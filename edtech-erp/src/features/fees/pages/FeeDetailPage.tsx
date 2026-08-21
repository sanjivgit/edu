import { ArrowLeft, CreditCard, QrCode, Smartphone, CheckCircle, Clock, AlertCircle, Download, Copy, Share2 } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils';
import { useAuth, useToast } from '@/hooks';
import { useGetStudentPaymentHistory, useRecordDirectPayment, type PaymentHistoryItem, type StudentPaymentHistory } from '../services/fees.service';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name?: string; email?: string; contact?: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
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

function getMonthLabel(monthStr?: string): string {
  if (!monthStr) return 'Unknown';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function groupPaymentsByMonth(payments: PaymentHistoryItem[]): Record<string, PaymentHistoryItem[]> {
  const grouped: Record<string, PaymentHistoryItem[]> = {};
  for (const p of payments) {
    const key = p.month || 'unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }
  return grouped;
}

export default function FeeDetailPage() {
  const navigate = useNavigate();
  const { id: studentId } = useParams();
  const { success, error: showError } = useToast();
  const { isManagement, isParent, isStudent } = useAuth();
  const historyQuery = useGetStudentPaymentHistory(studentId ?? '');
  const recordPaymentMutation = useRecordDirectPayment();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<{ id: string; amount: number; feeType: string; feeName?: string } | null>(null);
  const [payMethod, setPayMethod] = useState<'razorpay' | 'qr' | 'upi'>('razorpay');
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  if (!studentId) return <Navigate to="/fees" replace />;
  if (!historyQuery.isLoading && !historyQuery.data) return <Navigate to="/fees" replace />;

  const data = historyQuery.data as StudentPaymentHistory | undefined;
  if (!data) return null;

  const grouped = groupPaymentsByMonth(data.payments);
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const openPayModal = (fee: { id: string; amount: number; feeType: string; feeName?: string }) => {
    setPayingFee(fee);
    setPayMethod('razorpay');
    setPayModalOpen(true);
  };

  const upiUrl = payingFee ? buildUpiUrl(payingFee.amount, payingFee.feeName ?? payingFee.feeType, data.student.name) : '';
  const qrImageUrl = upiUrl ? buildQrApiUrl(upiUrl) : '';

  const handleRazorpayPayment = async () => {
    if (!RAZORPAY_KEY) {
      showError('Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to your .env');
      return;
    }
    if (!payingFee) return;

    setRazorpayLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showError('Failed to load Razorpay SDK.');
      setRazorpayLoading(false);
      return;
    }

    const options: RazorpayOptions = {
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
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp: { error: { description: string } }) => {
      showError(`Payment failed: ${resp.error.description}`);
      setRazorpayLoading(false);
    });
    rzp.open();
  };

  const handleConfirmQrUpiPayment = () => {
    if (!payingFee) return;
    setPayModalOpen(false);
    setConfirmModalOpen(true);
  };

  const handleRecordConfirmedPayment = (mode: 'online' | 'cash', remarks: string) => {
    if (!payingFee) return;
    recordPaymentMutation.mutate(
      {
        studentId: data.student.id,
        feeId: payingFee.id.startsWith('pending-') ? payingFee.id.replace('pending-', '').split('-')[0] : undefined,
        amount: payingFee.amount,
        paymentMode: mode,
        paymentDate: new Date().toISOString().split('T')[0],
        referenceId: mode === 'online' ? `UPI-${Date.now()}` : undefined,
        remarks,
      },
      {
        onSuccess: () => {
          setConfirmModalOpen(false);
          setPayingFee(null);
          success('Payment recorded!');
          historyQuery.refetch();
        },
      }
    );
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    success('UPI ID copied!');
  };

  const copyUpiLink = () => {
    if (!upiUrl) return;
    navigator.clipboard.writeText(upiUrl);
    success('UPI payment link copied!');
  };

  const sharePaymentLink = async () => {
    if (!payingFee) return;
    const shareText = `Fee Payment for ${data.student.name}\n${payingFee.feeName ?? payingFee.feeType}: ${formatCurrency(payingFee.amount)}\n\nUPI ID: ${UPI_ID}\nUPI Link: ${upiUrl}\n\nScan QR or click link to pay.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Fee Payment', text: shareText });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(shareText);
      success('Payment details copied to clipboard!');
    }
  };

  const downloadQr = () => {
    if (!qrImageUrl) return;
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `QR-${payingFee?.feeType}-${data.student.rollNo}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Fee Details"
        description={`${data.student.name} · ${data.student.rollNo} · ${data.student.className}${data.student.section ? `-${data.student.section}` : ''}`}
        actions={
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/fees')}>
            Back to List
          </Button>
        }
      />

      {/* Summary Cards */}
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

      {/* Pending Fees — Pay */}
      {data.pendingFees.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">Pending Fees</h3>
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
                  {(isManagement || isParent) && (
                    <Button size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />} onClick={() => openPayModal(fee)}>
                      {isParent ? 'Pay Now' : 'Record Payment'}
                    </Button>
                  )}
                  {isStudent && (
                    <span className="text-xs text-muted-foreground">Contact admin to pay</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Payment History</h3>
        {sortedMonths.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment history found.</p>
        ) : (
          <div className="space-y-4">
            {sortedMonths.map((month) => (
              <div key={month}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {getMonthLabel(month)}
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1.5 text-left font-medium text-muted-foreground">Fee</th>
                      <th className="py-1.5 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="py-1.5 text-center font-medium text-muted-foreground">Status</th>
                      <th className="py-1.5 text-left font-medium text-muted-foreground">Receipt</th>
                      <th className="py-1.5 text-left font-medium text-muted-foreground">Mode</th>
                      <th className="py-1.5 text-left font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[month].map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-1.5 font-medium">{p.feeName ?? p.feeType.toUpperCase()}</td>
                        <td className="py-1.5 text-right font-mono">{formatCurrency(p.amount)}</td>
                        <td className="py-1.5 text-center">
                          <StatusBadge status={p.status as 'paid' | 'pending' | 'overdue'} />
                        </td>
                        <td className="py-1.5 font-mono text-muted-foreground">{p.receiptNo ?? '—'}</td>
                        <td className="py-1.5 uppercase text-muted-foreground">{p.paymentMode ?? '—'}</td>
                        <td className="py-1.5 text-muted-foreground">
                          {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* PAYMENT MODAL — Choose Method */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => { setPayModalOpen(false); setPayingFee(null); }}
        title={`Pay ${payingFee?.feeName ?? payingFee?.feeType ?? ''}`}
        description={`${formatCurrency(payingFee?.amount ?? 0)} — ${data.student.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => { setPayModalOpen(false); setPayingFee(null); }}>
              Cancel
            </Button>
            {isManagement && payMethod === 'razorpay' && (
              <Button onClick={handleRazorpayPayment} isLoading={razorpayLoading || recordPaymentMutation.isPending} leftIcon={<CreditCard className="h-4 w-4" />}>
                Record Online Payment
              </Button>
            )}
            {isManagement && (payMethod === 'qr' || payMethod === 'upi') && (
              <Button onClick={handleConfirmQrUpiPayment} leftIcon={<Share2 className="h-4 w-4" />}>
                Generate Payment Link
              </Button>
            )}
            {isParent && payMethod === 'razorpay' && (
              <Button onClick={handleRazorpayPayment} isLoading={razorpayLoading || recordPaymentMutation.isPending} leftIcon={<CreditCard className="h-4 w-4" />}>
                Pay with Razorpay
              </Button>
            )}
            {isParent && (payMethod === 'qr' || payMethod === 'upi') && (
              <Button onClick={handleConfirmQrUpiPayment} leftIcon={<Share2 className="h-4 w-4" />}>
                Generate Payment Link
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
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
                payMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/30'
              }`}
              onClick={() => setPayMethod('razorpay')}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-medium">Razorpay</span>
              <span className="text-[10px] text-muted-foreground">Online gateway</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
                payMethod === 'qr' ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/30'
              }`}
              onClick={() => setPayMethod('qr')}
            >
              <QrCode className="h-5 w-5" />
              <span className="text-xs font-medium">QR Code</span>
              <span className="text-[10px] text-muted-foreground">Scan to pay</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
                payMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/30'
              }`}
              onClick={() => setPayMethod('upi')}
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs font-medium">UPI</span>
              <span className="text-[10px] text-muted-foreground">Direct transfer</span>
            </button>
          </div>

          {/* Razorpay info */}
          {payMethod === 'razorpay' && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {isParent
                ? 'Opens Razorpay payment gateway \u2014 cards, netbanking, wallets, UPI all supported.'
                : 'Opens Razorpay checkout to record an online payment from the parent/student.'
              }
            </div>
          )}

          {/* QR preview */}
          {payMethod === 'qr' && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {isParent
                ? 'Click "Generate Payment Link" to create a QR code. Scan it with any UPI app to pay.'
                : 'Click "Generate Payment Link" to create a QR code. Download it and share with the parent/student to scan and pay.'
              }
            </div>
          )}

          {/* UPI info */}
          {payMethod === 'upi' && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {isParent
                ? 'Click "Generate Payment Link" to get the UPI ID and payment link. Make a direct transfer using any UPI app.'
                : 'Click "Generate Payment Link" to get the UPI ID and payment link. Share it with the parent/student to make a direct transfer.'
              }
            </div>
          )}
        </div>
      </Modal>

      {/* CONFIRM / SHARE MODAL — Shows QR + UPI + actions */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setPayingFee(null); }}
        title="Payment Link Generated"
        description={isParent ? 'Scan the QR code or use the UPI ID below to make payment.' : 'Share this with the parent/student. Once they pay, confirm below.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Close
            </Button>
            {isManagement && (
              <Button
                onClick={() => handleRecordConfirmedPayment('online', `Paid via ${payMethod === 'qr' ? 'QR code' : 'UPI transfer'}`)}
                isLoading={recordPaymentMutation.isPending}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                Confirm Payment Received
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {/* Amount banner */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">Amount to pay</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(payingFee?.amount ?? 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{payingFee?.feeName ?? payingFee?.feeType} — {data.student.name}</p>
          </div>

          {/* QR Code — always shown */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={qrImageUrl}
              alt="UPI QR Code"
              className="h-56 w-56 rounded-lg border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p className="text-xs text-muted-foreground">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
          </div>

          {/* UPI ID */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">UPI ID</p>
            <div className="flex items-center gap-2 rounded bg-muted px-3 py-2">
              <span className="text-sm font-mono flex-1 select-all">{UPI_ID}</span>
              <Button size="sm" variant="ghost" onClick={copyUpiId}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" onClick={downloadQr} leftIcon={<Download className="h-3.5 w-3.5" />}>
              Download QR
            </Button>
            <Button size="sm" variant="outline" onClick={copyUpiLink} leftIcon={<Copy className="h-3.5 w-3.5" />}>
              Copy Link
            </Button>
            <Button size="sm" variant="outline" onClick={sharePaymentLink} leftIcon={<Share2 className="h-3.5 w-3.5" />}>
              Share
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {isParent
              ? 'After making payment, the admin will confirm and record your payment.'
              : 'After the parent/student confirms payment, click "Confirm Payment Received" to record it.'
            }
          </p>
        </div>
      </Modal>
    </div>
  );
}
