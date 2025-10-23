import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AppointmentNotes, HospedagemNotes, IngressoNotes, AtividadeNotes, ChatMessage, ParsedChatMessage } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normaliza telefone para o padrão do n8n/Evolution
 * SEMPRE adiciona sufixo @s.whatsapp.net
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove espaços, parênteses, hífens
  let normalized = phone.replace(/[\s\(\)\-]/g, "");
  
  // Se já tem sufixo, retorna
  if (normalized.endsWith("@s.whatsapp.net")) {
    return normalized;
  }
  
  // Adiciona sufixo
  return `${normalized}@s.whatsapp.net`;
}

/**
 * Remove sufixo @s.whatsapp.net para exibição
 */
export function denormalizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace("@s.whatsapp.net", "");
}

/**
 * Parse seguro de appointmentNotes do n8n
 * Remove markdown code blocks se existirem
 */
export function parseAppointmentNotes(notes: any): AppointmentNotes | null {
  if (!notes) return null;
  
  try {
    // Se já é objeto, retorna
    if (typeof notes === "object" && !Array.isArray(notes)) {
      return notes as AppointmentNotes;
    }
    
    // Se é string, fazer parse
    if (typeof notes === "string") {
      // Remover markdown code blocks
      let cleaned = notes.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```\n?/g, "");
      }
      
      return JSON.parse(cleaned) as AppointmentNotes;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao fazer parse de appointmentNotes:", error);
    return null;
  }
}

/**
 * Formata appointmentNotes para exibição legível
 */
export function formatAppointmentNotes(notes: AppointmentNotes | null, type?: string): string {
  if (!notes) return "Sem detalhes";
  
  try {
    if (type === "Hospedagem" && "tipo_acomodacao" in notes) {
      const h = notes as HospedagemNotes;
      return `${h.tipo_acomodacao} - Check-in: ${formatDate(h.data_checkin)}, Check-out: ${formatDate(h.data_checkout)} - ${h.num_adultos} adulto(s), ${h.num_criancas} criança(s) - R$ ${h.valor_total.toFixed(2)}`;
    }
    
    if (type === "Ingresso" && "tipo_ingresso" in notes) {
      const i = notes as IngressoNotes;
      return `${i.tipo_ingresso} - ${formatDate(i.data_visita)} - ${i.num_pessoas} pessoa(s) - R$ ${i.valor_total.toFixed(2)}`;
    }
    
    if (type === "Atividade" && "nome_atividade" in notes) {
      const a = notes as AtividadeNotes;
      return `${a.nome_atividade} - ${formatDate(a.data_atividade)} às ${a.horario_atividade} - ${a.num_participantes} participante(s)`;
    }
    
    // Fallback para JSON
    return JSON.stringify(notes, null, 2);
  } catch (error) {
    return "Erro ao formatar detalhes";
  }
}

export function formatPhone(phone: string): string {
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, "");
  
  // Formata como +55 (48) 99999-9999
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  
  return phone;
}

export function formatCPF(cpf: string): string {
  // Remove tudo que não é número
  const cleaned = cpf.replace(/\D/g, "");
  
  // Formata como 123.456.789-00
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return cpf;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    "Novo Contato": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    "Contato em Andamento": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    "Orçamento Enviado": "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    "Reserva/Agendamento Confirmado": "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    "Visita/Atividade Realizada": "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    "Contato Perdido": "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    
    "Pendente": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    "Confirmado": "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    "Cancelado": "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    "Realizado": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };
  
  return statusColors[status] || "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
}

export function getAppointmentTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    "Hospedagem": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    "Ingresso": "bg-green-500/10 text-green-700 dark:text-green-300",
    "Atividade": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  };
  
  return typeColors[type] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
}

/**
 * Parse mensagem do chat do n8n
 * Aceita tanto string JSON quanto objeto (JSONB do Supabase)
 */
export function parseChatMessage(messageJson: string | any, id: number): ParsedChatMessage | null {
  try {
    let parsed: ChatMessage;
    
    // Se já é um objeto, usa direto (JSONB do Supabase)
    if (typeof messageJson === 'object' && messageJson !== null) {
      parsed = messageJson as ChatMessage;
      console.log("📦 [parseChatMessage] Já é objeto:", parsed.type);
    } 
    // Se é string, faz parse
    else if (typeof messageJson === 'string') {
      parsed = JSON.parse(messageJson);
      console.log("📝 [parseChatMessage] String parseada:", parsed.type);
    } 
    // Tipo inválido
    else {
      console.error("❌ [parseChatMessage] Tipo inválido:", typeof messageJson, messageJson);
      return null;
    }
    
    return {
      id,
      role: parsed.type === "human" ? "user" : 
            parsed.type === "ai" ? "assistant" : "system",
      content: parsed.content,
      rawMessage: parsed
    };
  } catch (error) {
    console.error("❌ [parseChatMessage] Erro ao fazer parse:", error);
    return null;
  }
}

/**
 * Filtra mensagens internas do n8n (não relevantes para exibição)
 * Remove mensagens do tipo "O cliente de telefone..."
 */
export function filterInternalMessages(messages: ParsedChatMessage[]): ParsedChatMessage[] {
  return messages.filter(msg => {
    // Remover mensagens internas do AI_CRM
    if (msg.role === "user" && msg.content.includes("O cliente de telefone")) {
      return false;
    }
    if (msg.role === "assistant" && msg.content.includes("atualizado com sucesso na tabela")) {
      return false;
    }
    // Remover mensagens internas do AI_Scheduling
    if (msg.role === "user" && msg.content.includes("quer saber a disponibilidade")) {
      return false;
    }
    if (msg.role === "user" && msg.content.includes("quer saber o preço")) {
      return false;
    }
    
    return true;
  });
}
