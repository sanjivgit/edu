import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { SyllabusAttachmentsTable } from './SyllabusAttachmentsTable';
import { createSyllabusSchema, updateSyllabusSchema, type CreateSyllabusPayload, type UpdateSyllabusPayload } from '../validations/syllabus.schema';
import type { SyllabusAttachment } from '../services/syllabus.service';

type Mode = 'create' | 'edit';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Computer', 'PE', 'Art'];
const TERM_OPTIONS = [
  { label: 'Term 1', value: 'term-1' },
  { label: 'Term 2', value: 'term-2' },
  { label: 'Final', value: 'final' },
];

export function SyllabusForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<CreateSyllabusPayload & { id?: string }>;
  onSubmit: (values: CreateSyllabusPayload | UpdateSyllabusPayload, attachments: SyllabusAttachment[]) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<CreateSyllabusPayload | UpdateSyllabusPayload>({
    resolver: yupResolver(mode === 'create' ? createSyllabusSchema : updateSyllabusSchema),
    defaultValues: {
      title: '',
      classId: '10',
      section: 'A',
      subject: 'Mathematics',
      term: 'term-1',
      description: '',
      attachments: [],
      status: 'draft',
      ...(defaultValues ?? {}),
    } as any,
  });

  const [attachments, setAttachments] = useState<SyllabusAttachment[]>(
    (defaultValues?.attachments as SyllabusAttachment[] | undefined) ?? [{ name: 'Syllabus.pdf', url: 'https://example.com/syllabus.pdf' }]
  );

  const fileCount = useMemo(() => attachments.length, [attachments]);
  const errors = form.formState.errors as any;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Title" placeholder="e.g. Class 10 Mathematics — Term 1" {...form.register('title' as any)} />
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
          <SelectInput
            label="Term"
            options={TERM_OPTIONS}
            value={form.watch('term' as any) as any}
            onChange={(e) => form.setValue('term' as any, e.target.value as any, { shouldValidate: true })}
          />
          <SelectInput
            label="Status"
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
            ]}
            value={form.watch('status' as any) as any}
            onChange={(e) => form.setValue('status' as any, e.target.value as any, { shouldValidate: true })}
          />
          <Input label="Files" value={String(fileCount)} disabled />
        </div>

        <div className="mt-4">
          <Textarea label="Description (optional)" rows={4} placeholder="Syllabus overview..." {...form.register('description' as any)} />
        </div>

        {(errors?.title?.message ||
          errors?.classId?.message ||
          errors?.section?.message ||
          errors?.subject?.message ||
          errors?.term?.message ||
          errors?.status?.message ||
          errors?.attachments?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {errors?.title?.message ??
              errors?.classId?.message ??
              errors?.section?.message ??
              errors?.subject?.message ??
              errors?.term?.message ??
              errors?.status?.message ??
              errors?.attachments?.message}
          </div>
        )}
      </Card>

      <SyllabusAttachmentsTable items={attachments} onChange={setAttachments} />

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any, attachments))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Syllabus' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

