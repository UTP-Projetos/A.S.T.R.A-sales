-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS) - CRM CAVERÁ COUNTRY PARK
-- ============================================================================
-- Este arquivo contém as políticas de Row Level Security para proteger
-- os dados do CRM. Execute no SQL Editor do Supabase.
-- 
-- IMPORTANTE: Antes de executar, configure a autenticação no Supabase.
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS NAS TABELAS
-- ============================================================================

ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedules" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
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

-- ============================================================================
-- 3. POLÍTICAS PARA TABELA "Client"
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
-- 4. POLÍTICAS PARA TABELA "Company"
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
-- 5. POLÍTICAS PARA TABELA "Schedules"
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
-- 6. PERMITIR ACESSO DO SERVICE ROLE (n8n/Webhooks)
-- ============================================================================

-- IMPORTANTE: O service_role bypassa RLS automaticamente
-- Use a service_role key no n8n para inserir/atualizar dados
-- NUNCA exponha a service_role key publicamente!

-- ============================================================================
-- 7. VERIFICAR SE AS POLÍTICAS FORAM APLICADAS
-- ============================================================================

-- Execute esta query para verificar todas as políticas ativas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('Client', 'Company', 'Schedules');

-- ============================================================================
-- 8. TESTE DE SEGURANÇA
-- ============================================================================

-- Após aplicar as políticas, teste:
-- 1. Tente acessar dados sem estar autenticado (deve falhar)
-- 2. Faça login no CRM e tente acessar dados (deve funcionar)
-- 3. Verifique se o n8n consegue inserir dados com service_role key

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================

-- ✅ Estas políticas permitem acesso TOTAL para usuários AUTENTICADOS
-- ✅ Usuários NÃO autenticados NÃO podem acessar nenhum dado
-- ✅ O n8n deve usar a SERVICE_ROLE_KEY (não a anon key)
-- ✅ Para produção, considere políticas mais restritivas baseadas em roles
-- ✅ Você pode adicionar campos de role/permissão para controle granular

-- Exemplo de política mais restritiva (descomente se quiser usar):
-- 
-- CREATE POLICY "Admin pode tudo, operador só visualiza" 
-- ON "Client" 
-- FOR SELECT 
-- TO authenticated 
-- USING (
--   auth.jwt() ->> 'role' = 'admin' OR 
--   auth.jwt() ->> 'role' = 'operador'
-- );

-- ============================================================================
-- FIM DO ARQUIVO
-- ============================================================================
