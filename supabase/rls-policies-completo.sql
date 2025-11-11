-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS) - A.S.T.R.A CRM
-- ============================================================================
-- Este arquivo contém TODAS as políticas de Row Level Security necessárias
-- para o funcionamento completo do CRM.
-- 
-- IMPORTANTE: Execute este script no SQL Editor do Supabase.
-- Execute TUDO de uma vez (todo o arquivo).
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS NAS TABELAS
-- ============================================================================

ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedules" ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS em n8nchathistories se a tabela existir
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'n8nchathistories') THEN
        ALTER TABLE "n8nchathistories" ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================================================
-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================================================

-- Remover políticas antigas da tabela Client
DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir inserção de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir atualização de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Permitir exclusão de clientes autenticados" ON "Client";
DROP POLICY IF EXISTS "Clientes pertencem à própria empresa" ON "Client";

-- Remover políticas antigas da tabela Company
DROP POLICY IF EXISTS "Permitir leitura de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir inserção de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir atualização de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Permitir exclusão de empresas autenticadas" ON "Company";
DROP POLICY IF EXISTS "Empresas pertencem ao próprio usuário" ON "Company";
DROP POLICY IF EXISTS "Permitir cadastro de nova empresa" ON "Company";

-- Remover políticas antigas da tabela Schedules
DROP POLICY IF EXISTS "Permitir leitura de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir inserção de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir atualização de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Permitir exclusão de agendamentos autenticados" ON "Schedules";
DROP POLICY IF EXISTS "Agendamentos pertencem à própria empresa" ON "Schedules";

-- Remover políticas antigas da tabela n8nchathistories
DROP POLICY IF EXISTS "Empresas veem apenas seus clientes" ON "n8nchathistories";
DROP POLICY IF EXISTS "Histórico de chat por empresa" ON "n8nchathistories";

-- ============================================================================
-- 3. POLÍTICAS PARA TABELA "Company"
-- ============================================================================

-- POLÍTICA CRÍTICA: Permitir INSERT durante cadastro (mesmo sem sessão completa)
-- Esta policy permite que um usuário recém-criado insira sua própria empresa
-- baseado no email que acabou de ser criado no Auth
CREATE POLICY "Permitir cadastro de nova empresa" 
ON "Company" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Permitir se o email da Company corresponde ao email do usuário autenticado
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  -- Permitir durante cadastro (usuário acabou de ser criado)
  email = (SELECT raw_user_meta_data->>'email' FROM auth.users WHERE id = auth.uid())
);

-- Permitir leitura apenas da própria empresa
CREATE POLICY "Empresas pertencem ao próprio usuário - SELECT" 
ON "Company" 
FOR SELECT 
TO authenticated 
USING (
  -- Usuário pode ver sua própria empresa por email
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  -- Ou por user_id se estiver preenchido
  user_id = auth.uid()::text
);

-- Permitir atualização apenas da própria empresa
CREATE POLICY "Empresas pertencem ao próprio usuário - UPDATE" 
ON "Company" 
FOR UPDATE 
TO authenticated 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  user_id = auth.uid()::text
)
WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  user_id = auth.uid()::text
);

-- Permitir exclusão apenas da própria empresa (opcional)
CREATE POLICY "Empresas pertencem ao próprio usuário - DELETE" 
ON "Company" 
FOR DELETE 
TO authenticated 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  user_id = auth.uid()::text
);

-- ============================================================================
-- 4. POLÍTICAS PARA TABELA "Client"
-- ============================================================================

-- Permitir leitura apenas de clientes da própria empresa
CREATE POLICY "Clientes pertencem à própria empresa - SELECT" 
ON "Client" 
FOR SELECT 
TO authenticated 
USING (
  "CompanyId" IN (
    SELECT id::text FROM "Company" 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR user_id = auth.uid()::text
  )
);

-- Permitir inserção de clientes apenas na própria empresa
CREATE POLICY "Clientes pertencem à própria empresa - INSERT" 
ON "Client" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  "CompanyId" IN (
    SELECT id::text FROM "Company" 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR user_id = auth.uid()::text
  )
);

-- Permitir atualização apenas de clientes da própria empresa
CREATE POLICY "Clientes pertencem à própria empresa - UPDATE" 
ON "Client" 
FOR UPDATE 
TO authenticated 
USING (
  "CompanyId" IN (
    SELECT id::text FROM "Company" 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR user_id = auth.uid()::text
  )
)
WITH CHECK (
  "CompanyId" IN (
    SELECT id::text FROM "Company" 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR user_id = auth.uid()::text
  )
);

-- Permitir exclusão apenas de clientes da própria empresa
CREATE POLICY "Clientes pertencem à própria empresa - DELETE" 
ON "Client" 
FOR DELETE 
TO authenticated 
USING (
  "CompanyId" IN (
    SELECT id::text FROM "Company" 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR user_id = auth.uid()::text
  )
);

-- ============================================================================
-- 5. POLÍTICAS PARA TABELA "Schedules"
-- ============================================================================

-- Permitir leitura apenas de agendamentos da própria empresa
CREATE POLICY "Agendamentos pertencem à própria empresa - SELECT" 
ON "Schedules" 
FOR SELECT 
TO authenticated 
USING (
  "CompanyClientId" IN (
    SELECT id::text FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- Permitir inserção de agendamentos apenas na própria empresa
CREATE POLICY "Agendamentos pertencem à própria empresa - INSERT" 
ON "Schedules" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  "CompanyClientId" IN (
    SELECT id::text FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- Permitir atualização apenas de agendamentos da própria empresa
CREATE POLICY "Agendamentos pertencem à própria empresa - UPDATE" 
ON "Schedules" 
FOR UPDATE 
TO authenticated 
USING (
  "CompanyClientId" IN (
    SELECT id::text FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
)
WITH CHECK (
  "CompanyClientId" IN (
    SELECT id::text FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- Permitir exclusão apenas de agendamentos da própria empresa
CREATE POLICY "Agendamentos pertencem à própria empresa - DELETE" 
ON "Schedules" 
FOR DELETE 
TO authenticated 
USING (
  "CompanyClientId" IN (
    SELECT id::text FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- ============================================================================
-- 6. POLÍTICAS PARA TABELA "n8nchathistories" (se existir)
-- ============================================================================

-- Permitir leitura apenas de conversas dos próprios clientes
CREATE POLICY "Histórico de chat por empresa - SELECT" 
ON "n8nchathistories" 
FOR SELECT 
TO authenticated 
USING (
  session_id IN (
    SELECT "wppPhone" 
    FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- Permitir inserção apenas de conversas dos próprios clientes
CREATE POLICY "Histórico de chat por empresa - INSERT" 
ON "n8nchathistories" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  session_id IN (
    SELECT "wppPhone" 
    FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- Permitir atualização apenas de conversas dos próprios clientes
CREATE POLICY "Histórico de chat por empresa - UPDATE" 
ON "n8nchathistories" 
FOR UPDATE 
TO authenticated 
USING (
  session_id IN (
    SELECT "wppPhone" 
    FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
)
WITH CHECK (
  session_id IN (
    SELECT "wppPhone" 
    FROM "Client" 
    WHERE "CompanyId" IN (
      SELECT id::text FROM "Company" 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_id = auth.uid()::text
    )
  )
);

-- ============================================================================
-- 7. VERIFICAR SE AS POLÍTICAS FORAM APLICADAS
-- ============================================================================

-- Execute esta query para verificar todas as políticas ativas:
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY tablename, cmd;

-- ============================================================================
-- 8. TESTE DE SEGURANÇA
-- ============================================================================

-- Após aplicar as políticas, teste:
-- 1. Tente acessar dados sem estar autenticado (deve falhar)
-- 2. Faça cadastro de nova empresa (deve funcionar)
-- 3. Faça login no CRM e tente acessar dados (deve funcionar)
-- 4. Verifique que cada empresa só vê seus próprios dados
-- 5. Verifique se o n8n consegue inserir dados com service_role key

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================

-- ✅ Estas políticas permitem:
--    - Cadastro de nova empresa (INSERT durante signup)
--    - Usuários veem apenas seus próprios dados
--    - Isolamento completo entre empresas
--    - Service role bypassa RLS automaticamente (para n8n)

-- ✅ A política "Permitir cadastro de nova empresa" é CRÍTICA:
--    - Permite INSERT durante o cadastro mesmo que a sessão não esteja completa
--    - Valida que o email da Company corresponde ao email do usuário autenticado
--    - Resolve o problema de RLS bloqueando durante o cadastro

-- ⚠️ IMPORTANTE: O service_role bypassa RLS automaticamente
--    - Use a SERVICE_ROLE_KEY no n8n para inserir/atualizar dados
--    - NUNCA exponha a service_role key publicamente!

-- ============================================================================
-- FIM DO ARQUIVO
-- ============================================================================

