# 🚀 DEPLOY HOJE - Guia Rápido

**Status:** ✅ Pronto para deploy  
**Tempo estimado:** 4 horas  
**Data:** 22/10/2025

---

## 📋 **CHECKLIST PRÉ-DEPLOY (30 minutos)**

### **1. Corrigir RLS (15 min):**
```bash
# No Supabase Dashboard → SQL Editor
# Cole e execute:
/home/tr00vuada/.../tina-crm/supabase/rls-chat-history.sql
```

### **2. Verificar variáveis (5 min):**
```bash
# Verificar se todas estão no .env.local
cat .env.local | grep -E "SUPABASE|EVOLUTION|N8N"
```

### **3. Build de teste (10 min):**
```bash
cd tina-crm
npm run build
# Deve compilar sem erros!
```

---

## 🧪 **TESTES CRÍTICOS (1 hora)**

### **1. Teste Onboarding (20 min):**
```
[ ] Login funciona
[ ] Criar instância Evolution
[ ] QR Code aparece
[ ] Conecta WhatsApp
[ ] Status muda para "connected"
```

### **2. Teste A.S.T.R.A (20 min):**
```
[ ] Enviar mensagem via WhatsApp
[ ] A.S.T.R.A responde
[ ] Mensagem salva no banco
[ ] Histórico aparece no CRM
[ ] Polling funciona (3s)
```

### **3. Teste CRUD (20 min):**
```
[ ] Criar cliente
[ ] Editar cliente
[ ] Ver lista de clientes
[ ] Criar agendamento
[ ] Ver detalhes de agendamento
```

---

## 🌐 **DEPLOY (1 hora)**

### **Opção A: Vercel (Recomendado)**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd tina-crm
vercel

# 4. Configurar variáveis de ambiente no dashboard Vercel:
https://vercel.com/[seu-projeto]/settings/environment-variables

# 5. Deploy de produção
vercel --prod
```

### **Opção B: VPS (Manual)**

```bash
# 1. SSH na VPS
ssh user@seu-servidor.com

# 2. Clonar projeto
git clone [seu-repo]
cd tina-crm

# 3. Instalar dependências
npm install

# 4. Criar .env.local
nano .env.local
# Cole todas as variáveis

# 5. Build
npm run build

# 6. Iniciar com PM2
npm i -g pm2
pm2 start npm --name "astra-crm" -- start
pm2 save
pm2 startup

# 7. Configurar Nginx
sudo nano /etc/nginx/sites-available/astra-crm
```

---

## 🔒 **SEGURANÇA (30 min)**

### **1. SSL/HTTPS:**
```bash
# Se Vercel: Automático ✅
# Se VPS com Nginx:
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### **2. Firewall:**
```bash
# VPS apenas:
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### **3. Backup do banco:**
```bash
# No Supabase Dashboard:
# Database → Backups → Create backup
```

---

## ✅ **TESTES PÓS-DEPLOY (1 hora)**

### **1. Teste de Acesso:**
```
[ ] Site carrega (HTTPS)
[ ] Login funciona
[ ] Dashboard aparece
```

### **2. Teste de Funcionalidade:**
```
[ ] Criar cliente novo
[ ] Testar WhatsApp com número real
[ ] Verificar A.S.T.R.A responde
[ ] Ver histórico no CRM
```

### **3. Teste de Performance:**
```
[ ] Tempo de carregamento < 2s
[ ] Polling não trava interface
[ ] Sem erros no console
```

---

## 🎯 **MONITORAMENTO**

### **Configurar (opcional):**

```bash
# 1. Sentry (erros)
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs

# 2. Google Analytics
# Adicionar no layout.tsx

# 3. Uptime monitoring
# https://uptimerobot.com
```

---

## 📊 **MÉTRICAS DE SUCESSO**

```
✅ Site no ar com HTTPS
✅ Onboarding funciona
✅ A.S.T.R.A responde
✅ Histórico salva e mostra
✅ Sem erros críticos
✅ Performance < 2s
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Build falha**
```bash
# Verificar variáveis
node -e "require('./lib/env')"

# Limpar cache
rm -rf .next
npm run build
```

### **Problema: A.S.T.R.A não responde**
```bash
# 1. Verificar n8n está rodando
curl https://your-n8n.railway.app/webhook/test

# 2. Verificar Evolution API
curl https://evolution-api.com/status

# 3. Ver logs Supabase
# Dashboard → Logs
```

### **Problema: Chat não aparece**
```bash
# 1. Verificar RLS
SELECT * FROM pg_policies WHERE tablename = 'n8nchathistories';

# 2. Verificar telefone do cliente
SELECT "wppPhone" FROM "Client" WHERE id = 'X';

# 3. Verificar session_id no banco
SELECT DISTINCT session_id FROM n8nchathistories;
```

---

## 🎉 **GO-LIVE!**

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚀 DEPLOY CONCLUÍDO COM SUCESSO!                        ║
║                                                           ║
║  Próximos passos:                                        ║
║  1. ✅ Testar com clientes reais                         ║
║  2. ✅ Coletar feedback                                   ║
║  3. ✅ Ajustar conforme necessário                        ║
║  4. ✅ Começar a vender! 💰                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

**Vilmar** - Guia de Deploy  
**Data:** 22/10/2025
