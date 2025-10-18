import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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
    
    // Testar conexão com Supabase
    const { data, error } = await supabase
      .from("Company")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: "Erro ao conectar com Supabase"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase conectado com sucesso",
      data: data
    });

  } catch (error) {
    console.error("Erro no teste Supabase:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: "Erro interno no servidor"
    }, { status: 500 });
  }
}
