"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseChatMessage, filterInternalMessages, normalizePhone } from "@/lib/utils";
import type { ParsedChatMessage } from "@/types/database";
import { useEffect, useRef } from "react";

interface ChatViewerProps {
  clientPhone: string; // wppPhone do cliente
}

export function ChatViewer({ clientPhone }: ChatViewerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Normalizar telefone para busca
  const normalizedPhone = normalizePhone(clientPhone);
  
  // 🔍 DEBUG: Mostrar o que está sendo buscado
  console.log("🔍 [ChatViewer] Telefone original:", clientPhone);
  console.log("🔍 [ChatViewer] Telefone normalizado:", normalizedPhone);
  
  // Polling a cada 3 segundos para tempo real
  const { data: rawMessages, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["chat-messages", normalizedPhone],
    queryFn: async () => {
      console.log("📡 [ChatViewer] Buscando mensagens para:", normalizedPhone);
      
      const { data, error } = await supabase
        .from("n8nchathistories")
        .select("*")
        .eq("session_id", normalizedPhone)
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ [ChatViewer] Erro na query:", error);
        throw error;
      }
      
      console.log("✅ [ChatViewer] Mensagens encontradas:", data?.length || 0);
      console.log("📦 [ChatViewer] Dados brutos:", data);
      
      return data || [];
    },
    refetchInterval: 3000, // Atualiza a cada 3s
  });

  // 🔍 DEBUG: Buscar todos os session_ids existentes (apenas para debug)
  const { data: allSessions } = useQuery({
    queryKey: ["all-sessions-debug"],
    queryFn: async () => {
      const { data } = await supabase
        .from("n8nchathistories")
        .select("session_id")
        .limit(100);
      
      const uniqueSessions = [...new Set(data?.map(d => d.session_id) || [])];
      console.log("🗂️ [ChatViewer] Session IDs existentes no banco:", uniqueSessions);
      return uniqueSessions;
    },
    refetchInterval: false, // Só busca uma vez
  });

  // Parse e filtra mensagens
  const messages: ParsedChatMessage[] = rawMessages
    ? filterInternalMessages(
        rawMessages
          .map(msg => parseChatMessage(msg.message, msg.id))
          .filter((msg): msg is ParsedChatMessage => msg !== null)
      )
    : [];
  
  // 🔍 DEBUG: Mostrar mensagens parseadas
  console.log("📝 [ChatViewer] Mensagens após parse e filtro:", messages.length);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Calcular tempo desde última atualização
  const timeSinceUpdate = dataUpdatedAt
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Histórico de Conversa com A.S.T.R.A
            {messages.length > 0 && (
              <Badge variant="secondary">{messages.length} mensagens</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Atualizado há {timeSinceUpdate}s
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-medium">
              Nenhuma conversa ainda
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              As mensagens entre o cliente e A.S.T.R.A aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 p-4 rounded-lg transition-all ${
                  msg.role === "assistant"
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-gray-50 border-l-4 border-gray-300"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "assistant" ? (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-400">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {msg.role === "assistant" ? "A.S.T.R.A" : "Cliente"}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
