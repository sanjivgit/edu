import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, SelectInput } from '@/components/ui/Input';
import { updateInvoiceSchema, type UpdateInvoicePayload } from '../validations/invoice.schema';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';
import { getInvoiceTotals, useGetInvoiceById, useUpdateInvoice, type InvoiceItem } from '../services/invoice.service';

export default function InvoiceEditPage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const detailQuery = useGetInvoiceById({ invoiceId });
  const invoice = detailQuery.data;
  const updateMutation = useUpdateInvoice();

  const form = useForm<UpdateInvoicePayload>({
    resolver: yupResolver(updateInvoiceSchema),
    defaultValues: {
      id: invoiceId ?? '',
      student: '',
      classId: '10',
      section: 'A',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
      items: [{ description: 'Tuition Fee - April', quantity: 1, unitPrice: 2500 }],
      notes: '',
      status: 'issued',
    },
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (!invoice) return;
    form.reset({
      id: invoice.id,
      student: invoice.student,
      classId: invoice.classId,
      section: invoice.section,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      items: invoice.items as unknown as UpdateInvoicePayload['items'],
      notes: invoice.notes ?? '',
      status: invoice.status,
    });
    setItems(invoice.items);
  }, [invoice, form]);

  const totals = useMemo(() => items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0), [items]);

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Invoice"
          description="Update invoice details and line items"
          actions={
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/invoice')}>
              Back
            </Button>
          }
        />
        <Card>
          <div className="text-sm text-muted-foreground">{detailQuery.isLoading ? 'Loading...' : 'Invoice not found.'}</div>
        </Card>
      </div>
    );
  }

  const t = getInvoiceTotals(invoice);

  const onSubmit = (values: UpdateInvoicePayload) => {
    updateMutation.mutate(
      {
        id: values.id,
        student: values.student,
        classId: values.classId,
        section: values.section,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        status: values.status,
        items,
        notes: values.notes ?? '',
      },
      {
        onSuccess: (updated) => navigate(`/invoice/${updated.id}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Invoice"
        description="Update invoice details and line items"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(`/invoice/${invoice.id}`)}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={form.handleSubmit(onSubmit)} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="Student (Roll No / Name)" {...form.register('student')} />
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
          <SelectInput
            label="Status"
            options={['draft', 'issued', 'paid', 'overdue', 'cancelled'].map((s) => ({ label: s.toUpperCase(), value: s }))}
            value={form.watch('status')}
            onChange={(e) => form.setValue('status', e.target.value as UpdateInvoicePayload['status'], { shouldValidate: true })}
          />
          <Input label="Issue Date" type="date" {...form.register('issueDate')} />
          <Input label="Due Date" type="date" {...form.register('dueDate')} />
          <Input label="Total" value={`₹${totals}`} disabled />
          <Input label="Current Balance" value={`₹${t.balance}`} disabled />
        </div>
      </Card>

      <InvoiceItemsTable items={items} onChange={setItems} />

      <Card className="p-5">
        <Input label="Notes (optional)" {...form.register('notes')} />
      </Card>
    </div>
  );
}

