import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { createAlbumSchema, updateAlbumSchema, type CreateAlbumPayload, type UpdateAlbumPayload } from '../validations/gallery.schema';

type Mode = 'create' | 'edit';

const VISIBILITY = [
  { label: 'Public', value: 'public' },
  { label: 'Students', value: 'students' },
  { label: 'Parents', value: 'parents' },
  { label: 'Staff', value: 'staff' },
];

export function AlbumForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: Mode;
  defaultValues?: Partial<CreateAlbumPayload & { id?: string }>;
  onSubmit: (values: CreateAlbumPayload | UpdateAlbumPayload) => void;
  isSubmitting?: boolean;
}) {
  const form = useForm<CreateAlbumPayload | UpdateAlbumPayload>({
    resolver: yupResolver(mode === 'create' ? createAlbumSchema : updateAlbumSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      visibility: 'public',
      ...(defaultValues ?? {}),
    } as any,
  });

  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Album Title" placeholder="e.g. Annual Day 2026" {...form.register('title' as any)} />
        <Input label="Date" type="date" {...form.register('date' as any)} />
        <SelectInput
          label="Visibility"
          options={VISIBILITY}
          value={form.watch('visibility' as any) as any}
          onChange={(e) => form.setValue('visibility' as any, e.target.value as any, { shouldValidate: true })}
        />
      </div>

      <div className="mt-4">
        <Textarea label="Description (optional)" rows={4} placeholder="Album description..." {...form.register('description' as any)} />
      </div>

      {(errors?.title?.message || errors?.date?.message || errors?.visibility?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.title?.message ?? errors?.date?.message ?? errors?.visibility?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Album' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}

