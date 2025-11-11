import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";
import { createErrorResponse } from "@/lib/api-error";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/utils";
import type { ChatMessage } from "@/types/database";

/**
 * API para enviar mensagens via Evolution API
 * Quando o atendente envia uma mensagem, o n8n detecta automaticamente e pausa a IA
 */
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

    if (!company.instanceName || !company.tokenInstance) {
      return NextResponse.json({ 
        error: "Instância WhatsApp não configurada. Complete o onboarding primeiro." 
      }, { status: 400 });
    }

    // Validar dados da requisição
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message || typeof phone !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ 
        error: "Telefone e mensagem são obrigatórios e devem ser strings" 
      }, { status: 400 });
    }

    // Normalizar telefone para o formato do WhatsApp
    // O normalizePhone já adiciona @s.whatsapp.net
    const normalizedPhone = normalizePhone(phone);

    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ 
        error: "Configuração da Evolution API não encontrada" 
      }, { status: 500 });
    }

    // Verificar se é o emoji de reativação
    const isReactivationEmoji = message.trim() === "😉" || message === "😉";
    const emojiCodePoint = message.codePointAt(0)?.toString(16);
    const emojiLength = Array.from(message).length;
    
    logger.info('Enviando mensagem via Evolution API', { 
      instanceName: company.instanceName,
      phone: normalizedPhone,
      messageLength: message.length,
      messagePreview: message.substring(0, 100),
      isEmoji: isReactivationEmoji,
      emojiCodePoint: emojiCodePoint,
      emojiLength: emojiLength,
      messageBytes: Buffer.from(message, 'utf8').toString('hex'),
      messageArray: Array.from(message),
      messageJSON: JSON.stringify(message)
    });

    // Evolution API geralmente espera número SEM @s.whatsapp.net no body
    // Mas o normalizedPhone vem com @s.whatsapp.net
    // Remover sufixo apenas para o body da requisição
    const phoneForEvolution = normalizedPhone.replace('@s.whatsapp.net', '');
    
    // Preparar body da requisição
    // IMPORTANTE: Evolution API pode esperar formato específico
    const requestBody: any = {
      number: phoneForEvolution, // Evolution API: número sem @s.whatsapp.net
      text: message,
    };
    
    // Verificar se precisa de campos adicionais
    // Algumas versões da Evolution API precisam de delayText
    if (isReactivationEmoji) {
      logger.warn('Enviando emoji de reativação - verificação especial', {
        emoji: message,
        emojiHex: Buffer.from(message, 'utf8').toString('hex'),
        emojiUnicode: message.charCodeAt(0).toString(16)
      });
    }
    
    logger.info('Formato do número e mensagem para Evolution API', { 
      original: normalizedPhone,
      formatted: phoneForEvolution,
      messageText: message,
      messageType: typeof message,
      isReactivationEmoji: isReactivationEmoji,
      requestBody: requestBody,
      requestBodyJSON: JSON.stringify(requestBody),
      endpoint: `${evolutionUrl}/message/sendText/${company.instanceName}`
    });

    // Enviar mensagem via Evolution API
    const sendResponse = await fetch(
      `${evolutionUrl}/message/sendText/${company.instanceName}`,
      {
        method: "POST",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Ler resposta (texto primeiro para poder fazer parse depois se necessário)
    const responseText = await sendResponse.text();
    
    if (!sendResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText.substring(0, 200) };
      }
      
      logger.error('Erro ao enviar mensagem na Evolution API', { 
        status: sendResponse.status,
        statusText: sendResponse.statusText,
        error: errorData,
        isReactivationEmoji: isReactivationEmoji,
        requestBody: requestBody,
        responseText: responseText.substring(0, 500)
      });

      return NextResponse.json({ 
        error: "Erro ao enviar mensagem",
        details: errorData 
      }, { status: sendResponse.status });
    }
    
    // Parsear resposta da Evolution API
    let sendData;
    try {
      sendData = JSON.parse(responseText);
      
      // Log da resposta completa da Evolution API
      logger.info('Resposta completa da Evolution API', {
        status: sendResponse.status,
        responseData: sendData,
        isReactivationEmoji: isReactivationEmoji,
        responseText: responseText.substring(0, 500)
      });
    } catch (e) {
      logger.error('Erro ao parsear resposta da Evolution API como JSON', { 
        responseText: responseText.substring(0, 500),
        error: e 
      });
      sendData = { rawResponse: responseText, success: true };
    }

    logger.info('Mensagem enviada via Evolution API com sucesso', { 
      instanceName: company.instanceName,
      phone: normalizedPhone,
      phoneForEvolution: phoneForEvolution,
      message: message,
      isReactivationEmoji: isReactivationEmoji,
      evolutionResponse: sendData,
      messageId: sendData?.key?.id || sendData?.messageId || 'N/A'
    });

    // Salvar mensagem no histórico do banco de dados (n8nchathistories)
    // IMPORTANTE: Usar type: "ai" para aparecer como A.S.T.R.A, não como cliente
    // Formato esperado pelo n8n: Deve ter todos os campos para evitar erro no Chat Memory
    // Formato completo do n8n: { type: "ai", content: "...", tool_calls: [], additional_kwargs: {}, response_metadata: {}, invalid_tool_calls: [] }
    const chatMessage: ChatMessage = {
      type: "ai" as const, // Mudado de "human" para "ai" para aparecer como A.S.T.R.A
      content: message,
      tool_calls: [], // Campo obrigatório para mensagens AI do n8n
      additional_kwargs: {}, // Campo obrigatório do n8n
      response_metadata: {}, // Campo obrigatório do n8n
      invalid_tool_calls: [], // Campo obrigatório para mensagens AI do n8n
    };

    // Garantir que o session_id está no formato correto do n8n
    // O n8n espera: 55XXXXXXXXXXX@s.whatsapp.net (com DDD 55 no início)
    // O normalizePhone já garante o formato correto, mas vamos verificar
    let sessionIdForDB = normalizedPhone;
    
    // Remover @s.whatsapp.net temporariamente para verificar
    let phoneWithoutSuffix = normalizedPhone.replace('@s.whatsapp.net', '');
    
    // Remover DDD 55 duplicado se existir (ex: 5555...)
    if (phoneWithoutSuffix.startsWith('5555')) {
      phoneWithoutSuffix = phoneWithoutSuffix.substring(2);
      logger.warn('DDD 55 duplicado removido', {
        original: normalizedPhone,
        corrected: phoneWithoutSuffix + '@s.whatsapp.net'
      });
    }
    
    // Garantir que começa com 55 (DDD do Brasil) e não duplica
    if (!phoneWithoutSuffix.startsWith('55')) {
      phoneWithoutSuffix = '55' + phoneWithoutSuffix;
      logger.info('DDD 55 adicionado ao número', {
        original: normalizedPhone,
        corrected: phoneWithoutSuffix + '@s.whatsapp.net'
      });
    }
    
    // Reconstruir session_id no formato correto
    sessionIdForDB = phoneWithoutSuffix + '@s.whatsapp.net';
    
    logger.info('Salvando mensagem no histórico', {
      originalPhone: phone,
      normalizedPhone: normalizedPhone,
      sessionIdForDB: sessionIdForDB,
      messageType: 'ai', // A.S.T.R.A
      messageContent: message.substring(0, 100)
    });

    // Usar Supabase com service role para garantir permissão de escrita
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // IMPORTANTE: O campo message é JSONB no banco
    // JSONB não mantém formatação pretty - o PostgreSQL normaliza automaticamente
    // A formatação pretty é apenas visual, não afeta o conteúdo armazenado
    // O importante é ter TODOS os campos obrigatórios do n8n
    const messageJson = JSON.stringify(chatMessage); // JSON compacto é suficiente para JSONB
    
    logger.info('Formato da mensagem a ser salva', {
      messageType: chatMessage.type,
      hasToolCalls: Array.isArray(chatMessage.tool_calls),
      hasAdditionalKwargs: !!chatMessage.additional_kwargs,
      hasResponseMetadata: !!chatMessage.response_metadata,
      hasInvalidToolCalls: Array.isArray(chatMessage.invalid_tool_calls),
      messageJsonPreview: messageJson.substring(0, 200),
      messageJsonLength: messageJson.length,
      fullMessageJson: messageJson
    });

    const { error: insertError } = await supabaseService
      .from("n8nchathistories")
      .insert({
        session_id: sessionIdForDB, // Usar session_id no formato correto do n8n
        message: messageJson, // JSONB normaliza automaticamente, mas campos estão corretos
      });

    if (insertError) {
      logger.error('Erro ao salvar mensagem no histórico', { 
        error: insertError,
        phone: normalizedPhone,
        sessionId: sessionIdForDB,
        chatMessage: chatMessage
      });
      // Não falhar a requisição se falhar ao salvar no histórico
      // A mensagem já foi enviada via Evolution API
    } else {
      logger.info('Mensagem salva no histórico com sucesso', { 
        phone: normalizedPhone,
        sessionId: sessionIdForDB,
        messageType: 'ai'
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Mensagem enviada com sucesso",
      data: sendData
    });

  } catch (error) {
    logger.error('Erro ao enviar mensagem', { error });
    return createErrorResponse(error, 'Erro ao enviar mensagem');
  }
}

