import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Iniciando limpeza de instâncias inexistentes...");
    
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

    console.log(`🔍 Verificando empresa: ${company.name} (ID: ${company.id})`);
    console.log(`📊 Instância atual: ${company.instanceName}`);

    // Se não tem instância configurada, não há nada para limpar
    if (!company.instanceName) {
      return NextResponse.json({ 
        success: true,
        message: "Nenhuma instância configurada para limpar",
        company: {
          id: company.id,
          name: company.name,
          instanceName: null
        }
      });
    }

    // Verificar se a instância existe na Evolution API
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    try {
      console.log(`🔍 Verificando instância: ${company.instanceName}`);
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
        console.log(`✅ Instância ${company.instanceName} existe na Evolution API`);
        return NextResponse.json({ 
          success: true,
          message: "Instância existe na Evolution API - não é necessário limpar",
          company: {
            id: company.id,
            name: company.name,
            instanceName: company.instanceName,
            exists: true
          }
        });
      } else if (checkResponse.status === 404) {
        console.log(`❌ Instância ${company.instanceName} NÃO existe na Evolution API`);
        
        // Limpar dados da instância no banco
        const { error: updateError } = await supabase
          .from("Company")
          .update({ 
            instanceName: null,
            tokenInstance: null,
            whatsappConnected: false,
            webhookConfigured: false,
            onboardingCompleted: false
          })
          .eq("id", company.id);

        if (updateError) {
          console.error("Erro ao limpar dados da instância:", updateError);
          return NextResponse.json(
            { error: "Erro ao limpar dados da instância" },
            { status: 500 }
          );
        }

        console.log(`✅ Dados da instância ${company.instanceName} limpos com sucesso`);
        
        return NextResponse.json({ 
          success: true,
          message: "Instância inexistente removida com sucesso",
          company: {
            id: company.id,
            name: company.name,
            instanceName: null,
            cleaned: true
          }
        });
      } else {
        console.error(`Erro ao verificar instância: ${checkResponse.status}`);
        return NextResponse.json({ 
          error: "Erro ao verificar instância na Evolution API",
          status: checkResponse.status
        }, { status: 500 });
      }
    } catch (error) {
      console.error("Erro ao verificar instância:", error);
      return NextResponse.json({ 
        error: "Erro ao verificar instância", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro ao limpar instâncias:", error);
    return NextResponse.json(
      { error: "Erro ao limpar instâncias", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
