import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // MODO DESENVOLVIMENTO: Se DISABLE_AUTH=true, permitir acesso sem autenticação
  const disableAuth = process.env.DISABLE_AUTH === "true";
  
  if (disableAuth) {
    // Em modo desenvolvimento, permitir acesso a todas as rotas sem autenticação
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Verificar sessão do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Rotas públicas (não requerem autenticação)
  const publicRoutes = ["/login", "/cadastro", "/recuperar-senha", "/termos", "/force-logout", "/clear-session"];
  const apiRoutes = ["/api/check-env", "/api/test-supabase", "/api/force-logout", "/api/health"]; // APIs que não precisam de autenticação
  const authRequiredRoutes = ["/onboarding"]; // Rotas que requerem autenticação mas não redirecionam
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isApiRoute = apiRoutes.some((route) => pathname.startsWith(route));
  const isAuthRequiredRoute = authRequiredRoutes.some((route) => pathname.startsWith(route));

  // Se é rota pública ou API pública, permitir acesso
  if (isPublicRoute || isApiRoute) {
    // Se usuário já está autenticado e tenta acessar login, redirecionar para dashboard
    // Mas permitir acesso ao cadastro (para criar múltiplas empresas)
    if (session && pathname === "/login") {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
    
    return res;
  }

  // Se não está autenticado e tenta acessar rota protegida, redirecionar para login
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    
    // Guardar URL de origem para redirect pós-login
    // Apenas se não for a raiz (para evitar loop)
    if (pathname !== "/") {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  // Usuário autenticado, permitir acesso
  return res;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
