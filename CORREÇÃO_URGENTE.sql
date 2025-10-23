-- 🔥 CORREÇÃO URGENTE: Telefone com formato errado
-- 
-- PROBLEMA: O telefone está salvo como "5548999249556s.whatsapp.net"
-- CORRETO: Deveria ser "5548999249556@s.whatsapp.net"

-- ============================================
-- 1. VERIFICAR TODOS OS TELEFONES ERRADOS
-- ============================================

SELECT 
    id, 
    name, 
    "wppPhone",
    CASE 
        WHEN "wppPhone" LIKE '%s.whatsapp.net' 
         AND "wppPhone" NOT LIKE '%@s.whatsapp.net' 
        THEN '❌ ERRADO (falta @)'
        WHEN "wppPhone" LIKE '%@s.whatsapp.net' 
        THEN '✅ CORRETO'
        ELSE '⚠️ OUTRO FORMATO'
    END as status
FROM "Client"
WHERE "wppPhone" IS NOT NULL
ORDER BY status, name;

-- ============================================
-- 2. CORRIGIR TELEFONE ESPECÍFICO
-- ============================================

-- Corrigir o telefone que apareceu no log
UPDATE "Client"
SET "wppPhone" = '5548999249556@s.whatsapp.net'
WHERE "wppPhone" = '5548999249556s.whatsapp.net';

-- ============================================
-- 3. CORRIGIR TODOS OS TELEFONES ERRADOS (se tiver mais)
-- ============================================

UPDATE "Client"
SET "wppPhone" = REPLACE("wppPhone", 's.whatsapp.net', '@s.whatsapp.net')
WHERE "wppPhone" LIKE '%s.whatsapp.net'
  AND "wppPhone" NOT LIKE '%@s.whatsapp.net';

-- ============================================
-- 4. CRIAR MENSAGENS DE TESTE
-- ============================================

INSERT INTO n8nchathistories (session_id, message) VALUES
('5548999249556@s.whatsapp.net', '{"type": "human", "content": "Olá, boa tarde!", "additional_kwargs": {}, "response_metadata": {}}'),
('5548999249556@s.whatsapp.net', '{"type": "ai", "content": "Olá! Eu sou a Astra, do Caverá Country Park. Como posso ajudar?", "tool_calls": [], "additional_kwargs": {}, "response_metadata": {}, "invalid_tool_calls": []}');
