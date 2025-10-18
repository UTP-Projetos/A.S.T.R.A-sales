import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Validação das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "❌ NEXT_PUBLIC_SUPABASE_URL não está definida. " +
    "Crie um arquivo .env.local na raiz do projeto e adicione: " +
    "NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida. " +
    "Crie um arquivo .env.local na raiz do projeto e adicione: " +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui"
  );
}

// Validação adicional do formato da URL
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `❌ NEXT_PUBLIC_SUPABASE_URL está mal formatada: "${supabaseUrl}". ` +
    "Deve ser uma URL válida (ex: https://seu-projeto.supabase.co)"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
