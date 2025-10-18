-- Adicionar campos de onboarding à tabela Company
-- Execute este script no Supabase SQL Editor

-- Adicionar campo instanceName (nome da instância Evolution)
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "instanceName" TEXT;

-- Adicionar campo whatsappConnected (status da conexão WhatsApp)
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "whatsappConnected" BOOLEAN DEFAULT FALSE;

-- Adicionar campo webhookConfigured (status da configuração do webhook)
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "webhookConfigured" BOOLEAN DEFAULT FALSE;

-- Adicionar campo onboardingCompleted (status do onboarding)
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN DEFAULT FALSE;

-- Comentários para documentação
COMMENT ON COLUMN "Company"."instanceName" IS 'Nome da instância Evolution API (ex: company-123)';
COMMENT ON COLUMN "Company"."whatsappConnected" IS 'Indica se o WhatsApp Business está conectado';
COMMENT ON COLUMN "Company"."webhookConfigured" IS 'Indica se o webhook n8n está configurado';
COMMENT ON COLUMN "Company"."onboardingCompleted" IS 'Indica se o onboarding foi concluído';

-- Atualizar empresas existentes (opcional - se já tiver empresas cadastradas)
-- Descomente as linhas abaixo se quiser marcar empresas existentes como configuradas
-- UPDATE "Company" 
-- SET "onboardingCompleted" = TRUE, 
--     "whatsappConnected" = TRUE,
--     "webhookConfigured" = TRUE
-- WHERE "tokenInstance" IS NOT NULL;
