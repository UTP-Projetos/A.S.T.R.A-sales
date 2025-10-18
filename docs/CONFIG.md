# ⚙️ Configuração de Produção - CRM Caverá

## 🔧 Variáveis de Ambiente

### **Arquivo `.env.local`**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Evolution API Configuration
NEXT_PUBLIC_EVOLUTION_API_URL=your_evolution_api_url_here
EVOLUTION_API_KEY=your_evolution_api_key_here

# n8n Webhooks Configuration
N8N_WEBHOOK_BASE_URL=your_n8n_webhook_url_here

# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🗄️ Configuração do Supabase

### **1. Criar Projeto**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

### **2. Configurar Tabelas**
Execute os scripts SQL em `supabase/`:
- `rls-policies.sql` - Políticas de segurança
- `add-instance-name-field.sql` - Campo de instância
- `add-onboarding-fields.sql` - Campos de onboarding

### **3. Configurar Auth**
- Habilitar autenticação por email
- Configurar redirects para produção

## 🤖 Configuração da Evolution API

### **1. Instalar Evolution API**
- Deploy em VPS com Docker
- Configurar domínio e SSL
- Gerar API Key

### **2. Configurar Webhooks**
- Apontar para n8n workflows
- Configurar eventos: `MESSAGES_UPSERT`, `CONNECTION_UPDATE`

## 🔄 Configuração do n8n

### **1. Deploy n8n**
- Deploy em Railway ou VPS
- Configurar domínio e SSL
- Configurar webhooks

### **2. Workflows**
- Importar workflows de `Workflow's/`
- Configurar variáveis de ambiente
- Testar conectividade

## 🚀 Deploy da Aplicação

### **1. Build**
```bash
npm run build
```

### **2. Start**
```bash
npm start
```

### **3. Verificação**
```bash
# Testar APIs
curl https://your-domain.com/api/test-supabase
curl https://your-domain.com/api/evolution/check-amanda
```

## 🔒 Segurança

### **1. HTTPS**
- Certificado SSL obrigatório
- Redirect HTTP → HTTPS

### **2. Variáveis**
- Nunca commitar `.env.local`
- Usar variáveis de ambiente do servidor

### **3. Supabase**
- RLS habilitado
- Políticas de segurança aplicadas
- Auth configurado corretamente

## 📊 Monitoramento

### **1. Logs**
- Verificar logs do servidor
- Monitorar erros da aplicação

### **2. APIs**
- Status da Evolution API
- Conectividade com Supabase
- Performance das queries

### **3. Alertas**
- Configurar alertas para falhas
- Monitorar uso de recursos
