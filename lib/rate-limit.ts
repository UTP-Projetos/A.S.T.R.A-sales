import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// Armazenamento em memória (para produção, use Redis ou similar)
const store = new Map<string, RateLimitStore>();

// Configurações de rate limit
export interface RateLimitConfig {
  interval: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições na janela
}

// Presets comuns
export const RATE_LIMIT_PRESETS = {
  // APIs críticas: 5 requisições por minuto
  CRITICAL: { interval: 60 * 1000, maxRequests: 5 },
  
  // APIs normais: 20 requisições por minuto
  NORMAL: { interval: 60 * 1000, maxRequests: 20 },
  
  // APIs de leitura: 60 requisições por minuto
  READ: { interval: 60 * 1000, maxRequests: 60 },
  
  // Autenticação: 5 tentativas por 15 minutos
  AUTH: { interval: 15 * 60 * 1000, maxRequests: 5 },
};

/**
 * Obter identificador único do cliente (IP ou user ID)
 */
function getClientId(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Tentar obter IP real
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Limpar entradas expiradas periodicamente
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

// Executar cleanup a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpired, 5 * 60 * 1000);
}

/**
 * Verificar rate limit e retornar resposta se excedido
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): { limited: boolean; response?: NextResponse } {
  const clientId = getClientId(request, identifier);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const existing = store.get(key);

  // Se não existe ou expirou, criar novo
  if (!existing || now > existing.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.interval,
    });
    return { limited: false };
  }

  // Se já atingiu o limite
  if (existing.count >= config.maxRequests) {
    const resetIn = Math.ceil((existing.resetTime - now) / 1000);
    
    return {
      limited: true,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(resetIn),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(existing.resetTime / 1000)),
          },
        }
      ),
    };
  }

  // Incrementar contador
  existing.count++;
  store.set(key, existing);

  return { limited: false };
}

/**
 * Middleware helper para aplicar rate limiting
 */
export function withRateLimit(
  config: RateLimitConfig = RATE_LIMIT_PRESETS.NORMAL
) {
  return (request: NextRequest, userId?: string) => {
    return checkRateLimit(request, config, userId);
  };
}
