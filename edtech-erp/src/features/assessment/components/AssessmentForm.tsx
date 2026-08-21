import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import {
  assessmentCreateSchema,
  assessmentUpdateSchema,
  type AssessmentCreatePayload,
  type AssessmentUpdatePayload,
} from '../validations/assessment.schema';

type Mode = 'create' | 'edit';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];
const TYPES = [
  { label: 'Quiz', value: 'quiz' },
  { label: 'Assignment', value: 'assignment' },
  { label: 'Unit Test', value: 'unit-test' },
  { label: 'Project', value: 'project' },
];

export function AssessmentForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<AssessmentCreatePayload & { id?: string; status?: AssessmentUpdatePayload['status'] }>;
  onSubmit: (values: AssessmentCreatePayload | AssessmentUpdatePayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<AssessmentCreatePayload | AssessmentUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? assessmentCreateSchema : assessmentUpdateSchema),
    defaultValues: {
      academicYearId: '',
      title: '',
      type: 'quiz',
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      totalMarks: 20,
      date: new Date().toISOString().split('T')[0],
      instructions: '',
      ...(defaultValues ?? {}),
    } as any,
  });

  const errors = form.formState.errors as any;
  const { data: academicYears = [] } = useGetAcademicYears();

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Title" placeholder="e.g. Math Quiz - Algebra" {...form.register('title' as any)} />
        <SelectInput
          label="Type"
          options={TYPES}
          value={form.watch('type' as any) as any}
          onChange={(e) => form.setValue('type' as any, e.target.value as any, { shouldValidate: true })}
        />
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
        <SelectInput
          label="Academic Year"
          options={academicYears.map((y) => ({ label: y.name, value: y.id }))}
          value={(form.watch('academicYearId' as any) as string) ?? ''}
          onChange={(e) => form.setValue('academicYearId' as any, e.target.value || null, { shouldValidate: true })}
        />
        <Input label="Total Marks" type="number" {...form.register('totalMarks' as any)} />
        <Input label="Date" type="date" {...form.register('date' as any)} />
      </div>

      <div className="mt-4">
        <Textarea label="Instructions (optional)" rows={4} placeholder="Any instructions..." {...form.register('instructions' as any)} />
      </div>

      {(errors?.title?.message ||
        errors?.type?.message ||
        errors?.classId?.message ||
        errors?.section?.message ||
        errors?.subject?.message ||
        errors?.totalMarks?.message ||
        errors?.date?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.title?.message ??
            errors?.type?.message ??
            errors?.classId?.message ??
            errors?.section?.message ??
            errors?.subject?.message ??
            errors?.totalMarks?.message ??
            errors?.date?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Assessment' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

