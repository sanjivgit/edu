import { Download, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { useMemo, useState } from 'react';
import { AdmissionStatsCards } from '../components/AdmissionStatsCards';
import { AdmissionTable } from '../components/AdmissionTable';
import { useAdmissionStats } from '../hooks/useAdmissionUi';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import {
  type AdmissionRecord,
  useDeleteAdmission,
  useUpdateAdmissionStatus,
} from '../services/admission.service';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected'] as const;
const CLASS_OPTIONS = ['all', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)] as const;
const GENDER_OPTIONS = ['all', 'male', 'female', 'other'] as const;

export default function AdmissionListPage() {
  const navigate = useNavigate();
  const { admissions, admissionsQuery, stats } = useAdmissionStats();
  const { data: academicYears = [] } = useGetAcademicYears();
  const deleteAdmission = useDeleteAdmission();
  const updateStatus = useUpdateAdmissionStatus();
  const [deletingItem, setDeletingItem] = useState<AdmissionRecord | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');

  const hasActiveFilters = statusFilter !== 'all' || classFilter !== 'all' || genderFilter !== 'all' || academicYearFilter !== 'all';

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (classFilter !== 'all' && item.classApplyingFor !== classFilter) return false;
      if (genderFilter !== 'all' && item.gender !== genderFilter) return false;
      if (academicYearFilter !== 'all' && item.academicYearId !== academicYearFilter) return false;
      return true;
    });
  }, [admissions, statusFilter, classFilter, genderFilter, academicYearFilter]);

  const selectClass =
    'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

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

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          ))}
        </select>

        <label className="text-sm font-medium text-muted-foreground">Class</label>
        <select className={selectClass} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          {CLASS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt === 'all' ? 'All' : opt}</option>
          ))}
        </select>

        <label className="text-sm font-medium text-muted-foreground">Gender</label>
        <select className={selectClass} value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          ))}
        </select>

        <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
        <select className={selectClass} value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
          <option value="all">All</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => { setStatusFilter('all'); setClassFilter('all'); setGenderFilter('all'); setAcademicYearFilter('all'); }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <AdmissionTable
        data={filteredAdmissions}
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
