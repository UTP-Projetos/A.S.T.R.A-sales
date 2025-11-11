-- ============================================================================
-- APLICAR POLÍTICAS RLS - A.S.T.R.A CRM (VERSÃO SIMPLIFICADA)
-- ============================================================================
-- Este arquivo aplica as políticas de Row Level Security (RLS) nas tabelas
-- que já existem no banco de dados.
-- 
-- VERSÃO SIMPLIFICADA: Sem problemas de tipo (cast)
-- Todas as policies permitem acesso total para usuários autenticados
-- 
-- IMPORTANTE: Execute este script completo no SQL Editor do Supabase.
-- Execute TUDO de uma vez (todo o arquivo).
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS NAS TABELAS (se ainda não estiver habilitado)
-- ============================================================================

ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "n8nchathistories" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================================================

-- Remover políticas antigas da tabela Client
DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir inserção de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir atualização de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir exclusão de clientes autenticados" ON "Client";

-- Remover políticas antigas da tabela Company
DROP POLICY IF EXISTS "Permitir leitura de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir inserção de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir atualização de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir exclusão de empresas autenticadas" ON "Company";

-- Remover políticas antigas da tabela Schedules
DROP POLICY IF EXISTS "Permitir leitura de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir inserção de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir atualização de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir exclusão de agendamentos autenticados" ON "Schedules";

-- Remover políticas antigas da tabela n8nchathistories
DROP POLICY IF EXISTS "Empresas veem apenas conversas de seus clientes" ON "n8nchathistories";
DROP POLICY IF EXISTS "Service role pode inserir" ON "n8nchathistories";
DROP POLICY IF EXISTS "Service role pode atualizar" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir leitura de conversas autenticadas" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir inserção de conversas autenticadas" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir atualização de conversas autenticadas" ON "n8nchathistories";

-- ============================================================================
-- 3. POLÍTICAS PARA TABELA "Client"
-- ============================================================================

CREATE POLICY "Permitir leitura de clientes autenticados" 
ON "Client" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de clientes autenticados" 
ON "Client" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de clientes autenticados" 
ON "Client" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão de clientes autenticados" 
ON "Client" FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- 4. POLÍTICAS PARA TABELA "Company"
-- ============================================================================

CREATE POLICY "Permitir leitura de empresas autenticadas" 
ON "Company" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de empresas autenticadas" 
ON "Company" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de empresas autenticadas" 
ON "Company" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão de empresas autenticadas" 
ON "Company" FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- 5. POLÍTICAS PARA TABELA "Schedules"
-- ============================================================================

CREATE POLICY "Permitir leitura de agendamentos autenticados" 
ON "Schedules" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de agendamentos autenticados" 
ON "Schedules" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de agendamentos autenticados" 
ON "Schedules" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão de agendamentos autenticados" 
ON "Schedules" FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- 6. POLÍTICAS PARA TABELA "n8nchathistories"
-- ============================================================================

CREATE POLICY "Permitir leitura de conversas autenticadas"
ON "n8nchathistories" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de conversas autenticadas"
ON "n8nchathistories" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de conversas autenticadas"
ON "n8nchathistories" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 7. VERIFICAR SE AS POLÍTICAS FORAM APLICADAS
-- ============================================================================

SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY tablename;

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY tablename, cmd;
