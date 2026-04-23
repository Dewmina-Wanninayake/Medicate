import { useEffect, useState } from 'react';
import { adminAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Users, Stethoscope, Clock, ShieldCheck, CheckCircle, XCircle, ToggleLeft, Trash2, CreditCard, Search, Filter, Edit2, Save, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats]            = useState(null);
  const [pendingDoctors, setPending] = useState([]);
  const [allUsers, setAllUsers]      = useState([]);
  const [payments, setPayments]      = useState([]);
  const [activeTab, setActiveTab]    = useState('overview');
  const [loading, setLoading]        = useState(true);

  // Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });

  // Filters for Payments
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentDateFilter, setPaymentDateFilter] = useState('');

  // Stripe Action Modal
  const [actionModal, setActionModal] = useState({ open: false, type: null, payment: null });
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, paymentsRes] = await Promise.all([
        adminAPI.listUsers?.({ role: 'doctor', isVerified: false }) || Promise.resolve({ users: [] }),
        adminAPI.listUsers?.() || Promise.resolve({ users: [] }),
        paymentsAPI.list?.() || Promise.resolve([]),
      ]);
      
      const pDocs = pendingRes.users || [];
      const users = usersRes.users || [];
      
      setStats({
        totalPatients: users.filter(u => u.role === 'patient').length,
        totalDoctors: users.filter(u => u.role === 'doctor').length,
        pendingDoctors: pDocs.length,
        inactiveUsers: users.filter(u => !u.isActive).length,
      });

      setPending(pDocs);
      setAllUsers(users);
      setPayments(Array.isArray(paymentsRes) ? paymentsRes : paymentsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminAPI.verifyDoctor(id);
      toast.success('Doctor verified successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify doctor');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this doctor?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('Doctor request rejected');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject doctor');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await adminAPI.toggleStatus(id, !isActive);
      toast.success(`User ${isActive ? 'disabled' : 'enabled'} successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const startEditing = (u) => {
    setEditingUser(u._id);
    setEditFormData({
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      role: u.role
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditFormData({ name: '', email: '', role: '' });
  };

  const saveEdit = async (id) => {
    try {
      await adminAPI.updateUser(id, editFormData);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    }
  };

  const openActionModal = (payment, type) => {
    setActionModal({ open: true, type, payment });
  };

  const confirmPaymentAction = async () => {
    if (!actionModal.payment) return;
    setActionProcessing(true);
    try {
      if (actionModal.type === 'pay') {
        await paymentsAPI.updateStatus(actionModal.payment._id, 'paid_to_doctor');
        toast.success('Payout to doctor processed via Stripe');
      } else {
        await paymentsAPI.refund(actionModal.payment._id);
        toast.success('Refund processed via Stripe');
      }
      fetchData();
      setActionModal({ open: false, type: null, payment: null });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed');
    } finally {
      setActionProcessing(false);
    }
  };

  // Filter Users
  const filteredUsers = allUsers.filter(u => {
    const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
    const searchString = `${name} ${u.email || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter Payments
  const filteredPayments = payments.filter(p => {
    const searchString = `${p.doctorName || ''} ${p.patientEmail || ''} ${p.patientId || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(paymentSearch.toLowerCase());
    const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
    
    let matchesDate = true;
    if (paymentDateFilter) {
      const pDate = new Date(p.createdAt || p.appointmentDate).toISOString().split('T')[0];
      matchesDate = pDate === paymentDateFilter;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medicate Admin</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name || user?.firstName || 'Admin'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Patients', value: stats.totalPatients || 0,  icon: Users,       color: 'text-blue-500' },
            { label: 'Total Doctors',  value: stats.totalDoctors || 0,   icon: Stethoscope, color: 'text-green-500' },
            { label: 'Pending Verify', value: stats.pendingDoctors || 0, icon: Clock,       color: 'text-yellow-500' },
            { label: 'Inactive Users', value: stats.inactiveUsers || 0,  icon: XCircle,     color: 'text-red-500' },
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
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {[
          { id: 'overview', label: 'Pending Doctors' },
          { id: 'users',    label: 'User Management' },
          { id: 'payments', label: 'Payment Management' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
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
                {pendingDoctors.map((doctor) => {
                  const docName = doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
                  return (
                  <div key={doctor._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-2xl gap-4">
                    <div>
                      <p className="font-semibold">Dr. {docName.replace(/^(dr\.?\s*)+/gi, '')}</p>
                      <p className="text-sm text-muted-foreground">{doctor.email}</p>
                      <p className="text-sm text-primary">{doctor.doctorProfile?.specialty || doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground">License: {doctor.doctorProfile?.licenseNumber || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
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
                )})}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Users Tab */}
      {activeTab === 'users' && (
        <Card className="rounded-3xl border-none shadow-md">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle className="text-lg">User Management</CardTitle>
              <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-9 pr-4 py-2 text-sm bg-muted/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <div className="relative w-full md:w-auto">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="pl-9 pr-8 py-2 text-sm bg-muted/50 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="patient">Patients</option>
                    <option value="doctor">Doctors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No users found.</p>
              )}
              {filteredUsers.map((u) => {
                const uName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
                const isEditing = editingUser === u._id;
                
                return (
                <div key={u._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-2xl gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                    <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-bold text-white ${
                      u.role === 'admin' ? 'bg-purple-500' : u.role === 'doctor' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {uName?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden flex-1">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                          <input 
                            className="px-3 py-1 text-sm bg-white border border-border rounded-md focus:outline-primary w-full" 
                            value={editFormData.name} 
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                            placeholder="Name"
                          />
                          <input 
                            className="px-3 py-1 text-sm bg-white border border-border rounded-md focus:outline-primary w-full" 
                            value={editFormData.email} 
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                            placeholder="Email"
                          />
                          <select 
                            className="px-3 py-1 text-sm bg-white border border-border rounded-md focus:outline-primary w-full md:col-span-2"
                            value={editFormData.role}
                            onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold truncate">{u.role === 'doctor' ? `Dr. ${uName.replace(/^(dr\.?\s*)+/gi, '')}` : uName}</p>
                          <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              u.role === 'admin'   ? 'bg-purple-100 text-purple-700' :
                              u.role === 'doctor'  ? 'bg-blue-100 text-blue-700' :
                                                     'bg-green-100 text-green-700'
                            }`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {u.role === 'doctor' && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                u.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {u.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end shrink-0">
                    {isEditing ? (
                      <>
                        <Button onClick={() => saveEdit(u._id)} size="sm" className="rounded-full gap-1 bg-primary text-white">
                          <Save className="w-4 h-4" /> Save
                        </Button>
                        <Button onClick={cancelEditing} variant="outline" size="sm" className="rounded-full gap-1">
                          <XCircle className="w-4 h-4" /> Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startEditing(u)} variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {u.role !== 'admin' && (
                          <Button
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2 hover:bg-muted"
                          >
                            <ToggleLeft className={`w-4 h-4 ${u.isActive ? 'text-orange-500' : 'text-green-500'}`} />
                            {u.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        )}
                        {u.role !== 'admin' && (
                          <Button
                            onClick={() => handleDeleteUser(u._id)}
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card className="rounded-3xl border-none shadow-md">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle className="text-lg">Payment Management</CardTitle>
              <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search doctor or patient..."
                    className="pl-9 pr-4 py-2 text-sm bg-muted/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                  />
                </div>
                <div className="relative w-full md:w-auto">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="pl-9 pr-8 py-2 text-sm bg-muted/50 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full"
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="succeeded">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="paid_to_doctor">Paid to Doctor</option>
                  </select>
                </div>
                <div className="relative w-full md:w-auto">
                  <input
                    type="date"
                    className="px-4 py-2 text-sm bg-muted/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary w-full"
                    value={paymentDateFilter}
                    onChange={(e) => setPaymentDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPayments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No payments found.</p>
              )}
              {filteredPayments.map((p) => (
                <div key={p._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-2xl gap-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      ${(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Patient:</span> {p.patientEmail || p.patientId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Doctor:</span> {p.doctorName ? `Dr. ${p.doctorName.replace(/^(dr\.?\s*)+/gi, '')}` : p.doctorId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Apt Date:</span> {p.appointmentDate ? new Date(p.appointmentDate).toLocaleDateString() : 'N/A'} {p.startTime || ''}
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                        p.status === 'refunded'  ? 'bg-red-100 text-red-700' :
                        p.status === 'paid_to_doctor' ? 'bg-blue-100 text-blue-700' :
                        p.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                   'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status === 'succeeded' ? 'PAID' : p.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end shrink-0">
                    {p.status === 'succeeded' && (
                      <>
                        <Button
                          onClick={() => openActionModal(p, 'pay')}
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Pay Doctor
                        </Button>
                        <Button
                          onClick={() => openActionModal(p, 'refund')}
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          Refund
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe-style Action Modal */}
      <Dialog open={actionModal.open} onOpenChange={(open) => !open && setActionModal({ open: false, type: null, payment: null })}>
        <DialogContent className="sm:max-w-[480px] rounded-[36px] p-0 border-none shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-br ${actionModal.type === 'pay' ? 'from-blue-600 to-blue-800' : 'from-red-500 to-red-700'} p-8 text-white`}>
            <div className="flex items-center gap-5 mb-2">
              <div className="w-14 h-14 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-black opacity-80 uppercase tracking-[0.15em] mb-1">
                  Stripe Payment Portal
                </div>
                <div className="text-2xl font-black tracking-tight">
                  {actionModal.payment ? `$${(actionModal.payment.amount / 100).toFixed(2)} ${actionModal.payment.currency.toUpperCase()}` : ''}
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black">
                {actionModal.type === 'pay' ? 'Process Doctor Payout' : 'Issue Patient Refund'}
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {actionModal.type === 'pay' 
                  ? 'This will transfer funds securely to the doctor\'s connected Stripe account.'
                  : 'This will reverse the charge and refund the amount back to the patient\'s card via Stripe.'}
              </p>
            </DialogHeader>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Transaction Target</p>
                <p className="font-semibold text-foreground">
                  {actionModal.type === 'pay' 
                    ? (actionModal.payment?.doctorName ? `Dr. ${actionModal.payment.doctorName.replace(/^(dr\.?\s*)+/gi, '')}` : 'Doctor Account')
                    : (actionModal.payment?.patientEmail || 'Patient Account')}
                </p>
              </div>
            </div>

            <Button
              onClick={confirmPaymentAction}
              disabled={actionProcessing}
              className={`w-full h-14 rounded-full text-lg font-black shadow-lg gap-3 text-white ${
                actionModal.type === 'pay' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              {actionProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing via Stripe…</>
              ) : (
                <><Lock className="w-5 h-5" /> Confirm {actionModal.type === 'pay' ? 'Payout' : 'Refund'}</>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground/70">
              <Lock className="w-3 h-3" />
              <span>256-bit TLS encryption · Secured by Stripe</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
