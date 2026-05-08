import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { createHomeworkSchema, updateHomeworkSchema, type CreateHomeworkPayload, type UpdateHomeworkPayload } from '../validations/homework.schema';

type Mode = 'create' | 'edit';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];

export function HomeworkForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<CreateHomeworkPayload & { id?: string; status?: UpdateHomeworkPayload['status'] }>;
  onSubmit: (values: CreateHomeworkPayload | UpdateHomeworkPayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<CreateHomeworkPayload | UpdateHomeworkPayload>({
    resolver: yupResolver(mode === 'create' ? createHomeworkSchema : updateHomeworkSchema),
    defaultValues: {
      title: '',
      description: '',
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
      attachments: [],
      ...(defaultValues ?? {}),
    } as any,
  });

  const errors = form.formState.errors as any;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Title" placeholder="e.g. Algebra Worksheet" {...form.register('title' as any)} />
          <SelectInput
            label="Subject"
            options={SUBJECTS.map((s) => ({ label: s, value: s }))}
            value={form.watch('subject' as any) as any}
            onChange={(e) => form.setValue('subject' as any, e.target.value as any, { shouldValidate: true })}
          />
          <SelectInput
            label="Class"
            options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
            value={form.watch('classId' as any) as any}
            onChange={(e) => form.setValue('classId' as any, e.target.value as any, { shouldValidate: true })}
          />
          <SelectInput
            label="Section"
            options={['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))}
            value={form.watch('section' as any) as any}
            onChange={(e) => form.setValue('section' as any, e.target.value as any, { shouldValidate: true })}
          />
          <Input label="Assigned Date" type="date" {...form.register('assignedDate' as any)} />
          <Input label="Due Date" type="date" {...form.register('dueDate' as any)} />
        </div>

        <div className="mt-4">
          <Textarea label="Description" rows={5} placeholder="Homework instructions..." {...form.register('description' as any)} />
        </div>

        {(errors?.title?.message ||
          errors?.description?.message ||
          errors?.classId?.message ||
          errors?.section?.message ||
          errors?.subject?.message ||
          errors?.assignedDate?.message ||
          errors?.dueDate?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {errors?.title?.message ??
              errors?.description?.message ??
              errors?.classId?.message ??
              errors?.section?.message ??
              errors?.subject?.message ??
              errors?.assignedDate?.message ??
              errors?.dueDate?.message}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
            {mode === 'create' ? 'Create Homework' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

