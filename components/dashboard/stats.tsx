"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, DollarSign } from "lucide-react";
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
        if (value >= 1000) {
          return `R$ ${(value / 1000).toFixed(1)}K`;
        }
        return `R$ ${value.toFixed(0)}`;
      };

      return {
        totalClients: totalClients || 0,
        newClients: newClients || 0,
        totalSchedules: totalSchedules || 0,
        pendingSchedules: pendingSchedules || 0,
        conversionRate: `${conversionRate}%`,
        conversionDiff: `${conversionDiffValue >= 0 ? '+' : ''}${conversionDiff}% vs. mês anterior`,
        totalRevenue: formatCurrency(totalRevenue),
        revenueThisMonth: formatCurrency(revenueThisMonth),
      };
    },
  });

  const statsCards = [
    {
      title: "Total de Clientes",
      value: stats?.totalClients || 0,
      description: `+${stats?.newClients || 0} este mês`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Agendamentos",
      value: stats?.totalSchedules || 0,
      description: `${stats?.pendingSchedules || 0} pendentes`,
      icon: Calendar,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Taxa de Conversão",
      value: stats?.conversionRate || "0.0%",
      description: stats?.conversionDiff || "Sem dados do mês anterior",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Receita Total",
      value: stats?.totalRevenue || "R$ 0",
      description: `${stats?.revenueThisMonth || "R$ 0"} este mês`,
      icon: DollarSign,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
