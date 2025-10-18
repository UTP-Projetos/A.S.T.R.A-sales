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
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar empresa do usuário
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    // Gerar nome único para a instância
    const instanceName = `empresa-${company.id}-${Date.now()}`;
    
    // Criar nova instância
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
          webhook: {
            url: `${process.env.N8N_WEBHOOK_BASE_URL}/evolution-webhook`,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
          }
        })
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("Erro ao criar instância:", errorData);
      
      return NextResponse.json({ 
        error: "Erro ao criar instância",
        details: errorData 
      }, { status: createResponse.status });
    }

    const createData = await createResponse.json();

    // Atualizar empresa com o nome da instância
    const { error: updateError } = await supabase
      .from("Company")
      .update({ instanceName: instanceName })
      .eq("id", company.id);

    if (updateError) {
      console.error("Erro ao atualizar empresa:", updateError);
    }

    return NextResponse.json({ 
      success: true,
      instanceName: instanceName,
      message: "Instância criada com sucesso",
      data: createData
    });

  } catch (error) {
    console.error("Erro ao criar instância:", error);
    return NextResponse.json(
      { error: "Erro ao criar instância", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
