# 🚀 Setup - A.S.T.R.A CRM

Guia passo a passo para configurar o projeto do zero.

---

## 📋 Pré-requisitos

- ✅ Node.js 20+ ([Download](https://nodejs.org/))
- ✅ npm 10+ (vem com Node.js)
- ✅ Conta no [Supabase](https://supabase.com)
- ✅ Acesso à Evolution API (WhatsApp)

---

## 🔧 Passo 1: Clonar e Instalar

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd tina-crm

# Instalar dependências
npm install
```

⏱️ **Tempo:** 2-3 minutos

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

### Opção A: Script Automático
```bash
npm run setup
```

### Opção B: Manual
```bash
# Copiar arquivo de exemplo
cp env.example .env.local

# Editar o arquivo
code .env.local  # ou nano .env.local
```

### Preencher as variáveis no `.env.local`:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Evolution API (obrigatório)
NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key

# n8n (opcional)
N8N_WEBHOOK_BASE_URL=https://seu-n8n.com

# Modo Desenvolvimento (OPCIONAL - para trabalhar sem autenticação)
# ⚠️ Use apenas em desenvolvimento local!
DISABLE_AUTH=false
```

**Onde obter as chaves:**
- **Supabase**: Settings → API (URL, anon key, service role key)
- **Evolution API**: Configurações da sua instância

⏱️ **Tempo:** 5-10 minutos

---

## 🗄️ Passo 3: Configurar Banco de Dados

1. Acesse o [Supabase](https://supabase.com) e faça login
2. Abra seu projeto
3. Vá em **SQL Editor**
4. Execute os scripts **nesta ordem**:

### **3.1 Criar Tabelas**
```sql
-- Execute: supabase/create-tables-and-policies.sql
-- Cole todo o conteúdo do arquivo e execute
```

### **3.2 Adicionar Campos de Instância**
```sql
-- Execute: supabase/add-instance-name-field.sql
```

### **3.3 Adicionar Campos de Onboarding**
```sql
-- Execute: supabase/add-onboarding-fields.sql
```

### **3.4 Dados de Exemplo (Opcional)**
```sql
-- Execute: supabase/seed.sql
-- Adiciona dados de teste para desenvolvimento
```

### **3.5 Modo Desenvolvimento (Opcional)**

Se você configurou `DISABLE_AUTH=true` no `.env.local`:

```sql
-- Execute: supabase/disable-rls.sql
-- Remove políticas de segurança para desenvolvimento
```

⚠️ **Atenção:** Desabilitar RLS remove todas as proteções. Use apenas em desenvolvimento local!

⏱️ **Tempo:** 3-5 minutos

---

## 🚀 Passo 4: Rodar o Projeto

```bash
npm run dev
```

✅ Pronto! Acesse: [http://localhost:3000](http://localhost:3000)

⏱️ **Tempo:** 30 segundos

---

## ✅ Verificar se Está Funcionando

### 1. Health Check
Acesse: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Deve retornar:
```json
{
  "status": "healthy",
  "checks": {
    "env": { "status": "pass" },
    "supabase": { "status": "pass" },
    "evolution": { "status": "pass" }
  }
}
```

### 2. Dashboard
Acesse: [http://localhost:3000](http://localhost:3000)

- Se `DISABLE_AUTH=false`: Redireciona para `/login`
- Se `DISABLE_AUTH=true`: Acessa direto o dashboard

---

## 🆘 Problemas Comuns

### Erro: `Missing env vars`
→ Configure o `.env.local` (Passo 2)

### Erro: `relation "Client" does not exist`
→ Execute os scripts SQL (Passo 3)

### Erro: `Cannot find module 'react/jsx-dev-runtime'`
→ Use Node.js 20+ (`node --version`)

### Erro: `Evolution API unreachable`
→ Verifique se a URL e API Key estão corretas no `.env.local`

### Dashboard vazio (sem dados)
→ Execute `supabase/seed.sql` para adicionar dados de exemplo

---

## 🛠️ Modo Desenvolvimento

Para trabalhar sem autenticação e bloqueios:

1. **No `.env.local`:**
```env
DISABLE_AUTH=true
```

2. **No Supabase (SQL Editor):**
```sql
-- Execute: supabase/disable-rls.sql
```

3. **Reiniciar servidor:**
```bash
npm run dev
```

📚 **Mais detalhes:** [MODO_DESENVOLVIMENTO.md](MODO_DESENVOLVIMENTO.md)

---

## 📚 Próximos Passos

- **[MVP_FALTANTE_SIMPLES.md](MVP_FALTANTE_SIMPLES.md)** - O que falta implementar
- **[docs/API.md](docs/API.md)** - Documentação da API
- **[docs/ONBOARDING_DEV.md](docs/ONBOARDING_DEV.md)** - Guia para desenvolvedores

---

## 🎯 Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Rodar build de produção
npm run setup        # Configurar .env.local
npm run check-env    # Validar variáveis de ambiente
npm run lint         # Verificar erros de código
```

---

**✅ Setup completo!** Se levou mais de 30 minutos, consulte a seção de problemas comuns ou abra uma issue.
