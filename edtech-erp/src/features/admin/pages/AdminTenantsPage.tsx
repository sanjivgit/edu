import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminCard, AdminEmpty, AdminTable, Td } from '../components/admin-ui';
import { formatDate, useAdminTenants, useCreateTenant } from '../services/admin.service';

const emptyForm = {
  name: '',
  code: '',
  domain: '',
  address: '',
  phone: '',
  website: '',
  registrationNo: '',
  adminEmail: '',
  adminName: '',
};

export default function AdminTenantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useAdminTenants(page, search);
  const createTenant = useCreateTenant();

  const items = data?.items ?? [];
  const meta = data?.meta;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenant.mutate(
      {
        name: form.name,
        code: form.code,
        domain: form.domain || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        registrationNo: form.registrationNo || undefined,
        adminEmail: form.adminEmail || undefined,
        adminName: form.adminName || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm(emptyForm);
          setPage(1);
          setSearch('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Manage all tenant schools and their accounts"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add School
          </Button>
        }
      />

      <AdminCard
        title={`All schools (${meta?.total ?? 0})`}
        actions={
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              className="w-56 pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </form>
        }
      >
        {isLoading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <AdminEmpty title="No schools found" hint="Create your first school to get started." />
        ) : (
          <AdminTable
            headers={['School', 'Plan', 'Status', 'Usage', 'Created', '']}
          >
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.code}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="font-medium">{t.subscription?.plan?.name ?? '—'}</span>
                </Td>
                <Td>
                  <StatusBadge status={t.subscription?.status ?? 'inactive'} />
                </Td>
                <Td className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.studentCount ?? 0}</span> students ·{' '}
                  <span className="font-medium text-foreground">{t.teacherCount ?? 0}</span> teachers ·{' '}
                  <span className="font-medium text-foreground">{t.classCount ?? 0}</span> classes
                </Td>
                <Td className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</Td>
                <Td className="text-right">
                  <Link
                    to={`/billing/schools/${t.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Manage →
                  </Link>
                </Td>
              </tr>
            ))}
          </AdminTable>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </AdminCard>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add a new school"
        description="A 14-day trial subscription starts automatically"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={createTenant.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="admin-tenant-form" isLoading={createTenant.isPending}>
              Create school
            </Button>
          </>
        }
      >
        <form id="admin-tenant-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="School name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Tenant code"
            required
            helperText="Unique short code used for admissions"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <Input
            label="Domain"
            placeholder="school.example.com"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
          />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input
            label="Registration No."
            value={form.registrationNo}
            onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
          />
          <Input
            label="Admin email"
            type="email"
            helperText="Creates an admin login for the school"
            value={form.adminEmail}
            onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
          />
          <Input
            label="Admin name"
            value={form.adminName}
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
