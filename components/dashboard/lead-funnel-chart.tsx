"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CRM_LEAD_STATUS } from "@/types/database";

export function LeadFunnelChart() {
  const { data: funnelData } = useQuery({
    queryKey: ["lead-funnel"],
    queryFn: async () => {
      const statuses = Object.values(CRM_LEAD_STATUS);
      const results = await Promise.all(
        statuses.map(async (status) => {
          const { count } = await supabase
            .from("Client")
            .select("*", { count: "exact", head: true })
            .eq("crmLeadStatus", status);
          
          return {
            name: status.replace("Reserva/Agendamento Confirmado", "Confirmado")
              .replace("Visita/Atividade Realizada", "Realizado")
              .replace("Contato em Andamento", "Em Andamento"),
            total: count || 0,
          };
        })
      );
      
      return results.filter(r => r.total > 0);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Leads</CardTitle>
        <CardDescription>
          Distribuição de clientes por estágio do funil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="total" 
              fill="hsl(221.2 83.2% 53.3%)" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
