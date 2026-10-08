'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, ExternalLink, ShieldAlert, AlertTriangle, Clock, Info } from 'lucide-react';
import { apiClient } from '@/lib/api';

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotificationData();
    const interval = setInterval(fetchNotificationData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotificationData = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        apiClient.get('/notifications/unread-count').catch(() => ({ data: { unreadCount: 0 } })),
        apiClient.get('/notifications?limit=5').catch(() => ({ data: { items: [] } })),
      ]);

      if (countRes?.data) setUnreadCount(countRes.data.unreadCount || 0);
      if (listRes?.data) setNotifications(listRes.data.items || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      fetchNotificationData();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      fetchNotificationData();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = (n: any) => {
    setIsOpen(false);
    if (!n.isRead) {
      apiClient.patch(`/notifications/${n.id}/read`).catch(() => null);
    }

    if (n.employeeId) {
      router.push(`/employees/${n.employeeId}`);
    } else if (n.relatedEntityType === 'DepartmentTask') {
      router.push('/tasks');
    } else if (n.relatedEntityType === 'EmployeeAsset') {
      router.push('/assets');
    } else {
      router.push('/notifications');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" title="Critical Priority" />;
      case 'HIGH':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="High Priority" />;
      case 'MEDIUM':
        return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Medium Priority" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" title="Low Priority" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors focus:outline-hidden"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-3xs font-bold ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden text-xs">
          {/* Dropdown Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-100 text-blue-800">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-2xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-2xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer flex items-start gap-3 ${
                    !n.isRead ? 'bg-blue-50/40 font-medium' : ''
                  }`}
                >
                  {getPriorityBadge(n.priority)}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 truncate text-xs">{n.title}</span>
                      <span className="text-3xs text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-2xs text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-2xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>View All Notification History</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
