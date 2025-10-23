"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import type { Client } from "@/types/database";
import { AlertCircle } from "lucide-react";

export function RecentClients() {
  const { data: clients, isLoading, isError, error } = useQuery({
    queryKey: ["recent-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Client")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Client[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes Recentes</CardTitle>
        <CardDescription>
          Últimos 10 clientes cadastrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Erro ao carregar clientes</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </div>
        ) : !clients || clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum cliente cadastrado ainda
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {client.name || "Sem nome"}
                    </p>
                    {client.crmLeadStatus && (
                      <Badge className={getStatusColor(client.crmLeadStatus)}>
                        {client.crmLeadStatus}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{client.email || "Sem e-mail"}</span>
                    <span>•</span>
                    <span>{formatDateTime(client.created_at)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={client.activeBot ? "default" : "secondary"}>
                    {client.activeBot ? "Bot Ativo" : "Bot Inativo"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
