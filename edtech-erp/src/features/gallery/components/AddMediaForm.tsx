import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { addMediaSchema, type AddMediaPayload } from '../validations/gallery.schema';

const TYPE_OPTIONS = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
];

export function AddMediaForm({
  albumId,
  onSubmit,
  isSubmitting = false,
}: {
  albumId: string;
  onSubmit: (values: AddMediaPayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<AddMediaPayload>({
    resolver: yupResolver(addMediaSchema),
    defaultValues: {
      albumId,
      type: 'image',
      url: '',
      caption: '',
    },
  });

  const errors = form.formState.errors as any;

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput
          label="Type"
          options={TYPE_OPTIONS}
          value={form.watch('type')}
          onChange={(e) => form.setValue('type', e.target.value as AddMediaPayload['type'], { shouldValidate: true })}
        />
        <Input label="Media URL" placeholder="Paste image/video URL" {...form.register('url')} />
        <Input label="Album" value={albumId} disabled />
      </div>
      <div className="mt-3">
        <Textarea label="Caption (optional)" rows={3} placeholder="Caption..." {...form.register('caption')} />
      </div>

      {(errors?.url?.message || errors?.type?.message) && (
        <div className="mt-3 text-sm text-red-600">{errors?.url?.message ?? errors?.type?.message}</div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)} isLoading={isSubmitting}>
          Upload
        </Button>
      </div>
    </Card>
  );
}

