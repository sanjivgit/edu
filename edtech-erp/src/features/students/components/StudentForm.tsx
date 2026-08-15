import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  createStudentSchema,
  updateStudentSchema,
  type CreateStudentPayload,
  type UpdateStudentPayload,
} from '../validations/students.schema';

export function StudentForm({
  mode,
  defaultValues,
  isSubmitting = false,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateStudentPayload & { id?: string }>;
  isSubmitting?: boolean;
  onSubmit: (values: CreateStudentPayload | UpdateStudentPayload) => void;
}) {
  const form = useForm<CreateStudentPayload | UpdateStudentPayload>({
    resolver: yupResolver(mode === 'create' ? createStudentSchema : updateStudentSchema),
    defaultValues: {
      rollNo: '',
      name: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'male',
      address: '',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
      classId: '10',
      section: 'A',
      ...(defaultValues ?? {}),
    } as any,
  });

  const errors = form.formState.errors as any;

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Roll No" placeholder="e.g. R-1001" {...form.register('rollNo' as any)} />
        <Input label="Full Name" placeholder="e.g. Aarav Singh" {...form.register('name' as any)} />
        <SelectInput
          label="Gender"
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ]}
          value={form.watch('gender' as any) as any}
          onChange={(e) => form.setValue('gender' as any, e.target.value as any, { shouldValidate: true })}
        />
        <Input label="Date of Birth" type="date" {...form.register('dob' as any)} />
        <Input label="Email" type="email" placeholder="student@example.com" {...form.register('email' as any)} />
        <Input label="Phone" placeholder="10-digit mobile number" {...form.register('phone' as any)} />
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
          label="Status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Transferred', value: 'transferred' },
          ]}
          value={form.watch('status' as any) as any}
          onChange={(e) => form.setValue('status' as any, e.target.value as any, { shouldValidate: true })}
        />
        <Input label="Admission Date" type="date" {...form.register('admissionDate' as any)} />
      </div>

      <div className="mt-4">
        <Textarea label="Address (optional)" rows={3} {...form.register('address' as any)} />
      </div>

      {(errors?.rollNo?.message ||
        errors?.name?.message ||
        errors?.email?.message ||
        errors?.phone?.message ||
        errors?.gender?.message ||
        errors?.classId?.message ||
        errors?.section?.message ||
        errors?.status?.message) && (
        <div className="mt-3 text-sm text-red-600">
          {errors?.rollNo?.message ??
            errors?.name?.message ??
            errors?.email?.message ??
            errors?.phone?.message ??
            errors?.gender?.message ??
            errors?.classId?.message ??
            errors?.section?.message ??
            errors?.status?.message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={form.handleSubmit((v) => onSubmit(v as any))} isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Student' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}
