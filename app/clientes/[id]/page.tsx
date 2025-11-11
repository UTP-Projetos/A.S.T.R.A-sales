"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { 
  formatDateTime, 
  formatPhone, 
  formatDate,
  getStatusColor,
  getAppointmentTypeColor 
} from "@/lib/utils";
import { type Client, type Schedule } from "@/types/database";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChatActive } from "@/components/chat/chat-active";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  // Buscar dados do cliente
  const { data: client, isLoading: isLoadingClient, isError: isErrorClient, error: errorClient } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Client")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      return data as Client;
    },
  });

  // Buscar agendamentos relacionados
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["client-schedules", client?.wppPhone],
    queryFn: async () => {
      if (!client?.wppPhone) return [];
      
      const { data, error } = await supabase
        .from("Schedules")
        .select("*")
        .eq("client", client.wppPhone)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Schedule[];
    },
    enabled: !!client?.wppPhone,
  });

  // Loading state
  if (isLoadingClient) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (isErrorClient || !client) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            {errorClient instanceof Error ? errorClient.message : "O cliente solicitado não existe"}
          </p>
          <Button onClick={() => router.push("/clientes")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/clientes")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm border border-indigo-500/20">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {(client.name || "S").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {client.name || "Sem nome"}
                </h1>
                <p className="text-sm text-muted-foreground/70">
                  Cliente desde {formatDate(client.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-indigo-500/30 hover:bg-indigo-500/10 hover:border-indigo-500/50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Conversas
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Status Card */}
        {client.crmLeadStatus && (
          <Card className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground/80 mb-2">
                    Status Atual
                  </p>
                  <Badge className={`${getStatusColor(client.crmLeadStatus)} text-base`}>
                    {client.crmLeadStatus}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground/80 mb-1">
                    Total de Agendamentos
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                    {schedules?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground/70" />
                Informações de Contato
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                  <Phone className="h-4 w-4" />
                  Telefone
                </div>
                <p className="text-base font-medium">
                  {formatPhone(client.wppPhone)}
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                  <Mail className="h-4 w-4" />
                  E-mail
                </div>
                <p className="text-base">
                  {client.email || <span className="text-muted-foreground/70">Não informado</span>}
                </p>
              </div>

              {/* Date of Birth */}
              {client.dateOfBirth && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </div>
                  <p className="text-base">{formatDate(client.dateOfBirth)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Agendamentos */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground/70" />
                Agendamentos
              </h3>
              {schedules && schedules.length > 0 && (
                <Badge variant="secondary">
                  {schedules.length} {schedules.length === 1 ? 'agendamento' : 'agendamentos'}
                </Badge>
              )}
            </div>

            {isLoadingSchedules ? (
              <div className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
              </div>
            ) : !schedules || schedules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Nenhum agendamento</p>
                <p className="text-sm mt-1 text-muted-foreground/70">Este cliente ainda não possui agendamentos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/agendamentos/${schedule.id}`}
                    className="block p-4 rounded-lg border border-border/50 hover:border-indigo-500/50 hover:bg-accent/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {schedule.appointmentType && (
                            <Badge className={getAppointmentTypeColor(schedule.appointmentType)}>
                              {schedule.appointmentType}
                            </Badge>
                          )}
                          {schedule.schedulingStatus && (
                            <Badge variant="outline" className={getStatusColor(schedule.schedulingStatus)}>
                              {schedule.schedulingStatus}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                          <Calendar className="h-4 w-4" />
                          {schedule.appointmentDate 
                            ? formatDateTime(schedule.appointmentDate)
                            : "Data não definida"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Chat Ativo */}
        {client.wppPhone && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold">Conversa em Tempo Real</h3>
            </div>
            <ChatActive clientPhone={client.wppPhone} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
