"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
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
      
      const filtered = results.filter(r => r.total > 0);
      const totalLeads = filtered.reduce((acc, curr) => acc + curr.total, 0);
      
      return filtered.map(item => ({
        ...item,
        percentage: totalLeads > 0 ? (item.total / totalLeads * 100).toFixed(1) : "0"
      }));
    },
  });

  const total = funnelData?.reduce((acc, curr) => acc + curr.total, 0) || 0;

  const getBarGradient = (index: number) => {
    const gradients = [
      'from-cyan-500 to-cyan-600',
      'from-indigo-500 to-indigo-600',
      'from-purple-500 to-purple-600',
      'from-blue-500 to-blue-600',
      'from-violet-500 to-violet-600',
    ];
    return gradients[index % gradients.length];
  };

  const getBarGlow = (index: number) => {
    const glows = [
      'shadow-cyan-500/50',
      'shadow-indigo-500/50',
      'shadow-purple-500/50',
      'shadow-blue-500/50',
      'shadow-violet-500/50',
    ];
    return glows[index % glows.length];
  };

  return (
    <Card className="relative overflow-hidden border border-border/50 hover:border-border transition-all duration-300 bg-card/50 backdrop-blur-sm">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl opacity-30" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent backdrop-blur-sm">
                <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold">Funil de Leads</h3>
            </div>
            <p className="text-sm text-muted-foreground/70">
              Distribuição por estágio
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{total}</p>
            <p className="text-xs text-muted-foreground/70">Total</p>
          </div>
        </div>

        {/* Funnel Bars */}
        {!funnelData || funnelData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-sm text-muted-foreground space-y-2">
            <Filter className="h-8 w-8 opacity-50" />
            <p>Sem leads ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                {/* Label and Value */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground/90">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/70 font-medium">
                      {item.percentage}%
                    </span>
                    <span className="font-bold min-w-[32px] text-right">
                      {item.total}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarGradient(index)} rounded-full transition-all duration-700 ease-out shadow-sm ${getBarGlow(index)}`}
                    style={{ 
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
