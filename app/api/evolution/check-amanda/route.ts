import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Verificar status da Amanda
    const amandaStatus = {
      configured: !!(company.tokenInstance && company.instanceName),
      connected: company.whatsappConnected || false,
      instanceName: company.instanceName,
      tokenInstance: company.tokenInstance,
      whatsappPhone: company.WppPhone
    };

    // Sempre verificar se instância existe na Evolution API (se houver nome de instância)
    if (company.instanceName) {
      console.log(`🔍 Verificando instância: ${company.instanceName}`);
      console.log(`📊 Status atual: configured=${amandaStatus.configured}, connected=${amandaStatus.connected}`);
      
      try {
        const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;

        if (evolutionUrl && apiKey) {
          // Verificar se a instância existe na Evolution API
          const checkResponse = await fetch(
            `${evolutionUrl}/instance/connectionState/${company.instanceName}`,
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
            amandaStatus.connected = connectionData.instance?.connectionStatus === "open";
            
            // Atualizar status no banco se mudou
            if (amandaStatus.connected !== company.whatsappConnected) {
              await supabase
                .from("Company")
                .update({ whatsappConnected: amandaStatus.connected })
                .eq("id", company.id);
            }
          } else if (checkResponse.status === 404) {
            // Instância não existe na Evolution API
            console.log(`Instância ${company.instanceName} não existe na Evolution API`);
            console.log(`🧹 Limpando dados da instância inexistente...`);
            
            amandaStatus.configured = false;
            amandaStatus.connected = false;
            
            // Limpar completamente os dados da instância inexistente
            await supabase
              .from("Company")
              .update({ 
                instanceName: null,
                tokenInstance: null,
                whatsappConnected: false
              })
              .eq("id", company.id);
              
            console.log(`✅ Dados da instância ${company.instanceName} limpos com sucesso`);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status da Amanda:", error);
      }
    }

    return NextResponse.json({
      success: true,
      amanda: amandaStatus,
      company: {
        id: company.id,
        name: company.name,
        email: company.email
      }
    });

  } catch (error) {
    console.error("Erro ao verificar Amanda:", error);
    return NextResponse.json(
      { error: "Erro ao verificar Amanda", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
