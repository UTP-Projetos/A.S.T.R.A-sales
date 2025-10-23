import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface ApiError {
  error: string;
  code?: string;
  statusCode: number;
}

/**
 * Criar resposta de erro de API de forma segura
 * Em desenvolvimento: retorna detalhes completos
 * Em produção: retorna apenas mensagem genérica
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'Ocorreu um erro interno',
  statusCode: number = 500
): NextResponse<ApiError> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Logar erro completo (sanitizado automaticamente pelo logger)
  if (error instanceof Error) {
    logger.error(defaultMessage, error);
  } else {
    logger.error(defaultMessage, undefined, { error: String(error) });
  }

  // Em produção, nunca expor detalhes do erro
  if (!isDevelopment) {
    return NextResponse.json(
      {
        error: defaultMessage,
        statusCode,
      },
      { status: statusCode }
    );
  }

  // Em desenvolvimento, incluir mais detalhes
  const errorDetails: ApiError = {
    error: defaultMessage,
    statusCode,
  };

  if (error instanceof Error) {
    errorDetails.error = `${defaultMessage}: ${error.message}`;
  }

  return NextResponse.json(errorDetails, { status: statusCode });
}

/**
 * Validar se variáveis de ambiente existem
 */
export function validateEnvVars(...vars: string[]): { valid: boolean; missing: string[] } {
  const missing = vars.filter(v => !process.env[v]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Criar resposta de erro para variáveis de ambiente faltando
 */
export function createEnvVarErrorResponse(missingVars: string[]): NextResponse {
  logger.error('Missing required environment variables', undefined, { missingVars });
  
  return NextResponse.json(
    {
      error: 'Configuração do servidor incompleta',
      statusCode: 500,
    },
    { status: 500 }
  );
}
