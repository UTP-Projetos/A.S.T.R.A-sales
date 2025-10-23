# 🚀 Guia Rápido - Testar Correções Críticas

## ⚡ Início Rápido (5 minutos)

### **1. Configurar Ambiente**

```bash
# Copiar exemplo de variáveis
cp env.example .env.local

# Editar com suas credenciais reais
nano .env.local  # ou seu editor preferido
```

**Variáveis obrigatórias em `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api-evolution
```

### **2. Instalar e Testar**

```bash
# Instalar dependências
npm install

# Testar build (valida tudo)
npm run build

# Se build passar ✅ = Pronto para deploy!
```

### **3. Testar Localmente**

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, testar health check
curl http://localhost:3000/api/health

# Resposta esperada:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "checks": { ... }
# }
```

---

## 🧪 Testes Rápidos

### **Teste 1: Health Check**
```bash
curl http://localhost:3000/api/health | jq
```
**✅ Sucesso:** Status code 200 e `"status": "healthy"`

### **Teste 2: Security Headers**
```bash
curl -I http://localhost:3000/
```
**✅ Sucesso:** Headers aparecem:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### **Teste 3: Rate Limiting**
```bash
# Fazer 10 requisições rápidas
for i in {1..10}; do 
  curl -s http://localhost:3000/api/test-supabase
  echo ""
done
```
**✅ Sucesso:** Algumas requisições retornam 429 (Too Many Requests)

### **Teste 4: Logger em Produção**
```bash
# Simular produção
NODE_ENV=production npm run build
NODE_ENV=production npm start

# Verificar logs no console
# ✅ Sucesso: Apenas erros aparecem, sem debug/info
```

---

## 📊 Verificar Implementação

### **Arquivos Criados (7):**
```bash
ls -lh lib/
# Deve mostrar:
# - logger.ts (2.8 KB)
# - env.ts (2.1 KB)
# - api-error.ts (1.9 KB)
# - rate-limit.ts (3.3 KB)

ls -lh app/api/health/
# Deve mostrar:
# - route.ts (4.4 KB)

wc -l next.config.ts
# Deve mostrar: 73 linhas (era 8 antes)
```

### **Documentação Criada (2):**
```bash
ls -lh docs/CRITICAL_FIXES.md
ls -lh CRITICAL_FIXES_SUMMARY.md
```

---

## ⚠️ Troubleshooting

### **Erro: Variáveis de ambiente faltando**
```
❌ NEXT_PUBLIC_SUPABASE_URL não está definida
```
**Solução:** Criar `.env.local` com as variáveis do `env.example`

### **Erro: Build falha**
```
Cannot find module 'next' or 'zod'
```
**Solução:** Executar `npm install` primeiro

### **Erro: Health check retorna 503**
```json
{ "status": "unhealthy" }
```
**Solução:** Verificar se as URLs das APIs estão corretas no `.env.local`

### **Erro: TypeScript no VSCode**
```
Cannot find name 'process'
```
**Solução:** Reiniciar VSCode ou executar `npm run build` (resolvido em runtime)

---

## 🎯 Próximos Passos

Após confirmar que tudo funciona:

1. **Refatorar APIs existentes** (ver `docs/CRITICAL_FIXES.md`)
2. **Deploy em staging** para testes finais
3. **Deploy em produção** 🚀

---

## 📚 Documentação Completa

- 📖 **`CRITICAL_FIXES_SUMMARY.md`** - Visão geral executiva
- 📖 **`docs/CRITICAL_FIXES.md`** - Guia detalhado de uso
- 📖 **`docs/API.md`** - Documentação das APIs
- 📖 **`docs/DEPLOY.md`** - Guia de deploy

---

## ✅ Checklist de Validação

- [ ] `.env.local` criado com credenciais reais
- [ ] `npm install` executado sem erros
- [ ] `npm run build` completa com sucesso
- [ ] Health check retorna 200
- [ ] Security headers aparecem nas respostas
- [ ] Logs de debug não aparecem em produção

**Se todos os itens estão ✅ = Deploy liberado! 🎉**

---

**Dúvidas?** Consulte `docs/CRITICAL_FIXES.md` para exemplos detalhados.
