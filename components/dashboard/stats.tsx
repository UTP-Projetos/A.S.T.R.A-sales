"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import type { Schedule } from "@/types/database";

export function DashboardStats() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Total de clientes
      const { count: totalClients } = await supabase
        .from("Client")
        .select("*", { count: "exact", head: true });

      // Clientes novos este mês
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();

      const { count: newClients } = await supabase
        .from("Client")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth);

      // Total de agendamentos
      const { count: totalSchedules } = await supabase
        .from("Schedules")
        .select("*", { count: "exact", head: true });

      // Agendamentos pendentes
      const { count: pendingSchedules } = await supabase
        .from("Schedules")
        .select("*", { count: "exact", head: true })
        .eq("schedulingStatus", "Pendente");

      // Cálculo da taxa de conversão real
      const { count: convertedClients } = await supabase
        .from("Client")
        .select("*", { count: "exact", head: true })
        .in("crmLeadStatus", [
          "Reserva/Agendamento Confirmado",
          "Visita/Atividade Realizada"
        ]);

      const conversionRate = totalClients && totalClients > 0
        ? ((convertedClients || 0) / totalClients * 100).toFixed(1)
        : "0.0";

      // Taxa de conversão do mês anterior para comparação
      const firstDayOfLastMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        1
      ).toISOString();

      const { count: totalClientsLastMonth } = await supabase
        .from("Client")
        .select("*", { count: "exact", head: true })
        .lt("created_at", firstDayOfMonth);

      const { count: convertedLastMonth } = await supabase
        .from("Client")
        .select("*", { count: "exact", head: true })
        .lt("created_at", firstDayOfMonth)
        .in("crmLeadStatus", [
          "Reserva/Agendamento Confirmado",
          "Visita/Atividade Realizada"
        ]);

      const lastMonthRate = totalClientsLastMonth && totalClientsLastMonth > 0
        ? (convertedLastMonth || 0) / totalClientsLastMonth * 100
        : 0;

      const conversionDiffValue = parseFloat(conversionRate) - lastMonthRate;
      const conversionDiff = conversionDiffValue.toFixed(1);

      // Cálculo da receita estimada real
      const { data: schedulesData } = await supabase
        .from("Schedules")
        .select("appointmentNotes")
        .in("schedulingStatus", ["Confirmado", "Realizado"]);

      let totalRevenue = 0;
      let revenueThisMonth = 0;

      (schedulesData as Schedule[] || []).forEach((schedule) => {
        if (schedule.appointmentNotes && typeof schedule.appointmentNotes === 'object') {
          try {
            const notes = schedule.appointmentNotes as any;
            const value = parseFloat(notes.valor_total) || 0;
            if (!isNaN(value)) {
              totalRevenue += value;
            }
          } catch (error) {
            console.warn("Erro ao processar appointmentNotes:", error);
          }
        }
      });

      // Receita deste mês
      const { data: monthSchedules } = await supabase
        .from("Schedules")
        .select("appointmentNotes")
        .gte("created_at", firstDayOfMonth)
        .in("schedulingStatus", ["Confirmado", "Realizado"]);

      (monthSchedules as Schedule[] || []).forEach((schedule) => {
        if (schedule.appointmentNotes && typeof schedule.appointmentNotes === 'object') {
          try {
            const notes = schedule.appointmentNotes as any;
            const value = parseFloat(notes.valor_total) || 0;
            if (!isNaN(value)) {
              revenueThisMonth += value;
            }
          } catch (error) {
            console.warn("Erro ao processar appointmentNotes:", error);
          }
        }
      });

      const formatCurrency = (value: number) => {
        if (value >= 1000000) {
          return `R$ ${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
          return `R$ ${(value / 1000).toFixed(1)}K`;
        }
        return `R$ ${value.toFixed(0)}`;
      };

      // Calcular percentuais de mudança
      const clientsGrowth = totalClientsLastMonth 
        ? ((newClients || 0) / (totalClientsLastMonth || 1) * 100).toFixed(1)
        : "0.0";

      return {
        totalClients: totalClients || 0,
        newClients: newClients || 0,
        clientsGrowth: parseFloat(clientsGrowth),
        totalSchedules: totalSchedules || 0,
        pendingSchedules: pendingSchedules || 0,
        conversionRate: parseFloat(conversionRate),
        conversionDiff: conversionDiffValue,
        totalRevenue: totalRevenue,
        revenueThisMonth: revenueThisMonth,
        revenueFormatted: formatCurrency(totalRevenue),
      };
    },
  });

  const statsCards = [
    {
      title: "Clientes",
      value: stats?.totalClients || 0,
      change: stats?.clientsGrowth || 0,
      changeLabel: "vs. mês anterior",
      icon: Users,
      gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      glowColor: "shadow-cyan-500/20",
    },
    {
      title: "Agendamentos",
      value: stats?.totalSchedules || 0,
      subtitle: `${stats?.pendingSchedules || 0} pendentes`,
      icon: Calendar,
      gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      glowColor: "shadow-indigo-500/20",
    },
    {
      title: "Taxa de Conversão",
      value: `${stats?.conversionRate || 0}%`,
      change: stats?.conversionDiff || 0,
      changeLabel: "vs. mês anterior",
      icon: TrendingUp,
      gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
      iconColor: "text-purple-600 dark:text-purple-400",
      glowColor: "shadow-purple-500/20",
    },
    {
      title: "Receita",
      value: stats?.revenueFormatted || "R$ 0",
      subtitle: "Total acumulada",
      icon: DollarSign,
      gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
      iconColor: "text-blue-600 dark:text-blue-400",
      glowColor: "shadow-blue-500/20",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
        <Card 
          key={stat.title} 
          className={`relative overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg ${stat.glowColor} bg-card/50 backdrop-blur-sm`}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
          
          {/* Glow Effect */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${stat.gradient} rounded-full blur-3xl opacity-30`} />
          
          {/* Content */}
          <div className="relative p-6 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground/80">
                {stat.title}
              </p>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient.replace('/20', '/30').replace('/10', '/20')} backdrop-blur-sm`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {stat.value}
              </p>
              
              {/* Subtitle or Change */}
              {stat.subtitle ? (
                <p className="text-xs text-muted-foreground/70">
                  {stat.subtitle}
                </p>
              ) : stat.change !== undefined ? (
                <div className="flex items-center gap-1 text-xs">
                  {stat.change >= 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {Math.abs(stat.change).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        {Math.abs(stat.change).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground/70 ml-1">
                    {stat.changeLabel}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
