-- Script SQL para corrigir dados do CRM baseado no workflow N8N
-- Execute este script no Supabase SQL Editor

-- 1. Corrigir DDD nos telefones dos clientes
UPDATE "Client" 
SET "wppPhone" = '55' || SUBSTRING("wppPhone", 1, 11)
WHERE "wppPhone" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 11;

-- 2. Atualizar session_id no chat para ter DDD
UPDATE "n8nchathistories" 
SET "session_id" = '55' || SUBSTRING("session_id", 1, 11)
WHERE "session_id" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("session_id", '@s.whatsapp.net', '')) = 11;

-- 3. Preencher user_id na Company baseado no email
UPDATE "Company" 
SET "user_id" = (
  SELECT id FROM auth.users 
  WHERE email = "Company".email
)
WHERE "user_id" IS NULL;

-- 4. Corrigir Schedules com dados reais
UPDATE "Schedules" 
SET 
  "CompanyClientId" = '12',
  "client" = 'Gabriel',
  "confirmationLink" = 'https://cavera.com.br/confirmar/agendamento/placeholder',
  "appointmentNotes" = '{"tipo_acomodacao": "Hotel", "data_checkin": "10/10/2030", "num_adultos": 2, "valor_total": 0.00}'
WHERE id = 11;

-- 5. Verificar resultados
SELECT 'Client' as tabela, "wppPhone" FROM "Client" WHERE "wppPhone" LIKE '55%@s.whatsapp.net'
UNION ALL
SELECT 'Company' as tabela, "WppPhone" FROM "Company" WHERE "WppPhone" LIKE '55%@s.whatsapp.net'
UNION ALL
SELECT 'n8nchathistories' as tabela, "session_id" FROM "n8nchathistories" WHERE "session_id" LIKE '55%@s.whatsapp.net';

-- 6. Verificar user_id preenchido
SELECT id, name, email, "user_id" FROM "Company";

-- 7. Verificar Schedules corrigido
SELECT id, "CompanyClientId", "client", "confirmationLink", "appointmentNotes" FROM "Schedules";
