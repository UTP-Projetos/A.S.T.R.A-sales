"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Schedule } from "@/types/database";

export function SalesChart() {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales-chart"],
    queryFn: async () => {
      // Busca agendamentos dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from("Schedules")
        .select("created_at, appointmentNotes")
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Agrupa por mês
      const monthlyData: Record<string, number> = {};
      const schedules = data as Schedule[];

      schedules.forEach((schedule) => {
        const date = new Date(schedule.created_at);
        const monthKey = date.toLocaleDateString("pt-BR", { 
          month: "short", 
          year: "numeric" 
        });

        // Extrai valor_total do appointmentNotes se existir
        let value = 0;
        if (schedule.appointmentNotes && typeof schedule.appointmentNotes === 'object') {
          const notes = schedule.appointmentNotes as any;
          value = notes.valor_total || 0;
        }

        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + value;
      });

      // Converte para array ordenado
      const result = Object.entries(monthlyData)
        .map(([name, vendas]) => ({
          name: name.replace(/\./g, '').replace(' de ', '/'),
          vendas: Math.round(vendas)
        }))
        .slice(-6); // Últimos 6 meses

      return result;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Mensais</CardTitle>
        <CardDescription>
          Evolução das vendas nos últimos 6 meses (valores reais)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Carregando dados...
          </div>
        ) : !salesData || salesData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado de vendas disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => 
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                }
              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="hsl(221.2 83.2% 53.3%)" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
