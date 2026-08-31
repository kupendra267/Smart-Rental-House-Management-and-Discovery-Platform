import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Building,
  DollarSign,
  AlertTriangle,
  History,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, pendingRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/properties/pending'),
        api.get('/users'),
        api.get('/admin/audit-logs')
      ]);

      if (analyticsRes.data.success) setStats(analyticsRes.data.data.stats);
      if (pendingRes.data.success) setPendingProperties(pendingRes.data.data.properties || []);
      if (usersRes.data.success) setUsers(usersRes.data.data.users || []);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data.auditLogs || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProperty = async (propertyId, decision) => {
    try {
      const res = await api.patch(`/admin/properties/${propertyId}/verify`, {
        decision,
        reason: decision === 'APPROVED' ? 'Approved by admin inspector' : 'Incomplete documentation'
      });
      if (res.data.success) {
        showSuccess(`Property listing ${decision.toLowerCase()} successfully`);
        loadAdminData();
      }
    } catch (err) {
      showError('Failed to verify property');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        showSuccess(`User status changed to ${newStatus}`);
        loadAdminData();
      }
    } catch (err) {
      showError('Failed to update user status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">System Administration</span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Admin Control Center & Analytics
        </h1>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats?.totalUsers || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">{stats?.totalTenants || 0} Tenants • {stats?.totalOwners || 0} Owners</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Verified Listings</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats?.verifiedProperties || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">{stats?.pendingProperties || 0} Pending Moderation</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Active Leases</span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats?.activeRentals || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Under digital agreement</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Processed Volume</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-[11px] text-gray-400 mt-1">Verified via Razorpay</div>
        </div>
      </div>

      {/* Property Approvals Queue */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" /> Pending Property Listing Approvals ({pendingProperties.length})
        </h2>

        {pendingProperties.length === 0 ? (
          <p className="text-xs text-emerald-600 font-semibold py-4 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> All submitted listings are up-to-date and verified.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Rent</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {pendingProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">{p.title}</td>
                    <td className="py-3 px-4">{p.location?.area}, {p.location?.city}</td>
                    <td className="py-3 px-4 font-extrabold text-blue-600">₹{p.monthlyRent?.toLocaleString()}</td>
                    <td className="py-3 px-4">{p.owner?.user?.fullName || 'Owner'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerifyProperty(p.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                        >
                          Approve Listing
                        </button>
                        <button
                          onClick={() => handleVerifyProperty(p.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Governance Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Platform User Directory ({users.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[10px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {users.slice(0, 10).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{u.fullName}</div>
                    <span className="text-[11px] text-gray-400">{u.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="py-3 px-4">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" /> Platform Security & Audit Trail
        </h2>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono font-bold text-blue-600">{log.action}</span>
                <span className="text-gray-500 ml-2">[{log.entityType} #{log.entityId}]</span>
              </div>
              <div className="text-[11px] text-gray-400">
                {new Date(log.createdAt).toLocaleString()} • IP: {log.ipAddress}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
