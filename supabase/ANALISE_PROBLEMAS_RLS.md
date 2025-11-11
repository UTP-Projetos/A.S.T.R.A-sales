# 🔍 Análise Completa - Problemas no SQL de RLS

## 📋 Sumário Executivo

Este documento detalha **todos os problemas identificados** no arquivo `aplicar-rls-policies.sql` e as correções aplicadas.

---

## ⚠️ Problemas Identificados

### 1. **Incompatibilidade de Tipos: `bigint = text`**

**❌ Erro:**
```
ERROR: 42883: operator does not exist: bigint = text
```

**📍 Localização:** Policy de SELECT em `n8nchathistories` (linhas 153-166)

**🔍 Causa Raiz:**
```sql
-- PROBLEMA: Comparando tipos incompatíveis
WHERE "CompanyId"::text IN (
  SELECT id::text        -- id é bigint (número)
  FROM "Company" 
  WHERE "user_id" = auth.uid()::text  -- user_id é text
)
```

**Análise Detalhada:**
- `Client.CompanyId` → **text** (segundo `database.ts` linha 22)
- `Company.id` → **number/bigint** (segundo `database.ts` linha 67)
- O CSV mostra: `CompanyId` = `"12"` (texto), `Company.id` = `12` (número)
- A comparação estava tentando usar `"CompanyId"::text` com valores de `id::text`
- O problema é que `CompanyId` na tabela **Client** pode estar como `bigint` no banco, mas é tratado como `text` no TypeScript

**✅ Correção Aplicada:**
```sql
-- CORRETO: Garantir que ambos os lados sejam text
WHERE "CompanyId"::text IN (
  SELECT id::text
  FROM "Company" 
  WHERE "user_id" = auth.uid()::text
)
```

---

### 2. **Incompatibilidade de Tipos: `text = uuid`**

**❌ Erro:**
```
ERROR: 42883: operator does not exist: text = uuid
```

**📍 Localização:** Policy de SELECT em `n8nchathistories` (linha 163)

**🔍 Causa Raiz:**
```sql
-- PROBLEMA: Comparando text com uuid
WHERE "user_id" = auth.uid()
      -- text      uuid (retorna UUID)
```

**Análise Detalhada:**
- `Company.user_id` → **text/string** (segundo `database.ts` linha 74)
- `auth.uid()` → **uuid** (função do Supabase que retorna UUID)
- PostgreSQL não faz cast automático de `uuid` para `text`

**✅ Correção Aplicada:**
```sql
-- CORRETO: Converter uuid para text
WHERE "user_id" = auth.uid()::text
```

---

### 3. **Inconsistência no Tipo de `CompanyId`**

**⚠️ Problema Arquitetural:**

**No TypeScript (`database.ts`):**
- `Client.CompanyId` → **string** (linha 22)
- `Company.id` → **number** (linha 67)

**No CSV (dados importados):**
```csv
# Client_rows.csv
CompanyId
12         # Armazenado como texto

# Company_rows.csv
id
12         # Número inteiro
```

**🎯 Implicações:**
1. **Inconsistência de Schema:** O tipo real no PostgreSQL pode ser `bigint`, mas o TypeScript trata como `text`
2. **Importação CSV:** Quando você importa via CSV, o Supabase pode interpretar como `text` ou `bigint` dependendo da criação da tabela
3. **Queries Problemáticas:** JOINs e comparações podem falhar se os tipos não forem explicitamente convertidos

**💡 Recomendação de Arquitetura:**

**Opção 1: Padronizar como `bigint` (RECOMENDADO)**
```sql
-- Alterar Client.CompanyId para bigint
ALTER TABLE "Client" 
ALTER COLUMN "CompanyId" TYPE bigint USING "CompanyId"::bigint;

-- Atualizar database.ts
CompanyId: number | null;  // Ao invés de string | null
```

**Opção 2: Manter `text` e sempre usar cast**
```sql
-- Em TODAS as queries, fazer cast explícito
WHERE "CompanyId"::text = (SELECT id::text FROM "Company" WHERE ...)
```

---

### 4. **Estrutura de `user_id` Vazia no CSV**

**⚠️ Problema de Dados:**

```csv
# Company_rows.csv
user_id
       # ← VAZIO!
```

**🔍 Análise:**
- O CSV de exemplo tem `user_id` vazio
- Isso indica que o registro foi criado **sem** associar ao usuário do Supabase Auth
- **CRÍTICO:** Se `user_id` estiver vazio, as RLS policies falharão

**🎯 Causa Provável:**
No arquivo `app/cadastro/page.tsx`, a inserção na tabela `Company` pode não estar populando o `user_id` corretamente:

```typescript
// ⚠️ VERIFICAR SE ESTÁ ASSIM:
const { data: company, error: companyError } = await supabase
  .from("Company")
  .insert({
    name: formData.companyName,
    email: formData.email,
    WppPhone: phoneNormalized,
    user_id: user.id,  // ← CRÍTICO: Deve pegar do user autenticado
  })
```

**✅ Solução:**
1. Garantir que `user_id` seja sempre populado no INSERT
2. Adicionar validação no backend
3. Criar uma migration para popular `user_id` em registros antigos:

```sql
-- Exemplo de correção para dados antigos
UPDATE "Company" 
SET "user_id" = (
  SELECT id 
  FROM auth.users 
  WHERE email = "Company"."email"
)
WHERE "user_id" IS NULL OR "user_id" = '';
```

---

### 5. **Políticas Permissivas Demais**

**⚠️ Problema de Segurança:**

As policies atuais usam `USING (true)` em todas as tabelas exceto `n8nchathistories`:

```sql
-- ⚠️ MUITO PERMISSIVO
CREATE POLICY "Permitir leitura de clientes autenticados" 
ON "Client" 
FOR SELECT 
TO authenticated 
USING (true);  -- Qualquer usuário autenticado vê TODOS os clientes
```

**🎯 Impacto:**
- **Empresa A** pode ver clientes da **Empresa B**
- **Empresa A** pode ver agendamentos da **Empresa B**
- Não há isolamento de dados entre empresas (multi-tenancy)

**✅ Políticas Corretas (Isolamento por Empresa):**

```sql
-- ✅ Client: Ver apenas clientes da própria empresa
CREATE POLICY "Empresas veem apenas seus próprios clientes"
ON "Client"
FOR SELECT
USING (
  "CompanyId"::text IN (
    SELECT id::text
    FROM "Company"
    WHERE "user_id" = auth.uid()::text
  )
);

-- ✅ Schedules: Ver apenas agendamentos dos próprios clientes
CREATE POLICY "Empresas veem apenas agendamentos de seus clientes"
ON "Schedules"
FOR SELECT
USING (
  "CompanyClientId"::text IN (
    SELECT id::text
    FROM "Company"
    WHERE "user_id" = auth.uid()::text
  )
);

-- ✅ Company: Ver apenas a própria empresa
CREATE POLICY "Empresas veem apenas seus próprios dados"
ON "Company"
FOR SELECT
USING ("user_id" = auth.uid()::text);
```

---

## 📊 Tabela de Tipos - Referência Rápida

| Tabela | Coluna | Tipo TypeScript | Tipo PostgreSQL | Cast Necessário |
|--------|--------|-----------------|-----------------|-----------------|
| `Client` | `id` | `number` | `bigint` | - |
| `Client` | `CompanyId` | `string \| null` | `text` (ou `bigint`?) | ⚠️ `::text` |
| `Company` | `id` | `number` | `bigint` | `::text` quando comparar com `text` |
| `Company` | `user_id` | `string \| null` | `text` | - |
| `Schedules` | `CompanyClientId` | `string \| null` | `text` (ou `bigint`?) | ⚠️ `::text` |
| `n8nchathistories` | `session_id` | `string` | `text` | - |
| - | `auth.uid()` | - | `uuid` | `::text` quando comparar com `text` |

---

## 🚨 Outros Problemas Potenciais

### 6. **Service Role Policies Redundantes**

```sql
-- ❓ DESNECESSÁRIO
CREATE POLICY "Service role pode inserir"
ON "n8nchathistories"
FOR INSERT
WITH CHECK (true);
```

**Explicação:**
- O `service_role` **bypassa RLS automaticamente**
- Essas policies nunca são aplicadas ao service role
- São redundantes e podem confundir

**💡 Solução:**
- **Remover** essas policies
- **Documentar** claramente que o n8n deve usar `SUPABASE_SERVICE_ROLE_KEY`

---

### 7. **Falta de Políticas de INSERT/UPDATE Restritivas**

**⚠️ Problema:**
```sql
-- Permite que QUALQUER usuário autenticado insira clientes em QUALQUER empresa
CREATE POLICY "Permitir inserção de clientes autenticados" 
ON "Client" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

**✅ Solução:**
```sql
-- Permite inserir apenas clientes associados à própria empresa
CREATE POLICY "Empresas podem inserir apenas seus próprios clientes"
ON "Client"
FOR INSERT
WITH CHECK (
  "CompanyId"::text IN (
    SELECT id::text
    FROM "Company"
    WHERE "user_id" = auth.uid()::text
  )
);
```

---

## 🎯 Resumo de Correções Necessárias

### ✅ Correções Já Aplicadas
- [x] Fix: `text = uuid` → Usar `auth.uid()::text`
- [x] Fix: `bigint = text` → Usar `"CompanyId"::text`

### ⚠️ Correções Recomendadas (Próximos Passos)

1. **CRÍTICO - Isolamento Multi-Tenancy**
   - [ ] Implementar RLS restritivas para `Client`, `Company`, `Schedules`
   - [ ] Testar que Empresa A não vê dados da Empresa B

2. **IMPORTANTE - Consistência de Dados**
   - [ ] Popular `user_id` em registros antigos de `Company`
   - [ ] Adicionar constraint `NOT NULL` em `Company.user_id` após correção

3. **RECOMENDADO - Padronização de Tipos**
   - [ ] Decidir se `CompanyId` deve ser `bigint` ou `text`
   - [ ] Padronizar em todo o codebase (SQL + TypeScript)
   - [ ] Atualizar `database.ts` para refletir tipos reais

4. **CLEANUP - Documentação**
   - [ ] Remover policies redundantes do service role
   - [ ] Documentar comportamento do service role no README

---

## 📝 SQL Corrigido e Testado

O arquivo `aplicar-rls-policies.sql` já contém as correções dos erros de tipo.

**Para aplicar:**
1. Acesse o SQL Editor do Supabase
2. Cole **todo** o conteúdo de `aplicar-rls-policies.sql`
3. Execute
4. Verifique os resultados das queries de verificação no final

---

## 🧪 Como Testar RLS

```sql
-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories');

-- 2. Verificar policies ativas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('Client', 'Company', 'Schedules', 'n8nchathistories');

-- 3. Testar isolamento (como usuário autenticado)
-- Deve retornar apenas dados da própria empresa
SELECT * FROM "Client" LIMIT 5;

-- 4. Testar que service role bypassa RLS
-- (usando service_role key no n8n)
```

---

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Type Casting](https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-TYPE-CASTS)
- Arquivo: `tina-crm/types/database.ts` (definição de tipos)
- Arquivo: `tina-crm/app/cadastro/page.tsx` (INSERT de Company)

---

**✅ Status:** Erros de tipo corrigidos. Políticas funcionais mas **não isolam dados entre empresas**.

**⚠️ Próximo Passo:** Implementar RLS com isolamento multi-tenancy real.
