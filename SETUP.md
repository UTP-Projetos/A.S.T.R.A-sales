# 🚀 SETUP - A.S.T.R.A CRM

Guia rápido para rodar o projeto localmente em **15-30 minutos**.

---

## 📋 Pré-requisitos

Antes de começar, instale:

- ✅ **Node.js 20+** ([Download](https://nodejs.org/))
- ✅ **npm 10+** (vem com Node.js)
- ✅ **Git** ([Download](https://git-scm.com/))

### Verificar versões instaladas:
```bash
node --version  # Deve ser >= 20.0.0
npm --version   # Deve ser >= 10.0.0
```

### Usar nvm (recomendado):
```bash
# Instalar nvm (se não tiver)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Usar Node 20
nvm install 20
nvm use 20
```

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

### Opção A: Script Automático (Recomendado)
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

### Preencher as variáveis:

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
```

📚 **Onde obter as chaves?** Veja [docs/SERVICOS_EXTERNOS.md](docs/SERVICOS_EXTERNOS.md) (em breve)

⏱️ **Tempo:** 5-10 minutos

---

## 🗄️ Passo 3: Configurar Banco de Dados

1. Acesse o [Supabase](https://supabase.com) e faça login
2. Abra seu projeto
3. Vá em **SQL Editor**
4. Execute os scripts **nesta ordem**:

```sql
-- 1. Criar tabelas (2min)
-- Cole todo o conteúdo de: supabase/create-tables-and-policies.sql
-- Execute tudo de uma vez

-- 2. Adicionar campos de instância (30s)
-- Cole todo o conteúdo de: supabase/add-instance-name-field.sql
-- Execute tudo de uma vez

-- 3. Adicionar campos de onboarding (30s)
-- Cole todo o conteúdo de: supabase/add-onboarding-fields.sql
-- Execute tudo de uma vez

-- 4. Popular com dados de exemplo (30s) - OPCIONAL
-- Cole todo o conteúdo de: supabase/seed.sql
-- Execute tudo de uma vez
```

📚 **Mais detalhes:** [supabase/README.md](supabase/README.md)

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

### 1. Build de Produção
```bash
npm run build
```

Deve compilar sem erros ✅

### 2. Health Check
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

### 3. Dashboard
Acesse: [http://localhost:3000](http://localhost:3000)

Deve mostrar:
- ✅ Página de login
- ✅ Sem erros no console
- ✅ Design bonito

---

## 🆘 Troubleshooting

### Erro: `Missing env vars`
→ Configure o `.env.local` (Passo 2)

### Erro: `relation "Client" does not exist`
→ Execute os scripts SQL (Passo 3)

### Erro: `Cannot find module 'react/jsx-dev-runtime'`
→ Use Node.js 20+ (Passo 1)

### Erro: `Evolution API unreachable`
→ Verifique se a URL e API Key estão corretas

### Dashboard vazio (sem dados)
→ Execute `supabase/seed.sql` para adicionar dados de exemplo

### Mais problemas?
Consulte: [ANALISE_ONBOARDING.md](ANALISE_ONBOARDING.md)

---

## 📚 Próximos Passos

Depois de rodar o projeto:

1. **[ROADMAP_MVP.md](ROADMAP_MVP.md)** - Veja o que está implementado
2. **[docs/ONBOARDING_DEV.md](docs/ONBOARDING_DEV.md)** - Entenda a arquitetura
3. **[docs/API.md](docs/API.md)** - Conheça as APIs

---

## 🎯 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                # Rodar em dev mode
npm run build              # Build de produção
npm run start              # Rodar build de produção
npm run lint               # Checar erros de código

# Utilitários
npm run setup              # Configurar .env.local
npm run check-env          # Validar variáveis de ambiente
```

---

## 🐳 Alternativa: Docker (Opcional)

Se quiser rodar Evolution API e n8n localmente:

```bash
# Em breve: docker-compose.yml
docker-compose up -d
```

---

**✅ Setup completo!** Se levou mais de 30 minutos, abra uma issue para melhorarmos este guia.

**Última Atualização:** 06/11/2025
