import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 CORRIGINDO STATUS DA AMANDA...");
    
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
    console.log(`📊 Status atual:`, {
      instanceName: company.instanceName,
      tokenInstance: company.tokenInstance ? 'Presente' : 'Ausente',
      whatsappConnected: company.whatsappConnected,
      webhookConfigured: company.webhookConfigured,
      onboardingCompleted: company.onboardingCompleted
    });

    // Se tem instância configurada, marcar como configurada
    if (company.instanceName && company.tokenInstance) {
      console.log("✅ Amanda está configurada - corrigindo status...");
      
      const { error: updateError } = await supabase
        .from("Company")
        .update({
          onboardingCompleted: true,
          webhookConfigured: true,
        })
        .eq("id", company.id);

      if (updateError) {
        console.error("❌ Erro ao corrigir status:", updateError);
        return NextResponse.json(
          { error: "Erro ao corrigir status da Amanda" },
          { status: 500 }
        );
      }

      console.log("✅ Status corrigido com sucesso");
      
      return NextResponse.json({ 
        success: true,
        message: "Status da Amanda corrigido com sucesso",
        company: {
          id: company.id,
          name: company.name,
          instanceName: company.instanceName,
          tokenInstance: company.tokenInstance,
          whatsappConnected: company.whatsappConnected,
          webhookConfigured: true,
          onboardingCompleted: true
        }
      });
    } else {
      console.log("❌ Amanda não está configurada - não é possível corrigir");
      return NextResponse.json({ 
        error: "Amanda não está configurada. Configure primeiro.",
        company: {
          id: company.id,
          name: company.name,
          instanceName: company.instanceName,
          tokenInstance: company.tokenInstance
        }
      }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ Erro ao corrigir status:", error);
    return NextResponse.json(
      { error: "Erro ao corrigir status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
