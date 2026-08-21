import { ArrowLeft, CreditCard, QrCode, Smartphone, CheckCircle, Clock, AlertCircle, Copy } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks';
import { useGetStudentPaymentHistory, useRecordDirectPayment } from '@/features/fees/services/fees.service';
import type { StudentPaymentHistory } from '@/features/fees/services/fees.service';

interface RazorpayResponse {
  razorpay_payment_id: string;
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const UPI_ID = import.meta.env.VITE_SCHOOL_UPI_ID || 'school@upi';
const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || 'School ERP';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function buildUpiUrl(amount: number, feeName: string, studentName: string): string {
  const tn = `${feeName} - ${studentName}`;
  return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(SCHOOL_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(tn)}`;
}

function buildQrApiUrl(upiUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&format=png`;
}

export default function ParentFeeDetailPage() {
  const navigate = useNavigate();
  const { id: studentId } = useParams();
  const { success, error: showError } = useToast();
  const historyQuery = useGetStudentPaymentHistory(studentId ?? '');
  const recordPaymentMutation = useRecordDirectPayment();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<{ id: string; amount: number; feeType: string; feeName?: string } | null>(null);
  const [payMethod, setPayMethod] = useState<'razorpay' | 'qr' | 'upi'>('razorpay');
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!studentId) return <Navigate to="/parent-portal/fees" replace />;
  if (!historyQuery.isLoading && !historyQuery.data) return <Navigate to="/parent-portal/fees" replace />;

  const data = historyQuery.data as StudentPaymentHistory | undefined;
  if (!data) return null;

  const openPay = (fee: { id: string; amount: number; feeType: string; feeName?: string }) => {
    setPayingFee(fee);
    setPayMethod('razorpay');
    setShowQr(false);
    setPayModalOpen(true);
  };

  const upiUrl = payingFee ? buildUpiUrl(payingFee.amount, payingFee.feeName ?? payingFee.feeType, data.student.name) : '';
  const qrImageUrl = upiUrl ? buildQrApiUrl(upiUrl) : '';

  const handleRazorpayPayment = async () => {
    if (!RAZORPAY_KEY) {
      showError('Razorpay not configured. Please contact the school admin.');
      return;
    }
    if (!payingFee) return;

    setRazorpayLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showError('Failed to load payment gateway.');
      setRazorpayLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY,
      amount: Math.round(payingFee.amount * 100),
      currency: 'INR',
      name: SCHOOL_NAME,
      description: `${payingFee.feeName ?? payingFee.feeType} — ${data.student.name}`,
      handler: (response: RazorpayResponse) => {
        recordPaymentMutation.mutate(
          {
            studentId: data.student.id,
            feeId: payingFee.id.startsWith('pending-') ? payingFee.id.replace('pending-', '').split('-')[0] : undefined,
            amount: payingFee.amount,
            paymentMode: 'online',
            paymentDate: new Date().toISOString().split('T')[0],
            referenceId: response.razorpay_payment_id,
          },
          {
            onSuccess: () => {
              setPayModalOpen(false);
              setPayingFee(null);
              success('Payment successful!');
              historyQuery.refetch();
            },
          }
        );
        setRazorpayLoading(false);
      },
      prefill: { name: data.student.name },
      theme: { color: '#6366f1' },
    });
    rzp.on('payment.failed', (resp: { error: { description: string } }) => {
      showError(`Payment failed: ${resp.error.description}`);
      setRazorpayLoading(false);
    });
    rzp.open();
  };

  const handleGenerateQr = () => {
    setShowQr(true);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    success('UPI ID copied!');
  };

  const copyUpiLink = () => {
    navigator.clipboard.writeText(upiUrl);
    success('Payment link copied!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${data.student.name}'s Fees`}
        description={`${data.student.rollNo} · ${data.student.className}${data.student.section ? `-${data.student.section}` : ''}`}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/parent-portal/fees')}>
            Back
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(data.summary.totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(data.summary.totalPending)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(data.summary.totalOverdue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Fees */}
      {data.pendingFees.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">Dues to Pay</h3>
          <div className="space-y-2">
            {data.pendingFees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{fee.feeName ?? fee.feeType.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                    {fee.status === 'overdue' && (
                      <span className="ml-2 text-red-600 dark:text-red-400 font-medium">Overdue</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatCurrency(fee.amount)}</span>
                  <Button size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />} onClick={() => openPay(fee)}>
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Payment History</h3>
        {data.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">{p.feeName ?? p.feeType.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-IN') : ''}
                      {p.receiptNo && ` · ${p.receiptNo}`}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-green-600">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* PAY MODAL */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => { setPayModalOpen(false); setPayingFee(null); setShowQr(false); }}
        title={`Pay ${payingFee?.feeName ?? payingFee?.feeType ?? ''}`}
        description={`${formatCurrency(payingFee?.amount ?? 0)}`}
        footer={
          <>
            <Button variant="outline" onClick={() => { setPayModalOpen(false); setPayingFee(null); setShowQr(false); }}>
              Cancel
            </Button>
            {payMethod === 'razorpay' && (
              <Button onClick={handleRazorpayPayment} isLoading={razorpayLoading || recordPaymentMutation.isPending} leftIcon={<CreditCard className="h-4 w-4" />}>
                Pay with Razorpay
              </Button>
            )}
            {(payMethod === 'qr' || payMethod === 'upi') && !showQr && (
              <Button onClick={handleGenerateQr} leftIcon={<QrCode className="h-4 w-4" />}>
                Show QR & UPI
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                payMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/30'
              }`}
              onClick={() => { setPayMethod('razorpay'); setShowQr(false); }}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-medium">Razorpay</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                payMethod === 'qr' ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/30'
              }`}
              onClick={() => { setPayMethod('qr'); setShowQr(false); }}
            >
              <QrCode className="h-5 w-5" />
              <span className="text-xs font-medium">QR Code</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                payMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/30'
              }`}
              onClick={() => { setPayMethod('upi'); setShowQr(false); }}
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs font-medium">UPI</span>
            </button>
          </div>

          {payMethod === 'razorpay' && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Tap "Pay with Razorpay" to open the secure payment gateway.
            </div>
          )}

          {(payMethod === 'qr' || payMethod === 'upi') && !showQr && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Tap "Show QR & UPI" to display the payment details.
            </div>
          )}

          {/* QR + UPI display */}
          {(payMethod === 'qr' || payMethod === 'upi') && showQr && (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  className="h-52 w-52 rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="text-xs text-muted-foreground">Scan with any UPI app</p>
              </div>

              {/* UPI ID */}
              <div className="rounded-lg border p-3 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground">UPI ID</p>
                <div className="flex items-center gap-2 rounded bg-muted px-3 py-2">
                  <span className="text-sm font-mono flex-1 select-all">{UPI_ID}</span>
                  <Button size="sm" variant="ghost" onClick={copyUpiId}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Copy link */}
              <Button size="sm" variant="outline" className="w-full" onClick={copyUpiLink} leftIcon={<Copy className="h-3.5 w-3.5" />}>
                Copy Payment Link
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
