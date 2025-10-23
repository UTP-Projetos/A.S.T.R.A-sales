# 💬 Chat em Tempo Real - Visualização de Conversas Amanda

## 📋 **SUMÁRIO**

Este documento descreve a implementação da **funcionalidade de visualização de mensagens em tempo real** entre a IA Amanda e os clientes no CRM.

---

## 🎯 **OBJETIVO**

Permitir que o **atendente ou dono da empresa** visualize em tempo real as conversas que a IA Amanda está tendo com os clientes via WhatsApp.

---

## 🏗️ **ARQUITETURA**

### **Fluxo de Dados:**

```
WhatsApp → Evolution API → n8n → Supabase (N8NChatHistories) → CRM (ChatViewer)
```

### **Componentes:**

1. **`N8NChatHistories` (Supabase)**
   - Tabela onde o n8n salva todas as mensagens
   - `session_id`: Telefone do cliente (`5548912345678@s.whatsapp.net`)
   - `message`: JSON stringificado com `type` e `content`

2. **`ChatViewer` (React Component)**
   - Busca mensagens da tabela `N8NChatHistories`
   - Faz polling a cada 3 segundos
   - Auto-scroll para última mensagem
   - Filtra mensagens internas do n8n

3. **Helpers (`lib/utils.ts`)**
   - `parseChatMessage()`: Parse do JSON da coluna `message`
   - `filterInternalMessages()`: Remove mensagens internas do sistema

---

## 📂 **ARQUIVOS CRIADOS/MODIFICADOS**

### **1. `types/database.ts`**
**Mudanças:**
- Atualizado tipo da tabela `N8NChatHistories` para refletir estrutura real
- Adicionado `ChatMessage` interface (estrutura do JSON)
- Adicionado `ParsedChatMessage` interface (mensagem parseada para UI)

```typescript
export interface ChatMessage {
  type: "human" | "ai" | "system";
  content: string;
  tool_calls?: any[];
  // ...
}

export interface ParsedChatMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}
```

### **2. `lib/utils.ts`**
**Adicionado:**
- `parseChatMessage()`: Converte JSON → `ParsedChatMessage`
- `filterInternalMessages()`: Remove mensagens do tipo:
  - "O cliente de telefone X se chama..."
  - "`name` atualizado com sucesso..."
  - "O cliente X quer saber a disponibilidade..."

### **3. `components/chat/chat-viewer.tsx` (NOVO)**
**Funcionalidades:**
- ✅ Query com polling de 3s (tempo real)
- ✅ Auto-scroll para última mensagem
- ✅ UI diferenciada para cliente vs Amanda
- ✅ Contador de mensagens
- ✅ Indicador de "Atualizado há Xs"
- ✅ Botão de refresh manual
- ✅ Estado vazio amigável
- ✅ Loading state

### **4. `app/clientes/[id]/page.tsx`**
**Mudanças:**
- Adicionado import do `ChatViewer`
- Adicionado componente no final da página (após card de agendamentos)

---

## 🚀 **COMO TESTAR**

### **Teste 1: Visualizar Histórico Existente**

1. Acesse o CRM: `http://localhost:3000`
2. Navegue para **Clientes**
3. Clique em um cliente que já conversou com a Amanda
4. **Role até o final da página**
5. Você verá o card **"Histórico de Conversa com Amanda"**
6. Verifique:
   - ✅ Mensagens do cliente em cinza
   - ✅ Mensagens da Amanda em azul
   - ✅ Ícones diferenciados (Usuário vs Bot)
   - ✅ Contador de mensagens no título
   - ✅ Sem mensagens internas do sistema

### **Teste 2: Tempo Real (Polling)**

1. Abra a página de um cliente no CRM
2. Envie uma mensagem para a empresa via WhatsApp (simule ser o cliente)
3. **Aguarde até 3 segundos**
4. A nova mensagem deve aparecer automaticamente
5. Verifique:
   - ✅ Auto-scroll para a nova mensagem
   - ✅ Contador atualizado
   - ✅ Indicador de "Atualizado há Xs" resetado

### **Teste 3: Refresh Manual**

1. Na página do cliente, clique no botão 🔄 (Refresh)
2. Verifique:
   - ✅ Mensagens recarregadas
   - ✅ Indicador de tempo resetado

### **Teste 4: Cliente Sem Conversa**

1. Acesse um cliente que nunca conversou com a Amanda
2. Verifique:
   - ✅ Estado vazio amigável
   - ✅ Mensagem: "Nenhuma conversa ainda"
   - ✅ Ícone de chat cinza

---

## 📊 **ESTRUTURA DOS DADOS**

### **Exemplo de Registro na Tabela:**

```csv
id,session_id,message
431,11554899924955@s.whatsapp.net,"{""type"": ""human"", ""content"": ""Olá, Boa tarde""}"
432,11554899924955@s.whatsapp.net,"{""type"": ""ai"", ""content"": ""Olá! Eu sou a Astra...""}"
```

### **Após Parse:**

```typescript
{
  id: 431,
  role: "user", // "human" → "user"
  content: "Olá, Boa tarde",
  rawMessage: { type: "human", content: "...", ... }
}
```

---

## 🎨 **UI/UX**

### **Mensagem do Cliente:**
```
┌──────────────────────────────────────────┐
│ │ [👤]  Cliente                         │
│ │       Olá, Boa tarde                   │
│ └─ (Fundo cinza, borda esquerda cinza)   │
└──────────────────────────────────────────┘
```

### **Mensagem da Amanda:**
```
┌──────────────────────────────────────────┐
│ │ [🤖]  Amanda (IA)                      │
│ │       Olá! Eu sou a Astra, do Caverá...│
│ └─ (Fundo azul claro, borda esquerda azul)│
└──────────────────────────────────────────┘
```

---

## ⚙️ **CONFIGURAÇÃO**

### **Não é necessária configuração adicional!**

A funcionalidade usa:
- ✅ Mesma conexão Supabase do CRM
- ✅ Tabela já existente (`N8NChatHistories`)
- ✅ n8n já está salvando os dados
- ✅ Polling no frontend (sem webhook adicional)

---

## 🔍 **FILTROS DE MENSAGENS INTERNAS**

### **Mensagens REMOVIDAS da visualização:**

```typescript
// Do AI_CRM (atualizações de cadastro)
"O cliente de telefone 5548912345678@s.whatsapp.net se chama Gabriel..."
"`name` atualizado com sucesso na tabela `Client`..."
"`crmLeadStatus` definido como 'Contato em Andamento'."

// Do AI_Scheduling (consultas internas)
"O cliente Gabriel quer saber a disponibilidade..."
"O cliente Gabriel quer saber o preço..."
"Hotel disponível para 2 pessoas de 24/10/2025 a 26/10/2025."
"Valor da diária no Hotel para 2 pessoas..."
```

### **Mensagens EXIBIDAS:**

```typescript
// Mensagens reais da conversa
"Olá, Boa tarde" (Cliente)
"Olá! Eu sou a Astra, do Caverá Country Park..." (Amanda)
"Quero alugar um hotel para mim e minha esposa" (Cliente)
"Perfeito, Gabriel! Para qual data vocês gostariam..." (Amanda)
```

---

## 🚀 **MELHORIAS FUTURAS** (Opcional)

### **Fase 2: WebSocket (Tempo Real de Verdade)**
- Substituir polling por WebSocket
- Notificação instantânea de nova mensagem
- Indicador "Amanda está digitando..."

### **Fase 3: Interação**
- Atendente pode desabilitar bot e responder manualmente
- Enviar mensagem diretamente do CRM
- Transferir conversa (Bot → Humano)

### **Fase 4: Analytics**
- Tempo médio de resposta da Amanda
- Taxa de conversão por conversa
- Palavras-chave mais mencionadas

---

## 📝 **NOTAS TÉCNICAS**

### **Performance:**
- Polling de 3s é eficiente (não sobrecarrega Supabase)
- Query usa index na coluna `session_id`
- Filtro no frontend evita re-render desnecessário

### **Segurança:**
- RLS policies do Supabase aplicadas
- Apenas empresa dona do cliente vê suas mensagens
- `wppPhone` já normalizado (com sufixo)

### **Escalabilidade:**
- Para 1000 clientes ativos: ~333 queries/s (aceitável)
- Para mais, migrar para WebSocket ou Server-Sent Events

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] Atualizar tipos `N8NChatHistories`
- [x] Criar `ChatMessage` e `ParsedChatMessage` interfaces
- [x] Adicionar `parseChatMessage()` helper
- [x] Adicionar `filterInternalMessages()` helper
- [x] Criar componente `ChatViewer`
- [x] Adicionar polling (3s)
- [x] Adicionar auto-scroll
- [x] Adicionar UI diferenciada (cliente vs Amanda)
- [x] Adicionar estado vazio
- [x] Adicionar loading state
- [x] Integrar na página do cliente
- [x] Testar com dados reais

---

## 🎉 **RESULTADO**

**Funcionalidade implementada com sucesso!**

- ⏱️ **Tempo de implementação:** 5 minutos
- 📦 **Arquivos criados:** 1 (ChatViewer)
- 📝 **Arquivos modificados:** 3
- 🚫 **Configuração adicional:** Nenhuma
- ✅ **Pronto para produção:** Sim

---

## 📞 **SUPORTE**

Se tiver dúvidas ou problemas:
1. Verifique que a tabela `N8NChatHistories` existe no Supabase
2. Verifique que o n8n está salvando mensagens
3. Verifique que `wppPhone` do cliente tem sufixo `@s.whatsapp.net`
4. Abra o console do navegador para ver erros de query

**Logs úteis:**
```bash
# Ver queries no Supabase
SELECT * FROM "N8NChatHistories" WHERE session_id = '5548912345678@s.whatsapp.net';

# Ver clientes no CRM
SELECT id, name, wppPhone FROM "Client" LIMIT 10;
```
