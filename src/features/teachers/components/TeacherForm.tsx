import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createTeacherSchema, updateTeacherSchema, type CreateTeacherPayload, type UpdateTeacherPayload } from '../validations/teachers.schema';

export function TeacherForm({
  mode,
  defaultValues,
  isSubmitting = false,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateTeacherPayload & { id?: string }>;
  isSubmitting?: boolean;
  onSubmit: (values: CreateTeacherPayload | UpdateTeacherPayload) => void;
}) {
  const form = useForm<CreateTeacherPayload | UpdateTeacherPayload>({
    resolver: yupResolver(mode === 'create' ? createTeacherSchema : updateTeacherSchema),
    defaultValues: {
      fullName: '',
      employeeCode: '',
      subject: 'Mathematics',
      phone: '',
      email: '',
      classTeacherOf: '',
      status: 'active',
      ...(defaultValues ?? {}),
    } as any,
  });
  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Full Name" {...form.register('fullName' as any)} />
        <Input label="Employee Code" {...form.register('employeeCode' as any)} />
        <Input label="Subject" {...form.register('subject' as any)} />
        <Input label="Phone" {...form.register('phone' as any)} />
        <Input label="Email" type="email" {...form.register('email' as any)} />
        <Input label="Class Teacher Of" {...form.register('classTeacherOf' as any)} />
        <SelectInput label="Status" options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} value={form.watch('status' as any) as any} onChange={(e) => form.setValue('status' as any, e.target.value as any)} />
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>{mode === 'create' ? 'Create Teacher' : 'Save Changes'}</Button>
      </div>
    </Card>
  );
}

