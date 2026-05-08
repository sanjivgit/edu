import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { holidayCreateSchema, holidayUpdateSchema, type HolidayCreatePayload, type HolidayUpdatePayload } from '../validations/holidays.schema';

type Mode = 'create' | 'edit';

const TYPE_OPTIONS = [
  { label: 'Holiday', value: 'holiday' },
  { label: 'Event', value: 'event' },
  { label: 'Exam', value: 'exam' },
  { label: 'Closure', value: 'closure' },
];

const APPLIES_TO = [
  { label: 'All', value: 'all' },
  { label: 'Students', value: 'students' },
  { label: 'Staff', value: 'staff' },
];

export function HolidayForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<HolidayCreatePayload & { id?: string; status?: HolidayUpdatePayload['status'] }>;
  onSubmit: (values: HolidayCreatePayload | HolidayUpdatePayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<HolidayCreatePayload | HolidayUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? holidayCreateSchema : holidayUpdateSchema),
    defaultValues: {
      title: '',
      type: 'holiday',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isFullDay: true,
      description: '',
      appliesTo: 'all',
      ...(defaultValues ?? {}),
    } as any,
  });

  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Title" placeholder="e.g. Independence Day" {...form.register('title' as any)} />
        <SelectInput
          label="Type"
          options={TYPE_OPTIONS}
          value={form.watch('type' as any) as any}
          onChange={(e) => form.setValue('type' as any, e.target.value as any, { shouldValidate: true })}
        />
        <SelectInput
          label="Applies To"
          options={APPLIES_TO}
          value={form.watch('appliesTo' as any) as any}
          onChange={(e) => form.setValue('appliesTo' as any, e.target.value as any, { shouldValidate: true })}
        />
        <Input label="Start Date" type="date" {...form.register('startDate' as any)} />
        <Input label="End Date" type="date" {...form.register('endDate' as any)} />
      </div>

      <div className="mt-4">
        <Textarea label="Description (optional)" rows={4} placeholder="Add any details..." {...form.register('description' as any)} />
      </div>

      {(errors?.title?.message ||
        errors?.type?.message ||
        errors?.startDate?.message ||
        errors?.endDate?.message ||
        errors?.appliesTo?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.title?.message ??
            errors?.type?.message ??
            errors?.startDate?.message ??
            errors?.endDate?.message ??
            errors?.appliesTo?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Holiday' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

