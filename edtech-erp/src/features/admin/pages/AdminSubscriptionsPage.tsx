import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminCard, AdminEmpty, AdminTable, Td } from '../components/admin-ui';
import {
  daysUntil,
  formatCurrency,
  formatDate,
  useAdminPlans,
  useAdminSubscriptions,
  useAdminTenants,
  useCreateSubscription,
  useRenewSubscription,
  useSubscriptionStatus,
} from '../services/admin.service';
import type { Subscription } from '../types';

export default function AdminSubscriptionsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenantId: '', planId: '', period: 'monthly', status: 'active', months: '' });
  const [renewTarget, setRenewTarget] = useState<Subscription | null>(null);
  const [renewPeriod, setRenewPeriod] = useState('monthly');
  const [confirm, setConfirm] = useState<{ sub: Subscription; action: 'cancel' | 'suspend' | 'resume' } | null>(null);

  const { data, isLoading } = useAdminSubscriptions();
  const { data: tenants } = useAdminTenants(1, '');
  const { data: plans } = useAdminPlans();

  const createSub = useCreateSubscription();
  const renew = useRenewSubscription(renewTarget?.id);
  const status = useSubscriptionStatus(confirm?.sub.id);

  const items = data?.items ?? [];

  const canAct = (s: Subscription) => s.status === 'active' || s.status === 'trial';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="All school subscriptions across the platform"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New subscription
          </Button>
        }
      />

      <AdminCard title={`All subscriptions (${data?.meta?.total ?? 0})`}>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <AdminEmpty title="No subscriptions yet" hint="Create your first subscription." />
        ) : (
          <AdminTable headers={['School', 'Plan', 'Status', 'Period', 'Price', 'Expires', '']}>
            {items.map((s) => {
              const daysLeft = daysUntil(s.expiresAt);
              return (
                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                  <Td>
                    <p className="font-medium">{s.tenant?.name ?? s.tenantId}</p>
                    <p className="text-xs text-muted-foreground">{s.tenant?.code}</p>
                  </Td>
                  <Td className="font-medium">{s.plan?.name ?? '—'}</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td className="capitalize">{s.period}</Td>
                  <Td className="font-medium">{formatCurrency(s.pricePerPeriod, s.currency)}</Td>
                  <Td>
                    <p className="text-xs">{formatDate(s.expiresAt)}</p>
                    {daysLeft != null && canAct(s) && (
                      <p className={`text-xs ${daysLeft <= 30 ? 'font-medium text-amber-600' : 'text-muted-foreground'}`}>
                        {daysLeft <= 0 ? 'expired' : `${daysLeft} days left`}
                      </p>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => setRenewTarget(s)}>
                        Renew
                      </Button>
                      {canAct(s) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirm({ sub: s, action: s.status === 'active' ? 'suspend' : 'cancel' })}
                        >
                          {s.status === 'active' ? 'Suspend' : 'Cancel'}
                        </Button>
                      )}
                      {s.status === 'cancelled' && (
                        <Button variant="ghost" size="sm" onClick={() => setConfirm({ sub: s, action: 'resume' })}>
                          Resume
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </AdminTable>
        )}
      </AdminCard>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create subscription"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={createSub.isPending}>
              Cancel
            </Button>
            <Button form="admin-sub-form" type="submit" isLoading={createSub.isPending}>
              Create
            </Button>
          </>
        }
      >
        <form
          id="admin-sub-form"
          onSubmit={(e) => {
            e.preventDefault();
            createSub.mutate(
              {
                tenantId: form.tenantId,
                planId: form.planId,
                period: form.period as 'monthly' | 'yearly',
                status: form.status,
              },
              {
                onSuccess: () => {
                  setOpen(false);
                  setForm({ tenantId: '', planId: '', period: 'monthly', status: 'active', months: '' });
                },
              }
            );
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <SelectInput
            label="School"
            placeholder="Select a school..."
            required
            options={(tenants?.items ?? []).map((t) => ({ label: `${t.name} (${t.code})`, value: t.id }))}
            value={form.tenantId}
            onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
          />
          <SelectInput
            label="Plan"
            placeholder="Select a plan..."
            required
            options={(plans?.items ?? []).map((p) => ({ label: p.name, value: p.id }))}
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
          />
          <SelectInput
            label="Billing period"
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
          />
          <SelectInput
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Trial', value: 'trial' },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <Input
            label="Months (optional)"
            type="number"
            min={1}
            helperText="Override period length; defaults to 1 month / 1 year"
            value={form.months}
            onChange={(e) => setForm({ ...form, months: e.target.value })}
          />
        </form>
      </Modal>

      <Modal
        isOpen={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        title="Renew subscription"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenewTarget(null)}>
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
              { period: renewPeriod as 'monthly' | 'yearly' },
              { onSuccess: () => setRenewTarget(null) }
            );
          }}
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
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm?.action === 'cancel' ? 'Cancel' : confirm?.action === 'suspend' ? 'Suspend' : 'Resume'} subscription?`}
        description={
          confirm?.action === 'cancel'
            ? `${confirm.sub.tenant?.name} will lose access when the current period ends.`
            : confirm?.action === 'suspend'
              ? 'Access will be blocked immediately until resumed.'
              : 'Restore access for this school.'
        }
        variant={confirm?.action === 'resume' ? 'default' : 'danger'}
        confirmLabel={confirm?.action === 'cancel' ? 'Cancel' : confirm?.action === 'suspend' ? 'Suspend' : 'Resume'}
        isLoading={status.isPending}
        onConfirm={() => confirm && status.mutate({ action: confirm.action }, { onSuccess: () => setConfirm(null) })}
      />
    </div>
  );
}
