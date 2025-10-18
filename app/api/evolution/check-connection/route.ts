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

    console.log("🔍 Verificando token da instância:", {
      hasToken: !!company.tokenInstance,
      tokenLength: company.tokenInstance?.length || 0,
      tokenStart: company.tokenInstance?.substring(0, 20) || 'N/A',
      instanceName: company.instanceName
    });

    // Verificar se já tem tokenInstance configurado
    if (!company.tokenInstance) {
      console.log("❌ Token da instância não configurado");
      return NextResponse.json({ 
        connected: false, 
        message: "Token da instância não configurado" 
      });
    }

    // Chamar Evolution API para verificar status
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    const response = await fetch(
      `${evolutionUrl}/instance/connectionState/${company.instanceName || 'default'}`,
      {
        method: "GET",
        headers: {
          "apikey": apiKey!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ 
        connected: false, 
        message: "Erro ao verificar conexão" 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log("📊 Resposta da Evolution API:", data);
    
    // Verificar diferentes possibilidades de status de conexão
    const isConnected = data.instance?.state === "open" || 
                       data.instance?.connectionStatus === "open" ||
                       data.connectionStatus === "open" ||
                       data.state === "open";
    
    console.log("🔍 Status de conexão:", {
      instanceState: data.instance?.state,
      connectionStatus: data.instance?.connectionStatus,
      globalConnectionStatus: data.connectionStatus,
      globalState: data.state,
      isConnected: isConnected
    });

    // Atualizar status no banco com logs detalhados
    console.log("🔄 Atualizando status no banco:", {
      companyId: company.id,
      currentStatus: company.whatsappConnected,
      newStatus: isConnected,
      willUpdate: company.whatsappConnected !== isConnected
    });

    const { error: updateError } = await supabase
      .from("Company")
      .update({ whatsappConnected: isConnected })
      .eq("id", company.id);

    if (updateError) {
      console.error("❌ Erro ao atualizar status:", updateError);
    } else {
      console.log("✅ Status atualizado com sucesso no banco");
    }

    return NextResponse.json({ 
      connected: isConnected,
      state: data.instance?.state || data.connectionStatus,
      message: isConnected ? "WhatsApp conectado" : "WhatsApp desconectado",
      debug: {
        instanceState: data.instance?.state,
        connectionStatus: data.instance?.connectionStatus,
        globalConnectionStatus: data.connectionStatus,
        globalState: data.state
      }
    });

  } catch (error) {
    console.error("Erro ao verificar conexão:", error);
    return NextResponse.json(
      { error: "Erro ao verificar conexão" },
      { status: 500 }
    );
  }
}
