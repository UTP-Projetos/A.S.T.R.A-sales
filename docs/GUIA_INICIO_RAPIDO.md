# 🚀 Guia de Início Rápido - A.S.T.R.A CRM

**Para:** Nova pessoa que vai usar/desenvolver o projeto  
**Objetivo:** Configurar o projeto do zero e começar a trabalhar

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- ✅ **Node.js** (versão LTS recomendada - 18.x ou superior)
- ✅ **npm** (vem com Node.js)
- ✅ **Git** (para clonar o repositório)
- ✅ Conta no **Supabase** (banco de dados)
- ✅ Acesso à **Evolution API** (WhatsApp)
- ✅ Acesso ao **n8n** (automação/IA)

---

## 🔧 Passo 1: Clonar e Instalar

### **1.1 Clonar o repositório**
```bash
git clone <url-do-repositorio>
cd tina-crm
```

### **1.2 Instalar dependências**
```bash
npm install
```

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

### **2.1 Criar arquivo `.env.local`**
```bash
cp env.example .env.local
```

### **2.2 Preencher variáveis no `.env.local`**

Você precisa obter as seguintes informações:

#### **Supabase (Banco de Dados)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**Como obter:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um projeto ou use um existente
3. Vá em **Settings** → **API**
4. Copie a **URL** e as **chaves** (anon key e service role key)

#### **Evolution API (WhatsApp)**
```bash
NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key-aqui
```

**Como obter:**
1. Acesse sua instância da Evolution API
2. Vá em **Configurações** → **API Keys**
3. Copie a **URL** e a **API Key**

#### **n8n (Automação/IA)**
```bash
N8N_WEBHOOK_BASE_URL=https://seu-n8n.com
```

**Como obter:**
1. Acesse sua instância do n8n
2. Copie a **URL base** do webhook

---

## 🗄️ Passo 3: Configurar Banco de Dados (Supabase)

### **3.1 Executar scripts SQL**

Acesse o **SQL Editor** do Supabase e execute os scripts na seguinte ordem:

1. **Criar tabelas** (se ainda não existirem):
   - Execute os scripts necessários para criar as tabelas: `Company`, `Client`, `Schedules`, `n8nchathistories`

2. **Configurar RLS (Row Level Security)**:
   ```sql
   -- Execute o arquivo: supabase/rls-policies.sql
   ```

3. **Adicionar campos de instância**:
   ```sql
   -- Execute o arquivo: supabase/add-instance-name-field.sql
   ```

4. **Adicionar campos de onboarding**:
   ```sql
   -- Execute o arquivo: supabase/add-onboarding-fields.sql
   ```

5. **Corrigir dados (se necessário)**:
   ```sql
   -- Execute o arquivo: supabase/fix-data-based-on-n8n-workflow.sql
   ```

### **3.2 Verificar configuração**

Execute no SQL Editor:
```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 🤖 Passo 4: Configurar Evolution API

### **4.1 Verificar instância da Evolution API**

1. Acesse a URL da Evolution API
2. Verifique se a API está rodando
3. Teste a conexão com a API Key

### **4.2 Configurar webhooks**

Os webhooks devem apontar para o n8n:
- **URL do webhook:** `${N8N_WEBHOOK_BASE_URL}/astra-sales-webhook`
- **Eventos:** `MESSAGES_UPSERT`, `CONNECTION_UPDATE`

---

## 🔄 Passo 5: Configurar n8n

### **5.1 Importar workflows**

1. Acesse o n8n
2. Importe o workflow principal: `A.S.T.R.A - Sales.json`
3. Configure as variáveis de ambiente no n8n:
   - URL do Supabase
   - Service Role Key do Supabase
   - URL da Evolution API
   - API Key da Evolution API

### **5.2 Ativar workflow**

1. Ative o workflow no n8n
2. Verifique se o webhook está recebendo requisições

---

## 🚀 Passo 6: Executar o Projeto

### **6.1 Modo Desenvolvimento**
```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:3000`

### **6.2 Verificar se está funcionando**

1. Acesse `http://localhost:3000`
2. Você deve ver a tela de login
3. Teste criar uma conta nova
4. Complete o onboarding

---

## ✅ Passo 7: Verificar Funcionalidades

### **7.1 Testar APIs**

Execute no terminal ou navegador:

```bash
# Testar saúde do sistema
curl http://localhost:3000/api/health

# Testar conexão com Supabase
curl http://localhost:3000/api/test-supabase

# Testar Evolution API (precisa estar autenticado)
curl http://localhost:3000/api/evolution/check-amanda
```

### **7.2 Testar fluxo completo**

1. **Criar conta:**
   - Acesse `/cadastro`
   - Preencha os dados da empresa
   - Faça login

2. **Completar onboarding:**
   - Acesse `/onboarding`
   - Crie uma instância da Evolution API
   - Conecte o WhatsApp via QR Code

3. **Testar funcionalidades:**
   - Criar cliente
   - Criar agendamento
   - Verificar chat com A.S.T.R.A
   - Verificar dashboard

---

## 🐛 Problemas Comuns

### **Erro: "Variáveis de ambiente inválidas"**
- **Solução:** Verifique se todas as variáveis no `.env.local` estão preenchidas corretamente
- Verifique se não há espaços extras ou caracteres especiais

### **Erro: "Supabase não conectado"**
- **Solução:** Verifique se a URL e as chaves do Supabase estão corretas
- Verifique se o projeto Supabase está ativo

### **Erro: "Evolution API não conectada"**
- **Solução:** Verifique se a Evolution API está rodando
- Verifique se a API Key está correta
- Verifique se a URL está acessível

### **Erro: "n8n não recebe webhooks"**
- **Solução:** Verifique se o workflow está ativo no n8n
- Verifique se a URL do webhook está correta
- Verifique se o n8n está acessível publicamente

### **Erro: "RLS policy violation"**
- **Solução:** Execute os scripts SQL de RLS no Supabase
- Verifique se as políticas foram aplicadas corretamente

---

## 📚 Documentação Adicional

Para mais detalhes, consulte:

- **`docs/ONBOARDING_DEV.md`** - Guia completo para desenvolvedores
- **`docs/CONFIG.md`** - Configuração detalhada
- **`docs/API.md`** - Documentação da API
- **`docs/DEPLOY.md`** - Guia de deploy em produção
- **`docs/STATUS_PRODUCAO.md`** - Status atual do projeto

---

## 🎯 Checklist de Setup

Use este checklist para garantir que tudo está configurado:

- [ ] Node.js instalado e funcionando
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.local` criado e preenchido
- [ ] Supabase configurado (tabelas criadas)
- [ ] RLS policies aplicadas no Supabase
- [ ] Evolution API configurada e acessível
- [ ] n8n configurado e workflow ativo
- [ ] Projeto rodando localmente (`npm run dev`)
- [ ] Login funcionando
- [ ] Onboarding funcionando
- [ ] APIs testadas e funcionando

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   # Logs do Next.js
   npm run dev
   ```

2. **Verifique a documentação:**
   - Leia `docs/ONBOARDING_DEV.md` para entender a arquitetura
   - Leia `docs/CONFIG.md` para detalhes de configuração

3. **Verifique o status do projeto:**
   - Leia `docs/STATUS_PRODUCAO.md` para ver o que está pronto e o que falta

---

## ✅ Pronto!

Se você completou todos os passos acima, o projeto está configurado e pronto para uso!

**Próximos passos:**
- Explore as funcionalidades do sistema
- Leia a documentação técnica (`docs/ONBOARDING_DEV.md`)
- Comece a desenvolver novas features

---

**Documento criado por:** Vilmar  
**Data:** 22/10/2025  
**Versão:** 1.0 - Guia de início rápido

