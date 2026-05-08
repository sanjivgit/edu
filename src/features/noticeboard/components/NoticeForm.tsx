import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import {
  noticeCreateSchema,
  noticeUpdateSchema,
  type NoticeCreatePayload,
  type NoticeUpdatePayload,
} from '../validations/noticeboard.schema';

type Mode = 'create' | 'edit';

const CATEGORY_OPTIONS = [
  { label: 'General', value: 'general' },
  { label: 'Academic', value: 'academic' },
  { label: 'Event', value: 'event' },
  { label: 'Urgent', value: 'urgent' },
];

const AUDIENCE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Class', value: 'class' },
  { label: 'Staff', value: 'staff' },
  { label: 'Parents', value: 'parents' },
];

export function NoticeForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<NoticeCreatePayload & { id?: string }>;
  onSubmit: (values: NoticeCreatePayload | NoticeUpdatePayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<NoticeCreatePayload | NoticeUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? noticeCreateSchema : noticeUpdateSchema),
    defaultValues: {
      title: '',
      message: '',
      category: 'general',
      publishAt: new Date().toISOString().split('T')[0],
      expireAt: '',
      audience: { scope: 'all', classId: '', section: '' },
      status: 'draft',
      ...(defaultValues ?? {}),
    } as any,
  });

  const scope = (form.watch('audience.scope' as any) as any) ?? 'all';
  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Title" placeholder="Notice title" {...form.register('title' as any)} />
        <SelectInput
          label="Category"
          options={CATEGORY_OPTIONS}
          value={form.watch('category' as any) as any}
          onChange={(e) => form.setValue('category' as any, e.target.value as any, { shouldValidate: true })}
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

        <Input label="Publish Date" type="date" {...form.register('publishAt' as any)} />
        <Input label="Expire Date (optional)" type="date" {...form.register('expireAt' as any)} />
        <SelectInput
          label="Audience"
          options={AUDIENCE_OPTIONS}
          value={scope}
          onChange={(e) => form.setValue('audience.scope' as any, e.target.value as any, { shouldValidate: true })}
        />

        {scope === 'class' && (
          <>
            <SelectInput
              label="Class"
              options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
              value={(form.watch('audience.classId' as any) as any) ?? '10'}
              onChange={(e) => form.setValue('audience.classId' as any, e.target.value as any, { shouldValidate: true })}
            />
            <SelectInput
              label="Section"
              options={['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))}
              value={(form.watch('audience.section' as any) as any) ?? 'A'}
              onChange={(e) => form.setValue('audience.section' as any, e.target.value as any, { shouldValidate: true })}
            />
          </>
        )}
      </div>

      <div className="mt-4">
        <Textarea label="Message" rows={6} placeholder="Write your notice..." {...form.register('message' as any)} />
      </div>

      {(errors?.title?.message || errors?.message?.message || errors?.category?.message || errors?.publishAt?.message || errors?.audience?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.title?.message ?? errors?.message?.message ?? errors?.category?.message ?? errors?.publishAt?.message ?? errors?.audience?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Notice' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

