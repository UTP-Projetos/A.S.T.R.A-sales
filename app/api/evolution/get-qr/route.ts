import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API ETAPA 1: Iniciando API get-qr");
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
    console.log("🔍 API ETAPA 2: Verificando autenticação");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("❌ API ETAPA 2: Erro de autenticação:", authError);
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.log("✅ API ETAPA 2: Usuário autenticado:", user.email);

    // Buscar empresa do usuário
    console.log("🔍 API ETAPA 3: Buscando empresa do usuário");
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("*")
      .eq("email", user.email)
      .single();

    if (companyError || !company) {
      console.log("❌ API ETAPA 3: Erro ao buscar empresa:", companyError);
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }
    console.log("✅ API ETAPA 3: Empresa encontrada:", company.name);

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
      console.log("🔍 API ETAPA 4: Nenhuma instância configurada, criando nova...");
      
      // Gerar nome único para a instância
      const newInstanceName = `amanda-${company.id}-${Date.now()}`;
      console.log("🔍 API ETAPA 4: Nome da instância:", newInstanceName);
      
      try {
        // 1. Criar instância na Evolution API
        console.log("🔍 API ETAPA 5: Criando instância na Evolution API");
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
                url: `${process.env.N8N_WEBHOOK_BASE_URL}/amanda-webhook`,
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
          console.error("Erro ao criar instância:", errorData);
          return NextResponse.json({ 
            error: "Erro ao criar instância na Evolution API",
            details: errorData 
          }, { status: createResponse.status });
        }

        const createData = await createResponse.json();
        console.log("Instância criada com sucesso:", createData);

        // 2. Atualizar empresa com nome da instância
        const { error: updateError } = await supabase
          .from("Company")
          .update({ instanceName: newInstanceName })
          .eq("id", company.id);

        if (updateError) {
          console.error("Erro ao atualizar empresa:", updateError);
        }

        // 3. Obter QR Code da nova instância
        console.log("🔍 API ETAPA 7: Obtendo QR Code da nova instância");
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

        console.log("🔍 API ETAPA 7: QR Response Status:", qrResponse.status);
        if (!qrResponse.ok) {
          const errorData = await qrResponse.json();
          console.error("❌ API ETAPA 7: Erro ao obter QR Code:", errorData);
          return NextResponse.json({ 
            error: "Erro ao obter QR Code da nova instância",
            details: errorData 
          }, { status: qrResponse.status });
        }

        const qrData = await qrResponse.json();
        console.log("🔍 API ETAPA 8: QR Data recebido:", Object.keys(qrData));
        
        const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.qr?.base64;
        console.log("🔍 API ETAPA 8: QR Code encontrado:", !!qrCodeBase64);
        console.log("🔍 API ETAPA 8: QR Code tipo:", typeof qrCodeBase64);
        console.log("🔍 API ETAPA 8: QR Code tamanho:", qrCodeBase64?.length || 0);
        console.log("🔍 API ETAPA 8: QR Code primeiros 100 chars:", qrCodeBase64?.substring(0, 100));

        if (!qrCodeBase64) {
          console.log("❌ API ETAPA 8: QR Code não encontrado na resposta");
          return NextResponse.json({ 
            error: "QR Code não foi gerado pela Evolution API",
            details: "A Evolution API não retornou um QR Code válido",
            debug: qrData
          }, { status: 500 });
        }

        console.log("✅ API ETAPA 9: Retornando QR Code para frontend");
        console.log("🔍 API ETAPA 9: QR Code final - tipo:", typeof qrCodeBase64);
        console.log("🔍 API ETAPA 9: QR Code final - tamanho:", qrCodeBase64.length);
        console.log("🔍 API ETAPA 9: QR Code final - é data URL:", qrCodeBase64.startsWith('data:'));
        
        return NextResponse.json({ 
          qrCode: qrCodeBase64,
          code: qrData.code || qrData.qrcode?.code,
          pairingCode: qrData.pairingCode,
          instanceName: newInstanceName,
          debug: {
            hasQrCode: !!qrCodeBase64,
            qrCodeLength: qrCodeBase64?.length || 0,
            endpoint: "create_then_connect"
          }
        });

      } catch (error) {
        console.error("Erro ao criar instância:", error);
        return NextResponse.json({ 
          error: "Erro ao criar instância", 
          details: error instanceof Error ? error.message : String(error) 
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
        console.log(`Instância ${instanceName} não existe na Evolution API`);
        
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
      console.error("Erro ao verificar status da instância:", error);
    }

    // Se instância existe mas não está conectada, obter QR Code
    try {
      console.log(`Obtendo QR Code da instância: ${instanceName}`);
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
        console.error("Erro ao obter QR Code:", errorData);
        return NextResponse.json({ 
          error: "Erro ao obter QR Code",
          details: errorData 
        }, { status: qrResponse.status });
      }

      const qrData = await qrResponse.json();
      const qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || qrData.qr?.base64;

      if (!qrCodeBase64) {
        return NextResponse.json({ 
          error: "QR Code não foi gerado pela Evolution API",
          details: "A Evolution API não retornou um QR Code válido",
          debug: qrData
        }, { status: 500 });
      }

      return NextResponse.json({ 
        qrCode: qrCodeBase64,
        code: qrData.code || qrData.qrcode?.code,
        pairingCode: qrData.pairingCode,
        instanceName: instanceName,
        debug: {
          hasQrCode: !!qrCodeBase64,
          qrCodeLength: qrCodeBase64?.length || 0,
          endpoint: "connect_existing"
        }
      });

    } catch (error) {
      console.error("Erro ao obter QR Code:", error);
      return NextResponse.json({ 
        error: "Erro ao obter QR Code", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro ao obter QR Code:", error);
    return NextResponse.json(
      { error: "Erro ao obter QR Code", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
