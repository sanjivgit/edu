import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { ClassItem, SectionItem } from '../services/classes.service';
import { sectionCreateSchema, sectionUpdateSchema, type SectionCreatePayload } from '../validations/classes.schema';

interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  teacherOptions?: string[];
  editingSection?: SectionItem | null;
  onCreate: (payload: Omit<SectionItem, 'id' | 'className' | 'status'>) => void;
  onUpdate: (sectionId: string, payload: Pick<SectionItem, 'classId' | 'name' | 'roomNo' | 'sectionTeacher' | 'students' | 'status'>) => void;
  isLoading?: boolean;
}

export function SectionFormModal({
  isOpen,
  onClose,
  classes,
  teacherOptions = [],
  editingSection = null,
  onCreate,
  onUpdate,
  isLoading = false,
}: SectionFormModalProps) {
  const isEdit = !!editingSection;
  const form = useForm<SectionCreatePayload & { status?: 'active' | 'inactive' }>({
    resolver: yupResolver(isEdit ? sectionUpdateSchema : sectionCreateSchema),
    defaultValues: {
      classId: '',
      name: '',
      roomNo: '',
      sectionTeacher: '',
      students: 0,
      status: 'active',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      classId: editingSection?.classId ?? '',
      name: editingSection?.name ?? '',
      roomNo: editingSection?.roomNo ?? '',
      sectionTeacher: editingSection?.sectionTeacher ?? '',
      students: editingSection?.students ?? 0,
      status: editingSection?.status ?? 'active',
    });
  }, [isOpen, editingSection, form]);

  const submit = form.handleSubmit((values) => {
    const payload = {
      classId: values.classId,
      name: values.name.toUpperCase(),
      roomNo: values.roomNo || '',
      sectionTeacher: values.sectionTeacher,
      students: Number(values.students),
      status: values.status ?? 'active',
    };
    if (isEdit && editingSection) {
      onUpdate(editingSection.id, payload);
      return;
    }
    onCreate(payload);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Update Section' : 'Add New Section'}
      description="Create or update a section under a class."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isLoading}>
            {isEdit ? 'Update Section' : 'Save Section'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectInput
          label="Class"
          options={classes.map((item) => ({ label: item.name, value: item.id }))}
          placeholder="Select class"
          value={form.watch('classId')}
          onChange={(event) => form.setValue('classId', event.target.value)}
          error={form.formState.errors.classId?.message}
        />
        <Input label="Section Name" required {...form.register('name')} error={form.formState.errors.name?.message} />
        <SelectInput
          label="Section Teacher"
          required
          options={(teacherOptions.length ? teacherOptions : [editingSection?.sectionTeacher ?? '']).filter(Boolean).map((teacher) => ({ label: teacher, value: teacher }))}
          value={form.watch('sectionTeacher')}
          onChange={(event) => form.setValue('sectionTeacher', event.target.value, { shouldValidate: true })}
          error={form.formState.errors.sectionTeacher?.message}
          placeholder="Select section teacher"
        />
        <Input label="Room No" {...form.register('roomNo')} error={form.formState.errors.roomNo?.message} />
        <Input label="Students in Section" type="number" min={0} {...form.register('students')} error={form.formState.errors.students?.message} />
        {isEdit && (
          <SelectInput
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={form.watch('status')}
            onChange={(event) => form.setValue('status', event.target.value as 'active' | 'inactive')}
          />
        )}
      </div>
    </Modal>
  );
}
