import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Verifica se o modo de desenvolvimento está ativo (autenticação desabilitada)
 */
export function isDevMode(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

/**
 * Obtém o cliente Supabase para uso em rotas API
 */
export async function getSupabaseClient(request?: NextRequest) {
  const cookieStore = await cookies();
  
  // Se não tiver request, usar cookies do servidor
  const getCookie = (name: string) => {
    if (request) {
      return request.cookies.get(name)?.value;
    }
    return cookieStore.get(name)?.value;
  };
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: getCookie,
        set() {
          // Em rotas API, não podemos setar cookies diretamente
          // Isso é feito no middleware
        },
        remove() {
          // Em rotas API, não podemos remover cookies diretamente
        },
      },
    }
  );
}

/**
 * Verifica autenticação do usuário
 * Retorna null se estiver em modo dev ou se não estiver autenticado
 */
export async function requireAuth(request?: NextRequest): Promise<{
  user: any;
  supabase: ReturnType<typeof createServerClient>;
} | null> {
  // Se estiver em modo dev, retornar null (sem autenticação necessária)
  if (isDevMode()) {
    return null;
  }

  const supabase = await getSupabaseClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user, supabase };
}

/**
 * Obtém empresa do usuário autenticado
 * Em modo dev, retorna a primeira empresa do banco (para facilitar desenvolvimento)
 */
export async function getUserCompany(request?: NextRequest) {
  const auth = await requireAuth(request);
  const supabase = await getSupabaseClient(request);

  // Se estiver em modo dev, retornar primeira empresa do banco
  if (isDevMode()) {
    const { data: companies } = await supabase
      .from("Company")
      .select("*")
      .limit(1)
      .single();
    
    return companies;
  }

  // Modo produção: buscar empresa do usuário autenticado
  if (!auth || !auth.user) {
    return null;
  }

  const { data: company } = await supabase
    .from("Company")
    .select("*")
    .eq("email", auth.user.email)
    .single();

  return company;
}

