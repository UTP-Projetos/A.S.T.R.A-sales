"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, AlertCircle } from "lucide-react";
import { formatDateTime, formatPhone, getStatusColor } from "@/lib/utils";
import { type Client } from "@/types/database";
import Link from "next/link";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients, isLoading, isError, error } = useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("Client")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,wppPhone.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie todos os clientes do CRM
            </p>
          </div>
          <Link href="/clientes/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-8 text-red-500 dark:text-red-400">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="font-semibold">Erro ao carregar clientes</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Erro desconhecido"}
                </p>
              </div>
            ) : !clients || clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clientes/${client.id}`}
                    className="block border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {client.name || "Sem nome"}
                          </h3>
                          {client.crmLeadStatus && (
                            <Badge className={getStatusColor(client.crmLeadStatus)}>
                              {client.crmLeadStatus}
                            </Badge>
                          )}
                          <Badge variant={client.activeBot ? "default" : "secondary"}>
                            {client.activeBot ? "Bot Ativo" : "Bot Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {client.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {client.email}
                            </div>
                          )}
                          {client.wppPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {formatPhone(client.wppPhone)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Cadastrado em {formatDateTime(client.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
