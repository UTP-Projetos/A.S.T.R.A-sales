import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createErrorResponse } from "@/lib/api-error";
import { normalizePhone } from "@/lib/utils";

// Cliente Supabase com service role (para webhooks)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Webhook para receber eventos da Evolution API
 * Eventos suportados:
 * - CONNECTION_UPDATE: Status da conexão WhatsApp mudou
 * - MESSAGES_UPSERT: Nova mensagem recebida/enviada
 * - QRCODE_UPDATED: Novo QR Code gerado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Webhook Evolution recebido', { 
      event: body.event,
      instance: body.instance 
    });

    const { event, instance, data } = body;

    if (!event || !instance) {
      return NextResponse.json({ 
        error: "Dados do webhook inválidos" 
      }, { status: 400 });
    }

    // Processar eventos
    switch (event) {
      case 'connection.update':
      case 'CONNECTION_UPDATE':
        await handleConnectionUpdate(instance, data);
        break;

      case 'messages.upsert':
      case 'MESSAGES_UPSERT':
        await handleNewMessage(instance, data);
        break;

      case 'qrcode.updated':
      case 'QRCODE_UPDATED':
        await handleQRCodeUpdate(instance, data);
        break;

      default:
        logger.info('Evento não tratado', { event });
    }

    return NextResponse.json({ 
      success: true,
      message: "Webhook processado com sucesso"
    });

  } catch (error) {
    logger.error('Erro ao processar webhook Evolution', { error });
    return createErrorResponse(error, 'Erro ao processar webhook');
  }
}

/**
 * Atualiza status da conexão WhatsApp no banco
 */
async function handleConnectionUpdate(instanceName: string, data: any) {
  try {
    const isConnected = data.state === 'open' || 
                       data.connectionStatus === 'open' ||
                       data.status === 'open';

    logger.info('Atualizando status de conexão', { 
      instanceName, 
      isConnected,
      state: data.state 
    });

    // Buscar empresa pela instância
    const { data: company, error: findError } = await supabase
      .from('Company')
      .select('*')
      .eq('instanceName', instanceName)
      .single();

    if (findError || !company) {
      logger.warn('Empresa não encontrada para instância', { 
        instanceName,
        error: findError 
      });
      return;
    }

    // Atualizar status
    const { error: updateError } = await supabase
      .from('Company')
      .update({ 
        whatsappConnected: isConnected,
        onboardingCompleted: isConnected ? true : company.onboardingCompleted
      })
      .eq('id', company.id);

    if (updateError) {
      logger.error('Erro ao atualizar status de conexão', { error: updateError });
      return;
    }

    // Se conectou, salvar número de telefone
    if (isConnected && data.instance?.wid) {
      const wppPhone = normalizePhone(data.instance.wid);
      
      await supabase
        .from('Company')
        .update({ WppPhone: wppPhone })
        .eq('id', company.id);

      logger.info('Número WhatsApp salvo', { 
        companyId: company.id,
        wppPhone 
      });
    }

    logger.info('Status de conexão atualizado', { 
      companyId: company.id,
      isConnected 
    });

  } catch (error) {
    logger.error('Erro em handleConnectionUpdate', { error });
  }
}

/**
 * Processa nova mensagem (para futuras notificações)
 */
async function handleNewMessage(instanceName: string, data: any) {
  try {
    // Por enquanto apenas loga
    // No futuro: criar notificações, atualizar contadores, etc
    
    const isFromMe = data.key?.fromMe || false;
    const phoneNumber = normalizePhone(data.key?.remoteJid || '');

    logger.info('Nova mensagem recebida', { 
      instanceName,
      phoneNumber,
      isFromMe,
      messageType: data.messageType 
    });

    // TODO: Criar notificação no banco para dashboard
    // TODO: Atualizar último contato do cliente
    // TODO: Incrementar contador de mensagens

  } catch (error) {
    logger.error('Erro em handleNewMessage', { error });
  }
}

/**
 * Atualiza QR Code no banco (se necessário)
 */
async function handleQRCodeUpdate(instanceName: string, data: any) {
  try {
    logger.info('QR Code atualizado', { 
      instanceName,
      hasQR: !!data.qrcode 
    });

    // TODO: Salvar QR Code em tabela temporária se necessário
    // Por enquanto o CRM busca o QR via API quando necessário

  } catch (error) {
    logger.error('Erro em handleQRCodeUpdate', { error });
  }
}
