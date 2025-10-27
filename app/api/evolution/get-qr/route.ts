import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request, RATE_LIMIT_PRESETS.CRITICAL);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

  try {
    logger.debug("Iniciando API get-qr");
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
    
    // Verificar autenticação (usar getUser() para segurança)
    logger.debug("Verificando autenticação");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.error("Erro de autenticação", authError);
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.debug("Usuário autenticado", { userEmail: user.email });

    // Buscar empresa do usuário
    logger.debug("Buscando empresa do usuário");
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("*")
      .eq("email", user.email)
      .single();

    if (companyError || !company) {
      logger.error("Erro ao buscar empresa", companyError);
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }
    logger.debug("Empresa encontrada", { companyName: company.name, companyId: company.id });

    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    // Verificar se já existe instância configurada
    const instanceName = company.instanceName;
    
    // Se não tem instância configurada, criar uma nova
    if (!instanceName) {
      logger.debug("Nenhuma instância configurada, criando nova");
      
      // Gerar nome único para a instância
      const newInstanceName = `amanda-${company.id}-${Date.now()}`;
      logger.debug("Nome da instância gerado", { instanceName: newInstanceName });
      
      try {
        // 1. Criar instância na Evolution API
        logger.debug("Criando instância na Evolution API");
        const createResponse = await fetch(
          `${evolutionUrl}/instance/create`,
          {
            method: "POST",
            headers: {
              "apikey": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instanceName: newInstanceName,
              qrcode: true,
              integration: "WHATSAPP-BAILEYS",
              webhook: {
                url: `${process.env.N8N_WEBHOOK_BASE_URL}/astra-sales-webhook`,
                events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "MESSAGES_UPDATE"]
              },
              settings: {
                rejectCall: true,
                msgRetryCounterCache: true,
                userAgent: "Amanda CRM Bot",
                markMessagesRead: true,
                syncFullHistory: false,
                alwaysOnline: true,
                readMessages: true,
                readStatus: true
              }
            })
          }
        );

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          logger.error("Erro ao criar instância na Evolution API", errorData);
          return NextResponse.json({ 
            error: "Erro ao criar instância na Evolution API"
          }, { status: createResponse.status });
        }

        const createData = await createResponse.json();
        logger.debug("Instância criada com sucesso", { instanceName: newInstanceName });

        // 2. Atualizar empresa com nome da instância
        const { error: updateError } = await supabase
          .from("Company")
          .update({ instanceName: newInstanceName })
          .eq("id", company.id);

        if (updateError) {
          logger.error("Erro ao atualizar empresa com nome da instância", updateError);
        }

        // 3. Obter QR Code da nova instância
        logger.debug("Obtendo QR Code da nova instância");
        const qrResponse = await fetch(
          `${evolutionUrl}/instance/connect/${newInstanceName}`,
          {
            method: "GET",
            headers: {
              "apikey": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        logger.debug("QR Response Status", { status: qrResponse.status });
        if (!qrResponse.ok) {
          const errorData = await qrResponse.json();
          logger.error("Erro ao obter QR Code da nova instância", errorData);
          return NextResponse.json({ 
            error: "Erro ao obter QR Code da nova instância"
          }, { status: qrResponse.status });
        }

        const qrData = await qrResponse.json();
        logger.debug("QR Data recebido da Evolution API", { dataKeys: Object.keys(qrData) });
        
        const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.qr?.base64;
        logger.debug("QR Code processado", { 
          hasQrCode: !!qrCodeBase64,
          qrCodeType: typeof qrCodeBase64,
          qrCodeLength: qrCodeBase64?.length || 0
        });

        if (!qrCodeBase64) {
          logger.error("QR Code não encontrado na resposta da Evolution API", qrData);
          return NextResponse.json({ 
            error: "QR Code não foi gerado pela Evolution API"
          }, { status: 500 });
        }

        logger.debug("Retornando QR Code para frontend", { 
          qrCodeLength: qrCodeBase64.length,
          isDataUrl: qrCodeBase64.startsWith('data:')
        });
        
        return NextResponse.json({ 
          qrCode: qrCodeBase64,
          code: qrData.code || qrData.qrcode?.code,
          pairingCode: qrData.pairingCode,
          instanceName: newInstanceName
        });

      } catch (error) {
        logger.error("Erro ao criar instância", error);
        return NextResponse.json({ 
          error: "Erro ao criar instância"
        }, { status: 500 });
      }
    }

    // Se já tem instância, verificar se está conectada
    try {
      const checkResponse = await fetch(
        `${evolutionUrl}/instance/connectionState/${instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (checkResponse.ok) {
        const connectionData = await checkResponse.json();
        
        // Se já está conectado, retornar sucesso
        if (connectionData.instance?.connectionStatus === "open") {
          return NextResponse.json({ 
            success: true,
            message: "WhatsApp já conectado",
            connected: true,
            instanceName: instanceName
          });
        }
      } else if (checkResponse.status === 404) {
        // Instância não existe na Evolution API
        logger.warn("Instância não existe na Evolution API", { instanceName });
        
        // Limpar instância do banco
        await supabase
          .from("Company")
          .update({ 
            instanceName: null,
            whatsappConnected: false,
            webhookConfigured: false,
            onboardingCompleted: false
          })
          .eq("id", company.id);

        return NextResponse.json({ 
          error: "Instância não existe na Evolution API",
          suggestion: "Reconfigure a Amanda no onboarding",
          instanceName: instanceName
        }, { status: 404 });
      }
    } catch (error) {
      logger.error("Erro ao verificar status da instância", error);
    }

    // Se instância existe mas não está conectada, obter QR Code
    try {
      logger.debug("Obtendo QR Code da instância existente", { instanceName });
      const qrResponse = await fetch(
        `${evolutionUrl}/instance/connect/${instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json();
        logger.error("Erro ao obter QR Code da instância existente", errorData);
        return NextResponse.json({ 
          error: "Erro ao obter QR Code"
        }, { status: qrResponse.status });
      }

      const qrData = await qrResponse.json();
      const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.qr?.base64;

      if (!qrCodeBase64) {
        logger.error("QR Code não encontrado na resposta da Evolution API", qrData);
        return NextResponse.json({ 
          error: "QR Code não foi gerado pela Evolution API"
        }, { status: 500 });
      }

      logger.debug("Retornando QR Code da instância existente", { 
        qrCodeLength: qrCodeBase64.length,
        instanceName 
      });

      return NextResponse.json({ 
        qrCode: qrCodeBase64,
        code: qrData.code || qrData.qrcode?.code,
        pairingCode: qrData.pairingCode,
        instanceName: instanceName
      });

    } catch (error) {
      logger.error("Erro ao obter QR Code da instância existente", error);
      return NextResponse.json({ 
        error: "Erro ao obter QR Code"
      }, { status: 500 });
    }

  } catch (error) {
    logger.error("Erro geral ao obter QR Code", error);
    return NextResponse.json(
      { error: "Erro ao obter QR Code" },
      { status: 500 }
    );
  }
}
