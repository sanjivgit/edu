import { Download, Plus, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { FeesStatsCards } from '../components/FeesStatsCards';
import { FeesTable } from '../components/FeesTable';
import { useGetFees, type FeeRecord, type FeeFilters } from '../services/fees.service';

const CLASS_OPTIONS = [
  ...Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: String(i + 1) })),
];

const SECTION_OPTIONS = [
  { label: 'All Sections', value: '' },
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
];

export default function FeesListPage() {
  const navigate = useNavigate();
  const { user, isManagement, isStudent, isParent } = useAuth();
  const academicYearsQuery = useGetAcademicYears();

  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filters: FeeFilters = useMemo(() => ({
    classId: classFilter || undefined,
    section: sectionFilter || undefined,
    academicYearId: academicYearFilter || undefined,
    status: statusFilter || undefined,
  }), [classFilter, sectionFilter, academicYearFilter, statusFilter]);

  const feesQuery = useGetFees(isManagement ? filters : undefined);
  const fees = feesQuery.data ?? [];
  const academicYears = academicYearsQuery.data ?? [];

  const myFees = useMemo(() => {
    if (!isStudent || !user?.studentId) return [];
    return fees.filter((f) => f.studentId === user.studentId);
  }, [isStudent, user?.studentId, fees]);

  const displayFees = isStudent ? myFees : fees;

  const totals = useMemo(() => {
    const totalCollected = displayFees.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const totalPending = displayFees.filter((f) => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
    const totalOverdue = displayFees.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);
    return { totalCollected, totalPending, totalOverdue };
  }, [displayFees]);

  const hasActiveFilters = academicYearFilter || classFilter || sectionFilter || statusFilter;

  const goToPay = (row: FeeRecord) => {
    navigate(`/fees/${row.studentId}?pay=${row.id}`);
  };

  if (isParent) {
    navigate('/parent-portal/fees', { replace: true });
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'My Fees' : 'Fee Management'}
        description={isStudent ? 'View your fee payment status' : 'Track and manage student fee collection'}
        actions={
          isManagement ? (
            <>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                Export
              </Button>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/fees/record-payment')}>
                Record Payment
              </Button>
            </>
          ) : isStudent ? (
            <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => user?.studentId && navigate(`/fees/${user.studentId}`)}>
              View Details
            </Button>
          ) : undefined
        }
      />

      {/* Filters — admin only */}
      {isManagement && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-input bg-background p-3">
          <div className="w-44">
            <SelectInput
              label="Academic Year"
              options={[
                { label: 'All Years', value: '' },
                ...academicYears.map((y) => ({ label: y.name, value: y.id })),
              ]}
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
            />
          </div>
          <div className="w-40">
            <SelectInput
              label="Class"
              options={[{ label: 'All Classes', value: '' }, ...CLASS_OPTIONS]}
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            />
          </div>
          <div className="w-36">
            <SelectInput
              label="Section"
              options={SECTION_OPTIONS}
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            />
          </div>
          <div className="w-36">
            <SelectInput
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={() => { setAcademicYearFilter(''); setClassFilter(''); setSectionFilter(''); setStatusFilter(''); }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <FeesStatsCards {...totals} isLoading={feesQuery.isLoading} />

      <FeesTable
        data={displayFees}
        isLoading={feesQuery.isLoading}
        onView={(row) => navigate(`/fees/${row.studentId}`)}
        onPay={isManagement ? goToPay : undefined}
      />
    </div>
  );
}
