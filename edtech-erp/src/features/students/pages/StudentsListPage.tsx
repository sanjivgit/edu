import { GraduationCap, Plus, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectInput } from '@/components/ui/Input';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { useState, useMemo, useEffect } from 'react';
import { useAuth, useToast } from '@/hooks';
import { StudentsTable } from '../components/StudentsTable';
import {
  type StudentRecord,
  useDeleteStudent,
  useGetStudents,
  useGetParentChildren,
} from '../services/students.service';
import {
  useGetAcademicYears,
  useGetClasses,
  usePromoteStudents,
} from '@/features/classes/services/classes.service';

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
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Transferred', value: 'transferred' },
];

const GENDER_OPTIONS = [
  { label: 'All Genders', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

interface BulkPromoteForm {
  fromClassId: string;
  toClassId: string;
  academicYearId: string;
  examId: string;
}

export default function StudentsListPage() {
  const navigate = useNavigate();
  const { user, isStudent, isParent, isManagement } = useAuth();
  const { success } = useToast();
  const canEdit = isManagement;
  const canPromote = isManagement;

  const allStudentsQuery = useGetStudents();
  const parentChildrenQuery = useGetParentChildren();
  const deleteMutation = useDeleteStudent();
  const [deletingItem, setDeletingItem] = useState<StudentRecord | null>(null);
  const academicYearsQuery = useGetAcademicYears();
  const classesQuery = useGetClasses();
  const promoteMutation = usePromoteStudents();

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [promotingStudent, setPromotingStudent] = useState<StudentRecord | null>(null);
  const [promoteToClass, setPromoteToClass] = useState('');
  const [promoteAcademicYear, setPromoteAcademicYear] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPromoteOpen, setBulkPromoteOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState<BulkPromoteForm>({
    fromClassId: '',
    toClassId: '',
    academicYearId: '',
    examId: '',
  });

  const academicYears = academicYearsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  const rawStudents = useMemo(() => {
    if (isStudent) return [];
    if (isParent) return parentChildrenQuery.data ?? [];
    return allStudentsQuery.data ?? [];
  }, [isStudent, isParent, allStudentsQuery.data, parentChildrenQuery.data]);

  const isLoading = isStudent
    ? false
    : isParent
      ? parentChildrenQuery.isLoading
      : allStudentsQuery.isLoading;

  const hasActiveFilters = classFilter || sectionFilter || statusFilter || genderFilter || yearFilter;

  const activeAcademicYear = academicYears.find((y) => y.status === 'active');

  const filteredData = useMemo(() => {
    let students = rawStudents;

    if (yearFilter) {
      students = students.filter((s) => s.currentAcademicYearId === yearFilter);
    }

    return students.filter((student) => {
      if (classFilter && student.classId !== classFilter) return false;
      if (sectionFilter && student.section !== sectionFilter) return false;
      if (statusFilter && student.status !== statusFilter) return false;
      if (genderFilter && student.gender !== genderFilter) return false;
      return true;
    });
  }, [rawStudents, classFilter, sectionFilter, statusFilter, genderFilter, yearFilter]);

  const selectedStudents = useMemo(
    () => filteredData.filter((s) => selectedIds.includes(s.id)),
    [filteredData, selectedIds]
  );

  const bulkFromClass = useMemo(() => {
    const classNums = selectedStudents.map((s) => parseInt(s.classId, 10)).filter((n) => !isNaN(n));
    if (classNums.length === 0) return null;
    const minClass = Math.min(...classNums);
    return classes.find((c) => c.code === String(minClass) || c.name?.includes(`Class ${minClass}`));
  }, [selectedStudents, classes]);

  useEffect(() => {
    if (bulkFromClass) {
      setBulkForm((p) => ({ ...p, fromClassId: bulkFromClass.id }));
    }
  }, [bulkFromClass]);

  const clearFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setStatusFilter('');
    setGenderFilter('');
    setYearFilter('');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((d) => d.id));
    }
  };

  const handleSinglePromote = () => {
    if (!promotingStudent || !promoteToClass) return;
    const targetClassNum = parseInt(promoteToClass, 10);
    const currentClassNum = parseInt(promotingStudent.classId, 10);
    if (isNaN(targetClassNum) || isNaN(currentClassNum) || targetClassNum <= currentClassNum) return;

    const toClass = classes.find((c) => c.code === promoteToClass || c.name?.includes(`Class ${promoteToClass}`));
    const fromClass = classes.find((c) => c.code === promotingStudent.classId || c.name?.includes(`Class ${promotingStudent.classId}`));

    if (!fromClass || !toClass) return;

    const yearId = promoteAcademicYear || activeAcademicYear?.id || '';
    if (!yearId) return;

    promoteMutation.mutate(
      {
        fromClassId: fromClass.id,
        toClassId: toClass.id,
        promotedCount: 1,
        academicYearId: yearId,
        studentIds: [promotingStudent.id],
      },
      {
        onSuccess: () => {
          setPromotingStudent(null);
          setPromoteToClass('');
          setPromoteAcademicYear('');
          success(`Promoted ${promotingStudent.name} successfully`);
          allStudentsQuery.refetch();
          setSelectedIds((prev) => prev.filter((id) => id !== promotingStudent.id));
        },
      }
    );
  };

  const handleBulkPromote = () => {
    if (selectedIds.length === 0 || !bulkForm.toClassId || !bulkForm.academicYearId) return;

    promoteMutation.mutate(
      {
        fromClassId: bulkForm.fromClassId,
        toClassId: bulkForm.toClassId,
        promotedCount: selectedIds.length,
        academicYearId: bulkForm.academicYearId,
        studentIds: selectedIds,
      },
      {
        onSuccess: () => {
          setBulkPromoteOpen(false);
          setBulkForm({ fromClassId: '', toClassId: '', academicYearId: '', examId: '' });
          setSelectedIds([]);
          success(`Promoted ${selectedIds.length} student(s) successfully`);
          allStudentsQuery.refetch();
        },
      }
    );
  };

  const pageTitle = isStudent
    ? 'My Profile'
    : isParent
      ? "My Children"
      : 'Student Management';
  const pageDesc = isStudent
    ? 'View your student profile'
    : isParent
      ? "View your children's profiles"
      : 'Manage student profiles, classes, and sections';

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={pageDesc}
        actions={
          canEdit ? (
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/students/create')}>
              Add Student
            </Button>
          ) : isStudent ? (
            <Button size="sm" variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => user?.studentId && navigate(`/students/${user.studentId}`)}>
              View Full Profile
            </Button>
          ) : undefined
        }
      />

      {/* Filters — only for admin/teacher */}
      {!isStudent && !isParent && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-input bg-background p-3">
          <div className="w-44">
            <SelectInput
              label="Academic Year"
              options={[
                { label: 'All Years', value: '' },
                ...academicYears.map((y) => ({ label: y.name, value: y.id })),
              ]}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
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
          <div className="w-40">
            <SelectInput
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <div className="w-36">
            <SelectInput
              label="Gender"
              options={GENDER_OPTIONS}
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
          {canEdit && filteredData.length > 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                onChange={toggleAll}
              />
              Select all
            </label>
          )}
        </div>
      )}

      {canEdit && selectedIds.length > 0 && (
        <Card className="p-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedIds.length} student{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds([])}
            >
              Deselect All
            </Button>
            <Button
              size="sm"
              leftIcon={<GraduationCap className="h-4 w-4" />}
              onClick={() => {
                setBulkForm({
                  fromClassId: bulkFromClass?.id ?? '',
                  toClassId: '',
                  academicYearId: activeAcademicYear?.id ?? '',
                  examId: '',
                });
                setBulkPromoteOpen(true);
              }}
            >
              Promote Selected
            </Button>
          </div>
        </Card>
      )}

      <StudentsTable
        data={filteredData}
        isLoading={isLoading}
        canPromote={canPromote}
        selectedIds={selectedIds}
        onToggleSelect={canEdit ? toggleSelect : undefined}
        onView={(row) => navigate(`/students/${row.id}`)}
        onEdit={(row) => canEdit && navigate(`/students/${row.id}/edit`)}
        onDelete={(row) => canEdit && setDeletingItem(row)}
        onPromote={(row) => canEdit && setPromotingStudent(row)}
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

      <Modal
        isOpen={!!promotingStudent}
        onClose={() => { setPromotingStudent(null); setPromoteToClass(''); setPromoteAcademicYear(''); }}
        title={`Promote ${promotingStudent?.name ?? ''}`}
        description={`Currently in Class ${promotingStudent?.classId}-${promotingStudent?.section}. Select target class and academic year.`}
        footer={
          <>
            <Button variant="outline" onClick={() => { setPromotingStudent(null); setPromoteToClass(''); setPromoteAcademicYear(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSinglePromote}
              isLoading={promoteMutation.isPending}
              disabled={!promoteToClass || !promoteAcademicYear}
              leftIcon={<GraduationCap className="h-4 w-4" />}
            >
              Promote
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectInput
            label="Promote To Class"
            options={CLASS_OPTIONS.filter((opt) => {
              const target = parseInt(opt.value, 10);
              const current = parseInt(promotingStudent?.classId ?? '0', 10);
              return !isNaN(target) && !isNaN(current) && target > current;
            })}
            value={promoteToClass}
            onChange={(e) => setPromoteToClass(e.target.value)}
          />
          <SelectInput
            label="Academic Year"
            options={academicYears.map((y) => ({ label: y.name, value: y.id }))}
            value={promoteAcademicYear}
            onChange={(e) => setPromoteAcademicYear(e.target.value)}
          />
          {!activeAcademicYear && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No active academic year found. Please create one first.
            </p>
          )}
        </div>
      </Modal>

      <BulkPromoteModal
        isOpen={bulkPromoteOpen}
        onClose={() => setBulkPromoteOpen(false)}
        form={bulkForm}
        setForm={setBulkForm}
        classes={classes}
        academicYears={academicYears}
        selectedCount={selectedIds.length}
        onConfirm={handleBulkPromote}
        isSubmitting={promoteMutation.isPending}
      />
    </div>
  );
}

function BulkPromoteModal({
  isOpen,
  onClose,
  form,
  setForm,
  classes,
  academicYears,
  selectedCount,
  onConfirm,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: BulkPromoteForm;
  setForm: React.Dispatch<React.SetStateAction<BulkPromoteForm>>;
  classes: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string; status: string }>;
  selectedCount: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  const fromClass = classes.find((c) => c.id === form.fromClassId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Promote Students"
      description={`Promoting ${selectedCount} student${selectedCount !== 1 ? 's' : ''}${fromClass ? ` from ${fromClass.name}` : ''}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={onConfirm}
            isLoading={isSubmitting}
            disabled={!form.toClassId || !form.academicYearId}
            leftIcon={<GraduationCap className="h-4 w-4" />}
          >
            Promote {selectedCount} Student{selectedCount !== 1 ? 's' : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SelectInput
          label="From Class"
          options={classes.map((c) => ({ label: c.name, value: c.id }))}
          value={form.fromClassId}
          onChange={(e) => setForm((p) => ({ ...p, fromClassId: e.target.value, examId: '' }))}
        />
        <SelectInput
          label="To Class"
          options={classes.filter((c) => c.id !== form.fromClassId).map((c) => ({ label: c.name, value: c.id }))}
          value={form.toClassId}
          onChange={(e) => setForm((p) => ({ ...p, toClassId: e.target.value }))}
        />
        <SelectInput
          label="Academic Year"
          options={academicYears.map((y) => ({ label: y.name, value: y.id }))}
          value={form.academicYearId}
          onChange={(e) => setForm((p) => ({ ...p, academicYearId: e.target.value }))}
        />
        {!form.academicYearId && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Please select an academic year to proceed.
          </p>
        )}
      </div>
    </Modal>
  );
}
