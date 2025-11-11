"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor } from "@/lib/utils";
import type { Client } from "@/types/database";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export function RecentClients() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["recent-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Client")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Client[];
    },
  });

  return (
    <Card className="relative overflow-hidden border border-border/50 hover:border-border transition-all duration-300 bg-card/50 backdrop-blur-sm">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl opacity-30" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent backdrop-blur-sm">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Clientes Recentes</h3>
          </div>
          <Link 
            href="/clientes"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors group"
          >
            Ver todos
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : !clients || clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-sm text-muted-foreground space-y-2">
            <Users className="h-8 w-8 opacity-50" />
            <p>Nenhum cliente ainda</p>
          </div>
        ) : (
          <div className="space-y-1">
            {clients.map((client, index) => {
              const colors = [
                'from-cyan-500/20 to-cyan-600/20',
                'from-indigo-500/20 to-indigo-600/20',
                'from-purple-500/20 to-purple-600/20',
                'from-blue-500/20 to-blue-600/20',
                'from-violet-500/20 to-violet-600/20',
              ];
              const textColors = [
                'text-cyan-600 dark:text-cyan-400',
                'text-indigo-600 dark:text-indigo-400',
                'text-purple-600 dark:text-purple-400',
                'text-blue-600 dark:text-blue-400',
                'text-violet-600 dark:text-violet-400',
              ];
              
              return (
                <Link
                  key={client.id}
                  href={`/clientes/${client.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group border border-transparent hover:border-border/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center flex-shrink-0 backdrop-blur-sm`}>
                      <span className={`text-sm font-bold ${textColors[index % textColors.length]}`}>
                        {(client.name || "S").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {client.name || "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {formatDate(client.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {client.crmLeadStatus && (
                    <Badge 
                      className={`${getStatusColor(client.crmLeadStatus)} text-xs flex-shrink-0`}
                      variant="secondary"
                    >
                      {client.crmLeadStatus.length > 15 
                        ? client.crmLeadStatus.substring(0, 12) + '...'
                        : client.crmLeadStatus
                      }
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
