# 👋 Onboarding do Desenvolvedor — A.S.T.R.A CRM

## 🎯 Objetivo
Este documento guia o desenvolvedor no setup, entendimento de arquitetura, integrações e práticas do projeto A.S.T.R.A CRM (CRM + IA + WhatsApp + n8n).

- **Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, SSR)
- **Integrações**: Evolution API (WhatsApp), n8n (workflows)
- **Docs relacionadas**: `docs/README.md`, `docs/CONFIG.md`, `docs/API.md`, `docs/CRITICAL_FIXES.md`

---

## 🧭 Visão de Arquitetura
- **Frontend/SSR**: Next.js 15 com App Router, React 19, TypeScript
- **Autenticação**: Supabase Auth via middleware (`middleware.ts`)
- **Dados**: Supabase (Postgres) com RLS e scripts em `supabase/`
- **Mensageria**: Evolution API (envio/estado do WhatsApp)
- **Automação/IA**: n8n orquestra eventos e memória de chat

Fluxo resumido:
1) Usuário autentica ➜ 2) Onboarding cria/associa instância Amanda (Evolution) ➜ 3) Conexão WhatsApp via QR Code ➜ 4) Dashboard exibe status ➜ 5) n8n integra mensagens e pausa IA quando atendente humano responde.

---

## 📁 Estrutura do Projeto
- `app/`: páginas, rotas API (`app/api/**`) e estilos globais (`globals.css`)
- `components/`: UI compartilhada e componentes de dashboard
- `lib/`: utilidades (logger, env, rate-limit, supabase)
- `types/`: tipos do banco (ex.: `types/database.ts`)
- `supabase/`: scripts SQL (RLS, ajustes de schema)
- `docs/`: documentação do projeto

Ver também o sumário em `README.md` (raiz do projeto `tina-crm/`).

---

## ⚙️ Setup Local
1. Node LTS + npm instalados
2. Instalação
   ```bash
   npm install
   ```
3. Variáveis de ambiente
   ```bash
   cp env.example .env.local
   ```
   Preencha no `.env.local` (ver detalhes em `docs/CONFIG.md`):
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Evolution: `NEXT_PUBLIC_EVOLUTION_API_URL`, `EVOLUTION_API_KEY`
   - n8n: `N8N_WEBHOOK_BASE_URL` (opcional)
4. Executar
   ```bash
   npm run dev
   ```

---

## 🔒 Segurança (implementada e práticas)
- **Validação de ENV com Zod**: `lib/env.ts` falha cedo se faltar/env inválida
- **Middleware de auth**: `middleware.ts` protege rotas, permite públicas (`/login`, `/cadastro`, etc.)
- **Logger com sanitização**: `lib/logger.ts` remove chaves sensíveis (password, token, apikey...)
- **Rate limiting**: `lib/rate-limit.ts` com presets (CRITICAL, NORMAL, READ, AUTH)
- **Headers e erros**: ver `README.md` e `docs/CRITICAL_FIXES.md`

Recomendações:
- Nunca commitar `.env.local`
- Usar `SUPABASE_SERVICE_ROLE_KEY` apenas no backend (rotas API) quando necessário
- Validar input de usuários e não expor detalhes de stack em erros

---

## 🔌 APIs Internas (referência cruzada)
Leia a especificação completa em `docs/API.md`. Destaques:
- Saúde do sistema: `GET /api/health`
- Supabase test: `GET /api/test-supabase`
- Autenticação: `POST /api/logout`
- Evolution:
  - `GET /api/evolution/check-amanda`
  - `GET /api/evolution/get-qr` e `GET /api/evolution/get-qr-simple`
  - `POST /api/evolution/create-instance`
  - `GET /api/evolution/check-connection`
  - Suporte/Manutenção: `sync-status`, `status-complete`, `force-clean`, `fix-status`, `force-status-update`
- Mensagens:
  - `POST /api/messages/send` — envia via Evolution, normaliza telefone e persiste em `n8nchathistories` (usa `SUPABASE_SERVICE_ROLE_KEY`).

---

## 🗄️ Banco de Dados (Supabase)
- Tabelas principais: `Company`, `n8nchathistories`
- RLS e políticas: scripts em `supabase/rls-*.sql`
- Onboarding: campos de instância/whatsapp em `Company` (scripts `add-instance-name-field.sql`, `add-onboarding-fields.sql`)

Observações:
- `n8nchathistories.message` é JSONB. O Postgres normaliza o JSON; a forma compacta está ok.
- `session_id` para n8n deve estar no formato `55XXXXXXXXXXX@s.whatsapp.net`.

---

## 📱 Evolution API (WhatsApp)
- Variáveis: `NEXT_PUBLIC_EVOLUTION_API_URL`, `EVOLUTION_API_KEY`
- Endpoints utilizados (exemplos):
  - Envio: `/message/sendText/{instanceName}` (body usa número sem `@s.whatsapp.net`)
  - Estado: `/instance/connectionState/{instanceName}`
- Normalização de telefone: usar helper `normalizePhone` (armazenamento com `@s.whatsapp.net`; para Evolution, enviar sem o sufixo)
- Caso especial: emoji 😉 utilizado para “reativação” — já tratado em `POST /api/messages/send`

---

## 🤖 n8n e Memória de Chat
- Webhooks do Evolution devem apontar para o n8n
- Mensagens salvas em `n8nchathistories` devem respeitar o formato de Chat Memory do n8n:
  ```json
  {
    "type": "ai",
    "content": "...",
    "tool_calls": [],
    "additional_kwargs": {},
    "response_metadata": {},
    "invalid_tool_calls": []
  }
  ```
- O n8n pausa a IA quando detecta mensagem humana pelo atendente

---

## 🧩 Padrões de Código
- TypeScript estrito; nomes claros e funções pequenas
- Evitar try/catch desnecessário; centralizar erros (ex.: `lib/api-error.ts`)
- Componentes de UI em `components/ui` com Tailwind e utilitários (`tailwind-merge`, `class-variance-authority`)
- Manter coesão entre server components/route handlers e código cliente

---

## 🧪 Testes (recomendação)
- Base sugerida: Jest + Testing Library para React; supertest para rotas API
- Casos prioritários:
  - `POST /api/messages/send` (happy path, rate-limit, env faltando, Evolution offline)
  - `GET /api/evolution/get-qr` e `check-connection`
  - `GET /api/health` (com mocks de Supabase/Evolution)

---

## 🧰 Troubleshooting
- Env faltando: `GET /api/check-env` e logs de `lib/env.ts`
- Supabase fora: `GET /api/health` ➜ check `checks.supabase`
- Evolution fora ou instância inexistente: `GET /api/evolution/check-amanda` ➜ reconcilia estado e limpa instância inválida
- Falha ao enviar mensagem: ver logs em `messages/send` (status HTTP, payload truncado, resposta Evolution)
- Sessão não persiste: revisar cookies no `middleware.ts` (`@supabase/ssr` + cookies)

---

## ✅ Checklist — Primeiro Dia
- Clonar repo e instalar deps (`npm install`)
- Criar `.env.local` a partir de `env.example` e preencher variáveis
- Rodar `npm run dev` e acessar `/login`
- Executar `GET /api/health` e validar `status = healthy` (ou entender degradação)
- Ler `docs/API.md` e abrir no navegador: `/api/test-supabase`, `/api/evolution/check-amanda`

## 🚀 Checklist — Primeira Semana
- Passar pelo onboarding completo de uma empresa de teste
- Provisionar/usar instância Evolution sandbox; conectar via QR (`/api/evolution/get-qr`)
- Enviar mensagem de teste via `POST /api/messages/send` e validar persistência no Supabase (`n8nchathistories`)
- Validar que mensagens humanas pausam IA via n8n
- Escrever 2-3 testes de integração para endpoints críticos
- Documentar achados/ajustes necessários na configuração

---

## 🔗 Referências Rápidas
- `docs/CONFIG.md` — variáveis de ambiente, Supabase, Evolution e n8n
- `docs/API.md` — endpoints e exemplos
- `README.md` — visão geral e segurança
- `supabase/*.sql` — scripts de schema/RLS
