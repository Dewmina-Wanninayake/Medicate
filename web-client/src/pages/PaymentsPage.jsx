import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { CreditCard, Search, Download, Filter, TrendingUp, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const SAMPLE_TRANSACTIONS = [
  {
    _id: '1',
    description: 'Specialist Consultation - Dr. Sarah Adams',
    transactionId: 'TX-9921-001',
    amount: 15000,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-03-15T10:30:00Z'
  },
  {
    _id: '2',
    description: 'Lab Analysis - Blood Test',
    transactionId: 'TX-9921-002',
    amount: 7500,
    currency: 'USD',
    status: 'pending',
    createdAt: '2026-03-10T14:45:00Z'
  },
  {
    _id: '3',
    description: 'Monthly Prescription - Lisinopril',
    transactionId: 'TX-9921-003',
    amount: 4500,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-02-28T09:15:00Z'
  }
];

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = transactions.filter(t => t.status === 'succeeded').reduce((acc, t) => acc + t.amount, 0) / 100;
  const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0) / 100;

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Payments & Billing</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your consultation payments and billing history.
          </p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-accent h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 gap-3">
          <CreditCard className="w-5 h-5" /> 
          Add Payment Method
        </Button>
      </div>

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

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search by description or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-16 rounded-full bg-white border-none shadow-sm text-lg"
            />
          </div>
          <Button variant="outline" className="h-16 w-16 rounded-full border-none bg-white shadow-sm">
            <Filter className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredTransactions.map((tx) => (
            <Card key={tx._id} className="rounded-[40px] border-none shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
              <div className="p-2 flex flex-col md:flex-row md:items-center gap-6">
                <div className="p-6 md:p-8 flex-1 flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                    tx.status === 'succeeded' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-400/10 text-yellow-600'
                  }`}>
                    {tx.status === 'succeeded' ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-black tracking-tight truncate">{tx.description}</h3>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground mt-1">
                       <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {tx.transactionId}</span>
                       <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(tx.createdAt).toLocaleDateString()}</span>
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
                     'bg-yellow-400/5 text-yellow-700 border-yellow-400/20'
                   }`}>
                     {tx.status.toUpperCase()}
                   </Badge>
                   <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/30">
                     <Download className="w-5 h-5" />
                   </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
