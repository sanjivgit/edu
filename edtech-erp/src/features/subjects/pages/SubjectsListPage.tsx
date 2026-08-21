import { useMemo, useState } from 'react';
import { Filter, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { useDeleteSubject, useGetSubjects } from '../services/subjects.service';
import type { SubjectCategory } from '../services/subjects.service';
import { SubjectsTable } from '../components/SubjectsTable';

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));

const CATEGORY_OPTIONS: { value: SubjectCategory; label: string }[] = [
  { value: 'core', label: 'Core' },
  { value: 'language', label: 'Language' },
  { value: 'elective', label: 'Elective' },
  { value: 'lab', label: 'Lab' },
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts' },
];

export default function SubjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'teacher';
  const listQuery = useGetSubjects();
  const deleteMutation = useDeleteSubject();
  const allData = listQuery.data ?? [];

  const [classFilter, setClassFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const hasActiveFilters = classFilter || categoryFilter || statusFilter;

  const data = useMemo(() => {
    return allData.filter((row) => {
      if (classFilter && row.classId !== classFilter) return false;
      if (categoryFilter && row.category !== categoryFilter) return false;
      if (statusFilter === 'active' && !row.isActive) return false;
      if (statusFilter === 'inactive' && row.isActive) return false;
      return true;
    });
  }, [allData, classFilter, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setClassFilter('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const selectClass =
    'h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Management"
        description="Manage subjects and curriculum"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/subjects/create')} disabled={!canEdit}>
            Add Subject
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <select className={selectClass} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          {CLASS_OPTIONS.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>

        <select className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasActiveFilters && (
          <Button size="sm" variant="ghost" leftIcon={<X className="h-3.5 w-3.5" />} onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <SubjectsTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/subjects/${row.id}`)}
        onEdit={canEdit ? (row) => navigate(`/subjects/${row.id}/edit`) : undefined}
        onDelete={canEdit ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
      />
    </div>
  );
}

