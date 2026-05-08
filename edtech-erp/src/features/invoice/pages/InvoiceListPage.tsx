import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useGetInvoices, useDeleteInvoice } from '../services/invoice.service';
import { InvoiceTable } from '../components/InvoiceTable';

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const listQuery = useGetInvoices();
  const deleteMutation = useDeleteInvoice();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Management"
        description="Manage and generate student fee invoices"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/invoice/create')}>
            Create Invoice
          </Button>
        }
      />

      <InvoiceTable
        data={data}
        isLoading={listQuery.isLoading}
        onView={(row) => navigate(`/invoice/${row.id}`)}
        onEdit={(row) => navigate(`/invoice/${row.id}/edit`)}
        onDelete={(row) => deleteMutation.mutate({ id: row.id })}
      />
    </div>
  );
}

