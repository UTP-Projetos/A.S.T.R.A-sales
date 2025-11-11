"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  MessageSquare,
  Building2,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  // REMOVIDO: Links quebrados que não existem
  // { name: "Funil de Vendas", href: "/funil", icon: TrendingUp },
  // { name: "Conversas", href: "/conversas", icon: MessageSquare },
  // { name: "Empresas", href: "/empresas", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">A.S.T.R.A CRM</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium">Tema</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">?</span>
            </div>
            <div>
              <p className="text-sm font-medium">Usuário</p>
              <p className="text-xs text-muted-foreground">Logado</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              try {
                // Fazer logout forçado via API
                const response = await fetch('/api/force-logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (response.ok) {
                  // Limpar storage local
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Redirecionar para login
                  window.location.href = '/login';
                } else {
                  throw new Error('Erro na API de force logout');
                }
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
                // Fallback: limpar storage e redirecionar
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 hover:underline"
            title="Limpar sessão e sair"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
