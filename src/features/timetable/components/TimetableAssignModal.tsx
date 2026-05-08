import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, SelectInput } from '@/components/ui/Input';
import { useAssignTimetableCell } from '../services/timetable.service';
import { timetableAssignSchema, type TimetableAssignPayload } from '../validations/timetable.schema';
import { useGetTeachers } from '@/features/teachers/services/teachers.service';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];

export function TimetableAssignModal({
  isOpen,
  onClose,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: TimetableAssignPayload;
}) {
  const form = useForm<TimetableAssignPayload>({
    resolver: yupResolver(timetableAssignSchema),
    defaultValues,
  });
  const assignMutation = useAssignTimetableCell();
  const teachersQuery = useGetTeachers();
  const teacherOptions = (teachersQuery.data ?? []).filter((t) => t.status === 'active').map((t) => ({ label: t.fullName, value: t.fullName }));

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Period"
      description="Quickly update subject and teacher for the selected slot"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            isLoading={assignMutation.isPending}
            onClick={form.handleSubmit((values) =>
              assignMutation.mutate(values, {
                onSuccess: onClose,
              })
            )}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput label="Subject" options={SUBJECTS.map((s) => ({ label: s, value: s }))} value={form.watch('subject')} onChange={(e) => form.setValue('subject', e.target.value, { shouldValidate: true })} />
        <SelectInput label="Teacher" options={teacherOptions} value={form.watch('teacher')} onChange={(e) => form.setValue('teacher', e.target.value, { shouldValidate: true })} />
        <Input label="Day" value={form.watch('day')} disabled />
        <Input label="Period" value={`P${form.watch('periodId')}`} disabled />
      </div>
    </Modal>
  );
}

