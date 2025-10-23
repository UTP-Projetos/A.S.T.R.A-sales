# 🧪 Guia de Testes - Integração CRM ↔ n8n

**Versão:** 2.0  
**Data:** 21/10/2025

---

## 📋 PRÉ-REQUISITOS

### **1. Variáveis de Ambiente**

Certifique-se de ter todas as variáveis no `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui # ⚠️ NOVO

# Evolution API
NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api

# n8n
N8N_WEBHOOK_BASE_URL=https://seu-n8n.com
```

### **2. Dependências**

```bash
cd tina-crm
npm install
```

---

## ✅ TESTES OBRIGATÓRIOS

### **Teste 1: Helpers de Normalização**

**Objetivo:** Validar que telefones são normalizados corretamente

```bash
# Iniciar dev server
npm run dev

# Abrir console do navegador em qualquer página
```

```javascript
// No console do navegador:
import { normalizePhone, denormalizePhone } from '@/lib/utils';

// Teste 1: Normalização
console.assert(
  normalizePhone("5548912345678") === "5548912345678@s.whatsapp.net",
  "❌ normalizePhone falhou"
);

// Teste 2: Denormalização
console.assert(
  denormalizePhone("5548912345678@s.whatsapp.net") === "5548912345678",
  "❌ denormalizePhone falhou"
);

// Teste 3: Idempotência
console.assert(
  normalizePhone("5548912345678@s.whatsapp.net") === "5548912345678@s.whatsapp.net",
  "❌ normalizePhone não é idempotente"
);

console.log("✅ Testes de normalização passaram!");
```

---

### **Teste 2: Parsing de AppointmentNotes**

**Objetivo:** Validar parsing de JSON do n8n

```javascript
import { parseAppointmentNotes, formatAppointmentNotes } from '@/lib/utils';

// Teste com JSON puro
const json1 = { tipo_acomodacao: "Hotel", data_checkin: "2025-12-27" };
const parsed1 = parseAppointmentNotes(json1);
console.assert(parsed1?.tipo_acomodacao === "Hotel", "❌ Parse JSON puro falhou");

// Teste com markdown code block (n8n)
const json2 = '```json\n{"tipo_acomodacao": "Hotel"}\n```';
const parsed2 = parseAppointmentNotes(json2);
console.assert(parsed2?.tipo_acomodacao === "Hotel", "❌ Parse markdown falhou");

// Teste de formatação
const formatted = formatAppointmentNotes(parsed1, "Hospedagem");
console.assert(formatted.includes("Hotel"), "❌ Formatação falhou");

console.log("✅ Testes de parsing passaram!");
```

---

### **Teste 3: Criação de Instância (Salvar Token)**

**Objetivo:** Verificar se `tokenInstance` é salvo

#### **Passos:**

1. **Acessar onboarding:**
   ```
   http://localhost:3000/onboarding
   ```

2. **Clicar em "Configurar Amanda"**

3. **Verificar logs no terminal:**
   ```bash
   # Deve aparecer:
   ✅ Instância criada com sucesso
   ✅ Instância salva no banco com sucesso
   ```

4. **Verificar no Supabase:**
   ```sql
   SELECT instanceName, tokenInstance, webhookConfigured 
   FROM "Company" 
   WHERE email = 'seu-email@example.com';
   ```

   **Resultado esperado:**
   ```
   instanceName: empresa-11-1729531234567
   tokenInstance: DAB041778750-4118-8922-840CF636BF84 (não null!)
   webhookConfigured: true
   ```

**✅ PASSA:** Se `tokenInstance` não for `null`  
**❌ FALHA:** Se `tokenInstance` for `null`

---

### **Teste 4: Webhook Evolution → CRM**

**Objetivo:** Validar que webhook recebe e processa eventos

#### **Setup:**

1. **Expor webhook local (ngrok):**
   ```bash
   ngrok http 3000
   ```

2. **Atualizar webhook na Evolution API:**
   ```bash
   curl -X PUT https://sua-evolution-api.com/webhook/set \
     -H "apikey: SUA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://seu-ngrok.ngrok.io/api/webhooks/evolution",
       "events": ["CONNECTION_UPDATE", "MESSAGES_UPSERT"]
     }'
   ```

#### **Teste Manual:**

1. **Conectar WhatsApp via QR Code** no onboarding

2. **Verificar logs do servidor:**
   ```bash
   # Deve aparecer:
   INFO: Webhook Evolution recebido
   INFO: Atualizando status de conexão
   INFO: Status de conexão atualizado
   ```

3. **Verificar no Supabase:**
   ```sql
   SELECT whatsappConnected, WppPhone 
   FROM "Company" 
   WHERE email = 'seu-email@example.com';
   ```

   **Resultado esperado:**
   ```
   whatsappConnected: true
   WppPhone: 5548912345678@s.whatsapp.net
   ```

**✅ PASSA:** Status atualiza automaticamente  
**❌ FALHA:** Status não muda no banco

---

### **Teste 5: Toggle do Bot**

**Objetivo:** Validar controle do bot via interface

#### **Passos:**

1. **Acessar lista de clientes:**
   ```
   http://localhost:3000/clientes
   ```

2. **Clicar em qualquer cliente**

3. **Verificar botão "Ativar Bot" / "Desativar Bot"** no topo

4. **Clicar no botão**

5. **Verificar:**
   - ✅ Botão muda de estado
   - ✅ Badge "Bot Ativo" / "Bot Inativo" atualiza
   - ✅ Não há erro exibido

6. **Verificar no banco:**
   ```sql
   SELECT activeBot FROM "Client" WHERE id = 1;
   ```

**✅ PASSA:** Estado muda no banco e na interface  
**❌ FALHA:** Erro ou estado não muda

---

### **Teste 6: Queries com normalizePhone**

**Objetivo:** Garantir que busca de clientes funciona

#### **Teste no Código:**

```typescript
// Arquivo: app/clientes/page.tsx (modificar temporariamente)

// TESTE: Buscar cliente com normalização
const testPhone = "5548912345678"; // Sem sufixo
const { data, error } = await supabase
  .from("Client")
  .select("*")
  .eq("wppPhone", normalizePhone(testPhone)); // ✅ Com normalização

console.log("Cliente encontrado:", data);
```

**✅ PASSA:** Cliente é encontrado  
**❌ FALHA:** Retorna vazio

---

### **Teste 7: AppointmentNotes no Detalhes do Agendamento**

**Objetivo:** Validar exibição de detalhes estruturados

#### **Passos:**

1. **Criar agendamento via n8n** (enviar mensagem ao bot solicitando reserva)

2. **Verificar no Supabase** se foi criado:
   ```sql
   SELECT * FROM "Schedules" ORDER BY created_at DESC LIMIT 1;
   ```

3. **Acessar detalhes do agendamento:**
   ```
   http://localhost:3000/agendamentos/[id]
   ```

4. **Verificar seção "Detalhes do Agendamento":**
   - ✅ JSON é parseado corretamente
   - ✅ Não mostra markdown code blocks
   - ✅ Exibe estrutura legível

**✅ PASSA:** Detalhes exibidos corretamente  
**❌ FALHA:** Erro de parse ou JSON vazio

---

## 🔍 TESTES DE INTEGRAÇÃO COMPLETA

### **Fluxo End-to-End:**

```
1. Setup Amanda (create-instance)
   ↓
2. Conectar WhatsApp (QR Code)
   ↓
3. Webhook atualiza status (whatsappConnected = true)
   ↓
4. Cliente envia mensagem no WhatsApp
   ↓
5. n8n processa (AI_Coordinator + agentes)
   ↓
6. n8n cria registro em Client (se novo)
   ↓
7. n8n cria agendamento em Schedules
   ↓
8. CRM exibe cliente e agendamento
   ↓
9. Atendente desativa bot via toggle
   ↓
10. n8n para de responder cliente
```

**Como Testar:**

1. **Seguir fluxo completo** acima

2. **Verificar em cada etapa:**
   - ✅ Logs aparecem corretos
   - ✅ Dados salvos no banco
   - ✅ Interface atualiza

3. **Verificar no final:**
   ```sql
   -- Cliente foi criado
   SELECT * FROM "Client" WHERE wppPhone LIKE '%5548912345678%';
   
   -- Agendamento foi criado
   SELECT * FROM "Schedules" WHERE client LIKE '%5548912345678%';
   
   -- Bot pode ser controlado
   SELECT activeBot FROM "Client" WHERE wppPhone LIKE '%5548912345678%';
   ```

---

## 🐛 TROUBLESHOOTING

### **Problema: tokenInstance vem null**

**Causa:** Evolution API retornou estrutura diferente

**Solução:**
```typescript
// Adicionar log em create-instance/route.ts
console.log('CREATE DATA:', JSON.stringify(createData, null, 2));

// Verificar onde está o token:
// - createData.hash?.apikey
// - createData.instance?.token
// - createData.token
```

---

### **Problema: Webhook não recebe eventos**

**Causa:** URL não configurada na Evolution

**Solução:**
```bash
# Verificar webhook atual
curl https://sua-evolution-api.com/webhook/find/[instance] \
  -H "apikey: SUA_KEY"

# Reconfigurar
curl -X PUT https://sua-evolution-api.com/webhook/set \
  -H "apikey: SUA_KEY" \
  -d '{"url": "https://seu-crm.com/api/webhooks/evolution"}'
```

---

### **Problema: Parse de appointmentNotes falha**

**Causa:** Formato do JSON diferente do esperado

**Solução:**
```typescript
// Adicionar log em parseAppointmentNotes
console.log('RAW NOTES:', notes);
console.log('TYPE:', typeof notes);
```

---

### **Problema: Toggle do bot não funciona**

**Causa:** Autenticação ou permissões RLS

**Solução:**
```sql
-- Verificar RLS policies
SELECT * FROM pg_policies WHERE tablename = 'Client';

-- Garantir que usuário pode atualizar
GRANT UPDATE ON "Client" TO authenticated;
```

---

## ✅ CHECKLIST FINAL

Antes de fazer deploy, garanta:

- [ ] ✅ Teste 1: Normalização de telefone
- [ ] ✅ Teste 2: Parsing de appointmentNotes
- [ ] ✅ Teste 3: tokenInstance salvo
- [ ] ✅ Teste 4: Webhook recebe eventos
- [ ] ✅ Teste 5: Toggle do bot funciona
- [ ] ✅ Teste 6: Queries com normalização
- [ ] ✅ Teste 7: Detalhes de agendamento exibidos
- [ ] ✅ Fluxo end-to-end completo

---

## 📊 MÉTRICAS DE SUCESSO

**✅ INTEGRAÇÃO PERFEITA:**
- 100% dos testes passam
- Webhook sincroniza em < 1 segundo
- Nenhum erro de parse
- Toggle do bot instantâneo

**⚠️ INTEGRAÇÃO PARCIAL:**
- 80%+ dos testes passam
- Webhook sincroniza em < 5 segundos
- Alguns erros de parse (corrigíveis)
- Toggle do bot com delay

**❌ INTEGRAÇÃO FALHA:**
- < 80% dos testes passam
- Webhook não funciona
- Erros de parse frequentes
- Toggle do bot não responde

---

**Última atualização:** 21/10/2025 - 17:45  
**Autor:** Vilmar (AI Senior Engineer)
