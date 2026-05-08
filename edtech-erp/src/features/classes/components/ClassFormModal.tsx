import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Input, SelectInput } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { ClassItem } from '../services/classes.service';
import { classCreateSchema, classUpdateSchema, type ClassCreatePayload } from '../validations/classes.schema';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherOptions?: string[];
  onCreate: (payload: Omit<ClassItem, 'id' | 'students' | 'status'>) => void;
  onUpdate: (classId: string, payload: Pick<ClassItem, 'name' | 'code' | 'classTeacher' | 'sections' | 'capacity' | 'status'>) => void;
  editingClass?: ClassItem | null;
  isLoading?: boolean;
}

export function ClassFormModal({
  isOpen,
  onClose,
  teacherOptions = [],
  onCreate,
  onUpdate,
  editingClass = null,
  isLoading = false,
}: ClassFormModalProps) {
  const isEdit = !!editingClass;
  const form = useForm<ClassCreatePayload & { status?: 'active' | 'inactive' }>({
    resolver: yupResolver(isEdit ? classUpdateSchema : classCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      classTeacher: '',
      sections: 1,
      capacity: 35,
      status: 'active',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      name: editingClass?.name ?? '',
      code: editingClass?.code ?? '',
      classTeacher: editingClass?.classTeacher ?? '',
      sections: editingClass?.sections ?? 1,
      capacity: editingClass?.capacity ?? 35,
      status: editingClass?.status ?? 'active',
    });
  }, [isOpen, editingClass, form]);

  const submit = form.handleSubmit((values) => {
    if (isEdit && editingClass) {
      onUpdate(editingClass.id, {
        name: values.name,
        code: values.code.toUpperCase(),
        classTeacher: values.classTeacher,
        sections: Number(values.sections),
        capacity: Number(values.capacity),
        status: values.status ?? 'active',
      });
      return;
    }
    onCreate({
      name: values.name,
      code: values.code.toUpperCase(),
      classTeacher: values.classTeacher,
      sections: Number(values.sections),
      capacity: Number(values.capacity),
    });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Update Class' : 'Add New Class'}
      description="Create or update class details."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isLoading}>
            {isEdit ? 'Update Class' : 'Save Class'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Class Name" required {...form.register('name')} error={form.formState.errors.name?.message} />
        <Input label="Class Code" required {...form.register('code')} error={form.formState.errors.code?.message} />
        <SelectInput
          label="Class Teacher"
          required
          options={(teacherOptions.length ? teacherOptions : [editingClass?.classTeacher ?? '']).filter(Boolean).map((teacher) => ({ label: teacher, value: teacher }))}
          value={form.watch('classTeacher')}
          onChange={(event) => form.setValue('classTeacher', event.target.value, { shouldValidate: true })}
          error={form.formState.errors.classTeacher?.message}
          placeholder="Select teacher"
        />
        <Input label="Total Capacity" type="number" min={1} required {...form.register('capacity')} error={form.formState.errors.capacity?.message} />
        <Input label="Sections" type="number" min={1} required {...form.register('sections')} error={form.formState.errors.sections?.message} />
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
