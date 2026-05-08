import { Download, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useState } from 'react';
import { AdmissionStatsCards } from '../components/AdmissionStatsCards';
import { AdmissionTable } from '../components/AdmissionTable';
import { useAdmissionStats } from '../hooks/useAdmissionUi';
import {
  type AdmissionRecord,
  useDeleteAdmission,
  useUpdateAdmissionStatus,
} from '../services/admission.service';

export default function AdmissionListPage() {
  const navigate = useNavigate();
  const { admissions, admissionsQuery, stats } = useAdmissionStats();
  const deleteAdmission = useDeleteAdmission();
  const updateStatus = useUpdateAdmissionStatus();
  const [deletingItem, setDeletingItem] = useState<AdmissionRecord | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Management"
        description="Review and process student admission applications"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => navigate('/admissions/new')}>
              New Application
            </Button>
          </>
        }
      />

      <AdmissionStatsCards {...stats} />

      <AdmissionTable
        data={admissions}
        isLoading={admissionsQuery.isLoading}
        onView={(item) => navigate(`/admissions/${item.id}`)}
        onEdit={(item) => navigate(`/admissions/${item.id}/edit`)}
        onDelete={setDeletingItem}
        onStatusUpdate={(item, status) => updateStatus.mutate({ admissionId: item.id, status })}
      />

      {deletingItem && (
        <ConfirmModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={() => deleteAdmission.mutate(deletingItem.id, { onSuccess: () => setDeletingItem(null) })}
          title={`Delete ${deletingItem.firstName} ${deletingItem.lastName}`}
          description="This admission application will be deleted permanently."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteAdmission.isPending}
        />
      )}
    </div>
  );
}
