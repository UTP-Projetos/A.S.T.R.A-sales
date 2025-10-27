import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { createErrorResponse } from "@/lib/api-error";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request, RATE_LIMIT_PRESETS.CRITICAL);
  if (rateLimit.limited) {
    return rateLimit.response;
  }

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
    
    logger.info('Criando instância Evolution', { 
      instanceName, 
      companyId: company.id 
    });
    
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
            url: `${process.env.N8N_WEBHOOK_BASE_URL}/astra-sales-webhook`,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
          }
        })
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      logger.error('Erro ao criar instância na Evolution API', { 
        status: createResponse.status,
        error: errorData 
      });
      
      return NextResponse.json({ 
        error: "Erro ao criar instância",
        details: errorData 
      }, { status: createResponse.status });
    }

    const createData = await createResponse.json();
    
    logger.info('Instância criada com sucesso', { 
      instanceName,
      hasToken: !!createData.hash?.apikey 
    });

    // CORRIGIDO: Salvar tokenInstance e instanceName
    const tokenInstance = createData.hash?.apikey || createData.instance?.token || createData.token;
    
    if (!tokenInstance) {
      logger.warn('Token não encontrado na resposta da Evolution API', { createData });
    }

    const { error: updateError } = await supabase
      .from("Company")
      .update({ 
        instanceName: instanceName,
        tokenInstance: tokenInstance,
        webhookConfigured: true,
        onboardingCompleted: false // Ainda precisa conectar WhatsApp
      })
      .eq("id", company.id);

    if (updateError) {
      logger.error('Erro ao salvar instância no banco', { error: updateError });
      return createErrorResponse(updateError, 'Erro ao salvar instância');
    }

    logger.info('Instância salva no banco com sucesso', { 
      companyId: company.id,
      instanceName 
    });

    return NextResponse.json({ 
      success: true,
      instanceName: instanceName,
      tokenInstance: tokenInstance,
      message: "Instância criada com sucesso",
      data: createData
    });

  } catch (error) {
    logger.error('Erro ao criar instância', { error });
    return createErrorResponse(error, 'Erro ao criar instância');
  }
}
