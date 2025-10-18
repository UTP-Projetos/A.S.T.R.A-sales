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
          wppPhone: string;
          name: string | null;
          email: string | null;
          cpf: string | null;
          dateOfBirth: string | null;
          adress: string | null;
          CompanyId: number | null;
          activeBot: boolean | null; // CORRIGIDO: string -> boolean
          conversationId: string | null;
          crmLeadStatus: string | null;
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
          activeBot?: boolean | null; // CORRIGIDO: string -> boolean
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
          activeBot?: boolean | null; // CORRIGIDO: string -> boolean
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
          WppPhone: string | null;
          tokenInstance: string | null;
          status: string | null;
          email: string | null;
          // REMOVIDO: password - usar apenas Supabase Auth
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
          // REMOVIDO: password - usar apenas Supabase Auth
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
          // REMOVIDO: password - usar apenas Supabase Auth
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
          appointmentNotes: Json | null;
          appointmentType: string | null;
          schedulingStatus: string | null;
          confirmationLink: string | null;
          CompanyClientId: number | null;
          client: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          appointmentDate?: string | null;
          appointmentNotes?: Json | null;
          appointmentType?: string | null;
          schedulingStatus?: string | null;
          confirmationLink?: string | null;
          CompanyClientId?: number | null;
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
          CompanyClientId?: number | null;
          client?: string | null;
        };
      };
    };
  };
};

// Tipos auxiliares para facilitar o uso
export type Client = Database["public"]["Tables"]["Client"]["Row"];
export type Company = Database["public"]["Tables"]["Company"]["Row"];
export type Schedule = Database["public"]["Tables"]["Schedules"]["Row"];

// Enums para status
export const CRM_LEAD_STATUS = {
  NOVO_CONTATO: "Novo Contato",
  CONTATO_EM_ANDAMENTO: "Contato em Andamento",
  ORCAMENTO_ENVIADO: "Orçamento Enviado",
  RESERVA_CONFIRMADA: "Reserva/Agendamento Confirmado",
  VISITA_REALIZADA: "Visita/Atividade Realizada",
  CONTATO_PERDIDO: "Contato Perdido",
} as const;

export const SCHEDULING_STATUS = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  REALIZADO: "Realizado",
} as const;

export const APPOINTMENT_TYPE = {
  HOSPEDAGEM: "Hospedagem",
  INGRESSO: "Ingresso",
  ATIVIDADE: "Atividade",
} as const;
