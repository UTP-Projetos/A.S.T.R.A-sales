import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request, RATE_LIMIT_PRESETS.CRITICAL);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  try {
    logger.info("Iniciando processo de QR code simples");
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.error("Erro de autenticação", { error: authError?.message || "Erro desconhecido" });
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    logger.info("Usuário autenticado", { email: user.email });

    // Buscar empresa do usuário
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("*")
      .eq("email", user.email)
      .single();

    if (companyError || !company) {
      logger.error("Erro ao buscar empresa", { error: companyError?.message });
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    logger.info("Empresa encontrada", { name: company.name });

    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      logger.info("Configuração não encontrada", { value: { evolutionUrl: !!evolutionUrl, apiKey: !!apiKey } });
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    logger.info("Evolution API configurada", { value: evolutionUrl });

    // Gerar nome único para a instância
    const instanceName = `amanda-${company.id}-${Date.now()}`;
    logger.info("Nome da instância", { value: instanceName });

    try {
      // 1. Criar instância na Evolution API
      logger.info("Criando instância na Evolution API...");
      const createResponse = await fetch(`${evolutionUrl}/instance/create`, {
        method: "POST",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: {
            url: `${process.env.N8N_WEBHOOK_BASE_URL}/astra-sales-webhook`,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "MESSAGES_UPDATE"]
          }
        })
      });

      logger.info("Create Response Status", { value: createResponse.status });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        logger.error("Erro ao criar instância", { error: errorData });
        return NextResponse.json({ 
          error: "Erro ao criar instância na Evolution API",
          details: errorData 
        }, { status: createResponse.status });
      }

      const createData = await createResponse.json();
      logger.info("Instância criada com sucesso", { value: createData });

      // 2. Atualizar empresa com nome da instância
      logger.info("Atualizando empresa com nome da instância...");
      const { error: updateError } = await supabase
        .from("Company")
        .update({ instanceName: instanceName })
        .eq("id", company.id);

      if (updateError) {
        logger.error("Erro ao atualizar empresa", { error: updateError });
      } else {
        logger.info("Empresa atualizada com sucesso");
      }

      // 3. Aguardar um pouco para a instância se estabilizar
      logger.info("Aguardando instância se estabilizar...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Obter QR Code da instância
      logger.info("Obtendo QR Code da instância...");
      const qrResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
        method: "GET",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
      });

      logger.info("QR Response Status", { value: qrResponse.status });
      
      if (!qrResponse.ok) {
        const errorData = await qrResponse.json();
        logger.error("Erro ao obter QR Code", { error: errorData });
        return NextResponse.json({ 
          error: "Erro ao obter QR Code da instância",
          details: errorData 
        }, { status: qrResponse.status });
      }

      const qrData = await qrResponse.json();
      logger.info("QR Data recebido:", Object.keys(qrData));
      
      // Procurar QR Code em diferentes campos
      const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.qr?.base64 || qrData.data?.base64;
      
      logger.info("QR Code encontrado", { value: !!qrCodeBase64 });
      logger.info("Tamanho do QR Code", { value: qrCodeBase64?.length || 0 });

      if (!qrCodeBase64) {
        logger.error("QR Code não encontrado na resposta", { error: qrData });
        return NextResponse.json({ 
          error: "QR Code não foi gerado pela Evolution API",
          details: "A Evolution API não retornou um QR Code válido",
          debug: {
            response: qrData,
            fields: Object.keys(qrData)
          }
        }, { status: 500 });
      }

      logger.info("QR Code gerado com sucesso!");
      
      return NextResponse.json({ 
        success: true,
        qrCode: qrCodeBase64,
        instanceName: instanceName,
        debug: {
          hasQrCode: !!qrCodeBase64,
          qrCodeLength: qrCodeBase64?.length || 0,
          endpoint: "create_then_connect"
        }
      });

    } catch (error) {
      logger.error("Erro ao processar instância", { error: error });
      return NextResponse.json({ 
        error: "Erro ao processar instância", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }

  } catch (error) {
    logger.error("Erro geral", { error: error });
    return NextResponse.json(
      { error: "Erro geral", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
