import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';
import { RecordInvoicePaymentForm } from '../components/RecordInvoicePaymentForm';
import { getInvoiceTotals, useGetInvoiceById } from '../services/invoice.service';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const detailQuery = useGetInvoiceById({ invoiceId });
  const invoice = detailQuery.data;

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoice Details"
          description="Invoice information and payment status"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Details"
        description="Invoice information and payment status"
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/invoice')}>
              Back
            </Button>
            <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/invoice/${invoice.id}/edit`)}>
              Edit
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Invoice No</p>
            <p className="text-sm font-semibold">{invoice.invoiceNo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Student</p>
            <p className="text-sm font-semibold">{invoice.student}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="text-sm font-semibold">{`Class ${invoice.classId}-${invoice.section}`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Issue Date</p>
            <p className="text-sm font-semibold">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="text-sm font-semibold">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-semibold font-mono">₹{t.total}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-semibold font-mono">₹{t.balance}</p>
          </div>
        </div>
      </Card>

      <InvoiceItemsTable items={invoice.items} onChange={() => {}} readOnly />

      {t.balance > 0 && <RecordInvoicePaymentForm invoiceId={invoice.id} maxAmount={t.balance} />}
    </div>
  );
}

