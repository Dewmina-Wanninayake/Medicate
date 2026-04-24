import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import StripePaymentModal from '../components/StripePaymentModal';
import {
  CreditCard, Search, Download, Filter, TrendingUp,
  Clock, CheckCircle, AlertCircle, FileText, RefreshCw,
  Loader2, PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtAmount(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function statusStyle(status) {
  switch (status) {
    case 'succeeded': return 'bg-green-500/5 text-green-600 border-green-500/20';
    case 'pending': return 'bg-yellow-400/5 text-yellow-700 border-yellow-400/20';
    case 'failed': return 'bg-red-500/5 text-red-600 border-red-500/20';
    case 'refunded': return 'bg-purple-500/5 text-purple-600 border-purple-500/20';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function StatusIcon({ status }) {
  switch (status) {
    case 'succeeded': return <CheckCircle className="w-8 h-8" />;
    case 'pending': return <Clock className="w-8 h-8" />;
    case 'failed': return <AlertCircle className="w-8 h-8" />;
    default: return <CreditCard className="w-8 h-8" />;
  }
}

function iconBg(status) {
  switch (status) {
    case 'succeeded': return 'bg-green-500/10 text-green-600';
    case 'pending': return 'bg-yellow-400/10 text-yellow-600';
    case 'failed': return 'bg-red-500/10 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

// ── jsPDF Receipt ─────────────────────────────────────────────────────────────
function downloadReceipt(tx, user) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Blue header bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 48, 'F');

  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('Medicate', margin, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Healthcare Platform · Payment Receipt', margin, 32);

  // Receipt # + date (top-right)
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text(`Receipt #${String(tx._id).slice(-8).toUpperCase()}`, W - margin, 22, { align: 'right' });
  doc.text(new Date(tx.createdAt).toLocaleString(), W - margin, 30, { align: 'right' });

  // Status pill
  const pillColor = tx.status === 'succeeded' ? [34, 197, 94] : tx.status === 'failed' ? [239, 68, 68] : [234, 179, 8];
  doc.setFillColor(...pillColor);
  doc.roundedRect(W - margin - 38, 36, 38, 8, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(tx.status.toUpperCase(), W - margin - 19, 41.5, { align: 'center' });

  // Amount block
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 58, W - margin * 2, 30, 6, 6, 'F');
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(fmtAmount(tx.amount, tx.currency), W / 2, 77, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Charged', W / 2, 84, { align: 'center' });

  // Details table
  const patientName = user?.role === 'patient' ? (user?.name || user?.email || 'N/A') : (tx.patientEmail || 'Patient');
  const rows = [
    ['Patient Name', patientName],
    ['Appointment ID', String(tx.appointmentId || '—')],
    ['Payment Intent', String(tx.stripePaymentIntentId || '—')],
    ['Currency', (tx.currency || 'usd').toUpperCase()],
    ['Payment Date', new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['Payment Time', new Date(tx.createdAt).toLocaleTimeString()],
    ['Description', (tx.description || 'Medical Consultation').replace(/(dr\.?\s*)+/gi, 'Dr. ')],
  ];
  if (tx.doctorName) rows.push(['Doctor', `Dr. ${tx.doctorName.replace(/^(dr\.?\s*)+/gi, '')}`]);

  let y = 102;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Payment Details', margin, y);
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 7;

  rows.forEach(([label, value], idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin + 4, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(String(value), W - margin - 4, y + 2, { align: 'right', maxWidth: 90 });
    y += 12;
  });

  // Footer
  y = Math.max(y + 10, 240);
  doc.setFillColor(37, 99, 235);
  doc.rect(0, y, W, 1.5, 'F');
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated receipt and does not require a signature.', W / 2, y, { align: 'center' });
  doc.text('For support, contact support@medicate.health', W / 2, y + 6, { align: 'center' });
  doc.text('© Medicate Healthcare Platform', W / 2, y + 12, { align: 'center' });

  doc.save(`medicate-receipt-${String(tx._id).slice(-8)}.pdf`);
  toast.success('Receipt downloaded!');
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Resume-payment modal state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumePaymentData, setResumePaymentData] = useState(null);

  const fetchPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await paymentsAPI.list();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (!silent) toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  // Open the Stripe modal to resume a pending payment
  const handleResumePayment = (tx) => {
    if (!tx.stripeClientSecret) {
      toast.error('Payment session expired. Please re-book the appointment.');
      return;
    }
    setResumePaymentData({
      paymentId: tx._id,
      clientSecret: tx.stripeClientSecret,
      amount: tx.amount,
      currency: tx.currency,
      doctorName: tx.doctorName ? tx.doctorName.replace(/^(dr\.?\s*)+/gi, '') : undefined,
      patientEmail: tx.patientEmail || user?.email || '',
    });
    setResumeModalOpen(true);
  };

  const handleResumeSuccess = async (paymentIntent) => {
    setResumeModalOpen(false);
    toast.success('Payment confirmed! Your appointment is booked.', { duration: 5000 });
    try {
      if (resumePaymentData?.paymentId) {
        await paymentsAPI.confirm(resumePaymentData.paymentId);
      }
    } catch (_) { /* non-critical */ }
    fetchPayments(true);
    setResumePaymentData(null);
  };

  const filtered = transactions.filter(tx => {
    const q = searchTerm.toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(q) ||
      (tx.stripePaymentIntentId || '').toLowerCase().includes(q) ||
      (tx.status || '').toLowerCase().includes(q) ||
      (tx.appointmentId || '').toLowerCase().includes(q)
    );
  });

  const totalSpent = transactions.filter(t => t.status === 'succeeded').reduce((s, t) => s + t.amount, 0);
  const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8 p-1">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Payments &amp; Billing</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your consultation payments and billing history.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchPayments(true)}
          disabled={refreshing}
          className="rounded-full h-14 px-8 text-base font-bold border-none bg-white shadow-md gap-3"
        >
          {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Refresh
        </Button>
      </div>

      {/* Pending payment banner */}
      {user?.role === 'patient' && pendingCount > 0 && (
        <div className="flex items-center gap-5 p-6 rounded-[28px] bg-yellow-50 border-2 border-yellow-200">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center text-yellow-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-black text-yellow-800">
              {pendingCount} pending payment{pendingCount > 1 ? 's' : ''} — action required
            </p>
            <p className="text-sm text-yellow-700 font-medium mt-0.5">
              Click <span className="font-black">Complete Payment</span> below to finish your booking.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-primary">{fmtAmount(totalSpent)}</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {user?.role === 'doctor' ? 'Total Earned' : 'Total Spent'}
            </div>
          </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 flex items-center justify-center text-yellow-600">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-yellow-600">{fmtAmount(pendingAmount)}</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {user?.role === 'doctor' ? 'Pending Revenue' : 'Pending Bills'}
            </div>
          </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-green-600">{transactions.length}</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Transactions</div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by description, status or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-16 rounded-full bg-white border-none shadow-sm text-lg"
          />
        </div>
        <Button variant="outline" className="h-16 w-16 rounded-full border-none bg-white shadow-sm">
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {/* Transaction list */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-[40px] border-none shadow-md bg-white p-16 text-center">
            <CreditCard className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-bold text-muted-foreground">
              {searchTerm ? 'No transactions match your search.' : 'No payment history yet.'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Payments from your appointments will appear here.
            </p>
          </Card>
        ) : (
          filtered.map((tx) => (
            <Card key={tx._id} className="rounded-[40px] border-none shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
              <div className="p-2 flex flex-col md:flex-row md:items-center gap-6">
                <div className="p-6 md:p-8 flex-1 flex items-center gap-8">
                  {/* Status icon */}
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 ${iconBg(tx.status)}`}>
                    <StatusIcon status={tx.status} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-black tracking-tight truncate">
                      {user?.role === 'doctor'
                        ? `Payment from ${tx.patientEmail || 'Patient'}`
                        : (tx.description || 'Medical Consultation').replace(/(dr\.?\s*)+/gi, 'Dr. ')}
                    </h3>
                    <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {tx.stripePaymentIntentId
                          ? `pi_…${tx.stripePaymentIntentId.slice(-8)}`
                          : 'Pending'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                      {tx.doctorName && user?.role !== 'doctor' && (
                        <span className="font-semibold text-primary">Dr. {tx.doctorName.replace(/^(dr\.?\s*)+/gi, '')}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right hidden md:block px-8">
                    <div className="text-2xl font-black text-primary">
                      {fmtAmount(tx.amount, tx.currency)}
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">
                      {(tx.currency || 'usd').toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Right action panel */}
                <div className="px-8 pb-8 md:pb-0 md:border-l border-border/50 flex flex-row md:flex-col items-center justify-center gap-3 min-w-[200px]">
                  <Badge className={`rounded-xl px-4 py-1.5 text-xs font-black w-full text-center border ${statusStyle(tx.status)}`}>
                    {tx.status.toUpperCase()}
                  </Badge>

                  {/* Pending → Complete Payment button */}
                  {user?.role === 'patient' && tx.status === 'pending' && tx.stripeClientSecret && (
                    <Button
                      className="h-10 w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-black text-xs gap-2"
                      onClick={() => handleResumePayment(tx)}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Complete Payment
                    </Button>
                  )}

                  {/* Succeeded → Download receipt */}
                  {tx.status === 'succeeded' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary"
                      title="Download Receipt"
                      onClick={() => downloadReceipt(tx, user)}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Other statuses → disabled download */}
                  {tx.status !== 'succeeded' && tx.status !== 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-2xl bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                      disabled
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Resume payment modal */}
      {resumeModalOpen && resumePaymentData && (
        <StripePaymentModal
          open={resumeModalOpen}
          onClose={(open) => { if (!open) setResumeModalOpen(false); }}
          clientSecret={resumePaymentData.clientSecret}
          amount={resumePaymentData.amount}
          currency={resumePaymentData.currency}
          doctorName={resumePaymentData.doctorName}
          patientEmail={resumePaymentData.patientEmail}
          onSuccess={handleResumeSuccess}
        />
      )}
    </div>
  );
}
