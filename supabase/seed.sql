-- ============================================================================
-- SEED - Dados de Exemplo para Desenvolvimento
-- ============================================================================
-- Este arquivo adiciona dados de exemplo para testar o A.S.T.R.A CRM
-- 
-- IMPORTANTE: Use apenas em desenvolvimento/testes
-- NÃO execute em produção com dados reais!
-- ============================================================================

-- Limpar dados de exemplo anteriores (se existirem)
DELETE FROM "Schedules" WHERE "CompanyClientId" = '999';
DELETE FROM "Client" WHERE "CompanyId" = '999';
DELETE FROM "Company" WHERE id = 999;

-- ============================================================================
-- 1. EMPRESA DE TESTE
-- ============================================================================

INSERT INTO "Company" (
  id,
  name,
  email,
  "WppPhone",
  "user_id",
  status,
  "instanceName",
  "tokenInstance",
  "whatsappConnected",
  "webhookConfigured",
  "onboardingCompleted",
  created_at
) VALUES (
  999,
  'Empresa Teste - Dev',
  'teste@astra-crm.dev',
  '5511999990000@s.whatsapp.net',
  'test-user-uuid-123',
  'active',
  'amanda-test-999',
  'test-token-123',
  true,
  true,
  true,
  NOW()
);

-- ============================================================================
-- 2. CLIENTES DE EXEMPLO
-- ============================================================================

INSERT INTO "Client" (
  name,
  "wppPhone",
  email,
  "CompanyId",
  "crmLeadStatus",
  "activeBot",
  "conversationId",
  cpf,
  "dateOfBirth",
  adress,
  created_at
) VALUES 
-- Cliente 1: Novo Contato
(
  'João Silva',
  '5511999991111@s.whatsapp.net',
  'joao.silva@email.com',
  '999',
  'Novo Contato',
  true,
  null,
  '111.111.111-11',
  '1990-01-15',
  'Rua das Flores, 123 - São Paulo, SP',
  NOW() - INTERVAL '2 days'
),

-- Cliente 2: Contato em Andamento
(
  'Maria Santos',
  '5511999992222@s.whatsapp.net',
  'maria.santos@email.com',
  '999',
  'Contato em Andamento',
  true,
  'conv-maria-001',
  '222.222.222-22',
  '1985-05-20',
  'Av. Paulista, 1000 - São Paulo, SP',
  NOW() - INTERVAL '1 day'
),

-- Cliente 3: Orçamento Enviado
(
  'Pedro Oliveira',
  '5511999993333@s.whatsapp.net',
  'pedro.oliveira@email.com',
  '999',
  'Orçamento Enviado',
  true,
  'conv-pedro-001',
  '333.333.333-33',
  '1992-08-10',
  'Rua Augusta, 500 - São Paulo, SP',
  NOW() - INTERVAL '5 hours'
),

-- Cliente 4: Reserva Confirmada
(
  'Ana Costa',
  '5511999994444@s.whatsapp.net',
  'ana.costa@email.com',
  '999',
  'Reserva/Agendamento Confirmado',
  true,
  'conv-ana-001',
  '444.444.444-44',
  '1988-12-25',
  'Rua Oscar Freire, 200 - São Paulo, SP',
  NOW() - INTERVAL '3 hours'
),

-- Cliente 5: Visita Realizada
(
  'Carlos Mendes',
  '5511999995555@s.whatsapp.net',
  'carlos.mendes@email.com',
  '999',
  'Visita/Atividade Realizada',
  false,
  'conv-carlos-001',
  '555.555.555-55',
  '1995-03-30',
  'Rua da Consolação, 800 - São Paulo, SP',
  NOW() - INTERVAL '7 days'
),

-- Cliente 6: Contato Perdido
(
  'Juliana Lima',
  '5511999996666@s.whatsapp.net',
  'juliana.lima@email.com',
  '999',
  'Contato Perdido',
  false,
  null,
  '666.666.666-66',
  '1993-07-18',
  'Rua Haddock Lobo, 300 - São Paulo, SP',
  NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- 3. AGENDAMENTOS DE EXEMPLO
-- ============================================================================

INSERT INTO "Schedules" (
  "client",
  "CompanyClientId",
  "appointmentType",
  "appointmentDate",
  "appointmentNotes",
  "schedulingStatus",
  "confirmationLink",
  created_at
) VALUES 
-- Agendamento 1: Hospedagem Pendente
(
  '5511999994444@s.whatsapp.net',
  '999',
  'Hospedagem',
  NOW() + INTERVAL '7 days',
  '{"tipo_acomodacao": "Suíte Luxo", "data_checkin": "2025-11-15", "data_checkout": "2025-11-18", "num_adultos": 2, "num_criancas": 1, "valor_total": 2500.00}',
  'Pendente',
  'https://astra-crm.com/confirm/abc123',
  NOW() - INTERVAL '3 hours'
),

-- Agendamento 2: Ingresso Confirmado
(
  '5511999993333@s.whatsapp.net',
  '999',
  'Ingresso',
  NOW() + INTERVAL '3 days',
  '{"tipo_ingresso": "Parque Temático VIP", "data_visita": "2025-11-10", "num_pessoas": 4, "valor_total": 800.00}',
  'Confirmado',
  'https://astra-crm.com/confirm/def456',
  NOW() - INTERVAL '5 hours'
),

-- Agendamento 3: Atividade Realizada
(
  '5511999995555@s.whatsapp.net',
  '999',
  'Atividade',
  NOW() - INTERVAL '2 days',
  '{"nome_atividade": "City Tour Premium", "data_atividade": "2025-11-04", "horario_atividade": "09:00", "num_participantes": 2}',
  'Realizado',
  'https://astra-crm.com/confirm/ghi789',
  NOW() - INTERVAL '7 days'
),

-- Agendamento 4: Hospedagem Cancelada
(
  '5511999996666@s.whatsapp.net',
  '999',
  'Hospedagem',
  NOW() + INTERVAL '14 days',
  '{"tipo_acomodacao": "Quarto Standard", "data_checkin": "2025-11-20", "data_checkout": "2025-11-22", "num_adultos": 1, "num_criancas": 0, "valor_total": 600.00}',
  'Cancelado',
  'https://astra-crm.com/confirm/jkl012',
  NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- 4. HISTÓRICO DE CONVERSAS (Opcional)
-- ============================================================================

INSERT INTO "n8nchathistories" (
  session_id,
  message,
  created_at
) VALUES 
-- Conversa 1: Maria Santos
(
  '5511999992222@s.whatsapp.net',
  '{"type": "human", "content": "Olá, gostaria de informações sobre hospedagem"}',
  NOW() - INTERVAL '1 day'
),
(
  '5511999992222@s.whatsapp.net',
  '{"type": "ai", "content": "Olá! Sou a Amanda, assistente virtual da Pousada. Temos várias opções de hospedagem disponíveis. Para qual data você está pensando?"}',
  NOW() - INTERVAL '1 day' + INTERVAL '30 seconds'
),
(
  '5511999992222@s.whatsapp.net',
  '{"type": "human", "content": "Para o dia 15 de novembro, 3 dias"}',
  NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'
),

-- Conversa 2: Pedro Oliveira
(
  '5511999993333@s.whatsapp.net',
  '{"type": "human", "content": "Quanto custa o ingresso para o parque?"}',
  NOW() - INTERVAL '5 hours'
),
(
  '5511999993333@s.whatsapp.net',
  '{"type": "ai", "content": "Ótima pergunta! O ingresso normal custa R$ 150 por pessoa. Temos também a opção VIP por R$ 200 com acesso a atrações exclusivas. Quantas pessoas?"}',
  NOW() - INTERVAL '5 hours' + INTERVAL '20 seconds'
);

-- ============================================================================
-- 5. VERIFICAR DADOS INSERIDOS
-- ============================================================================

-- Contar registros inseridos
DO $$
DECLARE
  company_count INTEGER;
  client_count INTEGER;
  schedule_count INTEGER;
  chat_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO company_count FROM "Company" WHERE id = 999;
  SELECT COUNT(*) INTO client_count FROM "Client" WHERE "CompanyId" = '999';
  SELECT COUNT(*) INTO schedule_count FROM "Schedules" WHERE "CompanyClientId" = '999';
  SELECT COUNT(*) INTO chat_count FROM "n8nchathistories" WHERE session_id LIKE '%5511999%';
  
  RAISE NOTICE '✅ Seed concluído com sucesso!';
  RAISE NOTICE '   Empresas: % ', company_count;
  RAISE NOTICE '   Clientes: % ', client_count;
  RAISE NOTICE '   Agendamentos: %', schedule_count;
  RAISE NOTICE '   Conversas: %', chat_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Credenciais de teste:';
  RAISE NOTICE '   Email: teste@astra-crm.dev';
  RAISE NOTICE '   User ID: test-user-uuid-123';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Próximo passo:';
  RAISE NOTICE '   1. Faça login com um usuário que tenha user_id = "test-user-uuid-123"';
  RAISE NOTICE '   2. Ou atualize o user_id da empresa para seu usuário atual';
END $$;

-- ============================================================================
-- FIM DO SEED
-- ============================================================================
