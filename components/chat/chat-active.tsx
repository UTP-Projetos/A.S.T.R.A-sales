"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Loader2, MessageSquare, RefreshCw, Send, Sparkles } from "lucide-react";
import { parseChatMessage, filterInternalMessages, normalizePhone } from "@/lib/utils";
import type { ParsedChatMessage } from "@/types/database";
import { toast } from "sonner";

interface ChatActiveProps {
  clientPhone: string; // wppPhone do cliente
}

// Emoji para reativar IA conforme especificado
const REACTIVATE_AI_EMOJI = "😉";

export function ChatActive({ clientPhone }: ChatActiveProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Normalizar telefone para busca
  const normalizedPhone = normalizePhone(clientPhone);

  // Polling a cada 3 segundos para tempo real
  const { data: rawMessages, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["chat-messages", normalizedPhone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("n8nchathistories")
        .select("*")
        .eq("session_id", normalizedPhone)
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ [ChatActive] Erro na query:", error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 3000, // Atualiza a cada 3s
  });

  // Parse e filtra mensagens
  const messages: ParsedChatMessage[] = rawMessages
    ? filterInternalMessages(
        (rawMessages as any)
          .map((msg: any) => parseChatMessage(msg.message, msg.id))
          .filter((msg: any): msg is ParsedChatMessage => msg !== null)
      )
    : [];

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          message: messageText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errorData.error || "Erro ao enviar mensagem");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Limpar input apenas se não for o emoji de reativação
      if (variables !== REACTIVATE_AI_EMOJI) {
        setMessage("");
      }
      
      // Invalidar query para atualizar histórico
      queryClient.invalidateQueries({ queryKey: ["chat-messages", normalizedPhone] });
      
      // Refetch imediato para atualizar histórico
      setTimeout(() => {
        refetch();
      }, 1000);

      // Toast diferente para reativação
      if (variables === REACTIVATE_AI_EMOJI) {
        toast.success("IA reativada!", {
          description: "A.S.T.R.A voltou a atender automaticamente.",
          duration: 4000,
        });
      } else {
        toast.success("Mensagem enviada!", {
          description: "A IA foi pausada automaticamente.",
          duration: 3000,
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar mensagem", {
        description: error.message,
        duration: 5000,
      });
    },
  });

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      console.log("📤 [ChatActive] Enviando mensagem:", message.trim());
      await sendMessageMutation.mutateAsync(message.trim());
    } catch (error) {
      console.error("❌ [ChatActive] Erro ao enviar mensagem:", error);
      // Toast já é mostrado no onError da mutation
    } finally {
      setIsSending(false);
      // Focar no input após enviar
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Função para reativar IA (envia emoji)
  const handleReactivateAI = async () => {
    if (isSending) return;

    setIsSending(true);
    try {
      console.log("🔄 [ChatActive] Reativando IA com emoji:", REACTIVATE_AI_EMOJI);
      console.log("🔄 [ChatActive] Emoji char code:", REACTIVATE_AI_EMOJI.charCodeAt(0));
      await sendMessageMutation.mutateAsync(REACTIVATE_AI_EMOJI);
    } catch (error) {
      console.error("❌ [ChatActive] Erro ao reativar IA:", error);
      toast.error("Erro ao reativar IA", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSending(false);
      // Focar no input após enviar
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Enviar com Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Calcular tempo desde última atualização
  const timeSinceUpdate = dataUpdatedAt
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : 0;

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-muted-foreground">Carregando histórico...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden flex flex-col h-[700px] border border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl opacity-30" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="pb-4 px-6 pt-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent backdrop-blur-sm">
                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold">Chat Ativo com Cliente</h3>
                {messages.length > 0 && (
                  <p className="text-xs text-muted-foreground/70">{messages.length} mensagens</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {timeSinceUpdate}s atrás
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400 opacity-50" />
                </div>
                <p className="font-medium text-muted-foreground">
                  Nenhuma conversa ainda
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  As mensagens entre o cliente e A.S.T.R.A aparecerão aqui
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 p-4 rounded-xl transition-all backdrop-blur-sm ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                      : msg.role === "user"
                      ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                      : "bg-muted/50 border border-border/30"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === "assistant" ? (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        {msg.role === "assistant" ? "A.S.T.R.A" : "Cliente"}
                      </span>
                      {/* Mostrar badge "Atendente" se for mensagem enviada pelo atendente via CRM */}
                      {msg.role === "assistant" && (msg.rawMessage?.type === "ai" || !msg.rawMessage?.tool_calls) && (
                        <Badge className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300">
                          Atendente Humano
                        </Badge>
                      )}
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
        </div>

        {/* Área de input */}
        <div className="border-t border-border/50 p-4 space-y-3 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
          {/* Botão de reativar IA */}
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivateAI}
              disabled={isSending}
              className="text-xs border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-200"
            >
              <Sparkles className="h-3 w-3 mr-1.5 text-purple-600 dark:text-purple-400" />
              Reativar IA {REACTIVATE_AI_EMOJI}
            </Button>
          </div>

          {/* Input de mensagem */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Digite sua mensagem... (Enter para enviar)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1 border-border/50 bg-card/50 backdrop-blur-sm focus:border-indigo-500/50 focus:ring-indigo-500/20"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Aviso sobre IA */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <div className="w-1 h-1 rounded-full bg-indigo-500" />
            <p>Ao enviar uma mensagem, a IA será pausada automaticamente. Use o botão acima para reativá-la.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

