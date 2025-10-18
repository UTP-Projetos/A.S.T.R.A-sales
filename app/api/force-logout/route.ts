import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Criar resposta com headers para limpar cookies
    const response = NextResponse.json({ 
      success: true,
      message: "Logout forçado realizado com sucesso"
    });

    // Limpar todos os cookies relacionados ao Supabase
    const cookiesToClear = [
      'sb-zhnhqakyckalumtjiuki-auth-token',
      'sb-zhnhqakyckalumtjiuki-auth-token.0',
      'sb-zhnhqakyckalumtjiuki-auth-token.1',
      'sb-zhnhqakyckalumtjiuki-auth-token.2',
      'sb-zhnhqakyckalumtjiuki-auth-token.3',
      'sb-zhnhqakyckalumtjiuki-auth-token.4',
      'sb-zhnhqakyckalumtjiuki-auth-token.5',
      'sb-zhnhqakyckalumtjiuki-auth-token.6',
      'sb-zhnhqakyckalumtjiuki-auth-token.7',
      'sb-zhnhqakyckalumtjiuki-auth-token.8',
      'sb-zhnhqakyckalumtjiuki-auth-token.9'
    ];

    // Definir cookies para expirar (limpar)
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;

  } catch (error) {
    console.error("Erro inesperado no force logout:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erro inesperado no force logout" 
    }, { status: 500 });
  }
}
