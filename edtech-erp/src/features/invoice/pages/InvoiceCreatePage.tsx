import { ArrowLeft, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { createInvoiceSchema, type CreateInvoicePayload } from '../validations/invoice.schema';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';
import { useCreateInvoice, type InvoiceItem } from '../services/invoice.service';

export default function InvoiceCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateInvoice();

  const form = useForm<CreateInvoicePayload>({
    resolver: yupResolver(createInvoiceSchema),
    defaultValues: {
      student: '',
      classId: '10',
      section: 'A',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
      items: [{ description: 'Tuition Fee - April', quantity: 1, unitPrice: 2500 }],
      notes: '',
    },
  });

  const [items, setItems] = useState<InvoiceItem[]>(form.getValues('items') as InvoiceItem[]);

  const totals = useMemo(() => items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0), [items]);

  const onSubmit = (values: CreateInvoicePayload) => {
    createMutation.mutate(
      {
        student: values.student,
        classId: values.classId,
        section: values.section,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        items,
        notes: values.notes ?? '',
      },
      {
        onSuccess: (created) => navigate(`/invoice/${created.id}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Invoice"
        description="Generate a new student invoice"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/invoice')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={form.handleSubmit(onSubmit)} isLoading={createMutation.isPending}>
              Save Invoice
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Student (Roll No / Name)" placeholder="e.g. Aarav Sharma (010)" {...form.register('student')} />
          <SelectInput
            label="Class"
            options={Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: `${i + 1}` }))}
            value={form.watch('classId')}
            onChange={(e) => form.setValue('classId', e.target.value, { shouldValidate: true })}
          />
          <SelectInput
            label="Section"
            options={['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, value: s }))}
            value={form.watch('section')}
            onChange={(e) => form.setValue('section', e.target.value, { shouldValidate: true })}
          />
          <Input label="Issue Date" type="date" {...form.register('issueDate')} />
          <Input label="Due Date" type="date" {...form.register('dueDate')} />
          <Input label="Total" value={`₹${totals}`} disabled />
        </div>

        {(form.formState.errors.student?.message ||
          form.formState.errors.classId?.message ||
          form.formState.errors.section?.message ||
          form.formState.errors.issueDate?.message ||
          form.formState.errors.dueDate?.message ||
          form.formState.errors.items?.message) && (
          <div className="mt-3 text-sm text-red-600">
            {form.formState.errors.student?.message ??
              form.formState.errors.classId?.message ??
              form.formState.errors.section?.message ??
              form.formState.errors.issueDate?.message ??
              form.formState.errors.dueDate?.message ??
              (form.formState.errors.items as { message?: string } | undefined)?.message}
          </div>
        )}
      </Card>

      <InvoiceItemsTable items={items} onChange={setItems} />

      <Card className="p-5">
        <Input label="Notes (optional)" placeholder="Any note for the parent/student..." {...form.register('notes')} />
      </Card>
    </div>
  );
}

