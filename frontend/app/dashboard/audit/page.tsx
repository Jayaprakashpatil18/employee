'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface AuditLogItem {
  id: string;
  userId?: string;
  user?: { id: string; name: string; email: string; role: string };
  employeeId?: string;
  employee?: { id: string; firstName: string; lastName: string; employeeId: string; department?: string };
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

export default function AuditDashboardPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [entityType, setEntityType] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Selected Log for Json Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, dateRange, entityType, action]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (dateRange && dateRange !== 'ALL') params.dateRange = dateRange;
      if (entityType) params.entityType = entityType;
      if (action) params.action = action;

      const res = await apiClient.get('/audit', { params });
      setLogs(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeClass = (act: string) => {
    if (act.includes('VERIFIED') || act.includes('COMPLETED') || act.includes('READY')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('REJECTED') || act.includes('BLOCKED') || act.includes('OVERDUE') || act.includes('DELETED')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('CONVERTED') || act.includes('UPLOADED') || act.includes('CREATED') || act.includes('ASSIGNED')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Compliance Log</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Centralized immutable activity log tracking system operations, status changes, and user actions.
          </p>
        </div>

        <button
          onClick={() => { setPage(1); fetchLogs(); }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, description, actor, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="14_DAYS">Last 14 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Entities</option>
              <option value="Candidate">Candidate</option>
              <option value="Employee">Employee</option>
              <option value="EmployeeDocument">Employee Document</option>
              <option value="DepartmentTask">Department Task</option>
              <option value="BackgroundVerification">Background Check</option>
              <option value="EmployeeAsset">Asset</option>
              <option value="JoiningChecklistItem">Checklist Item</option>
              <option value="Notification">Notification</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="CANDIDATE_CREATED">CANDIDATE_CREATED</option>
              <option value="CANDIDATE_CONVERTED">CANDIDATE_CONVERTED</option>
              <option value="DOCUMENT_UPLOADED">DOCUMENT_UPLOADED</option>
              <option value="DOCUMENT_VERIFIED">DOCUMENT_VERIFIED</option>
              <option value="DOCUMENT_REJECTED">DOCUMENT_REJECTED</option>
              <option value="TASK_CREATED">TASK_CREATED</option>
              <option value="TASK_ASSIGNED">TASK_ASSIGNED</option>
              <option value="TASK_COMPLETED">TASK_COMPLETED</option>
              <option value="ASSET_READY">ASSET_READY</option>
              <option value="READINESS_STATUS_CHANGED">READINESS_STATUS_CHANGED</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Audit Log Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading audit log entries...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 bg-rose-50">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No audit log entries matching your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const badgeClass = getActionBadgeClass(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {log.user?.name || log.actorRole || 'System'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.actorRole || log.user?.role || 'SYSTEM'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-1 rounded border font-mono font-bold text-[10px] uppercase ${badgeClass}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        <span>{log.entity}</span>
                        {log.entityId && (
                          <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[120px]">
                            ID: {log.entityId}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        {log.description || log.details}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                        >
                          View Meta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({total} total records)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Audit Payload Metadata</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">ACTION</span>
                <span className="font-semibold text-slate-800">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">DESCRIPTION</span>
                <span className="text-slate-700">{selectedLog.description || selectedLog.details}</span>
              </div>
              {selectedLog.metadata && (
                <div>
                  <span className="text-slate-400 block font-mono mb-1">METADATA PAYLOAD</span>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
