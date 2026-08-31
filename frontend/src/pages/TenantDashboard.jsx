import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Key,
  CreditCard,
  Wrench,
  CheckCircle2,
  FileText,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PropertyCard from '../components/PropertyCard';
import StatusBadge from '../components/StatusBadge';
import ReceiptModal from '../components/ReceiptModal';

export default function TenantDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [recommendations, setRecommendations] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Maintenance Ticket Form state
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [maintCategory, setMaintCategory] = useState('PLUMBING');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintSubmitting, setMaintSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recRes, rentRes, invRes, maintRes] = await Promise.all([
        api.get('/recommendations?limit=3'),
        api.get('/rentals'),
        api.get('/rentals/invoices'),
        api.get('/maintenance')
      ]);

      if (recRes.data.success) setRecommendations(recRes.data.data.recommendations || []);
      if (rentRes.data.success) setRentals(rentRes.data.data.rentals || []);
      if (invRes.data.success) setInvoices(invRes.data.data.invoices || []);
      if (maintRes.data.success) setMaintenance(maintRes.data.data.maintenanceRequests || []);
    } catch (err) {
      console.error('Error loading tenant dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async (invoice) => {
    setPayingInvoiceId(invoice.id);
    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', { invoiceId: invoice.id });
      const { orderId } = orderRes.data.data;

      // 2. Simulate Razorpay Checkout verification with sandbox signature
      const verifyRes = await api.post('/payments/verify', {
        invoiceId: invoice.id,
        orderId,
        paymentId: `pay_sandbox_${Date.now()}`,
        signature: 'sig_verified_mock_hash_sandbox'
      });

      if (verifyRes.data.success) {
        showSuccess('Rent payment processed successfully! Digital receipt generated.');
        setSelectedReceipt(verifyRes.data.data.receipt);
        loadDashboardData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!rentals.length) {
      showError('You must have an active rental lease to submit a maintenance request');
      return;
    }

    setMaintSubmitting(true);
    try {
      const activeRental = rentals[0];
      const res = await api.post('/maintenance', {
        rentalId: activeRental.id,
        propertyId: activeRental.propertyId,
        category: maintCategory,
        description: maintDesc,
        priority: 'MEDIUM'
      });

      if (res.data.success) {
        showSuccess('Maintenance ticket submitted to owner');
        setMaintModalOpen(false);
        setMaintDesc('');
        loadDashboardData();
      }
    } catch (err) {
      showError('Failed to submit maintenance request');
    } finally {
      setMaintSubmitting(false);
    }
  };

  const activeRental = rentals.find((r) => r.status === 'ACTIVE') || (rentals.length > 0 ? rentals[0] : null);
  const pendingInvoice = invoices.find((i) => i.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Tenant Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Manage your rental home, review monthly rent invoices, download digital receipts, and track repairs.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/properties"
            className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-sm transition"
          >
            Explore More Houses
          </Link>
          <button
            onClick={() => setMaintModalOpen(true)}
            className="px-4 py-2.5 bg-blue-500/30 hover:bg-blue-500/50 border border-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" /> Raise Repair Ticket
          </button>
        </div>
      </div>

      {/* Active Lease & Next Rent Due Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Rental Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" /> Active Rental Lease
            </h2>
            {activeRental && <StatusBadge status={activeRental.status} />}
          </div>

          {activeRental ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{activeRental.property?.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeRental.property?.location?.address || `${activeRental.property?.location?.area}, ${activeRental.property?.location?.city}`}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-lg font-extrabold text-blue-600">
                    ₹{activeRental.monthlyRent?.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ mo</span>
                  </div>
                  <span className="text-[11px] text-gray-400">Due on 5th of each month</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-gray-500 text-[11px]">Lease Start</span>
                  <div className="font-bold text-gray-900 mt-0.5">
                    {new Date(activeRental.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-gray-500 text-[11px]">Lease End</span>
                  <div className="font-bold text-gray-900 mt-0.5">
                    {new Date(activeRental.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-gray-500 text-[11px]">Security Deposit</span>
                  <div className="font-bold text-gray-900 mt-0.5">
                    ₹{activeRental.securityDeposit?.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-gray-500 text-[11px]">Agreement</span>
                  <div className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Signed & Active
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-gray-500">You do not have any active rental leases right now.</p>
              <Link to="/properties" className="text-xs font-bold text-blue-600 hover:underline inline-block">
                Browse available homes to apply &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Current Pending Invoice / Pay Now Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Rent Obligation</span>
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>

            {pendingInvoice ? (
              <div className="space-y-2">
                <div className="text-3xl font-black text-white">
                  ₹{pendingInvoice.totalAmount?.toLocaleString()}
                </div>
                <p className="text-xs text-gray-300">
                  Billing Period: <strong className="text-white">{pendingInvoice.billingMonth}</strong>
                </p>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3 h-3" /> Due on {new Date(pendingInvoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div className="text-sm font-bold text-white">All Invoices Paid!</div>
                <p className="text-xs text-gray-400">You are up to date on all rent payments.</p>
              </div>
            )}
          </div>

          {pendingInvoice && (
            <button
              onClick={() => handlePayRent(pendingInvoice)}
              disabled={payingInvoiceId === pendingInvoice.id}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              {payingInvoiceId === pendingInvoice.id ? 'Verifying Payment...' : '💳 Pay Rent Online (Sandbox)'}
            </button>
          )}
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Personalized For You</span>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" /> AI Property Recommendations
            </h2>
          </div>
          <Link to="/properties" className="text-xs font-bold text-blue-600 hover:underline">
            View All Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>

      {/* Invoices & Maintenance Tabs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment History / Invoices */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Rent Payment Ledger & Receipts
          </h3>

          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900">{inv.billingMonth}</div>
                  <span className="text-gray-500 text-[11px]">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-gray-900">₹{inv.totalAmount?.toLocaleString()}</span>
                  <StatusBadge status={inv.status} />
                  {inv.payments && inv.payments.length > 0 && inv.payments[0].receipt && (
                    <button
                      onClick={() => setSelectedReceipt(inv.payments[0].receipt)}
                      className="text-blue-600 hover:text-blue-800 font-bold underline text-[11px]"
                    >
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" /> Maintenance Tickets
            </h3>
            <button
              onClick={() => setMaintModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              + New Request
            </button>
          </div>

          <div className="space-y-2.5">
            {maintenance.map((m) => (
              <div
                key={m.id}
                className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900">{m.category}</div>
                  <p className="text-gray-500 text-[11px] line-clamp-1">{m.description}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Maintenance Modal */}
      {maintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-gray-900 text-sm">Submit Maintenance Request</h3>
              <button onClick={() => setMaintModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Issue Category</label>
                <select
                  value={maintCategory}
                  onChange={(e) => setMaintCategory(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
                >
                  <option value="PLUMBING">Plumbing / Water Leakage</option>
                  <option value="ELECTRICAL">Electrical / Appliance</option>
                  <option value="WATER">Water Supply</option>
                  <option value="CLEANING">Sanitation / Cleaning</option>
                  <option value="OTHER">Other Repair</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the issue in detail for the property owner..."
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMaintModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={maintSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {maintSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
