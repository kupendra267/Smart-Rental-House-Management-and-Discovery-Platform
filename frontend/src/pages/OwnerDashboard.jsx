import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  Wrench,
  Clock,
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, pendingApproval: 0 });
  const [applications, setApplications] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [propRes, appRes, maintRes] = await Promise.all([
        api.get('/properties/owner/my-properties'),
        api.get('/applications/owner'),
        api.get('/maintenance')
      ]);

      if (propRes.data.success) {
        setProperties(propRes.data.data.properties || []);
        setStats(propRes.data.data.stats || {});
      }
      if (appRes.data.success) {
        setApplications(appRes.data.data.applications || []);
      }
      if (maintRes.data.success) {
        setMaintenance(maintRes.data.data.maintenanceRequests || []);
      }
    } catch (err) {
      console.error('Error loading owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationDecision = async (appId, status) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status });
      if (res.data.success) {
        showSuccess(`Application ${status === 'APPROVED' ? 'Approved & Lease Created!' : 'Rejected'}`);
        loadOwnerData();
      }
    } catch (err) {
      showError('Failed to update application');
    }
  };

  const handleMaintenanceStatus = async (maintId, status) => {
    try {
      const res = await api.patch(`/maintenance/${maintId}/status`, { status });
      if (res.data.success) {
        showSuccess(`Maintenance status updated to ${status}`);
        loadOwnerData();
      }
    } catch (err) {
      showError('Failed to update ticket status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Property Owner Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Owner Dashboard
          </h1>
        </div>
        <Link
          to="/owner/add-property"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" /> Add New Property
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Properties</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.total || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.available || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Occupied (Rented)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.rented || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pendingApproval || 0}</div>
        </div>
      </div>

      {/* Tenant Applications Queue */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Tenant Rental Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Move-in Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{app.tenant?.user?.fullName || 'Applicant'}</div>
                      <span className="text-[11px] text-gray-400">{app.tenant?.user?.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 line-clamp-1">{app.property?.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(app.moveInDate).toLocaleDateString()} ({app.occupants} Occupants)
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApplicationDecision(app.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                          >
                            Approve & Create Lease
                          </button>
                          <button
                            onClick={() => handleApplicationDecision(app.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Property Listings Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" /> My Property Listings ({properties.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[10px] border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <Link to={`/properties/${p.id}`} className="hover:text-blue-600 transition">
                      {p.title}
                    </Link>
                    <div className="text-[11px] text-gray-400 font-normal">{p.bhk} BHK • {p.areaSqft} sqft</div>
                  </td>
                  <td className="py-3 px-4">
                    {p.location?.area}, {p.location?.city}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-blue-600">
                    ₹{p.monthlyRent?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.verificationStatus} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/properties/${p.id}`}
                      className="text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Tickets Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" /> Maintenance & Repair Tickets ({maintenance.length})
        </h2>

        {maintenance.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No active maintenance tickets.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {maintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">{m.category}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{m.description}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={m.status}
                        onChange={(e) => handleMaintenanceStatus(m.id, e.target.value)}
                        className="bg-gray-50 border rounded-lg px-2 py-1 text-[11px] font-bold text-gray-800"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
