import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 FORÇANDO LIMPEZA COMPLETA DE INSTÂNCIAS...");
    
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

    console.log(`🔍 Empresa encontrada: ${company.name} (ID: ${company.id})`);
    console.log(`📊 Instância atual: ${company.instanceName}`);
    console.log(`📊 Token atual: ${company.tokenInstance ? 'Presente' : 'Ausente'}`);

    // FORÇAR LIMPEZA COMPLETA - independente de qualquer verificação
    console.log("🧹 FORÇANDO limpeza completa dos dados da Amanda...");
    
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
      console.error("❌ Erro ao forçar limpeza:", updateError);
      return NextResponse.json(
        { error: "Erro ao forçar limpeza dos dados" },
        { status: 500 }
      );
    }

    console.log("✅ LIMPEZA FORÇADA concluída com sucesso");
    console.log("📊 Todos os dados da Amanda foram removidos");
    
    return NextResponse.json({ 
      success: true,
      message: "Limpeza forçada concluída com sucesso",
      company: {
        id: company.id,
        name: company.name,
        instanceName: null,
        tokenInstance: null,
        whatsappConnected: false,
        webhookConfigured: false,
        onboardingCompleted: false,
        forcedClean: true
      }
    });

  } catch (error) {
    console.error("❌ Erro ao forçar limpeza:", error);
    return NextResponse.json(
      { error: "Erro ao forçar limpeza", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
