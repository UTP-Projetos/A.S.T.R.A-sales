import { z } from 'zod';

// Schema de validação das variáveis de ambiente
const envSchema = z.object({
  // Supabase (obrigatórias)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória'),
  
  // Evolution API (obrigatórias)
  NEXT_PUBLIC_EVOLUTION_API_URL: z.string().url('NEXT_PUBLIC_EVOLUTION_API_URL deve ser uma URL válida'),
  EVOLUTION_API_KEY: z.string().min(1, 'EVOLUTION_API_KEY é obrigatória'),
  
  // n8n Webhook (opcional, mas recomendada)
  N8N_WEBHOOK_BASE_URL: z.string().url('N8N_WEBHOOK_BASE_URL deve ser uma URL válida').optional(),
  
  // Configurações padrão (opcionais, legacy)
  DEFAULT_INSTANCE_TOKEN: z.string().optional(),
  DEFAULT_WHATSAPP_NUMBER: z.string().optional(),
  
  // Next.js (automático)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Tipo inferido do schema
export type Env = z.infer<typeof envSchema>;

// Validar variáveis de ambiente
function validateEnv(): Env {
  try {
    // @ts-ignore - process.env está disponível em Next.js
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err: z.ZodIssue) => {
        const path = err.path.join('.');
        return `❌ ${path}: ${err.message}`;
      });

      console.error('\n🚨 ERRO: Variáveis de ambiente inválidas ou faltando:\n');
      console.error(missingVars.join('\n'));
      console.error('\n📋 Crie um arquivo .env.local com as variáveis necessárias.');
      console.error('📄 Consulte o arquivo env.example para referência.\n');
      
      throw new Error('Validação de variáveis de ambiente falhou');
    }
    throw error;
  }
}

// Validar e exportar variáveis
export const env = validateEnv();

// Helper para verificar se está em produção
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
