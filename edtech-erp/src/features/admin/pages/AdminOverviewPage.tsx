import {
  Building2,
  CalendarClock,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardTitle, StatCard } from '@/components/ui/Card';
import { useAdminBillingStats } from '../services/admin.service';
import { AdminEmpty, AdminLoading } from '../components/admin-ui';
import { formatCurrency } from '../services/admin.service';

export default function AdminOverviewPage() {
  const { data, isLoading } = useAdminBillingStats();

  if (isLoading) return <AdminLoading />;

  const stats = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Overview"
        description="Platform-wide subscription and revenue health"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Schools"
          value={stats?.totalTenants ?? 0}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          label="Monthly Recurring Revenue"
          value={formatCurrency(stats?.mrr ?? 0)}
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <StatCard
          label="Expiring in 30 days"
          value={stats?.expiringSoon ?? 0}
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="mt-0 p-5">
            <CardTitle className="mb-1">Revenue collected</CardTitle>
            <p className="mb-4 text-sm text-muted-foreground">Total payments received via offline invoices</p>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{formatCurrency(stats?.revenue ?? 0)}</p>
                <p className="text-xs text-muted-foreground">All-time collected revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="mt-0 p-5">
            <CardTitle className="mb-1">Subscribers by plan</CardTitle>
            <p className="mb-4 text-sm text-muted-foreground">Current distribution across plans</p>
            {!stats?.planBreakdown || stats.planBreakdown.length === 0 ? (
              <AdminEmpty title="No subscriptions yet" />
            ) : (
              <div className="space-y-3">
                {stats.planBreakdown.map((p) => (
                  <div key={p.planId} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {p.name}
                    </span>
                    <span className="font-semibold">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
