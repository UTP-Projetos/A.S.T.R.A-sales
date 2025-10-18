# 🚀 Guia de Deploy - CRM Caverá

## 📋 Checklist de Deploy

### ✅ **Pré-Deploy**

- [ ] **Variáveis de ambiente** configuradas
- [ ] **Supabase** configurado e testado
- [ ] **Evolution API** configurada
- [ ] **n8n Workflows** configurados
- [ ] **Testes** executados com sucesso

### 🔧 **Configuração de Produção**

#### **1. Variáveis de Ambiente**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Evolution API
NEXT_PUBLIC_EVOLUTION_API_URL=your_evolution_api_url
EVOLUTION_API_KEY=your_evolution_api_key

# n8n Webhooks
N8N_WEBHOOK_BASE_URL=your_n8n_webhook_url
```

#### **2. Supabase**
- [ ] **RLS Policies** aplicadas
- [ ] **Tabelas** criadas
- [ ] **Auth** configurado
- [ ] **Webhooks** configurados

#### **3. Evolution API**
- [ ] **Instâncias** configuradas
- [ ] **Webhooks** apontando para n8n
- [ ] **API Key** válida

### 🚀 **Comandos de Deploy**

#### **Build de Produção**
```bash
npm run build
```

#### **Start de Produção**
```bash
npm start
```

#### **Verificação**
```bash
# Testar APIs
curl http://localhost:3000/api/test-supabase

# Testar autenticação
curl http://localhost:3000/api/evolution/check-amanda
```

### 📊 **Monitoramento**

- **Logs**: Verificar logs do servidor
- **APIs**: Monitorar endpoints críticos
- **Supabase**: Verificar conexões
- **Evolution**: Verificar status das instâncias

### 🔒 **Segurança**

- ✅ **HTTPS** obrigatório em produção
- ✅ **Variáveis** de ambiente seguras
- ✅ **RLS** habilitado no Supabase
- ✅ **Middleware** de autenticação ativo

### 📞 **Suporte**

Em caso de problemas:
1. Verificar logs do servidor
2. Testar conectividade com Supabase
3. Verificar status da Evolution API
4. Consultar documentação técnica
