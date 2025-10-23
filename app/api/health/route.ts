import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    env: CheckStatus;
    supabase: CheckStatus;
    evolution: CheckStatus;
  };
}

interface CheckStatus {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
}

async function checkEnvVariables(): Promise<CheckStatus> {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_EVOLUTION_API_URL',
    'EVOLUTION_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      status: 'fail',
      message: `Missing env vars: ${missing.join(', ')}`,
    };
  }

  return { status: 'pass' };
}

async function checkSupabase(): Promise<CheckStatus> {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      return { status: 'fail', message: 'Supabase URL not configured' };
    }

    // Tentar fazer uma requisição simples para verificar conectividade
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok || response.status === 404) {
      return {
        status: 'pass',
        message: 'Supabase reachable',
        responseTime,
      };
    }

    return {
      status: 'warn',
      message: `Supabase responded with ${response.status}`,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Connection failed',
      responseTime,
    };
  }
}

async function checkEvolutionAPI(): Promise<CheckStatus> {
  const startTime = Date.now();
  
  try {
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    
    if (!evolutionUrl || !apiKey) {
      return { status: 'fail', message: 'Evolution API not configured' };
    }

    // Tentar fazer uma requisição simples para verificar conectividade
    const response = await fetch(`${evolutionUrl}/`, {
      method: 'HEAD',
      headers: {
        'apikey': apiKey,
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok || response.status === 404 || response.status === 401) {
      return {
        status: 'pass',
        message: 'Evolution API reachable',
        responseTime,
      };
    }

    return {
      status: 'warn',
      message: `Evolution API responded with ${response.status}`,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Connection failed',
      responseTime,
    };
  }
}

export async function GET() {
  try {
    // Executar todas as verificações em paralelo
    const [envCheck, supabaseCheck, evolutionCheck] = await Promise.all([
      checkEnvVariables(),
      checkSupabase(),
      checkEvolutionAPI(),
    ]);

    // Determinar status geral
    const allPassed = [envCheck, supabaseCheck, evolutionCheck].every(
      check => check.status === 'pass'
    );
    const anyFailed = [envCheck, supabaseCheck, evolutionCheck].some(
      check => check.status === 'fail'
    );

    const overallStatus = anyFailed ? 'unhealthy' : allPassed ? 'healthy' : 'degraded';

    const health: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        env: envCheck,
        supabase: supabaseCheck,
        evolution: evolutionCheck,
      },
    };

    // Retornar 200 se saudável, 503 se não
    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
