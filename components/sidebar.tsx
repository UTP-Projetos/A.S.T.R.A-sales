"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl relative">
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                A.S.T.R.A
              </h1>
              <p className="text-[10px] text-muted-foreground/70 -mt-0.5">CRM System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-foreground shadow-lg shadow-indigo-500/10 border border-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-xl blur-sm" />
                )}
                <Icon className={cn(
                  "h-5 w-5 relative z-10 transition-colors",
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-400" 
                    : "group-hover:text-foreground"
                )} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-4 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50">
            <span className="text-sm font-medium">Tema</span>
            <ThemeToggle />
          </div>

          {/* User Section */}
          <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-border/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-indigo-500/20">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">U</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">Usuário</p>
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/force-logout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    if (response.ok) {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = '/login';
                    } else {
                      throw new Error('Erro ao fazer logout');
                    }
                  } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }
                }}
                className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 border border-transparent hover:border-rose-500/20"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
