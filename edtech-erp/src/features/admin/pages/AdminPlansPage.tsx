import { useState } from 'react';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminEmpty } from '../components/admin-ui';
import {
  formatCurrency,
  useAdminPlans,
  useCreatePlan,
  useDeletePlan,
  useUpdatePlan,
} from '../services/admin.service';
import type { Plan } from '../types';

interface PlanForm {
  name: string;
  code: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  currency: string;
  studentLimit: string;
  teacherLimit: string;
  storageMb: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  sortOrder: string;
}

const emptyForm: PlanForm = {
  name: '',
  code: '',
  description: '',
  priceMonthly: '0',
  priceYearly: '0',
  currency: 'INR',
  studentLimit: '',
  teacherLimit: '',
  storageMb: '0',
  isDefault: false,
  status: 'active',
  sortOrder: '0',
};

export default function AdminPlansPage() {
  const { data, isLoading } = useAdminPlans();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan(editing?.id);
  const deletePlan = useDeletePlan(deleting?.id);

  const items = data?.items ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({
      name: p.name,
      code: p.code,
      description: p.description ?? '',
      priceMonthly: String(p.priceMonthly ?? 0),
      priceYearly: String(p.priceYearly ?? 0),
      currency: p.currency,
      studentLimit: p.studentLimit == null ? '' : String(p.studentLimit),
      teacherLimit: p.teacherLimit == null ? '' : String(p.teacherLimit),
      storageMb: String(p.storageMb),
      isDefault: p.isDefault,
      status: p.status,
      sortOrder: String(p.sortOrder ?? 0),
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      code: form.code,
      description: form.description || undefined,
      priceMonthly: Number(form.priceMonthly) || 0,
      priceYearly: Number(form.priceYearly) || 0,
      currency: form.currency,
      studentLimit: form.studentLimit ? Number(form.studentLimit) : null,
      teacherLimit: form.teacherLimit ? Number(form.teacherLimit) : null,
      storageMb: Number(form.storageMb) || 0,
      isDefault: form.isDefault,
      status: form.status,
      sortOrder: Number(form.sortOrder) || 0,
    };
    const onOk = () => {
      setOpen(false);
      setForm(emptyForm);
    };
    if (editing) {
      updatePlan.mutate(payload, { onSuccess: onOk });
    } else {
      createPlan.mutate(payload, { onSuccess: onOk });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Subscription plans and pricing"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add plan
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="mt-0 p-0">
            <AdminEmpty title="No plans" hint="Create a subscription plan." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-sm font-semibold">
                    <Layers className="h-4 w-4 text-primary" />
                    {p.name}
                    {p.isDefault && <StatusBadge status="active" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.code}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <CardContent className="mt-0 flex flex-1 flex-col p-5">
                {p.description && <p className="mb-3 text-xs text-muted-foreground">{p.description}</p>}
                <div className="mb-3 flex flex-wrap items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold">
                    {formatCurrency(p.priceMonthly, p.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">/month</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-semibold">{formatCurrency(p.priceYearly, p.currency)}</span>
                  <span className="text-xs text-muted-foreground">/year</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Students', value: p.studentLimit == null ? '∞' : p.studentLimit },
                    { label: 'Teachers', value: p.teacherLimit == null ? '∞' : p.teacherLimit },
                    { label: 'Storage', value: `${p.storageMb} MB` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-muted px-2 py-2">
                      <p className="font-bold">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-1.5 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Add plan'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button form="admin-plan-form" type="submit" isLoading={createPlan.isPending || updatePlan.isPending}>
              {editing ? 'Save changes' : 'Create plan'}
            </Button>
          </>
        }
      >
        <form id="admin-plan-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Plan name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Plan code"
            required
            helperText="Unique slug, e.g. starter"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="Price monthly"
            type="number"
            min={0}
            required
            value={form.priceMonthly}
            onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })}
          />
          <Input
            label="Price yearly"
            type="number"
            min={0}
            required
            value={form.priceYearly}
            onChange={(e) => setForm({ ...form, priceYearly: e.target.value })}
          />
          <Input
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <Input
            label="Sort order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
          <Input
            label="Student limit"
            type="number"
            min={0}
            helperText="Leave blank for unlimited"
            value={form.studentLimit}
            onChange={(e) => setForm({ ...form, studentLimit: e.target.value })}
          />
          <Input
            label="Teacher limit"
            type="number"
            min={0}
            helperText="Leave blank for unlimited"
            value={form.teacherLimit}
            onChange={(e) => setForm({ ...form, teacherLimit: e.target.value })}
          />
          <Input
            label="Storage (MB)"
            type="number"
            min={0}
            value={form.storageMb}
            onChange={(e) => setForm({ ...form, storageMb: e.target.value })}
          />
          <SelectInput
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
          />
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm">Default plan (used for new schools)</span>
          </label>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete plan?"
        description={`Are you sure you want to delete ${deleting?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deletePlan.isPending}
        onConfirm={() => deletePlan.mutate({}, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
