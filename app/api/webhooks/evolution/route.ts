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
 * IMPORTANTE: Quando mensagem vem direto do WhatsApp (não do CRM),
 * precisamos garantir que o session_id está no formato correto para o n8n
 */
async function handleNewMessage(instanceName: string, data: any) {
  try {
    const isFromMe = data.key?.fromMe || false;
    
    // Obter número remoto (cliente ou IA)
    // IMPORTANTE: Quando cliente envia mensagem, remoteJid contém o número do cliente
    const remoteJid = data.key?.remoteJid || data.key?.from || '';
    const originalPhoneNumber = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    const phoneNumber = normalizePhone(remoteJid);
    
    // Extrair texto da mensagem
    let messageText = '';
    if (data.message?.conversation) {
      messageText = data.message.conversation;
    } else if (data.message?.extendedTextMessage?.text) {
      messageText = data.message.extendedTextMessage.text;
    } else if (typeof data.message === 'string') {
      messageText = data.message;
    }

    const isReactivationEmoji = messageText.trim() === "😉" || messageText === "😉";

    logger.info('Nova mensagem recebida no webhook', { 
      instanceName,
      originalPhoneNumber,
      phoneNumber,
      remoteJid,
      isFromMe,
      messageType: data.messageType,
      messageText: messageText,
      messageLength: messageText.length,
      isReactivationEmoji: isReactivationEmoji,
      isClientMessage: !isFromMe // Mensagem do cliente para IA
    });

    // Buscar empresa pela instância para garantir que existe
    const { data: company } = await supabase
      .from('Company')
      .select('id, name')
      .eq('instanceName', instanceName)
      .single();

    if (!company) {
      logger.warn('Empresa não encontrada para instância no webhook', { 
        instanceName 
      });
      return;
    }

    // IMPORTANTE: CompanyId no banco é string, mas company.id pode ser number
    const companyIdString = company.id.toString();
    
    // Garantir formato correto do número ANTES de buscar o cliente
    // O n8n espera formato: 55XXXXXXXXXXX@s.whatsapp.net (13 dígitos após DDD)
    let phoneWithoutSuffix = phoneNumber.replace('@s.whatsapp.net', '');
    
    // Remover DDD 55 duplicado se existir (ex: 5555...)
    if (phoneWithoutSuffix.startsWith('5555')) {
      phoneWithoutSuffix = phoneWithoutSuffix.substring(2);
      logger.warn('DDD 55 duplicado removido no webhook', {
        original: phoneNumber,
        corrected: phoneWithoutSuffix
      });
    }
    
    // Garantir DDD 55 (n8n espera sempre com DDD 55)
    if (!phoneWithoutSuffix.startsWith('55')) {
      phoneWithoutSuffix = '55' + phoneWithoutSuffix;
      logger.info('DDD 55 adicionado no webhook', {
        original: phoneNumber,
        corrected: phoneWithoutSuffix
      });
    }
    
    // Reconstruir número no formato correto
    const normalizedPhoneForDB = phoneWithoutSuffix + '@s.whatsapp.net';
    
    logger.info('Normalizando número para busca no webhook', {
      originalPhone: phoneNumber,
      normalizedPhone: normalizedPhoneForDB,
      companyId: companyIdString
    });

    // IMPORTANTE: Quando cliente envia mensagem (isFromMe = false), 
    // precisamos garantir que o cliente existe no banco com o formato correto
    // O n8n usa wppPhone para construir o session_id: {Company.id}{Client.wppPhone}
    // IMPORTANTE: Se o cliente não existir ou número estiver errado, o n8n dará erro "Got unexpected type: undefined"
    if (!isFromMe && normalizedPhoneForDB) {
      logger.info('Processando mensagem do cliente no webhook', {
        phoneNumber: normalizedPhoneForDB,
        companyId: companyIdString,
        originalPhone: phoneNumber,
        sessionIdExpected: `${companyIdString}${normalizedPhoneForDB}`
      });

      // Buscar cliente com diferentes variações do número
      // Primeiro tenta com número normalizado (formato esperado pelo n8n)
      const { data: client, error: clientError } = await supabase
        .from('Client')
        .select('id, wppPhone, CompanyId')
        .eq('wppPhone', normalizedPhoneForDB)
        .eq('CompanyId', companyIdString)
        .maybeSingle();

      let foundClient = client;
      
      // Se não encontrou, tenta buscar com número original (caso número antigo sem normalização)
      if (!foundClient && phoneNumber !== normalizedPhoneForDB) {
        logger.info('Cliente não encontrado com número normalizado, tentando número original', {
          normalizedPhone: normalizedPhoneForDB,
          originalPhone: phoneNumber
        });

        const { data: clientVariation } = await supabase
          .from('Client')
          .select('id, wppPhone, CompanyId')
          .eq('wppPhone', phoneNumber)
          .eq('CompanyId', companyIdString)
          .maybeSingle();
        
        foundClient = clientVariation;
      }
      
      // Também tentar buscar apenas pelo número (sem CompanyId) para casos de migração
      if (!foundClient) {
        const { data: clientByPhone } = await supabase
          .from('Client')
          .select('id, wppPhone, CompanyId')
          .eq('wppPhone', normalizedPhoneForDB)
          .maybeSingle();
        
        if (clientByPhone) {
          // Se encontrou por número mas CompanyId está errado, atualizar
          if (clientByPhone.CompanyId !== companyIdString) {
            logger.warn('Cliente encontrado mas CompanyId diferente, atualizando', {
              clientId: clientByPhone.id,
              oldCompanyId: clientByPhone.CompanyId,
              newCompanyId: companyIdString
            });
            
            await supabase
              .from('Client')
              .update({ CompanyId: companyIdString })
              .eq('id', clientByPhone.id);
          }
          foundClient = { ...clientByPhone, CompanyId: companyIdString };
        }
      }

      // Se cliente existe mas número está no formato errado, atualizar
      if (foundClient && foundClient.wppPhone !== normalizedPhoneForDB) {
        logger.info('Atualizando formato do número do cliente no webhook', {
          clientId: foundClient.id,
          oldPhone: foundClient.wppPhone,
          newPhone: normalizedPhoneForDB
        });

        const { error: updateError } = await supabase
          .from('Client')
          .update({ 
            wppPhone: normalizedPhoneForDB,
            CompanyId: companyIdString // Garantir CompanyId correto
          })
          .eq('id', foundClient.id);

        if (updateError) {
          logger.error('Erro ao atualizar número do cliente no webhook', {
            error: updateError,
            clientId: foundClient.id
          });
        } else {
          logger.info('Número do cliente atualizado com sucesso no webhook', {
            clientId: foundClient.id,
            newPhone: normalizedPhoneForDB,
            companyId: companyIdString
          });
        }
      }
      // Se cliente não existe, criar com formato correto
      else if (!foundClient) {
        logger.info('Cliente não encontrado no webhook, criando registro para n8n', {
          phoneNumber: normalizedPhoneForDB,
          companyId: companyIdString,
          originalPhone: phoneNumber
        });

        // Criar cliente básico com formato correto do número
        // IMPORTANTE: O n8n usa wppPhone para construir session_id: {Company.id}{Client.wppPhone}
        // O número deve estar no formato: 55XXXXXXXXXXX@s.whatsapp.net (sem duplicação de DDD)
        const { error: createError, data: newClient } = await supabase
          .from('Client')
          .insert({
            wppPhone: normalizedPhoneForDB, // Formato: 55XXXXXXXXXXX@s.whatsapp.net
            CompanyId: companyIdString, // String conforme esperado pelo n8n
            name: null,
            email: null,
            activeBot: true,
            crmLeadStatus: 'Novo Contato', // Status inicial
          })
          .select('id')
          .single();

        if (createError) {
          logger.error('Erro ao criar cliente no webhook', { 
            error: createError,
            phoneNumber: normalizedPhoneForDB,
            companyId: companyIdString,
            errorDetails: createError
          });
        } else {
          logger.info('Cliente criado com sucesso no webhook para n8n', {
            clientId: newClient.id,
            phoneNumber: normalizedPhoneForDB,
            companyId: companyIdString,
            originalPhone: phoneNumber,
            sessionIdExpected: `${companyIdString}${normalizedPhoneForDB}` // Formato que n8n espera
          });
        }
      } else {
        // Cliente existe e está no formato correto
        logger.info('Cliente encontrado no webhook com formato correto', {
          clientId: foundClient.id,
          phoneNumber: normalizedPhoneForDB,
          companyId: companyIdString,
          sessionIdExpected: `${companyIdString}${normalizedPhoneForDB}` // Formato que n8n espera: {Company.id}{Client.wppPhone}
        });
      }
    } else if (isFromMe) {
      // Mensagem enviada pela IA (fromMe = true)
      logger.info('Mensagem enviada pela IA, não é necessário criar/atualizar cliente', {
        instanceName,
        isFromMe: true
      });
    }

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
