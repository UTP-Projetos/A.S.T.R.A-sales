import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado',
      NEXT_PUBLIC_EVOLUTION_API_URL: process.env.NEXT_PUBLIC_EVOLUTION_API_URL ? '✅ Configurado' : '❌ Não configurado',
      EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? '✅ Configurado' : '❌ Não configurado',
      N8N_WEBHOOK_BASE_URL: process.env.N8N_WEBHOOK_BASE_URL ? '✅ Configurado' : '⚠️ Opcional',
      DEFAULT_INSTANCE_TOKEN: process.env.DEFAULT_INSTANCE_TOKEN ? '✅ Configurado' : '⚠️ Opcional',
      DEFAULT_WHATSAPP_NUMBER: process.env.DEFAULT_WHATSAPP_NUMBER ? '✅ Configurado' : '⚠️ Opcional'
    };

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_EVOLUTION_API_URL',
      'EVOLUTION_API_KEY'
    ];

    const missingRequired = requiredVars.filter(varName => 
      !process.env[varName]
    );

    const allConfigured = missingRequired.length === 0;

    return NextResponse.json({
      success: allConfigured,
      message: allConfigured ? 'Todas as variáveis obrigatórias estão configuradas' : 'Algumas variáveis obrigatórias estão faltando',
      variables: envVars,
      missingRequired: missingRequired,
      recommendations: missingRequired.length > 0 ? [
        'Crie o arquivo .env.local na raiz do projeto',
        'Configure as variáveis obrigatórias',
        'Reinicie o servidor (npm run dev)'
      ] : []
    });

  } catch (error) {
    console.error("Erro ao verificar variáveis de ambiente:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: "Erro interno no servidor"
    }, { status: 500 });
  }
}
