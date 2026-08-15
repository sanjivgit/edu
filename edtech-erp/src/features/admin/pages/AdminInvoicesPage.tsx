import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminCard, AdminEmpty, AdminTable, Td } from '../components/admin-ui';
import {
  formatCurrency,
  formatDate,
  useAdminInvoices,
  useAdminSubscriptions,
  useAdminTenants,
  useCancelInvoice,
  useIssueInvoice,
  useMarkInvoicePaid,
} from '../services/admin.service';
import type { SubscriptionInvoice } from '../types';

interface InvoiceForm {
  tenantId: string;
  subscriptionId: string;
  amount: string;
  currency: string;
  period: 'monthly' | 'yearly';
  periodStart: string;
  periodEnd: string;
  notes: string;
}

const emptyForm: InvoiceForm = {
  tenantId: '',
  subscriptionId: '',
  amount: '',
  currency: 'INR',
  period: 'monthly',
  periodStart: '',
  periodEnd: '',
  notes: '',
};

export default function AdminInvoicesPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [confirmInvoice, setConfirmInvoice] = useState<SubscriptionInvoice | null>(null);
  const [confirmAction, setConfirmAction] = useState<'paid' | 'cancel'>('paid');

  const { data, isLoading } = useAdminInvoices();
  const { data: tenants } = useAdminTenants(1, '');
  const { data: subscriptions } = useAdminSubscriptions();

  const issue = useIssueInvoice();
  const markPaid = useMarkInvoicePaid(confirmInvoice?.id);
  const cancel = useCancelInvoice(confirmInvoice?.id);

  const items = data?.items ?? [];
  const subOptions = (subscriptions?.items ?? [])
    .filter((s) => !form.tenantId || s.tenantId === form.tenantId)
    .map((s) => ({ label: `${s.plan?.name ?? 'Plan'} (${s.status})`, value: s.id }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Offline invoice management for school subscriptions"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Issue invoice
          </Button>
        }
      />

      <AdminCard title={`All invoices (${data?.meta?.total ?? 0})`}>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <AdminEmpty title="No invoices" hint="Issue an invoice to get started." />
        ) : (
          <AdminTable headers={['Invoice', 'School', 'Plan', 'Amount', 'Period', 'Status', '']}>
            {items.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{inv.invoiceNo}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(inv.issuedAt)}</p>
                </Td>
                <Td>
                  <p className="font-medium">{inv.tenant?.name}</p>
                  <p className="text-xs text-muted-foreground">{inv.tenant?.code}</p>
                </Td>
                <Td className="text-muted-foreground">{inv.subscription?.plan?.name ?? '—'}</Td>
                <Td className="font-medium">{formatCurrency(inv.amount, inv.currency)}</Td>
                <Td className="text-xs text-muted-foreground">
                  {formatDate(inv.periodStart)} → {formatDate(inv.periodEnd)}
                </Td>
                <Td><StatusBadge status={inv.status} /></Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1.5">
                    {(inv.status === 'issued' || inv.status === 'overdue' || inv.status === 'draft') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => {
                          setConfirmInvoice(inv);
                          setConfirmAction('paid');
                        }}
                      >
                        Mark paid
                      </Button>
                    )}
                    {(inv.status === 'issued' || inv.status === 'draft') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setConfirmInvoice(inv);
                          setConfirmAction('cancel');
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Issue invoice"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={issue.isPending}>
              Cancel
            </Button>
            <Button form="admin-invoice-form" type="submit" isLoading={issue.isPending}>
              Issue invoice
            </Button>
          </>
        }
      >
        <form
          id="admin-invoice-form"
          onSubmit={(e) => {
            e.preventDefault();
            issue.mutate(
              {
                tenantId: form.tenantId,
                subscriptionId: form.subscriptionId || undefined,
                amount: Number(form.amount),
                currency: form.currency,
                period: form.period,
                periodStart: form.periodStart || undefined,
                periodEnd: form.periodEnd || undefined,
                notes: form.notes || undefined,
              },
              {
                onSuccess: () => {
                  setOpen(false);
                  setForm(emptyForm);
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
            onChange={(e) => setForm({ ...form, tenantId: e.target.value, subscriptionId: '' })}
          />
          <SelectInput
            label="Subscription (optional)"
            placeholder="— None —"
            options={subOptions}
            value={form.subscriptionId}
            onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })}
          />
          <Input
            label="Amount"
            type="number"
            min={0}
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <SelectInput
            label="Billing period"
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value as 'monthly' | 'yearly' })}
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Input
            label="Period start (optional)"
            type="date"
            value={form.periodStart}
            onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
          />
          <Input
            label="Period end (optional)"
            type="date"
            value={form.periodEnd}
            onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmInvoice}
        onClose={() => setConfirmInvoice(null)}
        title={confirmAction === 'paid' ? 'Mark as paid?' : 'Cancel invoice?'}
        description={
          confirmAction === 'paid'
            ? `Record payment for ${confirmInvoice?.invoiceNo}. The linked subscription will be extended.`
            : `Cancel ${confirmInvoice?.invoiceNo}?`
        }
        variant={confirmAction === 'paid' ? 'default' : 'danger'}
        confirmLabel={confirmAction === 'paid' ? 'Mark paid' : 'Cancel'}
        isLoading={markPaid.isPending || cancel.isPending}
        onConfirm={() => {
          const fn = confirmAction === 'paid' ? markPaid : cancel;
          fn.mutate({}, { onSuccess: () => setConfirmInvoice(null) });
        }}
      />
    </div>
  );
}
