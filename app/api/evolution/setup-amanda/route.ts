import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar empresa do usuário
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("*")
      .eq("email", user.email)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // Verificar se já tem Amanda configurada
    if (company.onboardingCompleted && company.tokenInstance) {
      return NextResponse.json({ 
        success: true,
        message: "Amanda já está configurada",
        company: {
          id: company.id,
          name: company.name,
          instanceName: company.instanceName,
          whatsappConnected: company.whatsappConnected
        }
      });
    }

    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    // Gerar nome único para a instância da Amanda
    const instanceName = `amanda-${company.id}-${Date.now()}`;
    
    // Criar instância da Amanda na Evolution API
    const createResponse = await fetch(
      `${evolutionUrl}/instance/create`,
      {
        method: "POST",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
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
      console.error("Erro ao criar instância da Amanda:", errorData);
      
      return NextResponse.json({ 
        error: "Erro ao criar instância da Amanda",
        details: errorData 
      }, { status: createResponse.status });
    }

    const createData = await createResponse.json();
    console.log("📊 Resposta da Evolution API:", createData);

    // Usar token da Evolution API ou gerar UUID se não fornecido
    const tokenInstance = createData.token || 
                        createData.instance?.token || 
                        createData.data?.token ||
                        createData.instanceName ||
                        crypto.randomUUID();
    
    console.log("🔑 Token da instância:", tokenInstance);
    console.log("📊 Tipo do token:", tokenInstance.length === 36 ? 'UUID' : 'Custom');

    // Atualizar empresa com dados da Amanda
    const { error: updateError } = await supabase
      .from("Company")
      .update({
        tokenInstance: tokenInstance,
        instanceName: instanceName,
        whatsappConnected: false // Será true quando conectar WhatsApp
      })
      .eq("id", company.id);

    if (updateError) {
      console.error("Erro ao atualizar empresa com dados da Amanda:", updateError);
      return NextResponse.json(
        { error: "Erro ao configurar Amanda" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Amanda configurada com sucesso!",
      amanda: {
        instanceName: instanceName,
        tokenInstance: tokenInstance,
        qrCodeUrl: `${evolutionUrl}/instance/connect/${instanceName}`,
        company: {
          id: company.id,
          name: company.name,
          email: company.email
        }
      }
    });

  } catch (error) {
    console.error("Erro ao configurar Amanda:", error);
    return NextResponse.json(
      { error: "Erro ao configurar Amanda", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
