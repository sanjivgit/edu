import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { diaryCreateSchema, diaryUpdateSchema, type DiaryCreatePayload, type DiaryUpdatePayload } from '../validations/diary.schema';

type Mode = 'create' | 'edit';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];
const VISIBILITY = [
  { label: 'Students', value: 'students' },
  { label: 'Parents', value: 'parents' },
  { label: 'Both', value: 'both' },
];

export function DiaryForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<DiaryCreatePayload & { id?: string; status?: DiaryUpdatePayload['status'] }>;
  onSubmit: (values: DiaryCreatePayload | DiaryUpdatePayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<DiaryCreatePayload | DiaryUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? diaryCreateSchema : diaryUpdateSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      author: '',
      title: '',
      content: '',
      visibility: 'both',
      tags: [],
      ...(defaultValues ?? {}),
    } as any,
  });

  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Date" type="date" {...form.register('date' as any)} />
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
        <SelectInput
          label="Subject"
          options={SUBJECTS.map((s) => ({ label: s, value: s }))}
          value={form.watch('subject' as any) as any}
          onChange={(e) => form.setValue('subject' as any, e.target.value as any, { shouldValidate: true })}
        />
        <Input label="Author" placeholder="e.g. Mr. Verma" {...form.register('author' as any)} />
        <SelectInput
          label="Visibility"
          options={VISIBILITY}
          value={form.watch('visibility' as any) as any}
          onChange={(e) => form.setValue('visibility' as any, e.target.value as any, { shouldValidate: true })}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <Input label="Title" placeholder="Entry title" {...form.register('title' as any)} />
        <Textarea label="Content" rows={7} placeholder="Write diary entry..." {...form.register('content' as any)} />
      </div>

      {(errors?.date?.message ||
        errors?.classId?.message ||
        errors?.section?.message ||
        errors?.subject?.message ||
        errors?.author?.message ||
        errors?.title?.message ||
        errors?.content?.message ||
        errors?.visibility?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.date?.message ??
            errors?.classId?.message ??
            errors?.section?.message ??
            errors?.subject?.message ??
            errors?.author?.message ??
            errors?.title?.message ??
            errors?.content?.message ??
            errors?.visibility?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Entry' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

