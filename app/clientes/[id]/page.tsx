"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Building2,
  AlertCircle,
  Loader2,
  CalendarDays,
  Bot
} from "lucide-react";
import { 
  formatDateTime, 
  formatPhone, 
  formatCPF, 
  formatDate,
  getStatusColor,
  getAppointmentTypeColor 
} from "@/lib/utils";
import { type Client, type Schedule } from "@/types/database";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChatViewer } from "@/components/chat/chat-viewer";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clientId = params.id as string;
  const [botToggleError, setBotToggleError] = useState<string | null>(null);

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

  // Mutation para toggle do bot
  const toggleBotMutation = useMutation({
    mutationFn: async (activeBot: boolean) => {
      const response = await fetch(`/api/clients/${clientId}/toggle-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeBot })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar status do bot');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setBotToggleError(null);
    },
    onError: (error) => {
      setBotToggleError(error instanceof Error ? error.message : 'Erro ao alterar status do bot');
    }
  });

  const handleToggleBot = () => {
    if (client) {
      toggleBotMutation.mutate(!client.activeBot);
    }
  };

  // Buscar agendamentos relacionados
  // IMPORTANTE: Agendamentos são vinculados pelo telefone (wppPhone), não pelo ID
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
            <p className="text-muted-foreground">Carregando detalhes do cliente...</p>
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
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar cliente</h2>
          <p className="text-muted-foreground mb-4">
            {errorClient instanceof Error ? errorClient.message : "Cliente não encontrado"}
          </p>
          <Button onClick={() => router.push("/clientes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isBotActive = client.activeBot === true;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/clientes" className="hover:text-foreground transition-colors">
            Clientes
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{client.name || "Sem nome"}</span>
        </div>

        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/clientes")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {client.name || "Sem nome"}
              </h1>
              <p className="text-muted-foreground">
                Cliente desde {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isBotActive ? "destructive" : "default"}
              onClick={handleToggleBot}
              disabled={toggleBotMutation.isPending}
            >
              {toggleBotMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  {isBotActive ? "Desativar Bot" : "Ativar Bot"}
                </>
              )}
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ver Conversas
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mensagem de erro do toggle do bot */}
        {botToggleError && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{botToggleError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status do Bot</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isBotActive ? "default" : "secondary"} className="text-base">
                {isBotActive ? "Bot Ativo" : "Bot Inativo"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status no Funil</CardTitle>
            </CardHeader>
            <CardContent>
              {client.crmLeadStatus ? (
                <Badge className={getStatusColor(client.crmLeadStatus)}>
                  {client.crmLeadStatus}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Não definido</span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Dados cadastrais do cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  E-mail
                </div>
                <p className="text-base">
                  {client.email || <span className="text-muted-foreground">Não informado</span>}
                </p>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </div>
                <p className="text-base">
                  {formatPhone(client.wppPhone)}
                </p>
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  CPF
                </div>
                <p className="text-base">
                  {client.cpf ? formatCPF(client.cpf) : <span className="text-muted-foreground">Não informado</span>}
                </p>
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Data de Nascimento
                </div>
                <p className="text-base">
                  {client.dateOfBirth ? formatDate(client.dateOfBirth) : <span className="text-muted-foreground">Não informado</span>}
                </p>
              </div>

              {/* Endereço */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </div>
                <p className="text-base">
                  {client.adress || <span className="text-muted-foreground">Não informado</span>}
                </p>
              </div>

              {/* Company ID */}
              {client.CompanyId && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    ID da Empresa
                  </div>
                  <p className="text-base">
                    {client.CompanyId}
                  </p>
                </div>
              )}

              {/* Data de Cadastro */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Data de Cadastro
                </div>
                <p className="text-base">
                  {formatDateTime(client.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos Relacionados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Agendamentos
            </CardTitle>
            <CardDescription>
              Histórico de agendamentos deste cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
              </div>
            ) : !schedules || schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Nenhum agendamento encontrado</p>
                <p className="text-sm mt-1">Este cliente ainda não possui agendamentos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/agendamentos/${schedule.id}`}
                    className="block border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
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
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Criado em {formatDateTime(schedule.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Conversa com Amanda */}
        <ChatViewer clientPhone={client.wppPhone} />
      </div>
    </MainLayout>
  );
}
