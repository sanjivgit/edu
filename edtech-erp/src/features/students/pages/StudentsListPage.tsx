import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useState } from 'react';
import { useAuth } from '@/hooks';
import { StudentsTable } from '../components/StudentsTable';
import { type StudentRecord, useDeleteStudent, useGetStudents } from '../services/students.service';

export default function StudentsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';
  const listQuery = useGetStudents();
  const deleteMutation = useDeleteStudent();
  const [deletingItem, setDeletingItem] = useState<StudentRecord | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Manage student profiles, classes, and sections"
        actions={
          canEdit ? (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/students/create')}>
              Add Student
            </Button>
          ) : undefined
        }
      />

      <StudentsTable
        data={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/students/${row.id}`)}
        onEdit={(row) => canEdit && navigate(`/students/${row.id}/edit`)}
        onDelete={(row) => canEdit && setDeletingItem(row)}
      />

      {deletingItem && (
        <ConfirmModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={() =>
            deleteMutation.mutate({ id: deletingItem.id }, { onSuccess: () => setDeletingItem(null) })
          }
          title={`Delete ${deletingItem.name}`}
          description="This student record will be deleted permanently."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
