import { CreditCard, Clock, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils';
import { useGetParentFees } from '@/features/fees/services/fees.service';

export default function ParentFeesPage() {
  const navigate = useNavigate();
  const feesQuery = useGetParentFees();
  const data = feesQuery.data;

  if (feesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Children's Fees" description="View and pay fees for your children" />
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data || data.children.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Children's Fees" description="View and pay fees for your children" />
        <Card className="p-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No children found linked to your account.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Children's Fees" description="View and pay fees for your children" />

      {/* Total Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pending</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(data.totalPending)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Overdue</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(data.totalOverdue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Children Cards */}
      <div className="space-y-4">
        {data.children.map((child) => (
          <Card
            key={child.student.id}
            className="p-5 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/parent-portal/fees/${child.student.id}`)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                  {child.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{child.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {child.student.rollNo} · {child.student.className}
                    {child.student.section ? `-${child.student.section}` : ''}
                    {child.student.academicYearName && ` · ${child.student.academicYearName}`}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(child.summary.totalPaid)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatCurrency(child.summary.totalPending)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(child.summary.totalOverdue)}</p>
              </div>
            </div>

            {child.pendingFees.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {child.pendingFees.length} pending fee{child.pendingFees.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1">
                  {child.pendingFees.slice(0, 3).map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{fee.feeName ?? fee.feeType.toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{formatCurrency(fee.amount)}</span>
                        <StatusBadge status={fee.status as 'pending' | 'overdue'} />
                      </div>
                    </div>
                  ))}
                  {child.pendingFees.length > 3 && (
                    <p className="text-xs text-primary">+{child.pendingFees.length - 3} more...</p>
                  )}
                </div>
              </div>
            )}

            {child.recentPayments.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent Payments</p>
                {child.recentPayments.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-muted-foreground">
                        {p.feeType?.toUpperCase()} · {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    <span className="font-mono text-green-600">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
