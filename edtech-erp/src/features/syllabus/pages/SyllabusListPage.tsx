import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { useAuth } from '@/hooks';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { SyllabusTable } from '../components/SyllabusTable';
import { useDeleteSyllabus, useGetSyllabus } from '../services/syllabus.service';

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: String(i + 1) }));
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'].map((s) => ({ label: s, value: s }));
const SUBJECT_OPTIONS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'].map((s) => ({ label: s, value: s }));
const TERM_OPTIONS = [
  { label: 'Term 1', value: 'term-1' },
  { label: 'Term 2', value: 'term-2' },
  { label: 'Final', value: 'final' },
];
const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
];

interface Filters {
  classId: string;
  section: string;
  subject: string;
  term: string;
  status: string;
  academicYearId: string;
}

const EMPTY_FILTERS: Filters = { classId: '', section: '', subject: '', term: '', status: '', academicYearId: '' };

export default function SyllabusListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin';
  const listQuery = useGetSyllabus();
  const deleteMutation = useDeleteSyllabus();
  const { data: academicYears = [] } = useGetAcademicYears();
  const rawData = listQuery.data ?? [];

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const data = useMemo(() => {
    return rawData.filter((row) => {
      if (filters.classId && row.classId !== filters.classId) return false;
      if (filters.section && row.section !== filters.section) return false;
      if (filters.subject && row.subject !== filters.subject) return false;
      if (filters.term && row.term !== filters.term) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.academicYearId && row.academicYearId !== filters.academicYearId) return false;
      return true;
    });
  }, [rawData, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus Management"
        description="Manage course curriculum and syllabus"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/syllabus/create')} disabled={!canManage}>
            Add Syllabus
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <SelectInput
            label="Class"
            placeholder="All Classes"
            options={CLASS_OPTIONS}
            value={filters.classId}
            onChange={(e) => setFilter('classId', e.target.value)}
          />
        </div>
        <div className="w-32">
          <SelectInput
            label="Section"
            placeholder="All"
            options={SECTION_OPTIONS}
            value={filters.section}
            onChange={(e) => setFilter('section', e.target.value)}
          />
        </div>
        <div className="w-44">
          <SelectInput
            label="Subject"
            placeholder="All Subjects"
            options={SUBJECT_OPTIONS}
            value={filters.subject}
            onChange={(e) => setFilter('subject', e.target.value)}
          />
        </div>
        <div className="w-36">
          <SelectInput
            label="Term"
            placeholder="All Terms"
            options={TERM_OPTIONS}
            value={filters.term}
            onChange={(e) => setFilter('term', e.target.value)}
          />
        </div>
        <div className="w-36">
          <SelectInput
            label="Status"
            placeholder="All"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          />
        </div>
        <div className="w-44">
          <SelectInput
            label="Academic Year"
            placeholder="All Years"
            options={academicYears.map((y) => ({ label: y.name, value: y.id }))}
            value={filters.academicYearId}
            onChange={(e) => setFilter('academicYearId', e.target.value)}
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" leftIcon={<X className="h-3.5 w-3.5" />} onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <SyllabusTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/syllabus/${row.id}`)}
        onEdit={canManage ? (row) => navigate(`/syllabus/${row.id}/edit`) : undefined}
        onDelete={canManage ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

