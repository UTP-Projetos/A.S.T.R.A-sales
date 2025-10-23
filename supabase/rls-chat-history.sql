-- ============================================
-- RLS POLICY para n8nchathistories
-- ============================================
-- 
-- PROBLEMA: Qualquer usuário autenticado pode ver TODAS as conversas
-- SOLUÇÃO: Apenas ver conversas dos próprios clientes
--

-- Habilitar RLS
ALTER TABLE n8nchathistories ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: Ver apenas conversas dos clientes da própria empresa
CREATE POLICY "Empresas veem apenas conversas de seus clientes"
ON n8nchathistories
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
ON n8nchathistories
FOR INSERT
WITH CHECK (true);

-- Policy para UPDATE: n8n pode atualizar (usa service role)
CREATE POLICY "Service role pode atualizar"
ON n8nchathistories
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'n8nchathistories';
