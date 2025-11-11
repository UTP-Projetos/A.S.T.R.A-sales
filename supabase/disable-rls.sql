-- ============================================================================
-- DESABILITAR RLS (ROW LEVEL SECURITY) - MODO DESENVOLVIMENTO
-- ============================================================================
-- Este script DESABILITA todas as políticas RLS para facilitar desenvolvimento
-- e colaboração. Use APENAS em ambiente de desenvolvimento local.
-- 
-- ⚠️ ATENÇÃO: NUNCA execute este script em produção!
-- ⚠️ Este script remove TODAS as políticas de segurança do banco de dados.
-- 
-- Execute este script no SQL Editor do Supabase.
-- ============================================================================

-- ============================================================================
-- 1. REMOVER TODAS AS POLÍTICAS RLS
-- ============================================================================

-- Remover políticas da tabela Client
DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir inserção de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir atualização de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir exclusão de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Empresas veem apenas seus clientes" ON "Client";
DROP POLICY IF EXISTS "Service role pode inserir clientes" ON "Client";
DROP POLICY IF EXISTS "Service role pode atualizar clientes" ON "Client";
DROP POLICY IF EXISTS "Service role pode deletar clientes" ON "Client";

-- Remover políticas da tabela Company
DROP POLICY IF EXISTS "Permitir leitura de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir inserção de empresas autenticas" ON "Company";
DROP POLICY IF EXISTS "Permitir atualização de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir exclusão de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Usuários veem apenas suas empresas" ON "Company";
DROP POLICY IF EXISTS "Service role pode inserir empresas" ON "Company";
DROP POLICY IF EXISTS "Service role pode atualizar empresas" ON "Company";
DROP POLICY IF EXISTS "Service role pode deletar empresas" ON "Company";

-- Remover políticas da tabela Schedules
DROP POLICY IF EXISTS "Permitir leitura de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir inserção de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir atualização de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir exclusão de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Empresas veem apenas seus agendamentos" ON "Schedules";
DROP POLICY IF EXISTS "Service role pode inserir agendamentos" ON "Schedules";
DROP POLICY IF EXISTS "Service role pode atualizar agendamentos" ON "Schedules";
DROP POLICY IF EXISTS "Service role pode deletar agendamentos" ON "Schedules";

-- Remover políticas da tabela n8nchathistories
DROP POLICY IF EXISTS "Empresas veem apenas conversas de seus clientes" ON "n8nchathistories";
DROP POLICY IF EXISTS "Service role pode inserir" ON "n8nchathistories";
DROP POLICY IF EXISTS "Service role pode atualizar" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir leitura de conversas autenticadas" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir inserção de conversas autenticadas" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir atualização de conversas autenticadas" ON "n8nchathistories";
DROP POLICY IF EXISTS "Permitir exclusão de conversas autenticadas" ON "n8nchathistories";

-- ============================================================================
-- 2. DESABILITAR RLS NAS TABELAS
-- ============================================================================

ALTER TABLE "Client" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedules" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "n8nchathistories" DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. VERIFICAR STATUS (OPCIONAL - para confirmar)
-- ============================================================================

-- Verificar se RLS está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY tablename;

-- ============================================================================
-- ✅ RLS DESABILITADO COM SUCESSO
-- ============================================================================
-- Agora todas as tabelas podem ser acessadas sem autenticação.
-- ⚠️ Lembre-se: Isso é apenas para desenvolvimento!
-- ============================================================================

