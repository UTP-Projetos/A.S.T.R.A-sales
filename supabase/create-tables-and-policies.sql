-- ============================================================================
-- CRIAÇÃO DE TABELAS E POLÍTICAS RLS - A.S.T.R.A CRM
-- ============================================================================
-- Este arquivo cria todas as tabelas necessárias e aplica as políticas RLS
-- 
-- IMPORTANTE: Execute este script completo no SQL Editor do Supabase.
-- Execute TUDO de uma vez (todo o arquivo).
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELAS
-- ============================================================================

-- Tabela Company
CREATE TABLE IF NOT EXISTS "Company" (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT,
  "WppPhone" TEXT, -- WhatsApp com sufixo @s.whatsapp.net
  "tokenInstance" TEXT,
  status TEXT,
  email TEXT,
  "user_id" TEXT, -- ID do usuário proprietário
  "instanceName" TEXT,
  "whatsappConnected" BOOLEAN DEFAULT FALSE,
  "webhookConfigured" BOOLEAN DEFAULT FALSE,
  "onboardingCompleted" BOOLEAN DEFAULT FALSE
);

-- Tabela Client
CREATE TABLE IF NOT EXISTS "Client" (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "wppPhone" TEXT NOT NULL, -- WhatsApp com sufixo @s.whatsapp.net
  name TEXT,
  email TEXT,
  cpf TEXT,
  "dateOfBirth" TEXT,
  adress TEXT,
  "CompanyId" TEXT, -- ID da empresa (string para compatibilidade com n8n)
  "activeBot" BOOLEAN,
  "conversationId" TEXT,
  "crmLeadStatus" TEXT, -- "Novo Contato" | "Contato em Andamento" | etc
  "updateClientRegister" TEXT,
  "tokenInstance" TEXT,
  status TEXT
);

-- Tabela Schedules
CREATE TABLE IF NOT EXISTS "Schedules" (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "appointmentDate" TEXT,
  "appointmentNotes" JSONB, -- JSON com detalhes específicos
  "appointmentType" TEXT, -- "Hospedagem" | "Ingresso" | "Atividade"
  "schedulingStatus" TEXT, -- "Pendente" | "Confirmado" | "Cancelado" | "Realizado"
  "confirmationLink" TEXT,
  "CompanyClientId" TEXT, -- ID do cliente (string para compatibilidade com n8n)
  client TEXT -- wppPhone do cliente
);

-- Tabela n8nchathistories (histórico de chat do n8n)
CREATE TABLE IF NOT EXISTS "n8nchathistories" (
  id SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL, -- wppPhone do cliente (ex: 11554899924955@s.whatsapp.net)
  message TEXT NOT NULL, -- JSON stringificado com type, content, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. HABILITAR RLS NAS TABELAS
-- ============================================================================

ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "n8nchathistories" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================================================

DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir inserção de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir atualização de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir exclusão de clientes autenticados" ON "Client";

DROP POLICY IF EXISTS "Permitir leitura de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir inserção de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir atualização de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir exclusão de empresas autenticadas" ON "Company";

DROP POLICY IF EXISTS "Permitir leitura de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir inserção de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir atualização de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir exclusão de agendamentos autenticados" ON "Schedules";

DROP POLICY IF EXISTS "Empresas veem apenas conversas de seus clientes" ON "n8nchathistories";
DROP POLICY IF EXISTS "Service role pode inserir" ON "n8nchathistories";
DROP POLICY IF EXISTS "Service role pode atualizar" ON "n8nchathistories";

-- ============================================================================
-- 4. POLÍTICAS PARA TABELA "Client"
-- ============================================================================

-- Permitir leitura apenas para usuários autenticados
CREATE POLICY "Permitir leitura de clientes autenticados" 
ON "Client" 
FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserção apenas para usuários autenticados
CREATE POLICY "Permitir inserção de clientes autenticados" 
ON "Client" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização de clientes autenticados" 
ON "Client" 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Permitir exclusão apenas para usuários autenticados (opcional - remova se não quiser permitir exclusão)
CREATE POLICY "Permitir exclusão de clientes autenticados" 
ON "Client" 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- 5. POLÍTICAS PARA TABELA "Company"
-- ============================================================================

-- Permitir leitura apenas para usuários autenticados
CREATE POLICY "Permitir leitura de empresas autenticadas" 
ON "Company" 
FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserção apenas para usuários autenticados
CREATE POLICY "Permitir inserção de empresas autenticadas" 
ON "Company" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização de empresas autenticadas" 
ON "Company" 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Permitir exclusão apenas para usuários autenticados (opcional)
CREATE POLICY "Permitir exclusão de empresas autenticadas" 
ON "Company" 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- 6. POLÍTICAS PARA TABELA "Schedules"
-- ============================================================================

-- Permitir leitura apenas para usuários autenticados
CREATE POLICY "Permitir leitura de agendamentos autenticados" 
ON "Schedules" 
FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserção apenas para usuários autenticados
CREATE POLICY "Permitir inserção de agendamentos autenticados" 
ON "Schedules" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização de agendamentos autenticados" 
ON "Schedules" 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Permitir exclusão apenas para usuários autenticados (opcional)
CREATE POLICY "Permitir exclusão de agendamentos autenticados" 
ON "Schedules" 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- 7. POLÍTICAS PARA TABELA "n8nchathistories"
-- ============================================================================

-- Policy para SELECT: Ver apenas conversas dos clientes da própria empresa
CREATE POLICY "Empresas veem apenas conversas de seus clientes"
ON "n8nchathistories"
FOR SELECT
USING (
  session_id IN (
    SELECT "wppPhone" 
    FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text
      FROM "Company" 
      WHERE "user_id" = auth.uid()
    )
  )
);

-- Policy para INSERT: n8n pode inserir (usa service role)
CREATE POLICY "Service role pode inserir"
ON "n8nchathistories"
FOR INSERT
WITH CHECK (true);

-- Policy para UPDATE: n8n pode atualizar (usa service role)
CREATE POLICY "Service role pode atualizar"
ON "n8nchathistories"
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 8. PERMITIR ACESSO DO SERVICE ROLE (n8n/Webhooks)
-- ============================================================================

-- IMPORTANTE: O service_role bypassa RLS automaticamente
-- Use a service_role key no n8n para inserir/atualizar dados
-- NUNCA exponha a service_role key publicamente!

-- ============================================================================
-- 9. VERIFICAR SE AS TABELAS E POLÍTICAS FORAM APLICADAS
-- ============================================================================

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY table_name;

-- Verificar se as políticas foram aplicadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY tablename, cmd;

-- ============================================================================
-- 10. TESTE DE SEGURANÇA
-- ============================================================================

-- Após aplicar tudo, teste:
-- 1. Verifique se as tabelas foram criadas (execute a query acima)
-- 2. Verifique se as políticas foram aplicadas (execute a query acima)
-- 3. Tente acessar dados sem estar autenticado (deve falhar)
-- 4. Faça login no CRM e tente acessar dados (deve funcionar)
-- 5. Verifique se o n8n consegue inserir dados com service_role key

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================

-- ✅ Este script cria todas as tabelas necessárias
-- ✅ Este script aplica todas as políticas RLS
-- ✅ Execute TUDO de uma vez no SQL Editor do Supabase
-- ✅ Se as tabelas já existirem, serão ignoradas (CREATE TABLE IF NOT EXISTS)
-- ✅ Se as políticas já existirem, serão removidas e recriadas

-- ⚠️ IMPORTANTE: O service_role bypassa RLS automaticamente
-- ✅ Use a SERVICE_ROLE_KEY no n8n para inserir/atualizar dados
-- 🔒 NUNCA exponha a service_role key publicamente!

-- ============================================================================
-- FIM DO ARQUIVO
-- ============================================================================

