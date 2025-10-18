-- Adicionar campo instanceName na tabela Company
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar coluna instanceName se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Company' 
        AND column_name = 'instanceName'
    ) THEN
        ALTER TABLE "Company" 
        ADD COLUMN "instanceName" TEXT;
        
        RAISE NOTICE 'Campo instanceName adicionado à tabela Company';
    ELSE
        RAISE NOTICE 'Campo instanceName já existe na tabela Company';
    END IF;
END $$;

-- Adicionar coluna whatsappConnected se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Company' 
        AND column_name = 'whatsappConnected'
    ) THEN
        ALTER TABLE "Company" 
        ADD COLUMN "whatsappConnected" BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Campo whatsappConnected adicionado à tabela Company';
    ELSE
        RAISE NOTICE 'Campo whatsappConnected já existe na tabela Company';
    END IF;
END $$;

-- Adicionar coluna webhookConfigured se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Company' 
        AND column_name = 'webhookConfigured'
    ) THEN
        ALTER TABLE "Company" 
        ADD COLUMN "webhookConfigured" BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Campo webhookConfigured adicionado à tabela Company';
    ELSE
        RAISE NOTICE 'Campo webhookConfigured já existe na tabela Company';
    END IF;
END $$;

-- Adicionar coluna onboardingCompleted se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Company' 
        AND column_name = 'onboardingCompleted'
    ) THEN
        ALTER TABLE "Company" 
        ADD COLUMN "onboardingCompleted" BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Campo onboardingCompleted adicionado à tabela Company';
    ELSE
        RAISE NOTICE 'Campo onboardingCompleted já existe na tabela Company';
    END IF;
END $$;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Company' 
ORDER BY ordinal_position;
