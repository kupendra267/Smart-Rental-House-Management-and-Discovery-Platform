import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Building, Calendar } from 'lucide-react';

export default function ReceiptModal({ receipt, isOpen, onClose }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.paymentDate || receipt.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">Official Digital Rent Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Body */}
        <div id="printable-receipt" className="p-6 space-y-6 text-gray-800">
          {/* Brand & Receipt Number */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Smart<span className="text-blue-600">Rental</span>
              </h2>
              <p className="text-xs text-gray-500">Digital Rent Payment & Management Platform</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase">Receipt No.</span>
              <div className="text-sm font-extrabold font-mono text-blue-600">{receipt.receiptNumber}</div>
            </div>
          </div>

          {/* Amount Paid Banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase">Amount Paid</span>
              <div className="text-2xl font-black text-emerald-950">
                ₹{receipt.amountPaid?.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified & Paid
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Tenant Name</span>
              <div className="font-bold text-gray-900 mt-0.5">{receipt.tenantName || 'Tenant'}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Billing Period</span>
              <div className="font-bold text-gray-900 mt-0.5">{receipt.billingPeriod}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Payment Date</span>
              <div className="font-bold text-gray-900 mt-0.5">{formattedDate}</div>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Gateway Ref / Tx ID</span>
              <div className="font-mono text-gray-700 mt-0.5 text-[11px] truncate">{receipt.transactionReference}</div>
            </div>
          </div>

          {/* Property Reference */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs border border-gray-100 flex items-start gap-2.5">
            <Building className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 font-medium">Property</span>
              <div className="font-bold text-gray-900">{receipt.propertyName || 'Verified Rental House'}</div>
            </div>
          </div>

          {/* Disclaimer & Verification Footnote */}
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            This digital receipt is cryptographically recorded on the Smart Rental platform with HMAC SHA256 integrity checks.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-200 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
