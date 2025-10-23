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

## 🔧 Configuração

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp env.example .env.local
   ```

3. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

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

- 🔥 **[Correções Críticas](CRITICAL_FIXES_SUMMARY.md)** - Melhorias de segurança e deploy
- 🚀 **[Guia Rápido](QUICK_START.md)** - Como testar as correções
- **[Guia de Deploy](docs/DEPLOY.md)** - Instruções para deploy em produção
- **[API Reference](docs/API.md)** - Documentação completa da API
- **[Configuração](docs/CONFIG.md)** - Guia de configuração
- **[Correções Detalhadas](docs/CRITICAL_FIXES.md)** - Guia técnico completo

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
