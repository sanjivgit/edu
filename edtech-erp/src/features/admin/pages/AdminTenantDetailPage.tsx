import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminCard, AdminEmpty, AdminTable, Td, UsageBar } from '../components/admin-ui';
import {
  daysUntil,
  formatCurrency,
  formatDate,
  formatLimit,
  useAdminInvoices,
  useAdminPlans,
  useAdminTenant,
  useChangePlan,
  useCreateSubscription,
  useRenewSubscription,
  useSubscriptionStatus,
} from '../services/admin.service';
import type { Subscription } from '../types';

export default function AdminTenantDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();

  const [planModal, setPlanModal] = useState(false);
  const [renewModal, setRenewModal] = useState(false);
  const [confirm, setConfirm] = useState<{ action: 'cancel' | 'suspend' | 'resume'; label: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [renewPeriod, setRenewPeriod] = useState('monthly');
  const [renewMonths, setRenewMonths] = useState('');

  const { data: tenant, isLoading } = useAdminTenant(id);
  const { data: plans } = useAdminPlans();
  const { data: invoices } = useAdminInvoices(tenant?.code);

  const refreshTenant = () => queryClient.invalidateQueries({ queryKey: ['billing', 'tenant', id] });

  const sub: Subscription | undefined = tenant?.subscription;
  const plan = sub?.plan;

  const createSub = useCreateSubscription();
  const changePlan = useChangePlan(sub?.id);
  const renew = useRenewSubscription(sub?.id);
  const status = useSubscriptionStatus(sub?.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-56 rounded-xl lg:col-span-2" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!tenant) return <AdminEmpty title="School not found" />;

  const usage = {
    students: tenant.studentCount ?? 0,
    teachers: tenant.teacherCount ?? 0,
    storageMb: 0,
  };
  const daysLeft = daysUntil(sub?.expiresAt ?? null);
  const active = sub?.status === 'active' || sub?.status === 'trial';

  const planOptions = (plans?.items ?? []).map((p) => ({
    label: `${p.name} — ${formatCurrency(p.priceMonthly)}/mo · ${formatCurrency(p.priceYearly)}/yr`,
    value: p.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={tenant.name}
        description={`${tenant.code} · created ${formatDate(tenant.createdAt)}`}
        actions={<StatusBadge status={sub?.status ?? 'inactive'} />}
      />

      <Link to="/billing/schools" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to schools
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminCard
          className="lg:col-span-2"
          title={
            sub
              ? `Subscription · ${plan?.name ?? '—'} (${sub.period})`
              : 'Subscription'
          }
          actions={
            sub ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setPlanModal(true)}>
                  Change plan
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRenewModal(true)}>
                  Renew
                </Button>
                {active ? (
                  <Button
                    variant={sub.status === 'active' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setConfirm({
                        action: sub.status === 'active' ? 'suspend' : 'cancel',
                        label: sub.status === 'active' ? 'suspend' : 'cancel',
                      })
                    }
                  >
                    {sub.status === 'active' ? 'Suspend' : 'Cancel'}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setConfirm({ action: 'resume', label: 'resume' })}>
                    Resume
                  </Button>
                )}
              </div>
            ) : (
              <Button size="sm" onClick={() => setPlanModal(true)}>
                Create subscription
              </Button>
            )
          }
        >
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</p>
              <p className="mt-1 font-semibold">
                {sub
                  ? `${formatCurrency(sub.pricePerPeriod, sub.currency)}/${sub.period === 'monthly' ? 'mo' : 'yr'}`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expires</p>
              <p className="mt-1 font-semibold">{sub ? formatDate(sub.expiresAt) : '—'}</p>
              {daysLeft != null && active && (
                <p className="text-xs text-muted-foreground">
                  {daysLeft <= 0 ? 'expired' : `${daysLeft} days left`}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Auto renew</p>
              <p className="mt-1 font-semibold">{sub?.autoRenew ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </AdminCard>

        <Card>
          <CardContent className="mt-0 p-5">
            <CardTitle className="mb-1">Usage</CardTitle>
            <p className="mb-4 text-sm text-muted-foreground">Against the {plan?.name ?? 'no'} plan limits</p>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{usage.students} / {formatLimit(plan?.studentLimit ?? null)}</span>
                </div>
                <UsageBar value={usage.students} max={plan?.studentLimit ?? 0} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Teachers</span>
                  <span className="font-medium">{usage.teachers} / {formatLimit(plan?.teacherLimit ?? null)}</span>
                </div>
                <UsageBar value={usage.teachers} max={plan?.teacherLimit ?? 0} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">{usage.storageMb} MB / {plan?.storageMb ?? 0} MB</span>
                </div>
                <UsageBar value={usage.storageMb} max={plan?.storageMb ?? 0} />
              </div>
              {plan?.features && Object.keys(plan.features).length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="mb-1 text-xs font-medium text-foreground">Plan features</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {Object.entries(plan.features).map(([k, v]) => (
                      <span key={k} className="capitalize">
                        <span className={v ? 'text-emerald-600' : 'text-muted-foreground/40'}>
                          {v ? '✓' : '✕'} {k}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminCard title="Invoices" subtitle="Subscription billing history">
        {!invoices || invoices.items.length === 0 ? (
          <AdminEmpty title="No invoices" hint="Issue an invoice for this school." />
        ) : (
          <AdminTable headers={['Invoice', 'Period', 'Amount', 'Status', 'Issued', 'Paid']}>
            {invoices.items.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                <Td className="font-medium">{inv.invoiceNo}</Td>
                <Td className="text-xs text-muted-foreground">
                  {formatDate(inv.periodStart)} → {formatDate(inv.periodEnd)}
                </Td>
                <Td className="font-medium">{formatCurrency(inv.amount, inv.currency)}</Td>
                <Td><StatusBadge status={inv.status} /></Td>
                <Td className="text-xs text-muted-foreground">{formatDate(inv.issuedAt)}</Td>
                <Td className="text-xs text-muted-foreground">{inv.paidAt ? formatDate(inv.paidAt) : '—'}</Td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>

      <Modal
        isOpen={planModal}
        onClose={() => setPlanModal(false)}
        title={sub ? 'Change plan' : 'Create subscription'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setPlanModal(false)}>
              Cancel
            </Button>
            <Button
              form="admin-plan-form"
              type="submit"
              isLoading={createSub.isPending || changePlan.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <form
          id="admin-plan-form"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = { planId: selectedPlan, period: (sub?.period ?? 'monthly') as 'monthly' | 'yearly' };
            const onOk = () => {
              setPlanModal(false);
              refreshTenant();
            };
            if (sub) {
              changePlan.mutate(payload, { onSuccess: onOk });
            } else {
              createSub.mutate({ tenantId: id, planId: selectedPlan, period: 'monthly' }, { onSuccess: onOk });
            }
          }}
          className="space-y-4"
        >
          <SelectInput
            label="Plan"
            placeholder="Select a plan..."
            required
            options={planOptions}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
        </form>
      </Modal>

      <Modal
        isOpen={renewModal}
        onClose={() => setRenewModal(false)}
        title="Renew subscription"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenewModal(false)}>
              Cancel
            </Button>
            <Button
              form="admin-renew-form"
              type="submit"
              isLoading={renew.isPending}
            >
              Renew
            </Button>
          </>
        }
      >
        <form
          id="admin-renew-form"
          onSubmit={(e) => {
            e.preventDefault();
            renew.mutate(
              {
                period: renewPeriod as 'monthly' | 'yearly',
                months: renewMonths ? Number(renewMonths) : undefined,
              },
              {
                onSuccess: () => {
                  setRenewModal(false);
                  refreshTenant();
                },
              }
            );
          }}
          className="space-y-4"
        >
          <SelectInput
            label="Billing period"
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            value={renewPeriod}
            onChange={(e) => setRenewPeriod(e.target.value)}
          />
          <Input
            label="Months (optional)"
            type="number"
            min={1}
            helperText="Override the period length with a custom number of months"
            value={renewMonths}
            onChange={(e) => setRenewMonths(e.target.value)}
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm?.label === 'cancel' ? 'Cancel' : confirm?.label === 'suspend' ? 'Suspend' : 'Resume'} subscription?`}
        description={
          confirm?.action === 'cancel'
            ? 'The school will lose access when the current period ends.'
            : confirm?.action === 'suspend'
              ? 'Access will be blocked immediately until resumed.'
              : 'Restore access for this school.'
        }
        variant={confirm?.action === 'resume' ? 'default' : 'danger'}
        confirmLabel={confirm?.label === 'cancel' ? 'Cancel' : confirm?.label === 'suspend' ? 'Suspend' : 'Resume'}
        isLoading={status.isPending}
        onConfirm={() =>
          confirm &&
          status.mutate(
            { action: confirm.action },
            {
              onSuccess: () => {
                setConfirm(null);
                refreshTenant();
              },
            }
          )
        }
      />
    </div>
  );
}
