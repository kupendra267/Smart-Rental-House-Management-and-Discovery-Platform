import React from 'react';

const statusConfig = {
  // Property & Verification
  AVAILABLE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Available' },
  RENTED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Rented' },
  RESERVED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Reserved' },
  PENDING_APPROVAL: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Pending Approval' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved' },
  VERIFIED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Verified' },
  REJECTED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' },
  INACTIVE: { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Inactive' },

  // Applications
  PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Review' },
  UNDER_REVIEW: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Under Review' },
  WITHDRAWN: { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Withdrawn' },

  // Rentals & Leases
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active Lease' },
  ENDED: { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Ended' },
  TERMINATED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Terminated' },

  // Invoices & Payments
  PAID: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Paid' },
  OVERDUE: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Overdue' },
  SUCCESS: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Success' },
  FAILED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Failed' },

  // Maintenance
  OPEN: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Open' },
  ACKNOWLEDGED: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Acknowledged' },
  IN_PROGRESS: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Progress' },
  RESOLVED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' },
  CLOSED: { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Closed' }
};

export default function StatusBadge({ status, className = '' }) {
  const config = statusConfig[status] || { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}>
      {config.label}
    </span>
  );
}
