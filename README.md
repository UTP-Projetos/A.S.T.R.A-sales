# 🏢 A.S.T.R.A CRM

Sistema de gestão de clientes e vendas com agente de IA para WhatsApp, desenvolvido com Next.js 15, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, SSR)
- **IA**: Agente A.S.T.R.A (Multiagente via n8n)
- **WhatsApp**: Evolution API

## 📋 Pré-requisitos

- Node.js 20+ e npm 10+
- Conta no Supabase
- Acesso à Evolution API (WhatsApp)
- Acesso ao n8n (opcional, para workflows)

## 🔧 Setup Rápido

```bash
# 1. Clonar e instalar
git clone <url-do-repositorio>
cd tina-crm
npm install

# 2. Configurar variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas credenciais

# 3. Configurar banco de dados
# Execute os scripts SQL no Supabase (veja SETUP.md)

# 4. Rodar o projeto
npm run dev
```

📚 **Guia completo:** [SETUP.md](SETUP.md)

## 📋 Funcionalidades

- ✅ Dashboard com métricas e gráficos
- ✅ Gestão de Clientes
- ✅ Agendamentos
- ✅ Agente A.S.T.R.A (IA Multiagente)
- ✅ Integração WhatsApp via Evolution API
- ✅ Autenticação segura
- ✅ Modo desenvolvimento (sem autenticação)

## 🛠️ Modo Desenvolvimento

Para trabalhar sem bloqueios de autenticação:

1. Adicione no `.env.local`:
```env
DISABLE_AUTH=true
```

2. Execute no Supabase SQL Editor:
```sql
-- Execute: supabase/disable-rls.sql
```

📚 **Mais detalhes:** [MODO_DESENVOLVIMENTO.md](MODO_DESENVOLVIMENTO.md)

## 📁 Estrutura do Projeto

```
tina-crm/
├── app/              # Next.js App Router (páginas e APIs)
├── components/       # Componentes React
├── lib/             # Utilitários e helpers
├── types/           # Definições TypeScript
├── supabase/        # Scripts SQL
└── docs/            # Documentação técnica
```

## 📚 Documentação

- **[SETUP.md](SETUP.md)** - Guia completo de configuração
- **[MODO_DESENVOLVIMENTO.md](MODO_DESENVOLVIMENTO.md)** - Trabalhar sem autenticação
- **[MVP_FALTANTE_SIMPLES.md](MVP_FALTANTE_SIMPLES.md)** - O que falta para MVP
- **[docs/API.md](docs/API.md)** - Documentação da API

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Rodar build de produção
npm run setup        # Configurar .env.local automaticamente
npm run check-env    # Validar variáveis de ambiente
```

## ⚠️ Importante

- **NUNCA** use `DISABLE_AUTH=true` em produção
- O arquivo `.env.local` está no `.gitignore` por segurança
- Execute os scripts SQL na ordem correta (veja SETUP.md)

## 📞 Suporte

Para dúvidas, consulte a documentação ou abra uma issue no repositório.
