import { useMemo, useState } from 'react';
import { CalendarRange, GraduationCap, Layers, Plus, School, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { useAuth, useToast } from '@/hooks';
import { AcademicYearsTable } from '../components/AcademicYearsTable';
import { ClassFormModal } from '../components/ClassFormModal';
import { ClassStatsCards } from '../components/ClassStatsCards';
import { ClassesTable } from '../components/ClassesTable';
import { PromotionPanel } from '../components/PromotionPanel';
import { SectionFormModal } from '../components/SectionFormModal';
import { SectionsTable } from '../components/SectionsTable';
import { useClassesUi } from '../hooks/useClassesUi';
import {
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useAddClass,
  useAddSection,
  useDeleteClass,
  useDeleteSection,
  useEditClass,
  useEditSection,
  useGetAcademicYears,
  useGetClasses,
  useGetPromotions,
  useGetSections,
  usePromoteStudents,
} from '../services/classes.service';
import { useGetTeachers } from '@/features/teachers/services/teachers.service';

export default function ClassesPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin' || user?.role === 'admin';
  const { success } = useToast();
  const ui = useClassesUi();
  const classesQuery = useGetClasses();
  const teachersQuery = useGetTeachers();
  const sectionsQuery = useGetSections();
  const academicYearsQuery = useGetAcademicYears();
  const promotionsQuery = useGetPromotions();
  const addClass = useAddClass();
  const editClass = useEditClass();
  const deleteClass = useDeleteClass();
  const addSection = useAddSection();
  const editSection = useEditSection();
  const deleteSection = useDeleteSection();
  const createAcademicYear = useCreateAcademicYear();
  const updateAcademicYear = useUpdateAcademicYear();
  const deleteAcademicYear = useDeleteAcademicYear();
  const promoteStudents = usePromoteStudents();
  const [academicYearForm, setAcademicYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [editingAcademicYear, setEditingAcademicYear] = useState<import('../services/classes.service').AcademicYearItem | null>(null);
  const [deletingAcademicYear, setDeletingAcademicYear] = useState<import('../services/classes.service').AcademicYearItem | null>(null);

  const classes = classesQuery.data ?? [];
  const teacherNames = (teachersQuery.data ?? []).filter((t) => t.status === 'active').map((t) => t.fullName);
  const sections = sectionsQuery.data ?? [];
  const academicYears = academicYearsQuery.data ?? [];
  const promotions = promotionsQuery.data ?? [];

  const totals = useMemo(() => {
    const totalClasses = classes.length;
    const totalSections = sections.length;
    const activeClasses = classes.filter((c) => c.status === 'active').length;
    const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
    return { totalClasses, totalSections, activeClasses, totalStudents };
  }, [classes, sections]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Management"
        description="Manage classes, sections, academic years, and student promotions"
        actions={
          canManage ? (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Layers className="h-4 w-4" />}
                onClick={() => {
                  ui.setEditingSection(null);
                  ui.setSectionFormOpen(true);
                }}
              >
                Add Section
              </Button>
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  ui.setEditingClass(null);
                  ui.setClassFormOpen(true);
                }}
              >
                Add Class
              </Button>
            </>
          ) : undefined
        }
      />

      <ClassStatsCards {...totals} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={ui.activeTab === 'classes' ? 'default' : 'outline'}
          leftIcon={<School className="h-4 w-4" />}
          onClick={() => ui.setActiveTab('classes')}
        >
          Classes
        </Button>
        <Button
          size="sm"
          variant={ui.activeTab === 'sections' ? 'default' : 'outline'}
          leftIcon={<Users className="h-4 w-4" />}
          onClick={() => ui.setActiveTab('sections')}
        >
          Sections
        </Button>
        <Button
          size="sm"
          variant={ui.activeTab === 'academic-years' ? 'default' : 'outline'}
          leftIcon={<CalendarRange className="h-4 w-4" />}
          onClick={() => ui.setActiveTab('academic-years')}
        >
          Academic Years
        </Button>
        <Button
          size="sm"
          variant={ui.activeTab === 'promotion' ? 'default' : 'outline'}
          leftIcon={<GraduationCap className="h-4 w-4" />}
          onClick={() => ui.setActiveTab('promotion')}
        >
          Promotion
        </Button>
      </div>

      {ui.activeTab === 'classes' ? (
        <ClassesTable
          data={classes}
          isLoading={classesQuery.isLoading}
          onView={(row) => success('Class details', `${row.name}: ${row.sections} sections, ${row.students} students.`)}
          onEdit={canManage ? (row) => {
            ui.setEditingClass(row);
            ui.setClassFormOpen(true);
          } : undefined}
          onDelete={canManage ? (row) => ui.setDeletingClass(row) : undefined}
        />
      ) : ui.activeTab === 'sections' ? (
        <SectionsTable
          data={sections}
          isLoading={sectionsQuery.isLoading}
          onView={(row) => success('Section details', `${row.className} - Section ${row.name}, Room ${row.roomNo || 'N/A'}.`)}
          onEdit={canManage ? (row) => {
            ui.setEditingSection(row);
            ui.setSectionFormOpen(true);
          } : undefined}
          onDelete={canManage ? (row) => ui.setDeletingSection(row) : undefined}
        />
      ) : ui.activeTab === 'academic-years' ? (
        <div className="space-y-6">
          {canManage ? (
            <Card className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Year Name"
                  value={editingAcademicYear ? '' : academicYearForm.name}
                  onChange={(e) => setAcademicYearForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="2026-2027"
                  disabled={!!editingAcademicYear}
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={editingAcademicYear ? '' : academicYearForm.startDate}
                  onChange={(e) => setAcademicYearForm((p) => ({ ...p, startDate: e.target.value }))}
                  disabled={!!editingAcademicYear}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={editingAcademicYear ? '' : academicYearForm.endDate}
                  onChange={(e) => setAcademicYearForm((p) => ({ ...p, endDate: e.target.value }))}
                  disabled={!!editingAcademicYear}
                />
                <div className="flex items-end gap-2">
                  {editingAcademicYear ? (
                    <>
                      <Button
                        className="flex-1"
                        isLoading={updateAcademicYear.isPending}
                        onClick={() =>
                          updateAcademicYear.mutate(
                            { id: editingAcademicYear.id, payload: academicYearForm },
                            { onSuccess: () => { setEditingAcademicYear(null); setAcademicYearForm({ name: '', startDate: '', endDate: '' }); } }
                          )
                        }
                      >
                        Update Year
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setEditingAcademicYear(null); setAcademicYearForm({ name: '', startDate: '', endDate: '' }); }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      isLoading={createAcademicYear.isPending}
                      onClick={() =>
                        createAcademicYear.mutate(academicYearForm, {
                          onSuccess: () => setAcademicYearForm({ name: '', startDate: '', endDate: '' }),
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
            onEdit={canManage ? (row) => {
              setEditingAcademicYear(row);
              setAcademicYearForm({ name: row.name, startDate: row.startDate?.slice(0, 10) ?? '', endDate: row.endDate?.slice(0, 10) ?? '' });
            } : undefined}
            onDelete={canManage ? (row) => setDeletingAcademicYear(row) : undefined}
          />
        </div>
      ) : (
        <PromotionPanel
          classes={classes}
          academicYears={academicYears}
          promotions={promotions}
          isSubmitting={promoteStudents.isPending}
          onSubmit={(values) => promoteStudents.mutate(values)}
        />
      )}

      {canManage ? <ClassFormModal
        isOpen={ui.classFormOpen}
        onClose={() => {
          ui.setClassFormOpen(false);
          ui.setEditingClass(null);
        }}
        editingClass={ui.editingClass}
        teacherOptions={teacherNames}
        onCreate={(payload) => addClass.mutate(payload)}
        onUpdate={(classId, payload) => editClass.mutate({ classId, payload })}
        isLoading={addClass.isPending || editClass.isPending}
      /> : null}

      {canManage ? <SectionFormModal
        isOpen={ui.sectionFormOpen}
        onClose={() => {
          ui.setSectionFormOpen(false);
          ui.setEditingSection(null);
        }}
        classes={classes}
        teacherOptions={teacherNames}
        editingSection={ui.editingSection}
        onCreate={(payload) => addSection.mutate(payload)}
        onUpdate={(sectionId, payload) => editSection.mutate({ sectionId, payload })}
        isLoading={addSection.isPending || editSection.isPending}
      /> : null}

      {canManage && ui.deletingClass && (
        <ConfirmModal
          isOpen={!!ui.deletingClass}
          onClose={() => ui.setDeletingClass(null)}
          onConfirm={() => deleteClass.mutate(ui.deletingClass!.id, { onSuccess: () => ui.setDeletingClass(null) })}
          title={`Delete ${ui.deletingClass.name}`}
          description="This will also remove all sections under this class."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteClass.isPending}
        />
      )}

      {canManage && ui.deletingSection && (
        <ConfirmModal
          isOpen={!!ui.deletingSection}
          onClose={() => ui.setDeletingSection(null)}
          onConfirm={() => deleteSection.mutate(ui.deletingSection!.id, { onSuccess: () => ui.setDeletingSection(null) })}
          title={`Delete Section ${ui.deletingSection.name}`}
          description="This section will be removed from the class."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteSection.isPending}
        />
      )}

      {canManage && deletingAcademicYear && (
        <ConfirmModal
          isOpen={!!deletingAcademicYear}
          onClose={() => setDeletingAcademicYear(null)}
          onConfirm={() => deleteAcademicYear.mutate(deletingAcademicYear.id, { onSuccess: () => setDeletingAcademicYear(null) })}
          title={`Delete ${deletingAcademicYear.name}`}
          description="This will permanently remove this academic year."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteAcademicYear.isPending}
        />
      )}

    </div>
  );
}
