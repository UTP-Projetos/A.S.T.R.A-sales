import { MainLayout } from "@/components/main-layout";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentClients } from "@/components/dashboard/recent-clients";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LeadFunnelChart } from "@/components/dashboard/lead-funnel-chart";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas métricas de vendas
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <LeadFunnelChart />
        </div>

        {/* Recent Activity */}
        <RecentClients />
      </div>
    </MainLayout>
  );
}
