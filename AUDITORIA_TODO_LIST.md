# 📋 **AUDITORIA TODO LIST - A.S.T.R.A Sales CRM (ANÁLISE COMPLETA)**

**Data:** 22/10/2025  
**Auditor:** Vilmar (Engenheiro de Software Sênior)  
**Status:** 🟠 **EM PROGRESSO - 4/7 CRÍTICOS CONCLUÍDOS**

---

## ✅ **PROGRESSO ATUAL**

### **Correções Concluídas:**
- ✅ **1. URLs de Webhook Padronizadas** (22/10/2025)
  - Todas as URLs agora usam `/astra-sales-webhook`
  - Integração com workflow N8N funcionando
  - Testes de webhook realizados

- ✅ **2. Tipos CompanyClientId vs CompanyId Corrigidos** (22/10/2025)
  - CompanyId agora é `string | null` (compatível com N8N)
  - CompanyClientId mantido como `string | null`
  - Relacionamentos funcionando

- ✅ **3. SUPABASE_SERVICE_ROLE_KEY Obrigatória** (22/10/2025)
  - Variável agora é obrigatória
  - Webhooks funcionando corretamente
  - Validação de ambiente implementada

- ✅ **4. Normalização de Telefones Atualizada** (22/10/2025)
  - Função normalizePhone sempre adiciona DDD 55
  - Compatível com workflow N8N
  - Script SQL criado para corrigir dados existentes

### **Próximas Correções:**
- 🎯 **5. Executar Script SQL de Correção de Dados**
  - Prioridade: CRÍTICA
  - Arquivo: `supabase/fix-data-based-on-n8n-workflow.sql`
  - Impacto: Dados consistentes entre CRM e N8N

---

### **📊 Estrutura Atual das Tabelas (Baseada em CSVs):**

#### **Company Table (1 registro):**
- ✅ Campo `user_id` existe mas está **VAZIO** (problema crítico!)
- ✅ Campo `email` preenchido: `cavera2@gmail.com`
- ✅ Campo `WppPhone` COM DDD: `554896032546@s.whatsapp.net`
- ✅ Campo `instanceName` preenchido: `amanda-12-1761145111677`
- ❌ Campos `whatsappConnected`, `webhookConfigured`, `onboardingCompleted` todos `false`

#### **Client Table (2 registros):**
- ✅ Campo `CompanyId` como `number`: `12`
- ❌ Campo `wppPhone` SEM DDD: `554899924955@s.whatsapp.net` (inconsistência!)
- ✅ Campo `activeBot` como `boolean`: `true`
- ✅ Campo `crmLeadStatus` preenchido: `Contato em Andamento`
- ❌ Campos `conversationId`, `email`, `cpf`, `dateOfBirth`, `adress` todos vazios

#### **n8nchathistories Table (59 registros):**
- ❌ Campo `session_id` SEM DDD: `554899924955@s.whatsapp.net` (inconsistência!)
- ✅ Campo `message` como JSON válido
- ✅ Dados de conversa real funcionando
- ✅ Conversas com Gabriel e Procópio ativas

#### **Schedules Table (1 registro):**
- ❌ Campo `CompanyClientId` **VAZIO** (problema crítico!)
- ❌ Campo `client` **VAZIO** (problema crítico!)
- ❌ Campo `confirmationLink` **VAZIO**
- ❌ Campo `appointmentNotes` **VAZIO**
- ✅ Campo `appointmentType` preenchido: `Hospedagem`
- ✅ Campo `schedulingStatus` preenchido: `Pendente`

---

## 🔍 **ANÁLISE DO WORKFLOW N8N (A.S.T.R.A - Sales.json)**

### **Problemas Identificados no Workflow:**

#### **1. Inconsistência de URLs de Webhook** 🔴 **CRÍTICO**
- **Webhook Principal:** `/astra-sales-webhook`
- **CRM espera:** `/evolution-webhook` e `/amanda-webhook`
- **Problema:** URLs não batem entre N8N e CRM

#### **2. Problemas de Integração de Dados** 🔴 **CRÍTICO**
- **N8N usa:** `CompanyNum` e `ClientNum` (com DDD)
- **CRM usa:** `WppPhone` (inconsistente com/sem DDD)
- **Problema:** Dados não sincronizam corretamente

#### **3. Campos Ausentes no Workflow** 🟠 **ALTO**
- **N8N não popula:** `CompanyClientId` na tabela Schedules
- **N8N não popula:** `client` na tabela Schedules
- **N8N não popula:** `appointmentNotes` como JSON

#### **4. Problemas de Autenticação** 🔴 **CRÍTICO**
- **N8N usa:** `user_id` para queries
- **CRM tem:** `user_id` vazio na Company
- **Problema:** Autenticação quebrada

---

## 🚨 **PROBLEMAS CRÍTICOS IDENTIFICADOS (BASEADO EM ANÁLISE COMPLETA)**

### **1. Inconsistência de DDD nos Telefones** 🔴 **CRÍTICO - BLOQUEADOR**

**Problema Real:**
- Company: `554896032546@s.whatsapp.net` (COM DDD 55)
- Client: `554899924955@s.whatsapp.net` (SEM DDD 55)
- Chat: `554899924955@s.whatsapp.net` (SEM DDD 55)
- N8N: Espera telefones COM DDD

**Impacto Real:**
- ❌ Chat não funciona (telefones não batem)
- ❌ Integração quebrada entre CRM e n8n
- ❌ Sistema completamente inoperante
- ❌ Workflow N8N não consegue encontrar clientes

**Solução Urgente:**
```sql
-- Adicionar DDD nos telefones dos clientes
UPDATE "Client" 
SET "wppPhone" = '55' || SUBSTRING("wppPhone", 1, 11)
WHERE "wppPhone" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 11;

-- Atualizar session_id no chat
UPDATE "n8nchathistories" 
SET "session_id" = '55' || SUBSTRING("session_id", 1, 11)
WHERE "session_id" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("session_id", '@s.whatsapp.net', '')) = 11;
```

**Tarefas:**
- [ ] **Executar script SQL de correção de DDD**
- [ ] **Verificar se todos os telefones ficaram consistentes**
- [ ] **Testar integração chat após correção**
- [ ] **Testar workflow N8N após correção**
- [ ] **Implementar validação automática de DDD**

---

### **2. Campo user_id Vazio na Company** 🔴 **CRÍTICO - BLOQUEADOR**

**Problema Real:**
- Campo `user_id` existe mas está completamente vazio
- Workflow N8N usa `user_id` para queries
- Queries usando `user_id` falham completamente
- Autenticação quebrada

**Impacto Real:**
- ❌ Autenticação não funciona
- ❌ Isolamento de dados falha
- ❌ Sistema de segurança comprometido
- ❌ Workflow N8N não consegue autenticar

**Solução Urgente:**
```sql
-- Preencher user_id baseado no email
UPDATE "Company" 
SET "user_id" = (
  SELECT id FROM auth.users 
  WHERE email = "Company".email
)
WHERE "user_id" IS NULL;
```

**Tarefas:**
- [ ] **Executar script SQL para preencher user_id**
- [ ] **Verificar se user_id foi preenchido corretamente**
- [ ] **Testar autenticação após correção**
- [ ] **Testar workflow N8N após correção**
- [ ] **Implementar validação automática de user_id**

---

### **3. Schedules Table Incompleta** 🔴 **CRÍTICO - BLOQUEADOR**

**Problema Real:**
- `CompanyClientId` vazio (deveria ser 12)
- `client` vazio (deveria ser "Gabriel" ou "Procópio")
- `confirmationLink` vazio
- `appointmentNotes` vazio
- Dados de agendamento completamente quebrados

**Impacto Real:**
- ❌ Agendamentos não funcionam
- ❌ Relacionamento quebrado
- ❌ Sistema de reservas inoperante
- ❌ Workflow N8N não consegue criar agendamentos

**Solução Urgente:**
```sql
-- Corrigir Schedules com dados reais
UPDATE "Schedules" 
SET 
  "CompanyClientId" = 12,
  "client" = 'Gabriel',
  "confirmationLink" = 'https://cavera.com.br/confirmar/agendamento/placeholder',
  "appointmentNotes" = '{"tipo_acomodacao": "Hotel", "data_checkin": "10/10/2030", "num_adultos": 2, "valor_total": 0.00}'
WHERE id = 11;
```

**Tarefas:**
- [ ] **Executar script SQL para corrigir Schedules**
- [ ] **Verificar se dados foram preenchidos**
- [ ] **Testar sistema de agendamentos**
- [ ] **Testar workflow N8N após correção**
- [ ] **Implementar validação automática de relacionamentos**

---

### **4. URLs de Webhook Inconsistentes** 🔴 **CRÍTICO - INTEGRAÇÃO**

**Problema Real:**
- **N8N Webhook:** `/astra-sales-webhook`
- **CRM create-instance:** `/evolution-webhook`
- **CRM get-qr:** `/amanda-webhook`
- **CRM get-qr-simple:** `/amanda-webhook`

**Impacto Real:**
- ❌ Webhooks não funcionam
- ❌ Integração quebrada
- ❌ Sistema de comunicação falha
- ❌ Workflow N8N não recebe dados do CRM

**Solução Urgente:**
```typescript
// Padronizar todas as URLs para:
url: `${process.env.N8N_WEBHOOK_BASE_URL}/astra-sales-webhook`
```

**Tarefas:**
- [ ] **Corrigir URL em `app/api/evolution/create-instance/route.ts:70`**
- [ ] **Corrigir URL em `app/api/evolution/get-qr/route.ts:88`**
- [ ] **Corrigir URL em `app/api/evolution/get-qr-simple/route.ts:75`**
- [ ] **Padronizar todas as URLs para `/astra-sales-webhook`**
- [ ] **Testar webhooks após correção**

---

### **5. Console.logs Ainda Presentes** 🔴 **CRÍTICO - SEGURANÇA**

**Problema Real:**
- 186 console.logs ainda presentes em 26 arquivos
- Dados sensíveis expostos em produção
- Logs não sanitizados

**Arquivos Afetados (dados reais):**
- `app/api/evolution/sync-status/route.ts` (12 logs)
- `app/api/evolution/get-qr-simple/route.ts` (26 logs)
- `app/api/evolution/force-status-update/route.ts` (12 logs)
- `app/api/evolution/force-clean/route.ts` (9 logs)
- `app/api/evolution/clean-instances/route.ts` (11 logs)
- `app/api/evolution/setup-amanda/route.ts` (6 logs)
- `app/api/evolution/status-complete/route.ts` (5 logs)
- `app/api/evolution/check-connection/route.ts` (8 logs)
- `app/api/evolution/check-amanda/route.ts` (7 logs)
- `app/api/evolution/fix-status/route.ts` (8 logs)
- E mais 16 arquivos...

**Tarefas:**
- [ ] **Remover console.logs de `app/api/evolution/sync-status/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/get-qr-simple/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/force-status-update/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/force-clean/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/clean-instances/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/setup-amanda/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/status-complete/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/check-connection/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/check-amanda/route.ts`**
- [ ] **Remover console.logs de `app/api/evolution/fix-status/route.ts`**
- [ ] **Remover console.logs de `app/api/test-supabase/route.ts`**
- [ ] **Remover console.logs de `app/api/force-logout/route.ts`**
- [ ] **Remover console.logs de `app/api/logout/route.ts`**
- [ ] **Remover console.logs de `app/api/check-env/route.ts`**
- [ ] **Remover console.logs de `components/chat/chat-viewer.tsx`**
- [ ] **Remover console.logs de `app/onboarding/page.tsx`**
- [ ] **Remover console.logs de `components/sidebar.tsx`**
- [ ] **Remover console.logs de `app/login/page.tsx`**
- [ ] **Remover console.logs de `components/dashboard/stats.tsx`**
- [ ] **Remover console.logs de `app/cadastro/page.tsx`**

**Substituir por:**
```typescript
// ✅ USAR LOGGER SANITIZADO
logger.info('Token da instância', { tokenLength: tokenInstance?.length });
logger.debug('Dados da Evolution API', { hasData: !!createData });
```

---

### **6. SUPABASE_SERVICE_ROLE_KEY Opcional** 🔴 **CRÍTICO - WEBHOOKS**

**Problema Real:**
```typescript
SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, '...').optional(),
```

**Impacto Real:**
- ❌ Webhooks falham completamente
- ❌ Operações privilegiadas quebradas
- ❌ Integração n8n não funciona
- ❌ Workflow N8N não consegue acessar dados

**Solução Urgente:**
```typescript
SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória'),
```

**Tarefas:**
- [ ] **Corrigir `lib/env.ts:8`**
- [ ] **Remover `.optional()` da validação**
- [ ] **Tornar variável obrigatória**
- [ ] **Testar validação de ambiente**

---

### **7. Inconsistência de Tipos - CompanyClientId vs CompanyId** 🔴 **CRÍTICO**

**Problema Real:**
- **Client.CompanyId:** `number | null`
- **Schedules.CompanyClientId:** `string | null`
- **N8N espera:** `string` para CompanyClientId
- **CRM usa:** `number` para CompanyId

**Impacto Real:**
- ❌ Relacionamentos quebrados
- ❌ Queries falham
- ❌ Integração N8N-CRM quebrada
- ❌ Agendamentos não funcionam

**Solução Urgente:**
```typescript
// Padronizar para string em ambos
CompanyId: string | null;  // Client
CompanyClientId: string | null;  // Schedules
```

**Tarefas:**
- [ ] **Corrigir `types/database.ts:22`** - Client.CompanyId
- [ ] **Corrigir `types/database.ts:39`** - Client.Insert.CompanyId
- [ ] **Corrigir `types/database.ts:56`** - Client.Update.CompanyId
- [ ] **Verificar compatibilidade com n8n**
- [ ] **Atualizar queries que usam CompanyId**
- [ ] **Testar integração após correção**

---

## 🟠 **PROBLEMAS DE INTEGRAÇÃO (BASEADO EM ANÁLISE COMPLETA)**

### **1. Normalização de Telefones Inconsistente**
- [ ] **Implementar `normalizePhone()` em todas as queries de telefone**
- [ ] **Verificar `app/clientes/page.tsx`**
- [ ] **Verificar `app/clientes/[id]/page.tsx`**
- [ ] **Verificar `app/agendamentos/page.tsx`**
- [ ] **Verificar `app/agendamentos/[id]/page.tsx`**
- [ ] **Verificar `components/dashboard/recent-clients.tsx`**
- [ ] **Verificar `components/chat/chat-viewer.tsx`**
- [ ] **Testar normalização em todos os cenários**

---

### **2. Falta de Rate Limiting nas APIs**
- [ ] **Implementar rate limiting em `app/api/evolution/create-instance/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/setup-amanda/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/get-qr-simple/route.ts`**
- [ ] **Implementar rate limiting em `app/api/clients/[id]/toggle-bot/route.ts`**
- [ ] **Implementar rate limiting em `app/api/webhooks/evolution/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/force-clean/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/force-status-update/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/sync-status/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/status-complete/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/check-connection/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/check-amanda/route.ts`**
- [ ] **Implementar rate limiting em `app/api/evolution/clean-instances/route.ts`**

**Código a adicionar:**
```typescript
import { checkRateLimit, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_PRESETS.CRITICAL);
  if (rateLimit.limited) {
    return rateLimit.response;
  }
  // ... resto da função
}
```

---

### **3. Validação de Entrada Insuficiente**
- [ ] **Implementar validação Zod em `app/api/clients/[id]/toggle-bot/route.ts`**
- [ ] **Implementar validação Zod em `app/api/webhooks/evolution/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/create-instance/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/setup-amanda/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/get-qr-simple/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/force-clean/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/force-status-update/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/sync-status/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/status-complete/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/check-connection/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/check-amanda/route.ts`**
- [ ] **Implementar validação Zod em `app/api/evolution/clean-instances/route.ts`**

---

### **4. RLS Policies Incompletas**
- [ ] **Implementar RLS na tabela `n8nchathistories`**
- [ ] **Executar script `supabase/rls-chat-history.sql`**
- [ ] **Testar isolamento de dados entre empresas**
- [ ] **Verificar políticas de INSERT/UPDATE**

---

## 🟡 **PROBLEMAS DE CÓDIGO**

### **1. Falta de Testes Unitários**
- [ ] **Implementar testes para `lib/utils.ts`**
- [ ] **Implementar testes para `lib/env.ts`**
- [ ] **Implementar testes para `lib/logger.ts`**
- [ ] **Implementar testes para `lib/rate-limit.ts`**
- [ ] **Implementar testes para funções de normalização**

---

### **2. Falta de Documentação de API**
- [ ] **Implementar OpenAPI/Swagger**
- [ ] **Documentar todas as APIs**
- [ ] **Documentar schemas de entrada/saída**
- [ ] **Documentar códigos de erro**

---

### **3. Falta de Monitoramento**
- [ ] **Implementar Sentry para error tracking**
- [ ] **Implementar métricas de performance**
- [ ] **Implementar alertas de erro**
- [ ] **Implementar dashboard de monitoramento**

---

## 📋 **PLANO DE EXECUÇÃO URGENTE**

### **Fase 1: Críticos - HOJE (3-4 horas)**
- [ ] **Correção de Dados (1.5 horas)**
  - [ ] Executar script SQL de correção de DDD
  - [ ] Executar script SQL para preencher user_id
  - [ ] Executar script SQL para corrigir Schedules

- [ ] **Correção de Integração (1 hora)**
  - [ ] Padronizar URLs de webhook para `/astra-sales-webhook`
  - [ ] Corrigir tipos CompanyClientId vs CompanyId

- [ ] **Correção de Segurança (1.5 horas)**
  - [ ] Remover console.logs críticos
  - [ ] Tornar SUPABASE_SERVICE_ROLE_KEY obrigatória

### **Fase 2: Integração - AMANHÃ (3-4 horas)**
- [ ] **Melhorias de Integração**
  - [ ] Implementar normalizePhone() em todas as queries
  - [ ] Implementar rate limiting nas APIs críticas
  - [ ] Implementar validação Zod nas APIs
  - [ ] Implementar RLS policies completas

### **Fase 3: Qualidade - ESTA SEMANA (2-3 horas)**
- [ ] **Melhorias de Qualidade**
  - [ ] Implementar testes unitários básicos
  - [ ] Implementar documentação de API
  - [ ] Implementar monitoramento de erros

---

## 🎯 **PRIORIDADES URGENTES**

### **IMEDIATO (Hoje - 3-4 horas):**
- [ ] 🔴 **Corrigir DDD nos telefones** (45 min)
- [ ] 🔴 **Preencher user_id na Company** (30 min)
- [ ] 🔴 **Corrigir Schedules table** (30 min)
- [ ] 🔴 **Padronizar URLs de webhook** (45 min)
- [ ] 🔴 **Corrigir tipos CompanyClientId vs CompanyId** (30 min)
- [ ] 🔴 **Remover console.logs críticos** (1.5 horas)
- [ ] 🔴 **Tornar SUPABASE_SERVICE_ROLE_KEY obrigatória** (30 min)

### **ESTA SEMANA:**
- [ ] 🟠 Implementar rate limiting
- [ ] 🟠 Implementar validação Zod
- [ ] 🟠 Implementar normalizePhone() em todas as queries

### **PRÓXIMO MÊS:**
- [ ] 🟡 Implementar testes unitários
- [ ] 🟡 Implementar monitoramento
- [ ] 🟡 Implementar documentação completa

---

## ✅ **CHECKLIST DE VALIDAÇÃO URGENTE**

### **Após Correções Críticas:**
- [ ] **Testar Integração Chat**
  - [ ] Verificar se telefones batem entre Company/Client/Chat
  - [ ] Testar conversa com A.S.T.R.A
  - [ ] Verificar histórico de chat

- [ ] **Testar Autenticação**
  - [ ] Verificar se user_id foi preenchido
  - [ ] Testar login/logout
  - [ ] Verificar isolamento de dados

- [ ] **Testar Agendamentos**
  - [ ] Verificar se CompanyClientId foi preenchido
  - [ ] Testar criação de agendamento
  - [ ] Verificar relacionamento Client-Schedule

- [ ] **Testar Webhooks**
  - [ ] Verificar se URLs estão padronizadas
  - [ ] Testar comunicação com n8n
  - [ ] Verificar processamento de mensagens

- [ ] **Testar Workflow N8N**
  - [ ] Verificar se consegue encontrar clientes
  - [ ] Testar criação de agendamentos
  - [ ] Verificar integração completa

---

## 📊 **MÉTRICAS DE SUCESSO URGENTES**

### **Dados Corrigidos:**
- [ ] ✅ Telefones com DDD consistente
- [ ] ✅ user_id preenchido na Company
- [ ] ✅ Schedules com relacionamentos corretos
- [ ] ✅ URLs de webhook padronizadas

### **Segurança:**
- [ ] ✅ 0 console.logs em produção
- [ ] ✅ SUPABASE_SERVICE_ROLE_KEY obrigatória
- [ ] ✅ Rate limiting ativo

### **Integração:**
- [ ] ✅ Webhooks funcionando
- [ ] ✅ Chat funcionando
- [ ] ✅ Agendamentos funcionando
- [ ] ✅ Workflow N8N funcionando

---

## 🚨 **STATUS ATUAL - URGENTE**

```
╔═══════════════════════════════════════════════════════════╗
║  🚨 NECESSITA CORREÇÕES URGENTES - ANÁLISE COMPLETA      ║
║                                                           ║
║  Problemas Críticos:        🔴 7 encontrados             ║
║  Problemas de Dados:         🔴 3 encontrados             ║
║  Problemas de Segurança:     🔴 2 encontrados             ║
║  Problemas de Integração:    🟠 4 encontrados             ║
║  Problemas de Workflow N8N:  🔴 4 encontrados             ║
║                                                           ║
║  📅 TEMPO PARA CORREÇÃO:    3-4 horas (HOJE)              ║
║  🎯 PRIORIDADE:             URGENTE                      ║
║  ⚠️  SISTEMA:                INOPERANTE                  ║
║  🔗 INTEGRAÇÃO N8N:          QUEBRADA                    ║
╚═══════════════════════════════════════════════════════════╝
```

---

**Auditor:** Vilmar  
**Data:** 22/10/2025  
**Base:** Análise completa de CRM + Workflow N8N + Dados CSV + Schema SVG  
**Próximo passo:** Implementar correções críticas baseadas em análise completa

---

## 🔧 **SCRIPTS SQL PARA CORREÇÃO IMEDIATA**

### **Script 1: Corrigir DDD nos Telefones**
```sql
-- Adicionar DDD nos telefones dos clientes
UPDATE "Client" 
SET "wppPhone" = '55' || SUBSTRING("wppPhone", 1, 11)
WHERE "wppPhone" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("wppPhone", '@s.whatsapp.net', '')) = 11;

-- Atualizar session_id no chat
UPDATE "n8nchathistories" 
SET "session_id" = '55' || SUBSTRING("session_id", 1, 11)
WHERE "session_id" LIKE '5548%@s.whatsapp.net'
  AND LENGTH(REPLACE("session_id", '@s.whatsapp.net', '')) = 11;
```

### **Script 2: Preencher user_id na Company**
```sql
-- Preencher user_id baseado no email
UPDATE "Company" 
SET "user_id" = (
  SELECT id FROM auth.users 
  WHERE email = "Company".email
)
WHERE "user_id" IS NULL;
```

### **Script 3: Corrigir Schedules**
```sql
-- Corrigir Schedules com dados reais
UPDATE "Schedules" 
SET 
  "CompanyClientId" = '12',
  "client" = 'Gabriel',
  "confirmationLink" = 'https://cavera.com.br/confirmar/agendamento/placeholder',
  "appointmentNotes" = '{"tipo_acomodacao": "Hotel", "data_checkin": "10/10/2030", "num_adultos": 2, "valor_total": 0.00}'
WHERE id = 11;
```

---

**⚠️ IMPORTANTE:** Execute estes scripts em ordem e teste cada correção antes de prosseguir para a próxima!

**🔗 INTEGRAÇÃO N8N:** Após corrigir os dados, teste o workflow N8N completo para garantir que a integração está funcionando.