import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ShieldCheck, CreditCard, Key, Wrench, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const typeIcons = {
  PAYMENT_SUCCESS: <CreditCard className="w-4 h-4 text-emerald-600" />,
  RECEIPT_GENERATED: <ShieldCheck className="w-4 h-4 text-blue-600" />,
  APPLICATION_UPDATE: <Key className="w-4 h-4 text-indigo-600" />,
  MAINTENANCE_UPDATE: <Wrench className="w-4 h-4 text-amber-600" />,
  PROPERTY_VERIFICATION: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
  DEFAULT: <Bell className="w-4 h-4 text-blue-600" />
};

export default function Notifications() {
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError('Failed to mark notifications');
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Alerts & Updates</span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications
          </h1>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 p-2 rounded-xl hover:bg-blue-50 transition"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No notifications to display.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                className={`py-4 px-3 rounded-2xl flex items-start gap-3 transition cursor-pointer ${
                  !n.isRead ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                }`}
              >
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
                  {typeIcons[n.type] || typeIcons.DEFAULT}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{n.title}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
