"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  X, 
  CheckCircle2, 
  Calendar,
  User,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  FileText,
  ExternalLink
} from "lucide-react";
import { 
  formatDateTime, 
  formatPhone,
  getStatusColor,
  getAppointmentTypeColor,
  parseAppointmentNotes,
  formatAppointmentNotes,
  denormalizePhone
} from "@/lib/utils";
import { type Schedule, type Client } from "@/types/database";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ScheduleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.id as string;

  // Buscar dados do agendamento
  const { data: schedule, isLoading: isLoadingSchedule, isError: isErrorSchedule, error: errorSchedule } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Schedules")
        .select("*")
        .eq("id", scheduleId)
        .single();

      if (error) throw error;
      return data as Schedule;
    },
  });

  // Buscar dados do cliente relacionado
  // IMPORTANTE: Cliente é identificado pelo telefone (campo 'client' no Schedule)
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ["schedule-client", schedule?.client],
    queryFn: async () => {
      if (!schedule?.client) return null;
      
      const { data, error } = await supabase
        .from("Client")
        .select("*")
        .eq("wppPhone", schedule.client)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!schedule?.client,
  });

  // Loading state
  if (isLoadingSchedule) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando detalhes do agendamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (isErrorSchedule || !schedule) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar agendamento</h2>
          <p className="text-muted-foreground mb-4">
            {errorSchedule instanceof Error ? errorSchedule.message : "Agendamento não encontrado"}
          </p>
          <Button onClick={() => router.push("/agendamentos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Agendamentos
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Parse appointmentNotes usando helper
  const appointmentNotes = parseAppointmentNotes(schedule.appointmentNotes);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/agendamentos" className="hover:text-foreground transition-colors">
            Agendamentos
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {schedule.appointmentType || "Agendamento"} #{schedule.id}
          </span>
        </div>

        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/agendamentos")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {schedule.appointmentType || "Agendamento"}
                </h1>
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
              <p className="text-muted-foreground">
                Criado em {formatDateTime(schedule.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar Status
            </Button>
            <Button variant="destructive" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cards de Informação Principal */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Data do Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {schedule.appointmentDate 
                    ? formatDateTime(schedule.appointmentDate)
                    : "Data não definida"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.schedulingStatus ? (
                <Badge className={getStatusColor(schedule.schedulingStatus) + " text-base"}>
                  {schedule.schedulingStatus}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Não definido</span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.appointmentType ? (
                <Badge className={getAppointmentTypeColor(schedule.appointmentType) + " text-base"}>
                  {schedule.appointmentType}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Não definido</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações do Cliente */}
        {schedule.client && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
              <CardDescription>Informações do cliente relacionado</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingClient ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando dados do cliente...</span>
                </div>
              ) : client ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{client.name || "Sem nome"}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {client.email && (
                          <span>{client.email}</span>
                        )}
                        {client.wppPhone && (
                          <span>{formatPhone(client.wppPhone)}</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/clientes/${client.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                  {client.crmLeadStatus && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status no Funil:</span>
                      <Badge className={getStatusColor(client.crmLeadStatus)}>
                        {client.crmLeadStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Telefone do Cliente: {formatPhone(schedule.client)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Link de Confirmação */}
        {schedule.confirmationLink && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Link de Confirmação/Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                  {schedule.confirmationLink}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(schedule.confirmationLink || '', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalhes do Agendamento (JSON) */}
        {appointmentNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do Agendamento
              </CardTitle>
              <CardDescription>Informações adicionais sobre o agendamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
                  {JSON.stringify(appointmentNotes, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline de Mudanças de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
            <CardDescription>Histórico de mudanças de status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Evento: Criação */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="w-px h-full bg-border mt-2" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Agendamento Criado</span>
                    <Badge variant="outline" className="text-xs">
                      {formatDateTime(schedule.created_at)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O agendamento foi registrado no sistema
                  </p>
                </div>
              </div>

              {/* Evento: Status Atual */}
              {schedule.schedulingStatus && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full p-2 ${
                      schedule.schedulingStatus === 'Confirmado' ? 'bg-green-100' :
                      schedule.schedulingStatus === 'Cancelado' ? 'bg-red-100' :
                      schedule.schedulingStatus === 'Realizado' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      {schedule.schedulingStatus === 'Confirmado' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : schedule.schedulingStatus === 'Cancelado' ? (
                        <X className="h-4 w-4 text-red-600" />
                      ) : schedule.schedulingStatus === 'Realizado' ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Status: {schedule.schedulingStatus}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {schedule.schedulingStatus === 'Confirmado' && 'Agendamento confirmado pelo cliente'}
                      {schedule.schedulingStatus === 'Cancelado' && 'Agendamento foi cancelado'}
                      {schedule.schedulingStatus === 'Realizado' && 'Serviço foi realizado com sucesso'}
                      {schedule.schedulingStatus === 'Pendente' && 'Aguardando confirmação do cliente'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Alterar status do agendamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="flex-1 min-w-[150px]"
                disabled={schedule.schedulingStatus === 'Confirmado'}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 min-w-[150px]"
                disabled={schedule.schedulingStatus === 'Realizado'}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar como Realizado
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 min-w-[150px]"
                disabled={schedule.schedulingStatus === 'Cancelado'}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
