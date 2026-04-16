import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await paymentAPI.myTransactions();
        setTransactions(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Could not load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = transactions
    .filter(tx => tx.status === 'succeeded')
    .reduce((acc, tx) => acc + (tx.amount / 100), 0);

  const pendingAmount = transactions
    .filter(tx => tx.status === 'pending')
    .reduce((acc, tx) => acc + (tx.amount / 100), 0);

  const handleDownload = (tx) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Primary Color
    doc.text('MEDICATE', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Healthcare Platform - Official Receipt', 105, 38, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);
    
    // Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION DETAILS', 20, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction ID:`, 20, 75);
    doc.text(tx.transactionId, 70, 75);
    
    doc.text(`Date:`, 20, 85);
    doc.text(new Date(tx.createdAt).toLocaleString(), 70, 85);
    
    doc.text(`Service:`, 20, 95);
    doc.text(tx.description || 'Consultation', 70, 95);
    
    doc.text(`Status:`, 20, 105);
    if (tx.status === 'succeeded') doc.setTextColor(22, 163, 74);
    else doc.setTextColor(220, 38, 38);
    doc.text(tx.status.toUpperCase(), 70, 105);
    
    // Price
    doc.setTextColor(0);
    doc.line(20, 115, 190, 115);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL AMOUNT:`, 20, 130);
    doc.text(`$${(tx.amount / 100).toFixed(2)} ${tx.currency.toUpperCase()}`, 190, 130, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('This is a computer-generated receipt. No signature required.', 105, 270, { align: 'center' });
    doc.text('Thank you for choosing Medicate.', 105, 275, { align: 'center' });

    // Robust download logic
    try {
      const blob = doc.output('blob');
      const fileName = `Receipt_${tx.transactionId.substring(0, 8)}.pdf`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('PDF Save error:', err);
      doc.save(`Receipt_${tx.transactionId.substring(0, 8)}.pdf`); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Payments & Billing</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your consultation payments, invoices, and billing history.
          </p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-accent h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 gap-3 group">
          <CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
          Add Payment Method
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-8 h-8" />
           </div>
           <div>
              <div className="text-3xl font-black text-primary">${totalSpent.toFixed(2)}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Spent</div>
           </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 flex items-center justify-center text-yellow-600">
              <Clock className="w-8 h-8" />
           </div>
           <div>
              <div className="text-3xl font-black text-yellow-600">${pendingAmount.toFixed(2)}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pending Bills</div>
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

      {/* Search and History */}
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by description or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-16 rounded-full bg-white border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-lg"
            />
          </div>
          <Button variant="outline" className="h-16 w-16 rounded-full border-none bg-white shadow-sm hover:bg-muted">
            <Filter className="w-6 h-6" />
          </Button>
        </div>

        {error && (
          <div className="p-8 text-center bg-red-50 rounded-[40px] border border-red-100">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-600">{error}</h3>
            <Button variant="link" onClick={() => window.location.reload()} className="text-red-500 underline">Try Again</Button>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-[40px] bg-white animate-pulse shadow-sm"></div>
            ))
          ) : filteredTransactions.map((tx) => (
            <Card key={tx._id} className="rounded-[40px] border-none shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white">
              <div className="p-2 flex flex-col md:flex-row md:items-center gap-6">
                <div className="p-6 md:p-8 flex-1 flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 ${
                    tx.status === 'succeeded' ? 'bg-green-500/10 text-green-600' :
                    tx.status === 'pending' ? 'bg-yellow-400/10 text-yellow-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {tx.status === 'succeeded' ? <CheckCircle className="w-8 h-8" /> : 
                     tx.status === 'pending' ? <Clock className="w-8 h-8" /> : 
                     <AlertCircle className="w-8 h-8" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                       <h3 className="text-xl font-black tracking-tight truncate">{tx.description || 'Specialist Consultation'}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                       <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {tx.transactionId}
                       </span>
                       <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                       </span>
                    </div>
                  </div>
                  <div className="text-right hidden md:block px-8">
                    <div className="text-2xl font-black text-primary">${(tx.amount / 100).toFixed(2)}</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">{tx.currency}</div>
                  </div>
                </div>

                <div className="px-8 pb-8 md:pb-0 md:border-l border-border/50 flex flex-row md:flex-col items-center justify-center gap-3 min-w-[180px]">
                   <Badge className={`rounded-xl px-4 py-1.5 text-xs font-black w-full text-center border ${
                     tx.status === 'succeeded' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 
                     tx.status === 'pending' ? 'bg-yellow-400/5 text-yellow-700 border-yellow-400/20' : 
                     'bg-red-500/5 text-red-600 border-red-500/20'
                   }`}>
                     {tx.status.toUpperCase()}
                   </Badge>
                    <div className="flex gap-2 w-full">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDownload(tx)}
                         className="flex-1 h-12 rounded-2xl bg-muted/30 hover:bg-muted transition-colors"
                       >
                         <Download className="w-5 h-5" />
                       </Button>
                    </div>
                </div>
              </div>
            </Card>
          ))}
          {!loading && filteredTransactions.length === 0 && (
            <div className="py-32 text-center bg-muted/10 rounded-[48px] border-4 border-dashed border-border/50">
               <CreditCard className="w-20 h-20 mx-auto mb-6 text-muted-foreground/20" />
               <h3 className="text-2xl font-bold text-muted-foreground/50">No transactions found.</h3>
               <p className="text-muted-foreground/40 mt-2">Your payment history will appear here once you book a consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
