import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { createSubjectSchema, updateSubjectSchema, type CreateSubjectPayload, type UpdateSubjectPayload } from '../validations/subjects.schema';

type Mode = 'create' | 'edit';

const CATEGORY_OPTIONS = [
  { label: 'Core', value: 'core' },
  { label: 'Language', value: 'language' },
  { label: 'Elective', value: 'elective' },
  { label: 'Lab', value: 'lab' },
  { label: 'Sports', value: 'sports' },
  { label: 'Arts', value: 'arts' },
];

export function SubjectForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<CreateSubjectPayload & { id?: string; isActive?: boolean }>;
  onSubmit: (values: CreateSubjectPayload | UpdateSubjectPayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<CreateSubjectPayload | UpdateSubjectPayload>({
    resolver: yupResolver(mode === 'create' ? createSubjectSchema : updateSubjectSchema),
    defaultValues: {
      name: '',
      code: '',
      category: 'core',
      classId: '10',
      weeklyPeriods: 4,
      teacher: '',
      isActive: true,
      ...(defaultValues ?? {}),
    } as any,
  });

  useEffect(() => {
    if (!defaultValues) return;
    form.reset({ ...(form.getValues() as any), ...(defaultValues as any) });
  }, [defaultValues, form]);

  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Subject Name" placeholder="e.g. Mathematics" {...form.register('name' as any)} />
        <Input label="Subject Code" placeholder="e.g. MATH-10" {...form.register('code' as any)} />
        <SelectInput
          label="Category"
          options={CATEGORY_OPTIONS}
          value={form.watch('category' as any) as any}
          onChange={(e) => form.setValue('category' as any, e.target.value as any, { shouldValidate: true })}
        />
        <SelectInput
          label="Class"
          options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
          value={form.watch('classId' as any) as any}
          onChange={(e) => form.setValue('classId' as any, e.target.value as any, { shouldValidate: true })}
        />
        <Input label="Weekly Periods" type="number" {...form.register('weeklyPeriods' as any)} />
        <Input label="Teacher" placeholder="e.g. Mr. Verma" {...form.register('teacher' as any)} />
      </div>

      {(errors?.name?.message ||
        errors?.code?.message ||
        errors?.category?.message ||
        errors?.classId?.message ||
        errors?.weeklyPeriods?.message ||
        errors?.teacher?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.name?.message ??
            errors?.code?.message ??
            errors?.category?.message ??
            errors?.classId?.message ??
            errors?.weeklyPeriods?.message ??
            errors?.teacher?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Subject' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

