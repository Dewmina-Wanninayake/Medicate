import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { adminAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Stethoscope, Clock, ShieldCheck, LogOut, CheckCircle, XCircle, ToggleLeft } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]           = useState(null);
  const [pendingDoctors, setPending] = useState([]);
  const [allUsers, setAllUsers]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab]    = useState('overview');
  const [loading, setLoading]        = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes, paymentsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingDoctors(),
        adminAPI.listUsers(),
        paymentAPI.listTransactions({ limit: 50 }).catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data);
      setPending(pendingRes.data.data.doctors);
      setAllUsers(usersRes.data.data.users);
      setTransactions(paymentsRes?.data?.data || []);
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

  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await paymentAPI.updateStatus(id, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update payment status');
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(editingUser._id, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.role,
        specialty: editingUser.role === 'doctor' ? editingUser.doctorProfile?.specialty : undefined,
      });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
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
              { label: 'Inactive Users', value: stats.inactiveUsers,  icon: XCircle,     color: 'text-red-500' },
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
            { id: 'overview', label: 'Pending Doctors' },
            { id: 'users',    label: 'All Users' },
            { id: 'payments', label: 'Payments' },
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
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingUser(u)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        Edit
                      </Button>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card className="rounded-3xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-2xl gap-4">
                    <div>
                      <p className="font-semibold text-sm">TX ID: {tx.transactionId}</p>
                      <p className="text-sm text-muted-foreground">
                        Patient: {tx.metadata?.patientName || 'Unknown'} ({tx.metadata?.patientEmail || 'No Email'})
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                          {tx.currency} {(tx.amount / 100).toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                        <Badge className={`rounded-full ${
                          tx.status?.toLowerCase() === 'completed' ? 'bg-green-500' : 
                          tx.status?.toLowerCase() === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        } text-white capitalize`}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tx.status?.toLowerCase() === 'pending' && (
                        <Button 
                          size="sm" 
                          className="rounded-full"
                          onClick={() => handleUpdatePaymentStatus(tx.transactionId, 'completed')}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <select
                        className="text-sm border rounded px-2 py-1 bg-background"
                        value={tx.status}
                        onChange={(e) => handleUpdatePaymentStatus(tx.transactionId, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="succeeded">Succeeded</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="partially_refunded">Partially Refunded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm">No transactions found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-3xl w-full max-w-md p-6 relative shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit User Profile</h2>
            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 bg-muted/30" 
                  value={editingUser.firstName} 
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 bg-muted/30" 
                  value={editingUser.lastName} 
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input 
                  type="email" 
                  className="w-full border rounded-lg px-3 py-2 bg-muted/30" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 bg-muted/30" 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editingUser.role === 'doctor' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Specialty</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2 bg-muted/30" 
                    value={editingUser.doctorProfile?.specialty || ''} 
                    onChange={(e) => setEditingUser({ 
                      ...editingUser, 
                      doctorProfile: { ...editingUser.doctorProfile, specialty: e.target.value } 
                    })} 
                    required
                  >
                    <option value="" disabled>Select Specialty</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Endocrinologist">Endocrinologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Orthopedist">Orthopedist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}