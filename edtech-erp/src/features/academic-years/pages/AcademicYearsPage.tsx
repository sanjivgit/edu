import { useState } from 'react';
import { CalendarRange, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks';
import { AcademicYearsTable } from '@/features/classes/components/AcademicYearsTable';
import {
  useGetAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
} from '@/features/classes/services/classes.service';
import type { AcademicYearItem } from '@/features/classes/services/classes.service';

export default function AcademicYearsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin';

  const academicYearsQuery = useGetAcademicYears();
  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();
  const deleteYear = useDeleteAcademicYear();

  const academicYears = academicYearsQuery.data ?? [];

  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const [editing, setEditing] = useState<AcademicYearItem | null>(null);
  const [deleting, setDeleting] = useState<AcademicYearItem | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Years"
        description="Create and manage academic years for your institution"
        actions={
          canManage ? (
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setForm({ name: '', startDate: '', endDate: '' });
              }}
            >
              Add Academic Year
            </Button>
          ) : undefined
        }
      />

      {canManage ? (
        <Card className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Year Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="2026-2027"
            />
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            />
            <div className="flex items-end gap-2">
              {editing ? (
                <>
                  <Button
                    className="flex-1"
                    leftIcon={<CalendarRange className="h-4 w-4" />}
                    isLoading={updateYear.isPending}
                    onClick={() =>
                      updateYear.mutate(
                        { id: editing.id, payload: form },
                        {
                          onSuccess: () => {
                            setEditing(null);
                            setForm({ name: '', startDate: '', endDate: '' });
                          },
                        }
                      )
                    }
                  >
                    Update Year
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(null);
                      setForm({ name: '', startDate: '', endDate: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  leftIcon={<CalendarRange className="h-4 w-4" />}
                  isLoading={createYear.isPending}
                  onClick={() =>
                    createYear.mutate(form, {
                      onSuccess: () => setForm({ name: '', startDate: '', endDate: '' }),
                    })
                  }
                >
                  Create Year
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      <AcademicYearsTable
        data={academicYears}
        isLoading={academicYearsQuery.isLoading}
        canManage={canManage}
        onEdit={
          canManage
            ? (row) => {
                setEditing(row);
                setForm({
                  name: row.name,
                  startDate: row.startDate?.slice(0, 10) ?? '',
                  endDate: row.endDate?.slice(0, 10) ?? '',
                });
              }
            : undefined
        }
        onDelete={canManage ? (row) => setDeleting(row) : undefined}
      />

      {canManage && deleting && (
        <ConfirmModal
          isOpen={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            deleteYear.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title={`Delete ${deleting.name}`}
          description="This will permanently remove this academic year."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteYear.isPending}
        />
      )}
    </div>
  );
}
