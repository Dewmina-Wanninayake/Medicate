import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Stethoscope, Clock, ShieldCheck, LogOut, CheckCircle, XCircle, ToggleLeft, DollarSign } from 'lucide-react';
import { paymentAPI } from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]           = useState(null);
  const [pendingDoctors, setPending] = useState([]);
  const [allUsers, setAllUsers]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab]    = useState('overview');
  const [loading, setLoading]        = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes, txRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingDoctors(),
        adminAPI.listUsers(),
        paymentAPI.listTransactions({ limit: 50 }),
      ]);
      setStats(statsRes.data.data);
      setPending(pendingRes.data.data.doctors);
      setAllUsers(usersRes.data.data.users);
      setTransactions(txRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminAPI.verifyDoctor(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify doctor');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this doctor?')) return;
    try {
      await adminAPI.rejectDoctor(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject doctor');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">Medicate Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.firstName}
          </span>
          <Button variant="outline" onClick={logout} className="rounded-full gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Patients', value: stats.totalPatients,  icon: Users,       color: 'text-blue-500' },
              { label: 'Total Doctors',  value: stats.totalDoctors,   icon: Stethoscope, color: 'text-green-500' },
              { label: 'Pending Verify', value: stats.pendingDoctors, icon: Clock,        color: 'text-yellow-500' },
              { label: 'Revenue',        value: `$${(transactions.reduce((acc, t) => t.status === 'succeeded' ? acc + t.amount : acc, 0) / 100).toFixed(2)}`,  icon: DollarSign,     color: 'text-primary' },
            ].map((stat) => (
              <Card key={stat.label} className="rounded-3xl border-none shadow-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview',   label: 'Pending Doctors' },
            { id: 'users',      label: 'All Users' },
            { id: 'financials', label: 'Financial Records' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              {tab.id === 'overview' && pendingDoctors.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingDoctors.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Doctors Tab */}
        {activeTab === 'overview' && (
          <Card className="rounded-3xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Pending Doctor Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDoctors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending verifications</p>
              ) : (
                <div className="space-y-4">
                  {pendingDoctors.map((doctor) => (
                    <div key={doctor._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                      <div>
                        <p className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</p>
                        <p className="text-sm text-muted-foreground">{doctor.email}</p>
                        <p className="text-sm text-primary">{doctor.doctorProfile?.specialty}</p>
                        <p className="text-xs text-muted-foreground">License: {doctor.doctorProfile?.licenseNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVerify(doctor._id)}
                          className="rounded-full gap-2 bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4" /> Verify
                        </Button>
                        <Button
                          onClick={() => handleReject(doctor._id)}
                          variant="outline"
                          className="rounded-full gap-2 border-red-300 text-red-500 hover:bg-red-50"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <Card className="rounded-3xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div>
                      <p className="font-semibold">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'admin'   ? 'bg-purple-100 text-purple-700' :
                          u.role === 'doctor'  ? 'bg-blue-100 text-blue-700' :
                                                 'bg-green-100 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {u.role !== 'admin' && (
                      <Button
                        onClick={() => handleToggleStatus(u._id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2"
                      >
                        <ToggleLeft className="w-4 h-4" />
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <Card className="rounded-3xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Platform Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 font-semibold text-muted-foreground">Date</th>
                      <th className="pb-3 font-semibold text-muted-foreground">Patient ID</th>
                      <th className="pb-3 font-semibold text-muted-foreground text-right">Amount</th>
                      <th className="pb-3 font-semibold text-muted-foreground text-center">Status</th>
                      <th className="pb-3 font-semibold text-muted-foreground">Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr key={tx.transactionId || tx._id} className="group hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 font-mono text-xs">{tx.patientId}</td>
                        <td className="py-4 font-bold text-primary text-right">${(tx.amount / 100).toFixed(2)}</td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            tx.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                            tx.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                                                       'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground text-xs uppercase">{tx.gateway || 'stripe'}</td>
                      </tr>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-muted-foreground italic">
                          No transactions recorded on this platform yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}