"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
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
          name: name.charAt(0).toUpperCase() + name.slice(1, 3),
          vendas: Math.round(vendas)
        }))
        .slice(-6); // Últimos 6 meses

      return result;
    },
  });

  // Calcular totais e crescimento
  const total = salesData?.reduce((acc, curr) => acc + curr.vendas, 0) || 0;
  const lastMonth = salesData?.[salesData.length - 1]?.vendas || 0;
  const previousMonth = salesData?.[salesData.length - 2]?.vendas || 0;
  const growth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth * 100) : 0;

  return (
    <Card className="relative overflow-hidden border border-border/50 hover:border-border transition-all duration-300 bg-card/50 backdrop-blur-sm">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl opacity-30" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-semibold">Evolução de Vendas</h3>
            </div>
            <p className="text-sm text-muted-foreground/70">
              Últimos 6 meses
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              {total >= 1000 ? `R$ ${(total / 1000).toFixed(1)}K` : `R$ ${total}`}
            </p>
            {growth !== 0 && (
              <p className={`text-xs font-medium ${growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs. anterior
              </p>
            )}
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : !salesData || salesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-sm text-muted-foreground space-y-2">
            <TrendingUp className="h-8 w-8 opacity-50" />
            <p>Sem dados ainda</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorVendasCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(6 182 212)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgb(6 182 212)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, opacity: 0.7 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, opacity: 0.7 }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => 
                  [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 'Vendas']
                }
                cursor={{ stroke: 'rgb(6 182 212)', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="vendas" 
                stroke="rgb(6 182 212)" 
                strokeWidth={2.5}
                fill="url(#colorVendasCyan)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
