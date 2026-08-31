import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Key, ShieldCheck, CreditCard, FileText, Download, Calendar, DollarSign, Building } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import ReceiptModal from '../components/ReceiptModal';

export default function TenantRental() {
  const { showSuccess, showError } = useToast();
  const [rentals, setRentals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rentRes, invRes] = await Promise.all([
        api.get('/rentals'),
        api.get('/rentals/invoices')
      ]);
      if (rentRes.data.success) setRentals(rentRes.data.data.rentals || []);
      if (invRes.data.success) setInvoices(invRes.data.data.invoices || []);
    } catch (err) {
      console.error('Error fetching tenant rental data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoice) => {
    setPayingInvoiceId(invoice.id);
    try {
      const orderRes = await api.post('/payments/create-order', { invoiceId: invoice.id });
      const { orderId } = orderRes.data.data;

      const verifyRes = await api.post('/payments/verify', {
        invoiceId: invoice.id,
        orderId,
        paymentId: `pay_demo_${Date.now()}`,
        signature: 'sig_verified_mock_hash_sandbox'
      });

      if (verifyRes.data.success) {
        showSuccess('Rent payment successful!');
        setSelectedReceipt(verifyRes.data.data.receipt);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Payment failed');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const activeRental = rentals.find(r => r.status === 'ACTIVE') || (rentals.length > 0 ? rentals[0] : null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Lease Governance</span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Key className="w-6 h-6 text-blue-600" /> Active Lease & Rent Payments
        </h1>
      </div>

      {activeRental ? (
        <div className="space-y-8">
          {/* Active Lease Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={activeRental.status} />
                  <span className="text-xs font-bold text-gray-500 font-mono">ID: {activeRental.id}</span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mt-1">{activeRental.property?.title}</h2>
                <p className="text-xs text-gray-500">{activeRental.property?.location?.address || `${activeRental.property?.location?.area}, ${activeRental.property?.location?.city}`}</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl font-black text-blue-600">₹{activeRental.monthlyRent?.toLocaleString()}<span className="text-xs font-normal text-gray-500">/mo</span></div>
                <span className="text-xs text-gray-400">Due on {activeRental.rentDueDay}th of month</span>
              </div>
            </div>

            {/* Agreement Terms */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold uppercase text-[10px]">Start Date</span>
                <div className="font-bold text-gray-900 mt-1">{new Date(activeRental.startDate).toLocaleDateString()}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold uppercase text-[10px]">End Date</span>
                <div className="font-bold text-gray-900 mt-1">{new Date(activeRental.endDate).toLocaleDateString()}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold uppercase text-[10px]">Security Deposit</span>
                <div className="font-bold text-gray-900 mt-1">₹{activeRental.securityDeposit?.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold uppercase text-[10px]">Notice Period</span>
                <div className="font-bold text-gray-900 mt-1">30 Days</div>
              </div>
            </div>
          </div>

          {/* Monthly Invoices & Payment Ledger */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Rent Invoices & Receipts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Base Rent</th>
                    <th className="py-3 px-4">Maintenance</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-bold text-gray-900">{inv.billingMonth}</td>
                      <td className="py-3 px-4">₹{inv.baseRent?.toLocaleString()}</td>
                      <td className="py-3 px-4">₹{inv.maintenance?.toLocaleString() || 0}</td>
                      <td className="py-3 px-4 font-extrabold text-blue-600">₹{inv.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                      <td className="py-3 px-4 text-right">
                        {inv.status === 'PENDING' ? (
                          <button
                            onClick={() => handlePay(inv)}
                            disabled={payingInvoiceId === inv.id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                          >
                            {payingInvoiceId === inv.id ? 'Paying...' : 'Pay Online'}
                          </button>
                        ) : (
                          inv.payments && inv.payments.length > 0 && inv.payments[0].receipt && (
                            <button
                              onClick={() => setSelectedReceipt(inv.payments[0].receipt)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition"
                            >
                              View Receipt
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-3 max-w-md mx-auto">
          <Key className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">No active rental lease</h3>
          <p className="text-xs text-gray-500">
            Once a property owner approves your rental application, your digital lease and rent schedule will appear here.
          </p>
          <Link
            to="/properties"
            className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
          >
            Explore Houses &rarr;
          </Link>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
