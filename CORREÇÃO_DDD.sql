-- ============================================
-- 🔧 CORREÇÃO: Adicionar DDD nos telefones
-- ============================================
-- 
-- PROBLEMA: Telefones sem código de área (DDD)
-- Cliente:  554899924955@s.whatsapp.net    (11 dígitos)
-- Chat:     11554899924955@s.whatsapp.net  (13 dígitos)
-- FALTA: O DDD "11" no início
--

-- ============================================
-- 1. VERIFICAR TELEFONES INCOMPLETOS
-- ============================================

SELECT 
    id, 
    name, 
    "wppPhone",
    LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) as tamanho,
    CASE 
        WHEN LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 13 
        THEN '✅ CORRETO'
        WHEN LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 11 
        THEN '❌ FALTA DDD'
        ELSE '⚠️ VERIFICAR'
    END as status
FROM "Client"
WHERE "wppPhone" IS NOT NULL
ORDER BY status, name;


-- ============================================
-- 2. CORRIGIR CLIENTES ESPECÍFICOS
-- ============================================

-- Gabriel (adicionar DDD 11)
UPDATE "Client"
SET "wppPhone" = '11554899924955@s.whatsapp.net'
WHERE id = 100;

-- Procópio (adicionar DDD 11)
UPDATE "Client"
SET "wppPhone" = '11554896029163@s.whatsapp.net'
WHERE id = 99;


-- ============================================
-- 3. VERIFICAR SE CORRIGIU
-- ============================================

SELECT 
    id, 
    name, 
    "wppPhone",
    LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) as tamanho
FROM "Client"
WHERE id IN (99, 100);

-- Deve retornar tamanho = 13 para ambos


-- ============================================
-- 4. COMPARAR COM SESSION_IDS DO CHAT
-- ============================================

-- Session IDs existentes no chat
SELECT DISTINCT session_id 
FROM n8nchathistories 
ORDER BY session_id;

-- Telefones dos clientes
SELECT "wppPhone" 
FROM "Client" 
WHERE "wppPhone" IS NOT NULL
ORDER BY "wppPhone";

-- ESSES DEVEM BATER AGORA!


-- ============================================
-- 5. TESTAR: BUSCAR MENSAGENS DO GABRIEL
-- ============================================

SELECT 
    id,
    session_id,
    LEFT(message, 100) as preview
FROM n8nchathistories
WHERE session_id = '11554899924955@s.whatsapp.net'
ORDER BY id
LIMIT 10;

-- Deve retornar as mensagens!


-- ============================================
-- 6. SE PRECISAR CORRIGIR MAIS CLIENTES
-- ============================================

-- Para clientes de São Paulo (DDD 11):
-- Descomente e ajuste conforme necessário:

/*
UPDATE "Client"
SET "wppPhone" = '11' || "wppPhone"
WHERE "wppPhone" IS NOT NULL
  AND LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 11
  AND "wppPhone" LIKE '5548%';  -- Clientes SC que falta DDD
*/

-- ATENÇÃO: Só use isso se tiver certeza do DDD correto!
-- DDDs Santa Catarina: 47, 48, 49
-- Se o número for 5548XXXXX, está faltando o DDD 48


-- ============================================
-- 7. CORRIGIR AUTOMATICAMENTE (SC - DDD 48)
-- ============================================

-- Se todos os seus clientes são de SC (DDD 48):
/*
UPDATE "Client"
SET "wppPhone" = REPLACE("wppPhone", '5548', '485548')
WHERE "wppPhone" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 11;
*/

-- Isso transforma: 554899924955 → 48554899924955
