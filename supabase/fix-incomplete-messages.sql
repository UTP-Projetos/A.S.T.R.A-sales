-- Script para corrigir mensagens que não foram normalizadas pelo script anterior
-- Foco nas mensagens que aparecem como "TIPO DESCONHECIDO" ou incompletas

-- Primeiro, vamos ver quais mensagens estão com problema
SELECT 
  id,
  session_id,
  message::jsonb->>'type' as tipo_atual,
  CASE 
    WHEN message::jsonb ? 'type' THEN 'tem type'
    ELSE 'sem type'
  END as tem_type,
  LEFT(message::text, 150) as preview
FROM "n8nchathistories"
WHERE 
  id IN (733, 732, 731, 730, 729)
  OR message::jsonb->>'type' IS NULL
ORDER BY id DESC;

-- Corrigir mensagens do tipo "human" que estão faltando campos
-- IDs 731, 730, 729 são do tipo "human" mas faltam campos
UPDATE "n8nchathistories"
SET message = jsonb_set(
  jsonb_set(
    COALESCE(message::jsonb, '{}'::jsonb),
    '{additional_kwargs}',
    '{}'::jsonb
  ),
  '{response_metadata}',
  '{}'::jsonb
)
WHERE id IN (731, 730, 729)
  AND message::jsonb->>'type' = 'human';

-- Corrigir mensagens do tipo "ai" que estão faltando campos
-- ID 732 é do tipo "ai" mas falta campos
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
WHERE id = 732
  AND message::jsonb->>'type' = 'ai';

-- ID 733 já tem todos os campos, mas vamos garantir que está correto
-- Apenas verificar, não precisa atualizar

-- Verificar resultado final
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
WHERE id IN (733, 732, 731, 730, 729)
ORDER BY id DESC;

