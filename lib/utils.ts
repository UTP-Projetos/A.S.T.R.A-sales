import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    "Novo Contato": "bg-blue-100 text-blue-800 border-blue-300",
    "Contato em Andamento": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Orçamento Enviado": "bg-purple-100 text-purple-800 border-purple-300",
    "Reserva/Agendamento Confirmado": "bg-green-100 text-green-800 border-green-300",
    "Visita/Atividade Realizada": "bg-gray-100 text-gray-800 border-gray-300",
    "Contato Perdido": "bg-red-100 text-red-800 border-red-300",
    
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Confirmado": "bg-green-100 text-green-800 border-green-300",
    "Cancelado": "bg-red-100 text-red-800 border-red-300",
    "Realizado": "bg-blue-100 text-blue-800 border-blue-300",
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

export function getAppointmentTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    "Hospedagem": "bg-blue-100 text-blue-800",
    "Ingresso": "bg-green-100 text-green-800",
    "Atividade": "bg-purple-100 text-purple-800",
  };
  
  return typeColors[type] || "bg-gray-100 text-gray-800";
}
