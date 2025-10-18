"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Wifi,
  WifiOff,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AmandaStatus {
  configured: boolean;
  connected: boolean;
  instanceName?: string;
  tokenInstance?: string;
  whatsappPhone?: string;
}

export function AmandaStatus() {
  const router = useRouter();
  
  const { data: amandaData, isLoading, isError, error } = useQuery({
    queryKey: ["amanda-status"],
    queryFn: async () => {
      const response = await fetch("/api/evolution/check-amanda");
      if (!response.ok) {
        throw new Error("Erro ao verificar Amanda");
      }
      return response.json();
    },
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Status da Amanda
          </CardTitle>
          <CardDescription>
            Verificando configuração da sua agente de IA...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !amandaData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Status da Amanda
          </CardTitle>
          <CardDescription>
            Erro ao verificar configuração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            <span>Erro ao verificar Amanda</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const amanda: AmandaStatus = amandaData.amanda;

  const getStatusIcon = () => {
    if (!amanda.configured) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    if (amanda.connected) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (!amanda.configured) {
      return "Não configurada";
    }
    if (amanda.connected) {
      return "Conectada";
    }
    return "Desconectada";
  };

  const getStatusVariant = () => {
    if (!amanda.configured) {
      return "secondary";
    }
    if (amanda.connected) {
      return "default";
    }
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Status da Amanda
        </CardTitle>
        <CardDescription>
          Sua agente de IA para atendimento automatizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Detalhes da Configuração */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Configurada:</span>
            <div className="flex items-center gap-1">
              {amanda.configured ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>{amanda.configured ? "Sim" : "Não"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">WhatsApp:</span>
            <div className="flex items-center gap-1">
              {amanda.connected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span>{amanda.connected ? "Conectado" : "Desconectado"}</span>
            </div>
          </div>


          {amanda.instanceName && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Instância:</span>
              <span className="font-mono text-xs">{amanda.instanceName}</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="pt-2">
          {!amanda.configured ? (
            <Button 
              onClick={() => router.push("/onboarding")}
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar Amanda
            </Button>
          ) : !amanda.connected ? (
            <Button 
              onClick={() => router.push("/onboarding")}
              variant="outline"
              className="w-full"
            >
              <Wifi className="mr-2 h-4 w-4" />
              Conectar WhatsApp
            </Button>
          ) : (
            <div className="text-center text-green-600 text-sm">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              Amanda funcionando perfeitamente!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
