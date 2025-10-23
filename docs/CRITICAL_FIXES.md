# 🔧 Correções Críticas Implementadas

## ✅ **Problemas Resolvidos**

### **1. Sistema de Logging Estruturado** ✅
**Arquivo:** `lib/logger.ts`

**O que foi feito:**
- Criado logger que **sanitiza dados sensíveis** automaticamente
- Logs de `debug` e `info` **desabilitados em produção**
- Apenas `warn` e `error` aparecem em produção
- Tokens, senhas, e API keys são redacted automaticamente

**Como usar:**
```typescript
import { logger } from '@/lib/logger';

// Ao invés de console.log
logger.debug('Verificando instância', { instanceName });

// Ao invés de console.error
logger.error('Erro ao criar instância', error, { companyId });
```

---

### **2. Validação de Variáveis de Ambiente** ✅
**Arquivo:** `lib/env.ts`

**O que foi feito:**
- Validação com Zod de todas as variáveis obrigatórias
- Erro claro no build/runtime se algo estiver faltando
- Type-safe access às variáveis

**Como usar:**
```typescript
import { env } from '@/lib/env';

// Ao invés de process.env.EVOLUTION_API_KEY
const apiKey = env.EVOLUTION_API_KEY; // Type-safe e validado
```

---

### **3. Next.js Config com Security Headers** ✅
**Arquivo:** `next.config.ts`

**O que foi feito:**
- Headers de segurança (XSS, clickjacking, etc)
- Configuração de imagens para QR codes
- Otimizações para produção

**Headers adicionados:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restritiva

---

### **4. Health Check Endpoint** ✅
**Endpoint:** `/api/health`

**O que foi feito:**
- Verifica variáveis de ambiente
- Testa conectividade com Supabase
- Testa conectividade com Evolution API
- Retorna 200 (healthy), 503 (unhealthy), ou 503 (degraded)

**Como usar:**
```bash
curl http://localhost:3000/api/health
```

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T...",
  "version": "1.0.0",
  "checks": {
    "env": { "status": "pass" },
    "supabase": { "status": "pass", "responseTime": 123 },
    "evolution": { "status": "pass", "responseTime": 456 }
  }
}
```

---

### **5. Tratamento de Erros Seguro** ✅
**Arquivo:** `lib/api-error.ts`

**O que foi feito:**
- Helper para criar respostas de erro
- **Nunca expõe detalhes em produção**
- Logs completos no servidor
- Mensagens genéricas para cliente

**Como usar:**
```typescript
import { createErrorResponse, validateEnvVars } from '@/lib/api-error';

// Validar env vars
const { valid, missing } = validateEnvVars('EVOLUTION_API_KEY', 'SUPABASE_URL');
if (!valid) {
  return createEnvVarErrorResponse(missing);
}

// Tratar erros
try {
  // ... código
} catch (error) {
  return createErrorResponse(error, 'Erro ao processar requisição', 500);
}
```

---

### **6. Rate Limiting** ✅
**Arquivo:** `lib/rate-limit.ts`

**O que foi feito:**
- Sistema de rate limiting em memória
- Diferentes presets (AUTH, CRITICAL, NORMAL, READ)
- Headers padrão (Retry-After, X-RateLimit-*)

**Como usar:**
```typescript
import { checkRateLimit, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Aplicar rate limiting
  const rateLimit = checkRateLimit(request, RATE_LIMIT_PRESETS.CRITICAL);
  if (rateLimit.limited) {
    return rateLimit.response;
  }
  
  // ... resto da API
}
```

**Presets disponíveis:**
- `CRITICAL`: 5 req/min (criar instâncias, etc)
- `NORMAL`: 20 req/min (APIs gerais)
- `READ`: 60 req/min (leitura de dados)
- `AUTH`: 5 tentativas/15min (login, cadastro)

---

## 📝 **TAREFAS PENDENTES**

### **Aplicar Correções nas APIs Existentes**

Para cada API route em `app/api/`, faça:

1. **Substituir console.log/error:**
```typescript
// ❌ Antes
console.log("Verificando instância:", instanceName);
console.error("Erro:", error);

// ✅ Depois
import { logger } from '@/lib/logger';
logger.debug('Verificando instância', { instanceName });
logger.error('Erro ao verificar', error);
```

2. **Remover campos `debug` e `details` de respostas:**
```typescript
// ❌ Antes
return NextResponse.json({ 
  error: "Erro",
  details: error.message,  // ⚠️ Expõe detalhes
  debug: qrData            // ⚠️ Expõe estrutura interna
}, { status: 500 });

// ✅ Depois
import { createErrorResponse } from '@/lib/api-error';
return createErrorResponse(error, 'Erro ao obter QR Code', 500);
```

3. **Adicionar rate limiting:**
```typescript
// ✅ No início da função
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request, RATE_LIMIT_PRESETS.CRITICAL);
  if (rateLimit.limited) {
    return rateLimit.response;
  }
  
  // ... resto do código
}
```

4. **Adicionar timeout em fetches:**
```typescript
// ❌ Antes
const response = await fetch(url, { method: 'POST', ... });

// ✅ Depois
const response = await fetch(url, {
  method: 'POST',
  signal: AbortSignal.timeout(10000), // 10s timeout
  ...
});
```

---

## 🚀 **Como Testar**

### **1. Criar arquivo .env.local:**
```bash
cp env.example .env.local
# Editar com suas credenciais reais
```

### **2. Instalar dependências:**
```bash
npm install
```

### **3. Testar build:**
```bash
npm run build
```

### **4. Testar health check:**
```bash
npm run dev
curl http://localhost:3000/api/health
```

### **5. Verificar logs:**
Em desenvolvimento, você verá logs detalhados.
Em produção (`NODE_ENV=production`), apenas erros críticos.

---

## 📋 **Checklist de Deploy**

Antes de fazer deploy em produção:

- [ ] Todas as APIs usam `logger` ao invés de `console.log`
- [ ] Nenhuma resposta de API contém `details` ou `debug` em produção
- [ ] Rate limiting aplicado em APIs críticas
- [ ] Health check retorna 200
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] Build completa sem erros
- [ ] Headers de segurança configurados

---

## ⚠️ **APIs que PRECISAM ser Refatoradas**

### **Prioridade CRÍTICA:**
1. `/api/evolution/get-qr` - Remove 33 console.logs, adiciona rate limit
2. `/api/evolution/setup-amanda` - Adiciona rate limit (criação de instâncias $$)
3. `/api/evolution/create-instance` - Rate limit CRITICAL
4. `/api/login` (página) - Rate limit AUTH

### **Prioridade ALTA:**
5. `/api/evolution/check-amanda` - 7 console.logs
6. `/api/evolution/sync-status` - 12 console.logs
7. `/api/evolution/check-connection` - 8 console.logs

### **Prioridade MÉDIA:**
8. Todas as outras APIs em `/api/evolution/`

---

## 🔐 **Segurança Adicional Recomendada**

### **Para produção real:**

1. **Rate Limiting com Redis:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

2. **Error Tracking (Sentry):**
```bash
npm install @sentry/nextjs
```

3. **Environment Variables Validation:**
Já implementado em `lib/env.ts`

4. **CORS específico:**
Se precisar de cross-origin, configure no `next.config.ts`:
```typescript
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'https://seu-dominio.com' },
    ],
  }];
}
```

---

## 📚 **Referências**

- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [Rate Limiting Strategies](https://blog.logrocket.com/rate-limiting-node-js/)
