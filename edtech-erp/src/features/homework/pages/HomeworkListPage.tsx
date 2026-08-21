import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { HomeworkTable } from '../components/HomeworkTable';
import { useDeleteHomework, useGetHomework } from '../services/homework.service';

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const SUBJECT_OPTIONS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];
const STATUS_OPTIONS = ['draft', 'assigned', 'closed'] as const;

export default function HomeworkListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetHomework();
  const deleteMutation = useDeleteHomework();
  const { data: academicYears = [] } = useGetAcademicYears();
  const allData = listQuery.data ?? [];

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');

  const hasFilters = classFilter || sectionFilter || subjectFilter || statusFilter || academicYearFilter;

  const data = useMemo(() => {
    return allData.filter((row) => {
      if (classFilter && row.classId !== classFilter) return false;
      if (sectionFilter && row.section !== sectionFilter) return false;
      if (subjectFilter && row.subject !== subjectFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      if (academicYearFilter && row.academicYearId !== academicYearFilter) return false;
      return true;
    });
  }, [allData, classFilter, sectionFilter, subjectFilter, statusFilter, academicYearFilter]);

  const clearFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setSubjectFilter('');
    setStatusFilter('');
    setAcademicYearFilter('');
  };

  const selectClass = 'rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework Management"
        description="Assign and track student homework"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/homework/create')} disabled={!canEdit}>
            Create Homework
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Class</span>
          <select className={selectClass} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>{`Class ${c}`}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Section</span>
          <select className={selectClass} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="">All Sections</option>
            {SECTION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Subject</span>
          <select className={selectClass} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">All Subjects</option>
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Academic Year</span>
          <select className={selectClass} value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <Button size="sm" variant="ghost" leftIcon={<X className="h-3 w-3" />} onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <HomeworkTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/homework/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/homework/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

