'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Filter,
  Search,
  Zap,
  ShieldAlert,
  Clock,
  Mail,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'preferences'>('all');

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Preferences State
  const [preferences, setPreferences] = useState<any>({
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    documentNotifications: true,
    verificationNotifications: true,
    taskNotifications: true,
    assetNotifications: true,
    joiningReminders: true,
    overdueEscalations: true,
  });
  const [savingPref, setSavingPref] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [activeTab, priorityFilter, typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (activeTab === 'unread') params.unreadOnly = true;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await apiClient.get('/notifications', { params });
      setNotifications(res.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch notifications history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await apiClient.get('/notifications/preferences');
      if (res.data) setPreferences(res.data);
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleTriggerReminders = async () => {
    try {
      const res = await apiClient.post('/notifications/trigger-reminders');
      alert(`Deadline Reminder Scan Complete! ${JSON.stringify(res.data)}`);
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to trigger reminder engine.');
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPref(true);
    try {
      await apiClient.patch('/notifications/preferences', preferences);
      alert('Notification preferences updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setSavingPref(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded text-3xs font-black bg-rose-100 text-rose-800 border border-rose-300 uppercase">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded text-3xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded text-3xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 uppercase">MEDIUM</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-3xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 uppercase">LOW</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notification Center & Escalation Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of system alerts, deadline reminders, and compliance risk notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerReminders}
            className="px-3 py-1.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Run Deadline Scan</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>All Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'unread' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Unread Only</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'preferences' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Notification Settings</span>
          </button>
        </div>

        {activeTab !== 'preferences' && (
          <div className="flex items-center gap-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-2xs font-semibold text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1 & 2: NOTIFICATIONS LIST */}
      {activeTab !== 'preferences' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-200">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading notifications history...</div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold">No notifications found.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                    !n.isRead ? 'bg-blue-50/30 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="mt-0.5">{getPriorityBadge(n.priority)}</div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        <span className="text-3xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 uppercase">
                          {n.type}
                        </span>
                        {n.channel === 'EMAIL' && (
                          <span className="text-3xs text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" /> Email Dispatched
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                      <p className="text-3xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-2xs font-semibold border border-blue-200 flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Mark Read
                      </button>
                    )}

                    {n.employeeId && (
                      <Link
                        href={`/employees/${n.employeeId}`}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="View Related Employee"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATION PREFERENCES */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Notification Channel & Delivery Settings</h3>
            <p className="text-2xs text-slate-500">Configure delivery channels and alert subscriptions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Delivery Channels</h4>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700">In-App Notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.inAppNotificationsEnabled}
                  onChange={(e) => setPreferences({ ...preferences, inAppNotificationsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.emailNotificationsEnabled}
                  onChange={(e) => setPreferences({ ...preferences, emailNotificationsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Event Subscriptions</h4>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700">Document Upload & Verification Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.documentNotifications}
                  onChange={(e) => setPreferences({ ...preferences, documentNotifications: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700">Department Task & Deadline Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.taskNotifications}
                  onChange={(e) => setPreferences({ ...preferences, taskNotifications: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700">Joining Date Reminders (7d, 3d, 1d)</span>
                <input
                  type="checkbox"
                  checked={preferences.joiningReminders}
                  onChange={(e) => setPreferences({ ...preferences, joiningReminders: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-700">Overdue Escalation Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.overdueEscalations}
                  onChange={(e) => setPreferences({ ...preferences, overdueEscalations: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPref}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <span>{savingPref ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
