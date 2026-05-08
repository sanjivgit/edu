import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import {
  notificationCreateSchema,
  notificationUpdateSchema,
  type NotificationCreatePayload,
  type NotificationUpdatePayload,
} from '../validations/notifications.schema';

type Mode = 'create' | 'edit';

const CHANNEL_OPTIONS = [
  { label: 'In-App', value: 'in-app' },
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'WhatsApp', value: 'whatsapp' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
];

const AUDIENCE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Class', value: 'class' },
  { label: 'Staff', value: 'staff' },
  { label: 'Parents', value: 'parents' },
];

export function NotificationForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<NotificationCreatePayload & { id?: string; status?: NotificationUpdatePayload['status'] }>;
  onSubmit: (values: NotificationCreatePayload | NotificationUpdatePayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<NotificationCreatePayload | NotificationUpdatePayload>({
    resolver: yupResolver(mode === 'create' ? notificationCreateSchema : notificationUpdateSchema),
    defaultValues: {
      title: '',
      message: '',
      channel: 'in-app',
      priority: 'normal',
      audience: 'all',
      classId: '',
      section: '',
      scheduleAt: '',
      ...(defaultValues ?? {}),
    } as any,
  });

  const audience = (form.watch('audience' as any) as any) ?? 'all';
  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Title" placeholder="Notification title" {...form.register('title' as any)} />
        <SelectInput
          label="Channel"
          options={CHANNEL_OPTIONS}
          value={form.watch('channel' as any) as any}
          onChange={(e) => form.setValue('channel' as any, e.target.value as any, { shouldValidate: true })}
        />
        <SelectInput
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={form.watch('priority' as any) as any}
          onChange={(e) => form.setValue('priority' as any, e.target.value as any, { shouldValidate: true })}
        />
        <SelectInput
          label="Audience"
          options={AUDIENCE_OPTIONS}
          value={audience}
          onChange={(e) => form.setValue('audience' as any, e.target.value as any, { shouldValidate: true })}
        />
        {audience === 'class' && (
          <>
            <SelectInput
              label="Class"
              options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
              value={(form.watch('classId' as any) as any) ?? '10'}
              onChange={(e) => form.setValue('classId' as any, e.target.value as any, { shouldValidate: true })}
            />
            <SelectInput
              label="Section"
              options={['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))}
              value={(form.watch('section' as any) as any) ?? 'A'}
              onChange={(e) => form.setValue('section' as any, e.target.value as any, { shouldValidate: true })}
            />
          </>
        )}
        <Input label="Schedule Date (optional)" type="date" {...form.register('scheduleAt' as any)} />
      </div>

      <div className="mt-4">
        <Textarea label="Message" rows={6} placeholder="Write the notification message..." {...form.register('message' as any)} />
      </div>

      {(errors?.title?.message ||
        errors?.message?.message ||
        errors?.channel?.message ||
        errors?.priority?.message ||
        errors?.audience?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.title?.message ??
            errors?.message?.message ??
            errors?.channel?.message ??
            errors?.priority?.message ??
            errors?.audience?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Notification' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

