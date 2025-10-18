"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, AlertCircle } from "lucide-react";
import { formatDateTime, getStatusColor, getAppointmentTypeColor } from "@/lib/utils";
import { type Schedule } from "@/types/database";

export default function SchedulesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: schedules, isLoading, isError, error } = useQuery({
    queryKey: ["schedules", searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("Schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`client.ilike.%${searchTerm}%`);
      }

      if (filterStatus !== "all") {
        query = query.eq("schedulingStatus", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Schedule[];
    },
  });

  const statuses = ["all", "Pendente", "Confirmado", "Cancelado", "Realizado"];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todas as reservas e agendamentos
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === "all" ? "Todos" : status}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-8 text-red-500">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="font-semibold">Erro ao carregar agendamentos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Erro desconhecido"}
                </p>
              </div>
            ) : !schedules || schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {schedule.client || "Cliente não informado"}
                          </h3>
                          {schedule.appointmentType && (
                            <Badge className={getAppointmentTypeColor(schedule.appointmentType)}>
                              {schedule.appointmentType}
                            </Badge>
                          )}
                          {schedule.schedulingStatus && (
                            <Badge className={getStatusColor(schedule.schedulingStatus)}>
                              {schedule.schedulingStatus}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {schedule.appointmentDate 
                              ? formatDateTime(schedule.appointmentDate)
                              : "Data não definida"}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            ID: {schedule.CompanyClientId || "N/A"}
                          </div>
                        </div>
                        {schedule.appointmentNotes && (
                          <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                            <pre className="text-xs overflow-x-auto">
                              {(() => {
                                try {
                                  return JSON.stringify(schedule.appointmentNotes, null, 2);
                                } catch (error) {
                                  return "Dados de agendamento (formato inválido)";
                                }
                              })()}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Criado em {formatDateTime(schedule.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
