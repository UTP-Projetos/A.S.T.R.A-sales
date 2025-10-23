import { MainLayout } from "@/components/main-layout";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentClients } from "@/components/dashboard/recent-clients";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LeadFunnelChart } from "@/components/dashboard/lead-funnel-chart";
import { AmandaStatus } from "@/components/dashboard/amanda-status";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do A.S.T.R.A CRM
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 md:grid-cols-2">
          <SalesChart />
          <LeadFunnelChart />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AmandaStatus />
          <RecentClients />
        </div>
      </div>
    </MainLayout>
  );
}
