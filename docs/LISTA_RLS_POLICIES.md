# 📋 Lista de RLS Policies por Tabela - A.S.T.R.A CRM

**Documento:** Lista completa de todas as políticas de Row Level Security (RLS) por tabela  
**Data:** 22/10/2025

---

## 📊 Resumo Geral

O projeto possui **4 tabelas** com RLS habilitado:

- ✅ **Client** - 4 policies
- ✅ **Company** - 4 policies
- ✅ **Schedules** - 4 policies
- ✅ **n8nchathistories** - 3 policies

**Total:** 15 policies

---

## 📋 Policies por Tabela

### **1. Tabela `Client`**

**RLS Status:** ✅ Habilitado

#### **Policy 1: SELECT - Leitura**
- **Nome:** `"Permitir leitura de clientes autenticados"`
- **Operação:** SELECT (leitura)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true)`
- **Descrição:** Permite que qualquer usuário autenticado leia todos os clientes

#### **Policy 2: INSERT - Inserção**
- **Nome:** `"Permitir inserção de clientes autenticados"`
- **Operação:** INSERT (inserção)
- **Permissão:** `TO authenticated`
- **Condição:** `WITH CHECK (true)`
- **Descrição:** Permite que qualquer usuário autenticado insira novos clientes

#### **Policy 3: UPDATE - Atualização**
- **Nome:** `"Permitir atualização de clientes autenticados"`
- **Operação:** UPDATE (atualização)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true) WITH CHECK (true)`
- **Descrição:** Permite que qualquer usuário autenticado atualize clientes

#### **Policy 4: DELETE - Exclusão**
- **Nome:** `"Permitir exclusão de clientes autenticados"`
- **Operação:** DELETE (exclusão)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true)`
- **Descrição:** Permite que qualquer usuário autenticado exclua clientes
- **Nota:** Opcional - pode ser removida se não quiser permitir exclusão

---

### **2. Tabela `Company`**

**RLS Status:** ✅ Habilitado

#### **Policy 1: SELECT - Leitura**
- **Nome:** `"Permitir leitura de empresas autenticadas"`
- **Operação:** SELECT (leitura)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true)`
- **Descrição:** Permite que qualquer usuário autenticado leia todas as empresas

#### **Policy 2: INSERT - Inserção**
- **Nome:** `"Permitir inserção de empresas autenticadas"`
- **Operação:** INSERT (inserção)
- **Permissão:** `TO authenticated`
- **Condição:** `WITH CHECK (true)`
- **Descrição:** Permite que qualquer usuário autenticado insira novas empresas

#### **Policy 3: UPDATE - Atualização**
- **Nome:** `"Permitir atualização de empresas autenticadas"`
- **Operação:** UPDATE (atualização)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true) WITH CHECK (true)`
- **Descrição:** Permite que qualquer usuário autenticado atualize empresas

#### **Policy 4: DELETE - Exclusão**
- **Nome:** `"Permitir exclusão de empresas autenticadas"`
- **Operação:** DELETE (exclusão)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true)`
- **Descrição:** Permite que qualquer usuário autenticado exclua empresas
- **Nota:** Opcional

---

### **3. Tabela `Schedules`**

**RLS Status:** ✅ Habilitado

#### **Policy 1: SELECT - Leitura**
- **Nome:** `"Permitir leitura de agendamentos autenticados"`
- **Operação:** SELECT (leitura)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true)`
- **Descrição:** Permite que qualquer usuário autenticado leia todos os agendamentos

#### **Policy 2: INSERT - Inserção**
- **Nome:** `"Permitir inserção de agendamentos autenticados"`
- **Operação:** INSERT (inserção)
- **Permissão:** `TO authenticated`
- **Condição:** `WITH CHECK (true)`
- **Descrição:** Permite que qualquer usuário autenticado insira novos agendamentos

#### **Policy 3: UPDATE - Atualização**
- **Nome:** `"Permitir atualização de agendamentos autenticados"`
- **Operação:** UPDATE (atualização)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true) WITH CHECK (true)`
- **Descrição:** Permite que qualquer usuário autenticado atualize agendamentos

#### **Policy 4: DELETE - Exclusão**
- **Nome:** `"Permitir exclusão de agendamentos autenticados"`
- **Operação:** DELETE (exclusão)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true)`
- **Descrição:** Permite que qualquer usuário autenticado exclua agendamentos
- **Nota:** Opcional

---

### **4. Tabela `n8nchathistories`**

**RLS Status:** ✅ Habilitado

#### **Policy 1: SELECT - Leitura (Com Isolamento)**
- **Nome:** `"Empresas veem apenas conversas de seus clientes"`
- **Operação:** SELECT (leitura)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (session_id IN (SELECT "wppPhone" FROM "Client" WHERE "CompanyId" IN (SELECT id::text FROM "Company" WHERE "user_id" = auth.uid())))`
- **Descrição:** Permite que usuários vejam apenas conversas dos clientes da sua própria empresa
- **Isolamento:** ✅ Sim - Cada empresa vê apenas seus próprios clientes

#### **Policy 2: INSERT - Inserção**
- **Nome:** `"Service role pode inserir"`
- **Operação:** INSERT (inserção)
- **Permissão:** `TO authenticated`
- **Condição:** `WITH CHECK (true)`
- **Descrição:** Permite inserção de conversas (n8n usa service role que bypassa RLS)
- **Nota:** Service role bypassa RLS automaticamente

#### **Policy 3: UPDATE - Atualização**
- **Nome:** `"Service role pode atualizar"`
- **Operação:** UPDATE (atualização)
- **Permissão:** `TO authenticated`
- **Condição:** `USING (true) WITH CHECK (true)`
- **Descrição:** Permite atualização de conversas (n8n usa service role que bypassa RLS)
- **Nota:** Service role bypassa RLS automaticamente

---

## 🔍 Detalhes Técnicos

### **Padrão das Policies**

**Tabelas Client, Company e Schedules:**
- ✅ **Permissão:** `TO authenticated` (apenas usuários autenticados)
- ✅ **Condição:** `USING (true)` ou `WITH CHECK (true)` (sem restrições)
- ⚠️ **Isolamento:** Não - Qualquer usuário autenticado pode acessar todos os dados

**Tabela n8nchathistories:**
- ✅ **Permissão:** `TO authenticated` (apenas usuários autenticados)
- ✅ **Condição:** Isolamento por empresa via `user_id` e `CompanyId`
- ✅ **Isolamento:** Sim - Cada empresa vê apenas seus próprios clientes

---

## ⚠️ Observações Importantes

### **1. Service Role Bypass**
- ⚠️ O **service_role** bypassa RLS automaticamente
- ✅ Use `SERVICE_ROLE_KEY` no n8n para inserir/atualizar dados
- 🔒 **NUNCA** exponha a service_role key publicamente

### **2. Isolamento de Dados**
- ⚠️ **Client, Company e Schedules:** Não têm isolamento entre empresas
- ✅ **n8nchathistories:** Tem isolamento por empresa (via `user_id`)
- 📝 **Nota:** Para produção, considere políticas mais restritivas baseadas em roles

### **3. Permissões Atuais**
- ✅ Usuários **autenticados** têm acesso **total** às tabelas Client, Company e Schedules
- ✅ Usuários **não autenticados** **não podem** acessar nenhum dado
- ✅ n8nchathistories tem isolamento por empresa

---

## 📊 Query para Verificar Policies

Execute esta query no Supabase SQL Editor para ver todas as policies ativas:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories')
ORDER BY tablename, cmd;
```

---

## 🎯 Resumo Visual

```
╔═══════════════════════════════════════════════════════════╗
║  TABELA              │ SELECT │ INSERT │ UPDATE │ DELETE ║
╠═══════════════════════════════════════════════════════════╣
║  Client              │   ✅   │   ✅   │   ✅   │   ✅   ║
║  Company             │   ✅   │   ✅   │   ✅   │   ✅   ║
║  Schedules           │   ✅   │   ✅   │   ✅   │   ✅   ║
║  n8nchathistories    │   ✅*  │   ✅   │   ✅   │   ❌   ║
╚═══════════════════════════════════════════════════════════╝

✅ = Permitido para authenticated
✅* = SELECT com isolamento por empresa
❌ = DELETE não implementado
```

---

## 📝 Arquivos SQL Originais

As policies foram criadas a partir dos seguintes arquivos:

- `supabase/rls-policies.sql` - Policies para Client, Company e Schedules
- `supabase/rls-chat-history.sql` - Policies para n8nchathistories

---

**Documento criado por:** Vilmar  
**Data:** 22/10/2025  
**Versão:** 1.0

