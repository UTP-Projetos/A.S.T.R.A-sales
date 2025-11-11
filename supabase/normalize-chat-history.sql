-- Script para normalizar mensagens do chat histórico
-- Adiciona campos obrigatórios do n8n que estão faltando

-- IMPORTANTE: O campo message é armazenado como JSONB no banco
-- JSONB não mantém formatação (pretty print), apenas o conteúdo
-- O n8n visualiza formatado, mas armazena como JSONB normalizado
-- Este script adiciona campos faltantes e garante estrutura correta

-- Primeiro, vamos ver quantas mensagens estão com formato incompleto
SELECT 
  id,
  session_id,
  CASE 
    WHEN message::jsonb ? 'additional_kwargs' THEN 'completo'
    ELSE 'incompleto'
  END as status_formato,
  LEFT(message::text, 100) as preview
FROM "n8nchathistories"
ORDER BY id DESC
LIMIT 20;

-- Normalizar mensagens do tipo "human" que não têm additional_kwargs e response_metadata
-- IMPORTANTE: O campo message é JSONB, então não mantemos formatação pretty
-- Apenas adicionamos os campos faltantes
UPDATE "n8nchathistories"
SET message = jsonb_set(
  jsonb_set(
    COALESCE(message::jsonb, '{}'::jsonb),
    '{additional_kwargs}',
    COALESCE(message::jsonb->'additional_kwargs', '{}'::jsonb)
  ),
  '{response_metadata}',
  COALESCE(message::jsonb->'response_metadata', '{}'::jsonb)
)
WHERE 
  message::jsonb->>'type' = 'human'
  AND (
    NOT (message::jsonb ? 'additional_kwargs')
    OR NOT (message::jsonb ? 'response_metadata')
    OR message::jsonb->'additional_kwargs' IS NULL 
    OR message::jsonb->'response_metadata' IS NULL
  );

-- Normalizar mensagens do tipo "ai" que não têm todos os campos obrigatórios
-- IMPORTANTE: O campo message é JSONB, então apenas adicionamos campos faltantes
UPDATE "n8nchathistories"
SET message = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(message::jsonb, '{}'::jsonb),
        '{tool_calls}',
        COALESCE(message::jsonb->'tool_calls', '[]'::jsonb)
      ),
      '{additional_kwargs}',
      COALESCE(message::jsonb->'additional_kwargs', '{}'::jsonb)
    ),
    '{response_metadata}',
    COALESCE(message::jsonb->'response_metadata', '{}'::jsonb)
  ),
  '{invalid_tool_calls}',
  COALESCE(message::jsonb->'invalid_tool_calls', '[]'::jsonb)
)
WHERE 
  message::jsonb->>'type' = 'ai'
  AND (
    NOT (message::jsonb ? 'tool_calls')
    OR NOT (message::jsonb ? 'additional_kwargs')
    OR NOT (message::jsonb ? 'response_metadata')
    OR NOT (message::jsonb ? 'invalid_tool_calls')
    OR message::jsonb->'tool_calls' IS NULL 
    OR message::jsonb->'additional_kwargs' IS NULL 
    OR message::jsonb->'response_metadata' IS NULL 
    OR message::jsonb->'invalid_tool_calls' IS NULL
  );

-- IMPORTANTE: Como o campo message é JSONB, não podemos manter formatação pretty
-- O PostgreSQL normaliza automaticamente o formato do JSONB
-- A visualização pretty é apenas para exibição, não para armazenamento
-- Por isso, não precisamos normalizar o formato - apenas os campos faltantes

-- Verificar resultado após normalização
SELECT 
  id,
  session_id,
  message::jsonb->>'type' as tipo,
  CASE 
    WHEN message::jsonb->>'type' = 'human' THEN
      CASE 
        WHEN (message::jsonb ? 'additional_kwargs')
         AND (message::jsonb ? 'response_metadata')
         AND message::jsonb->'additional_kwargs' IS NOT NULL 
         AND message::jsonb->'response_metadata' IS NOT NULL THEN 'OK'
        ELSE 'INCOMPLETO'
      END
    WHEN message::jsonb->>'type' = 'ai' THEN
      CASE 
        WHEN (message::jsonb ? 'tool_calls')
         AND (message::jsonb ? 'additional_kwargs')
         AND (message::jsonb ? 'response_metadata')
         AND (message::jsonb ? 'invalid_tool_calls')
         AND message::jsonb->'tool_calls' IS NOT NULL 
         AND message::jsonb->'additional_kwargs' IS NOT NULL 
         AND message::jsonb->'response_metadata' IS NOT NULL 
         AND message::jsonb->'invalid_tool_calls' IS NOT NULL THEN 'OK'
        ELSE 'INCOMPLETO'
      END
    ELSE 'TIPO DESCONHECIDO'
  END as status_formato,
  jsonb_pretty(message::jsonb) as preview_pretty
FROM "n8nchathistories"
ORDER BY id DESC
LIMIT 20;

