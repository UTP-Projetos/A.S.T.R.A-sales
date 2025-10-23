type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

// Detectar ambiente de forma segura
const getNodeEnv = (): string => {
  try {
    // @ts-ignore - process.env está disponível em Next.js
    return process?.env?.NODE_ENV || 'production';
  } catch {
    return 'production';
  }
};

class Logger {
  private get isDevelopment(): boolean {
    return getNodeEnv() === 'development';
  }
  
  private get isTest(): boolean {
    return getNodeEnv() === 'test';
  }

  private shouldLog(level: LogLevel): boolean {
    // Em teste, não fazer log
    if (this.isTest) return false;
    
    // Em produção, apenas warn e error
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return false;
    }
    
    return true;
  }

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password',
      'token',
      'apikey',
      'api_key',
      'secret',
      'authorization',
      'auth',
      'apiKey',
      'tokenInstance',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(this.sanitize(context))}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
        } : String(error),
      };
      console.error(this.formatMessage('error', message, errorContext));
    }
  }
}

// Exportar instância singleton
export const logger = new Logger();
