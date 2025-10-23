import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite qualquer domínio HTTPS (necessário para QR codes de APIs externas)
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevenção de XSS
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevenção de clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Proteção XSS do browser
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Política de referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissões do browser
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects para forçar HTTPS em produção
  async redirects() {
    return [
      // Adicionar redirects específicos aqui se necessário
    ];
  },

  // Configuração de experimental features
  experimental: {
    // Otimizações para produção
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Configuração de webpack (se necessário)
  webpack: (config: any) => {
    // Otimizações customizadas aqui se necessário
    return config;
  },
};

export default nextConfig;
