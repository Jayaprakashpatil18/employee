'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  FileCheck,
  FileX,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Bell,
  Activity,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export interface AuditRecord {
  id: string;
  userId?: string;
  user?: { id: string; name: string; email: string; role: string };
  employeeId?: string;
  employee?: { id: string; firstName: string; lastName: string; employeeId: string };
  actorRole?: string;
  action: string;
  entity: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  details?: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
}

interface ActivityTimelineProps {
  employeeId?: string;
  entityType?: string;
  entityId?: string;
}

export function ActivityTimeline({ employeeId, entityType, entityId }: ActivityTimelineProps) {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditHistory();
  }, [employeeId, entityType, entityId]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/audit';
      if (employeeId) {
        url = `/audit/employee/${employeeId}`;
      } else if (entityType && entityId) {
        url = `/audit/entity/${entityType}/${entityId}`;
      }

      const res = await apiClient.get(url);
      const data = Array.isArray(res.data) ? res.data : res.data.items || [];
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit trail history.');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CONVERTED') || action.includes('CANDIDATE')) return UserCheck;
    if (action.includes('VERIFIED') || action.includes('DOCUMENT_UPLOADED')) return FileCheck;
    if (action.includes('REJECTED') || action.includes('FAILED')) return FileX;
    if (action.includes('COMPLETED') || action.includes('READY')) return CheckCircle2;
    if (action.includes('TASK')) return Clock;
    if (action.includes('ASSET')) return Package;
    if (action.includes('BLOCKED') || action.includes('OVERDUE')) return AlertTriangle;
    if (action.includes('NOTIFICATION')) return Bell;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('VERIFIED') || action.includes('COMPLETED') || action.includes('READY')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
    if (action.includes('REJECTED') || action.includes('BLOCKED') || action.includes('OVERDUE')) {
      return 'bg-rose-100 text-rose-700 border-rose-300';
    }
    if (action.includes('CONVERTED') || action.includes('UPLOADED') || action.includes('ASSIGNED')) {
      return 'bg-blue-100 text-blue-700 border-blue-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <Activity className="w-4 h-4 animate-spin text-blue-600" />
        <span>Loading audit history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
        {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400 border border-dashed rounded-lg">
        No audit activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-200 ml-4 space-y-6 py-2">
      {logs.map((log) => {
        const IconComponent = getActionIcon(log.action);
        const colorClass = getActionColor(log.action);

        return (
          <div key={log.id} className="relative pl-6 group">
            {/* Timeline Dot Icon */}
            <div
              className={`absolute -left-3 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-xs shadow-xs ${colorClass}`}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </div>

            {/* Event Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-slate-900">
                  {log.user?.name || log.actorRole || 'System Engine'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({log.actorRole || log.user?.role || 'SYSTEM'})
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${colorClass}`}
                >
                  {log.action}
                </span>
              </div>
              <time className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>

            {/* Event Description */}
            <p className="text-xs text-slate-700 mt-1 font-medium">
              {log.description || log.details}
            </p>

            {/* Metadata Badges if available */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="mt-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-600 font-mono">
                <pre className="whitespace-pre-wrap truncate max-h-24">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
