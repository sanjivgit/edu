import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { AssessmentsTable } from '../components/AssessmentsTable';
import { useDeleteAssessment, useGetAssessments } from '../services/assessment.service';
import type { AssessmentRecord } from '../services/assessment.service';

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const SUBJECT_OPTIONS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];
const TYPE_OPTIONS = ['quiz', 'assignment', 'unit-test', 'project'] as const;
const STATUS_OPTIONS = ['draft', 'published', 'closed'] as const;

const selectClass = 'h-8 rounded-md border border-input bg-background px-2 text-xs font-body focus:outline-none focus:ring-2 focus:ring-ring';

export default function AssessmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetAssessments();
  const deleteMutation = useDeleteAssessment();
  const { data: academicYears = [] } = useGetAcademicYears();
  const data = listQuery.data ?? [];

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');

  const hasActiveFilters = classFilter || sectionFilter || subjectFilter || typeFilter || statusFilter || academicYearFilter;

  const filteredData = useMemo(() => {
    return data.filter((row: AssessmentRecord) => {
      if (classFilter && row.classId !== classFilter) return false;
      if (sectionFilter && row.section !== sectionFilter) return false;
      if (subjectFilter && row.subject !== subjectFilter) return false;
      if (typeFilter && row.type !== typeFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      if (academicYearFilter && row.academicYearId !== academicYearFilter) return false;
      return true;
    });
  }, [data, classFilter, sectionFilter, subjectFilter, typeFilter, statusFilter, academicYearFilter]);

  const clearFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setSubjectFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setAcademicYearFilter('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Management"
        description="Create and manage assessments"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/assessment/create')} disabled={!canEdit}>
            Create Assessment
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Class</label>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={selectClass}>
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Section</label>
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className={selectClass}>
            <option value="">All Sections</option>
            {SECTION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Subject</label>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={selectClass}>
            <option value="">All Subjects</option>
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
            <option value="">All Types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t.replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Academic Year</label>
          <select value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)} className={selectClass}>
            <option value="">All Years</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters} className="gap-1">
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      <AssessmentsTable
        data={filteredData}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/assessment/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/assessment/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

