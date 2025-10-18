import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 SINCRONIZANDO STATUS COM EVOLUTION API...");
    
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

    console.log(`🔍 Sincronizando: ${company.name} (ID: ${company.id})`);
    console.log(`📊 Status atual no banco:`, {
      whatsappConnected: company.whatsappConnected,
      webhookConfigured: company.webhookConfigured,
      onboardingCompleted: company.onboardingCompleted
    });

    if (!company.instanceName) {
      return NextResponse.json({ 
        error: "Instância não configurada" 
      }, { status: 400 });
    }

    // Verificar status na Evolution API
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    try {
      console.log(`🔍 Verificando status na Evolution API: ${company.instanceName}`);
      
      const response = await fetch(
        `${evolutionUrl}/instance/connectionState/${company.instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📊 Resposta da Evolution API: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Dados da Evolution API:", data);
        
        // Verificar status de conexão
        const isConnected = data.instance?.state === "open" || 
                           data.instance?.connectionStatus === "open" ||
                           data.connectionStatus === "open" ||
                           data.state === "open";
        
        console.log("🔍 Status de conexão detectado:", {
          instanceState: data.instance?.state,
          connectionStatus: data.instance?.connectionStatus,
          globalConnectionStatus: data.connectionStatus,
          globalState: data.state,
          isConnected: isConnected
        });

        // Forçar atualização completa no banco
        const { error: updateError } = await supabase
          .from("Company")
          .update({ 
            whatsappConnected: isConnected,
            webhookConfigured: true,
            onboardingCompleted: true
          })
          .eq("id", company.id);

        if (updateError) {
          console.error("❌ Erro ao sincronizar status:", updateError);
          return NextResponse.json(
            { error: "Erro ao sincronizar status" },
            { status: 500 }
          );
        }

        console.log("✅ Status sincronizado com sucesso");
        
        // Buscar dados atualizados
        const { data: updatedCompany } = await supabase
          .from("Company")
          .select("*")
          .eq("id", company.id)
          .single();
        
        return NextResponse.json({ 
          success: true,
          message: "Status sincronizado com sucesso",
          company: {
            id: updatedCompany?.id,
            name: updatedCompany?.name,
            instanceName: updatedCompany?.instanceName,
            tokenInstance: updatedCompany?.tokenInstance,
            whatsappConnected: updatedCompany?.whatsappConnected,
            webhookConfigured: updatedCompany?.webhookConfigured,
            onboardingCompleted: updatedCompany?.onboardingCompleted
          },
          evolutionData: {
            instanceState: data.instance?.state,
            connectionStatus: data.instance?.connectionStatus,
            globalConnectionStatus: data.connectionStatus,
            globalState: data.state
          },
          syncDetails: {
            wasConnected: company.whatsappConnected,
            nowConnected: isConnected,
            statusChanged: company.whatsappConnected !== isConnected
          }
        });

      } else {
        const errorData = await response.json();
        console.error("❌ Erro na Evolution API:", errorData);
        
        return NextResponse.json({ 
          error: "Erro ao verificar status na Evolution API",
          details: errorData,
          status: response.status
        }, { status: response.status });
      }

    } catch (error) {
      console.error("❌ Erro ao conectar com Evolution API:", error);
      return NextResponse.json({ 
        error: "Erro ao conectar com Evolution API",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Erro ao sincronizar:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
