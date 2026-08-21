import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { useGetAcademicYears } from '@/features/classes/services/classes.service';
import { ExamPapersTable } from './ExamPapersTable';
import { examCreateSchema, examUpdateSchema, type ExamCreatePayload, type ExamUpdatePayload } from '../validations/exam.schema';
import type { ExamPaper } from '../services/exam.service';

type Mode = 'create' | 'edit';

const TERM_OPTIONS = [
  { label: 'Term 1', value: 'term-1' },
  { label: 'Term 2', value: 'term-2' },
  { label: 'Final', value: 'final' },
];

function validatePapers(papers: ExamPaper[]): string | null {
  if (papers.length === 0) return 'Add at least one exam paper';
  for (let i = 0; i < papers.length; i++) {
    const p = papers[i];
    if (!p.subject?.trim()) return `Paper ${i + 1}: Subject is required`;
    if (!p.date) return `Paper ${i + 1}: Date is required`;
    if (!p.startTime) return `Paper ${i + 1}: Start time is required`;
    if (!p.durationMinutes || p.durationMinutes < 15) return `Paper ${i + 1}: Duration must be at least 15 minutes`;
    if (!p.totalMarks || p.totalMarks < 1) return `Paper ${i + 1}: Total marks must be at least 1`;
  }
  return null;
}

export function ExamForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<ExamCreatePayload & { id?: string; status?: ExamUpdatePayload['status']; papers?: ExamPaper[] }>;
  onSubmit: (values: ExamCreatePayload | ExamUpdatePayload, papers: ExamPaper[]) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<ExamCreatePayload | ExamUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? examCreateSchema : examUpdateSchema),
    defaultValues: {
      name: '',
      term: 'term-1',
      classId: '10',
      section: 'A',
      papers: [],
      notes: '',
      ...(defaultValues ?? {}),
    } as any,
  });

  const [papers, setPapers] = useState<ExamPaper[]>(
    (defaultValues?.papers as ExamPaper[] | undefined) ?? [
      { subject: 'Mathematics', date: new Date().toISOString().split('T')[0], startTime: '09:30', durationMinutes: 90, totalMarks: 100 },
    ]
  );

  const [paperError, setPaperError] = useState<string | null>(null);
  const paperCount = useMemo(() => papers.length, [papers]);
  const errors = form.formState.errors as any;
  const { data: academicYears = [] } = useGetAcademicYears();

  const handlePapersChange = (updated: ExamPaper[]) => {
    setPapers(updated);
    if (paperError) setPaperError(null);
  };

  const handleSubmit = () => {
    const pErr = validatePapers(papers);
    if (pErr) {
      setPaperError(pErr);
      return;
    }
    setPaperError(null);
    form.handleSubmit((v) => onSubmit(v as any, papers))();
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Exam Name" placeholder="e.g. Term 1 Examination" {...form.register('name' as any)} />
          <SelectInput
            label="Term"
            options={TERM_OPTIONS}
            value={form.watch('term' as any) as any}
            onChange={(e) => form.setValue('term' as any, e.target.value as any, { shouldValidate: true })}
          />
          <Input label="Papers" value={String(paperCount)} disabled />
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
        </div>

        <div className="mt-4">
          <Textarea label="Notes (optional)" rows={3} placeholder="Any instructions..." {...form.register('notes' as any)} />
        </div>

        {(errors?.name?.message || errors?.term?.message || errors?.classId?.message || errors?.section?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {errors?.name?.message ?? errors?.term?.message ?? errors?.classId?.message ?? errors?.section?.message}
          </div>
        )}

        {paperError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {paperError}
          </div>
        )}
      </Card>

      <ExamPapersTable papers={papers} onChange={handlePapersChange} />

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={isSubmitting}>
          {mode === 'create' ? 'Schedule Exam' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

