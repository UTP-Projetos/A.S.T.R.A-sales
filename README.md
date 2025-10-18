# 🏢 T.I.N.A CRM

Sistema de gestão de clientes e vendas para o Caverá Country Park, desenvolvido com Next.js 15, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, SSR)
- **IA**: Agente Amanda (Multiagente)
- **WhatsApp**: Evolution API
- **Workflows**: n8n (Configuração manual)

## 📁 Estrutura do Projeto

```
crm-cavera/
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
- ✅ **Agente Amanda** (IA Multiagente)
- ✅ **WhatsApp** via Evolution API
- ✅ **Autenticação** segura
- ✅ **Responsivo** para mobile
- ✅ **Multi-tenant** (configuração por empresa)

## 🎯 Fluxo Principal

1. **Cliente acessa** o CRM
2. **Cria instância** da Amanda
3. **Conecta WhatsApp** via QR Code
4. **Dashboard** mostra status em tempo real
5. **Workflows n8n** configurados manualmente

## 📚 Documentação

- **[Guia de Deploy](docs/DEPLOY.md)** - Instruções para deploy em produção
- **[API Reference](docs/API.md)** - Documentação completa da API
- **[Configuração](docs/CONFIG.md)** - Guia de configuração

## 🚀 Deploy

O projeto está configurado para deploy em produção com:
- Next.js 15 com Turbopack
- Supabase SSR
- Variáveis de ambiente configuradas
- Middleware de autenticação

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.
