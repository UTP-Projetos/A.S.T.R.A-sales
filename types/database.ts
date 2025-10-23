export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      Client: {
        Row: {
          id: number;
          created_at: string;
          wppPhone: string; // SEMPRE com sufixo @s.whatsapp.net
          name: string | null;
          email: string | null;
          cpf: string | null;
          dateOfBirth: string | null;
          adress: string | null;
          CompanyId: number | null;
          activeBot: boolean | null;
          conversationId: string | null;
          crmLeadStatus: string | null; // "Novo Contato" | "Contato em Andamento" | "Orçamento Enviado" | "Reserva/Agendamento Confirmado" | "Visita/Atividade Realizada" | "Contato Perdido"
          updateClientRegister: string | null;
          tokenInstance: string | null;
          status: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          wppPhone: string;
          name?: string | null;
          email?: string | null;
          cpf?: string | null;
          dateOfBirth?: string | null;
          adress?: string | null;
          CompanyId?: number | null;
          activeBot?: boolean | null;
          conversationId?: string | null;
          crmLeadStatus?: string | null;
          updateClientRegister?: string | null;
          tokenInstance?: string | null;
          status?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          wppPhone?: string;
          name?: string | null;
          email?: string | null;
          cpf?: string | null;
          dateOfBirth?: string | null;
          adress?: string | null;
          CompanyId?: number | null;
          activeBot?: boolean | null;
          conversationId?: string | null;
          crmLeadStatus?: string | null;
          updateClientRegister?: string | null;
          tokenInstance?: string | null;
          status?: string | null;
        };
      };
      Company: {
        Row: {
          id: number;
          created_at: string;
          name: string | null;
          WppPhone: string | null; // SEMPRE com sufixo @s.whatsapp.net
          tokenInstance: string | null;
          status: string | null;
          email: string | null;
          instanceName: string | null;
          whatsappConnected: boolean | null;
          webhookConfigured: boolean | null;
          onboardingCompleted: boolean | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name?: string | null;
          WppPhone?: string | null;
          tokenInstance?: string | null;
          status?: string | null;
          email?: string | null;
          instanceName?: string | null;
          whatsappConnected?: boolean | null;
          webhookConfigured?: boolean | null;
          onboardingCompleted?: boolean | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string | null;
          WppPhone?: string | null;
          tokenInstance?: string | null;
          status?: string | null;
          email?: string | null;
          instanceName?: string | null;
          whatsappConnected?: boolean | null;
          webhookConfigured?: boolean | null;
          onboardingCompleted?: boolean | null;
        };
      };
      Schedules: {
        Row: {
          id: number;
          created_at: string;
          appointmentDate: string | null;
          appointmentNotes: Json | null; // JSON com detalhes específicos do tipo de agendamento
          appointmentType: string | null; // "Hospedagem" | "Ingresso" | "Atividade"
          schedulingStatus: string | null; // "Pendente" | "Confirmado" | "Cancelado" | "Realizado"
          confirmationLink: string | null;
          CompanyClientId: string | null; // CORRIGIDO: ID do Company (compatível com n8n)
          client: string | null; // wppPhone do cliente (com sufixo @s.whatsapp.net)
        };
        Insert: {
          id?: number;
          created_at?: string;
          appointmentDate?: string | null;
          appointmentNotes?: Json | null;
          appointmentType?: string | null;
          schedulingStatus?: string | null;
          confirmationLink?: string | null;
          CompanyClientId?: string | null;
          client?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          appointmentDate?: string | null;
          appointmentNotes?: Json | null;
          appointmentType?: string | null;
          schedulingStatus?: string | null;
          confirmationLink?: string | null;
          CompanyClientId?: string | null;
          client?: string | null;
        };
      };
      // Tabela de histórico de chat (n8n)
      // IMPORTANTE: Nome da tabela é tudo minúsculo no banco!
      n8nchathistories: {
        Row: {
          id: number;
          session_id: string; // wppPhone do cliente (ex: 11554899924955@s.whatsapp.net)
          message: string; // JSON stringificado com type, content, etc
        };
        Insert: {
          id?: number;
          session_id: string;
          message: string;
        };
        Update: {
          id?: number;
          session_id?: string;
          message?: string;
        };
      };
    };
  };
};

// Tipos auxiliares para facilitar o uso
export type Client = Database["public"]["Tables"]["Client"]["Row"];
export type Company = Database["public"]["Tables"]["Company"]["Row"];
export type Schedule = Database["public"]["Tables"]["Schedules"]["Row"];
export type ChatHistory = Database["public"]["Tables"]["n8nchathistories"]["Row"];

// Estrutura do JSON na coluna message
export interface ChatMessage {
  type: "human" | "ai" | "system";
  content: string;
  tool_calls?: any[];
  additional_kwargs?: any;
  response_metadata?: any;
  invalid_tool_calls?: any[];
}

// Mensagem parseada para exibição
export interface ParsedChatMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  rawMessage?: ChatMessage;
}

// Tipos de status do CRM (padrão n8n)
export type CrmLeadStatus = 
  | "Novo Contato"
  | "Contato em Andamento"
  | "Orçamento Enviado"
  | "Reserva/Agendamento Confirmado"
  | "Visita/Atividade Realizada"
  | "Contato Perdido";

// Constante com os valores de CrmLeadStatus (para iteração)
export const CRM_LEAD_STATUS = {
  NOVO_CONTATO: "Novo Contato",
  CONTATO_EM_ANDAMENTO: "Contato em Andamento",
  ORCAMENTO_ENVIADO: "Orçamento Enviado",
  RESERVA_CONFIRMADA: "Reserva/Agendamento Confirmado",
  VISITA_REALIZADA: "Visita/Atividade Realizada",
  CONTATO_PERDIDO: "Contato Perdido",
} as const;

export type SchedulingStatus = 
  | "Pendente"
  | "Confirmado"
  | "Cancelado"
  | "Realizado";

export type AppointmentType = 
  | "Hospedagem"
  | "Ingresso"
  | "Atividade";

// Tipos de appointmentNotes conforme n8n
export interface HospedagemNotes {
  tipo_acomodacao: string;
  data_checkin: string;
  data_checkout: string;
  num_adultos: number;
  num_criancas: number;
  valor_total: number;
}

export interface IngressoNotes {
  tipo_ingresso: string;
  data_visita: string;
  num_pessoas: number;
  valor_total: number;
}

export interface AtividadeNotes {
  nome_atividade: string;
  data_atividade: string;
  horario_atividade: string;
  num_participantes: number;
}

export type AppointmentNotes = HospedagemNotes | IngressoNotes | AtividadeNotes;
