import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Criar cliente Supabase com cookies corretos para Next.js 15
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Fazer logout do Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Erro ao fazer logout:", error);
      return NextResponse.json({ 
        success: false, 
        error: "Erro ao fazer logout" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Logout realizado com sucesso"
    });

  } catch (error) {
    console.error("Erro inesperado no logout:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erro inesperado no logout" 
    }, { status: 500 });
  }
}
