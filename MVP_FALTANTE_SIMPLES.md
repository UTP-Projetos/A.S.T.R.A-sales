# O Que Falta para MVP - ASTRA Sales

**Baseado em:** FuncionalidadesdasLinhasASTRAv2.md  
**Status Atual:** ~15% implementado

---

## 1. Qualificação Automática de Leads

- [ ] Coletar informações automaticamente durante conversa (orçamento, necessidade, autoridade, prazo)
- [ ] Aplicar framework BANT (Budget, Authority, Need, Timeline)
- [ ] Calcular pontuação de qualificação do lead
- [ ] Categorizar leads (Quente, Morno, Frio)
- [ ] Atualizar automaticamente o campo `crmLeadStatus` no banco de dados
- [ ] Exibir score de qualificação no frontend

---

## 2. Gestão de Pipeline Conversacional

- [ ] Atualizar status do lead automaticamente conforme interações progridem
- [ ] Identificar leads estagnados (sem interação há X dias)
- [ ] Enviar mensagens de reengajamento automáticas para leads estagnados
- [ ] Priorizar follow-ups baseado em probabilidade de conversão
- [ ] Exibir lista de leads estagnados no dashboard
- [ ] Permitir reengajamento manual pelo vendedor

---

## 3. Agendamento Funcional (CRUD Completo)

- [ ] Criar agendamento manual (formulário no frontend)
- [ ] Editar agendamento existente
- [ ] Cancelar agendamento
- [ ] Confirmar agendamento
- [ ] Marcar agendamento como realizado
- [ ] Validar disponibilidade (prevenir sobreposições de horário)
- [ ] Enviar lembrete automático por WhatsApp 24h antes do agendamento
- [ ] API: `POST /api/schedules` (criar)
- [ ] API: `PUT /api/schedules/[id]` (editar)
- [ ] API: `PATCH /api/schedules/[id]/cancel` (cancelar)
- [ ] API: `PATCH /api/schedules/[id]/confirm` (confirmar)
- [ ] API: `PATCH /api/schedules/[id]/complete` (marcar como realizado)

---

## 4. Handoff Humanizado

- [ ] Detectar momentos críticos que exigem intervenção humana (objeções, negociações, clientes VIP)
- [ ] Transferir conversa para vendedor humano com contexto completo
- [ ] Gerar resumo automático da interação
- [ ] Notificar vendedor sobre conversa pendente
- [ ] Criar painel de conversas pendentes no frontend
- [ ] Permitir que vendedor assuma controle da conversa (pausar bot)
- [ ] Tabela `HandoffRequests` no banco de dados
- [ ] API: `POST /api/handoff/request` (solicitar handoff)
- [ ] API: `GET /api/handoff/pending` (listar pendentes)
- [ ] API: `POST /api/handoff/accept` (aceitar handoff)

---

## 5. Processamento de Pedidos

- [ ] Coletar informações de pedido via conversa (produto, quantidade, prazo)
- [ ] Validar dados coletados
- [ ] Calcular valores automaticamente
- [ ] Gerar proposta comercial formatada
- [ ] Enviar proposta por WhatsApp
- [ ] Acompanhar status da proposta (Pendente, Aprovada, Rejeitada)
- [ ] Transformar proposta aprovada em pedido confirmado
- [ ] Tabela `Proposals` no banco de dados
- [ ] Página `/propostas` no frontend (listagem)
- [ ] Página `/propostas/[id]` no frontend (detalhes)
- [ ] API: `POST /api/proposals` (criar proposta)
- [ ] API: `GET /api/proposals` (listar propostas)
- [ ] API: `PATCH /api/proposals/[id]/approve` (aprovar)
- [ ] API: `PATCH /api/proposals/[id]/reject` (rejeitar)

---

## 6. Atendimento Conversacional Básico

- [ ] Manter contexto conversacional entre mensagens
- [ ] Personalizar respostas baseado em histórico do cliente
- [ ] Análise básica de sentimento (positivo/negativo/neutro)

---

## 7. Catálogo de Produtos Básico

- [ ] Cadastrar produtos/serviços
- [ ] Listar produtos no frontend
- [ ] Editar produtos
- [ ] Apresentar produtos de forma conversacional via WhatsApp
- [ ] Tabela `Products` no banco de dados
- [ ] Página `/produtos` no frontend (CRUD)
- [ ] API: `GET /api/products` (listar)
- [ ] API: `POST /api/products` (criar)
- [ ] API: `PUT /api/products/[id]` (editar)
- [ ] API: `DELETE /api/products/[id]` (deletar)

---

## Estrutura de Banco de Dados Necessária

- [ ] Tabela `HandoffRequests` (id, clientId, summary, status, createdAt)
- [ ] Tabela `Proposals` (id, clientId, products, total, status, createdAt)
- [ ] Tabela `Products` (id, name, description, price, category, image)
- [ ] Campo `qualificationScore` na tabela `Client` (INTEGER)
- [ ] Campo `lastInteractionDate` na tabela `Client` (TIMESTAMP)

---

## Workflows n8n Necessários

- [ ] Agente "Lead Qualifier" (qualificação automática)
- [ ] Agente "Pipeline Manager" (gestão de pipeline e reengajamento)
- [ ] Agente "Order Processor" (processamento de pedidos)
- [ ] Agente "Handoff Detector" (detecção de necessidade de handoff)
- [ ] Workflow de lembretes de agendamento (24h antes)

---

## Total Estimado

**MVP Core:** 116-158h (~3-4 semanas)  
**Com Melhorias:** 148-202h (~4-5 semanas)

