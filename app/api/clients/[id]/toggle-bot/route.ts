import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { createErrorResponse } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
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
    const { activeBot } = await request.json();

    if (typeof activeBot !== 'boolean') {
      return NextResponse.json({ 
        error: "Parâmetro activeBot deve ser boolean" 
      }, { status: 400 });
    }

    logger.info('Alterando status do bot para cliente', { 
      clientId, 
      activeBot,
      userId: user.id 
    });

    // Buscar empresa do usuário
    const { data: company, error: companyError } = await supabase
      .from("Company")
      .select("id")
      .eq("email", user.email)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // Verificar se o cliente pertence à empresa
    const { data: client, error: clientError } = await supabase
      .from("Client")
      .select("*")
      .eq("id", clientId)
      .eq("CompanyId", company.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ 
        error: "Cliente não encontrado ou não pertence a esta empresa" 
      }, { status: 404 });
    }

    // Atualizar status do bot
    const { error: updateError } = await supabase
      .from("Client")
      .update({ activeBot })
      .eq("id", clientId);

    if (updateError) {
      logger.error('Erro ao atualizar status do bot', { error: updateError });
      return createErrorResponse(updateError, 'Erro ao atualizar status do bot');
    }

    logger.info('Status do bot atualizado com sucesso', { 
      clientId,
      activeBot,
      clientName: client.name 
    });

    return NextResponse.json({ 
      success: true,
      message: activeBot 
        ? "Bot ativado com sucesso" 
        : "Bot desativado com sucesso",
      client: {
        id: client.id,
        name: client.name,
        activeBot
      }
    });

  } catch (error) {
    logger.error('Erro ao alterar status do bot', { error });
    return createErrorResponse(error, 'Erro ao alterar status do bot');
  }
}
