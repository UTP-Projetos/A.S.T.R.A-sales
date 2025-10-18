import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("=== INICIANDO GET QR CODE SIMPLES ===");
    
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
      console.log("Erro de autenticação:", authError);
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    console.log("Usuário autenticado:", user.email);

    // Buscar empresa do usuário
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("*")
      .eq("email", user.email)
      .single();

    if (companyError || !company) {
      console.log("Erro ao buscar empresa:", companyError);
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    console.log("Empresa encontrada:", company.name);

    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      console.log("Configuração não encontrada:", { evolutionUrl: !!evolutionUrl, apiKey: !!apiKey });
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    console.log("Evolution API configurada:", evolutionUrl);

    // Gerar nome único para a instância
    const instanceName = `amanda-${company.id}-${Date.now()}`;
    console.log("Nome da instância:", instanceName);

    try {
      // 1. Criar instância na Evolution API
      console.log("Criando instância na Evolution API...");
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
            url: `${process.env.N8N_WEBHOOK_BASE_URL}/amanda-webhook`,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "MESSAGES_UPDATE"]
          }
        })
      });

      console.log("Create Response Status:", createResponse.status);
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Erro ao criar instância:", errorData);
        return NextResponse.json({ 
          error: "Erro ao criar instância na Evolution API",
          details: errorData 
        }, { status: createResponse.status });
      }

      const createData = await createResponse.json();
      console.log("Instância criada com sucesso:", createData);

      // 2. Atualizar empresa com nome da instância
      console.log("Atualizando empresa com nome da instância...");
      const { error: updateError } = await supabase
        .from("Company")
        .update({ instanceName: instanceName })
        .eq("id", company.id);

      if (updateError) {
        console.error("Erro ao atualizar empresa:", updateError);
      } else {
        console.log("Empresa atualizada com sucesso");
      }

      // 3. Aguardar um pouco para a instância se estabilizar
      console.log("Aguardando instância se estabilizar...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Obter QR Code da instância
      console.log("Obtendo QR Code da instância...");
      const qrResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
        method: "GET",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
      });

      console.log("QR Response Status:", qrResponse.status);
      
      if (!qrResponse.ok) {
        const errorData = await qrResponse.json();
        console.error("Erro ao obter QR Code:", errorData);
        return NextResponse.json({ 
          error: "Erro ao obter QR Code da instância",
          details: errorData 
        }, { status: qrResponse.status });
      }

      const qrData = await qrResponse.json();
      console.log("QR Data recebido:", Object.keys(qrData));
      
      // Procurar QR Code em diferentes campos
      const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.qr?.base64 || qrData.data?.base64;
      
      console.log("QR Code encontrado:", !!qrCodeBase64);
      console.log("Tamanho do QR Code:", qrCodeBase64?.length || 0);

      if (!qrCodeBase64) {
        console.error("QR Code não encontrado na resposta:", qrData);
        return NextResponse.json({ 
          error: "QR Code não foi gerado pela Evolution API",
          details: "A Evolution API não retornou um QR Code válido",
          debug: {
            response: qrData,
            fields: Object.keys(qrData)
          }
        }, { status: 500 });
      }

      console.log("QR Code gerado com sucesso!");
      
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
      console.error("Erro ao processar instância:", error);
      return NextResponse.json({ 
        error: "Erro ao processar instância", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json(
      { error: "Erro geral", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
