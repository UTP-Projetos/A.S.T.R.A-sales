import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 VERIFICANDO STATUS COMPLETO DA AMANDA...");
    
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

    console.log(`🔍 Empresa: ${company.name} (ID: ${company.id})`);
    console.log(`📊 Status atual:`, {
      instanceName: company.instanceName,
      tokenInstance: company.tokenInstance ? 'Presente' : 'Ausente',
      whatsappConnected: company.whatsappConnected,
      webhookConfigured: company.webhookConfigured,
      onboardingCompleted: company.onboardingCompleted
    });

    // Verificar se Amanda está completamente configurada
    const isConfigured = !!(company.tokenInstance && company.instanceName);
    const isConnected = company.whatsappConnected || false;
    const isWebhookConfigured = company.webhookConfigured || false;
    const isOnboardingCompleted = company.onboardingCompleted || false;

    // Status geral
    const status = {
      configured: isConfigured,
      connected: isConnected,
      webhookConfigured: isWebhookConfigured,
      onboardingCompleted: isOnboardingCompleted,
      instanceName: company.instanceName,
      tokenInstance: company.tokenInstance,
      whatsappPhone: company.WppPhone
    };

    // Determinar status geral
    let overallStatus = "Não configurada";
    let statusColor = "red";
    
    if (isConfigured && isConnected && isWebhookConfigured && isOnboardingCompleted) {
      overallStatus = "Completamente configurada";
      statusColor = "green";
    } else if (isConfigured && isConnected && isWebhookConfigured) {
      overallStatus = "Configurada e conectada";
      statusColor = "blue";
    } else if (isConfigured) {
      overallStatus = "Configurada mas desconectada";
      statusColor = "yellow";
    }

    console.log(`📊 Status geral: ${overallStatus} (${statusColor})`);

    return NextResponse.json({ 
      success: true,
      status: overallStatus,
      statusColor: statusColor,
      amanda: status,
      company: {
        id: company.id,
        name: company.name,
        email: company.email
      },
      details: {
        hasInstance: !!company.instanceName,
        hasToken: !!company.tokenInstance,
        isConnected: isConnected,
        isWebhookConfigured: isWebhookConfigured,
        isOnboardingCompleted: isOnboardingCompleted
      }
    });

  } catch (error) {
    console.error("❌ Erro ao verificar status completo:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status completo", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
