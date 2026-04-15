import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  CreditCard, Search, Download, Calendar, DollarSign, AlertCircle,
  RefreshCw, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  completed: { cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  succeeded: { cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  pending:   { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  failed:    { cls: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  refunded:  { cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle },
};

export default function PaymentsPage() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [expanded, setExpanded]         = useState(null);

  // ── Fetch transactions ────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentAPI.myTransactions();
      setTransactions(res.data.data || res.data.transactions || []);
    } catch (err) {
      console.error('Transactions fetch failed:', err);
      setError('Could not load payment history. The payment service may be offline.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // ── Filtered ──────────────────────────────────────────────────────
  const filtered = transactions.filter(t =>
    (t.description || t.appointmentId || t._id || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ── Summary stats ─────────────────────────────────────────────────
  const totalSpent = transactions
    .filter(t => ['completed','succeeded'].includes((t.status || '').toLowerCase()))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pending = transactions.filter(t => (t.status || '').toLowerCase() === 'pending').length;

  // ── Receipt print ─────────────────────────────────────────────────
  const printReceipt = (t) => {
    const content = `
      <html><body style="font-family:sans-serif;padding:32px;max-width:560px;margin:auto">
        <h2 style="color:#333">Payment Receipt</h2><hr/>
        <p><b>Transaction ID:</b> ${t._id || t.id}</p>
        <p><b>Date:</b> ${new Date(t.createdAt || t.date).toLocaleString()}</p>
        <p><b>Amount:</b> $${((t.amount || 0) / 100).toFixed(2)}</p>
        <p><b>Status:</b> ${t.status}</p>
        ${t.description ? `<p><b>Description:</b> ${t.description}</p>` : ''}
        ${t.appointmentId ? `<p><b>Appointment ID:</b> ${t.appointmentId}</p>` : ''}
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    w.print();
  };

  const getStatusStyle = (status) =>
    STATUS_STYLES[(status || '').toLowerCase()] || STATUS_STYLES.pending;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Payments & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Your complete payment history and billing records for all consultations.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[32px] border-none shadow-md bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-black text-primary">
                ${(totalSpent / 100).toFixed(2)}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Spent</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-md">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600">{transactions.length}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Transactions</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-md">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-7 h-7 text-yellow-600" />
            </div>
            <div>
              <div className="text-3xl font-black text-yellow-600">{pending}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchTransactions}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions by ID or description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-full bg-card border-none shadow-sm"
        />
      </div>

      {/* Transactions */}
      <Card className="rounded-[40px] border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 px-8 py-6">
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <Badge variant="secondary" className="rounded-full">{filtered.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading transactions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-xl font-bold text-muted-foreground/50 mb-2">No transactions found</h3>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try adjusting your search.' : 'Your payment history will appear here after your first appointment.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map(t => {
                const id = t._id || t.id;
                const isExpanded = expanded === id;
                const { cls, icon: StatusIcon } = getStatusStyle(t.status);

                return (
                  <div key={id}>
                    <div
                      className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-6 hover:bg-muted/10 transition-colors cursor-pointer group"
                      onClick={() => setExpanded(isExpanded ? null : id)}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <CreditCard className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base">
                          {t.description || `Appointment Consultation`}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-3 mt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(t.createdAt || t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-mono text-xs opacity-60">#{(id || '').slice(-8).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xl font-black text-primary">
                            ${((t.amount || 0) / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">{t.currency?.toUpperCase() || 'USD'}</div>
                        </div>
                        <Badge className={`rounded-full px-3 py-1 text-xs font-bold border capitalize flex items-center gap-1.5 ${cls}`}>
                          <StatusIcon className="w-3 h-3" />
                          {t.status || 'Unknown'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-8 pb-6 bg-muted/10 border-t border-border/30 pt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Transaction ID</div>
                            <div className="font-mono text-xs">{id}</div>
                          </div>
                          {t.appointmentId && (
                            <div>
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Appointment ID</div>
                              <div className="font-mono text-xs">{t.appointmentId}</div>
                            </div>
                          )}
                          {t.paymentMethod && (
                            <div>
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment Method</div>
                              <div className="capitalize">{t.paymentMethod}</div>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full gap-2"
                          onClick={(e) => { e.stopPropagation(); printReceipt(t); }}
                        >
                          <Download className="w-4 h-4" /> Download Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
