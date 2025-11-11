# 🏢 A.S.T.R.A CRM

Sistema de gestão de clientes e vendas para o setor turístico, desenvolvido com Next.js 15, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, SSR)
- **IA**: Agente A.S.T.R.A (Multiagente)
- **WhatsApp**: Evolution API
- **Workflows**: n8n (Configuração manual)

## 📁 Estrutura do Projeto

```
astra-crm/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (pages)/           # Páginas da aplicação
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI
│   └── dashboard/        # Componentes do dashboard
├── lib/                  # Utilitários e configurações
├── types/                # Definições TypeScript
├── supabase/             # Scripts SQL
└── docs/                 # Documentação
```

## 🔧 Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
npm run setup

# 3. Rodar o projeto
npm run dev
```

📚 **Guia completo:** [SETUP.md](SETUP.md) - Setup em 15-30 minutos

## 📋 Funcionalidades

- ✅ **Dashboard** com métricas e gráficos
- ✅ **Gestão de Clientes** completa
- ✅ **Agendamentos** integrados
- ✅ **Agente A.S.T.R.A** (IA Multiagente)
- ✅ **WhatsApp** via Evolution API
- ✅ **Autenticação** segura
- ✅ **Responsivo** para mobile
- ✅ **Multi-tenant** (configuração por empresa)

## 🎯 Fluxo Principal

1. **Cliente acessa** o CRM
2. **Cria instância** da A.S.T.R.A
3. **Conecta WhatsApp** via QR Code
4. **Dashboard** mostra status em tempo real
5. **Workflows n8n** configurados manualmente

## 📚 Documentação

### **Documentos Principais**
- 🗺️ **[ROADMAP MVP](ROADMAP_MVP.md)** - Roadmap completo com 288 funcionalidades (132 implementadas)
- ✅ **[TESTES EXECUTADOS](TESTES_EXECUTADOS.md)** - Relatório completo de testes
- 🚧 **[ANÁLISE ONBOARDING](ANALISE_ONBOARDING.md)** - 18 barreiras identificadas para novos devs
- 🔍 **[ANÁLISE RLS](supabase/ANALISE_PROBLEMAS_RLS.md)** - Problemas de segurança SQL

### **Documentação Técnica**
- **[API Reference](docs/API.md)** - Documentação completa da API
- **[Configuração](docs/CONFIG.md)** - Guia de configuração
- **[Onboarding Dev](docs/ONBOARDING_DEV.md)** - Guia para novos desenvolvedores
- **[Guia Início Rápido](docs/GUIA_INICIO_RAPIDO.md)** - Setup rápido do projeto

## 🚀 Deploy

O projeto está configurado para deploy em produção com:
- Next.js 15 com Turbopack
- Supabase SSR
- Variáveis de ambiente configuradas e validadas
- Middleware de autenticação
- Security headers (XSS, clickjacking, etc)
- Rate limiting em APIs críticas
- Health check endpoint (`/api/health`)
- Sistema de logging estruturado

### 🔒 Segurança

✅ **Correções críticas implementadas** (21/10/2025):
- Sistema de logging que sanitiza dados sensíveis
- Validação de variáveis de ambiente com Zod
- Headers de segurança configurados
- Rate limiting para prevenir abuse
- Tratamento de erros que não expõe detalhes internos

**Veja mais:** [CRITICAL_FIXES_SUMMARY.md](CRITICAL_FIXES_SUMMARY.md)

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.
