-- RLS Policies para CRM Caverá - CORREÇÃO CRÍTICA
-- Execute este SQL no Supabase para corrigir problemas de segurança

-- 1. HABILITAR RLS (Row Level Security)
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedules" ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA TABELA COMPANY
-- Permitir que usuários vejam apenas sua própria empresa
CREATE POLICY "Users can view own company" ON "Company"
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own company" ON "Company"
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 3. POLÍTICAS PARA TABELA CLIENT
-- Permitir que usuários vejam clientes de sua empresa
CREATE POLICY "Users can view clients from own company" ON "Client"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Company" 
      WHERE "Company".id = "Client"."CompanyId" 
      AND auth.uid()::text = "Company".id::text
    )
  );

CREATE POLICY "Users can insert clients to own company" ON "Client"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Company" 
      WHERE "Company".id = "Client"."CompanyId" 
      AND auth.uid()::text = "Company".id::text
    )
  );

CREATE POLICY "Users can update clients from own company" ON "Client"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Company" 
      WHERE "Company".id = "Client"."CompanyId" 
      AND auth.uid()::text = "Company".id::text
    )
  );

-- 4. POLÍTICAS PARA TABELA SCHEDULES
-- Permitir que usuários vejam agendamentos de clientes de sua empresa
CREATE POLICY "Users can view schedules from own company" ON "Schedules"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Client" 
      JOIN "Company" ON "Company".id = "Client"."CompanyId"
      WHERE "Client".id = "Schedules"."CompanyClientId" 
      AND auth.uid()::text = "Company".id::text
    )
  );

CREATE POLICY "Users can insert schedules for own company" ON "Schedules"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Client" 
      JOIN "Company" ON "Company".id = "Client"."CompanyId"
      WHERE "Client".id = "Schedules"."CompanyClientId" 
      AND auth.uid()::text = "Company".id::text
    )
  );

CREATE POLICY "Users can update schedules from own company" ON "Schedules"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Client" 
      JOIN "Company" ON "Company".id = "Client"."CompanyId"
      WHERE "Client".id = "Schedules"."CompanyClientId" 
      AND auth.uid()::text = "Company".id::text
    )
  );

-- 5. POLÍTICA TEMPORÁRIA PARA DESENVOLVIMENTO
-- ATENÇÃO: Remover em produção!
-- Esta política permite acesso total para desenvolvimento
-- CREATE POLICY "Dev full access" ON "Client" FOR ALL USING (true);
-- CREATE POLICY "Dev full access" ON "Company" FOR ALL USING (true);
-- CREATE POLICY "Dev full access" ON "Schedules" FOR ALL USING (true);

-- 6. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('Client', 'Company', 'Schedules');
