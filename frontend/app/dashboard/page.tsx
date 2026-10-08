'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  ShieldCheck,
  CheckSquare,
  Package,
  Search,
  Filter,
  Calendar as CalendarIcon,
  ChevronRight,
  ShieldAlert,
  Building,
  MapPin,
  Briefcase,
  TrendingUp,
  Layers,
  ArrowRight,
  Zap,
  Sparkles,
  Plus,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export default function HRDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [attentionList, setAttentionList] = useState<any[]>([]);
  const [pendingReqs, setPendingReqs] = useState<any>(null);
  const [upcomingJoiners, setUpcomingJoiners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedLoc, setSelectedLoc] = useState<string>('ALL');
  const [selectedEmpType, setSelectedEmpType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Active Pending Requirements Tab
  const [pendingTab, setPendingTab] = useState<'docs' | 'verifs' | 'tasks' | 'assets'>('docs');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectedDept, selectedLoc, selectedEmpType, selectedStatus, search]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: any = {
        dateRange,
        department: selectedDept,
        location: selectedLoc,
        employmentType: selectedEmpType,
        status: selectedStatus,
        search,
      };

      const [sumRes, anaRes, attRes, penRes, upcRes] = await Promise.all([
        apiClient.get('/dashboard/summary', { params }).catch(() => null),
        apiClient.get('/dashboard/analytics', { params }).catch(() => null),
        apiClient.get('/dashboard/attention-required', { params }).catch(() => null),
        apiClient.get('/dashboard/pending-requirements', { params }).catch(() => null),
        apiClient.get('/dashboard/upcoming-joiners', { params }).catch(() => null),
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (anaRes?.data) setAnalytics(anaRes.data);
      if (attRes?.data) setAttentionList(attRes.data);
      if (penRes?.data) setPendingReqs(penRes.data);
      if (upcRes?.data) setUpcomingJoiners(upcRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'READY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-green" />
            READY
          </span>
        );
      case 'PARTIALLY_READY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <Clock className="w-3 h-3 text-blue-600" />
            PARTIALLY READY
          </span>
        );
      case 'DELAYED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            DELAYED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 pulse-red" />
            BLOCKED
          </span>
        );
      default:
        return null;
    }
  };

  const COLORS = {
    READY: '#10B981',
    PARTIALLY_READY: '#3B82F6',
    DELAYED: '#F59E0B',
    BLOCKED: '#F43F5E',
  };

  const pieData = analytics?.statusDistribution
    ? [
        { name: 'Ready', value: analytics.statusDistribution.READY || 0, color: COLORS.READY },
        { name: 'Partially Ready', value: analytics.statusDistribution.PARTIALLY_READY || 0, color: COLORS.PARTIALLY_READY },
        { name: 'Delayed', value: analytics.statusDistribution.DELAYED || 0, color: COLORS.DELAYED },
        { name: 'Blocked', value: analytics.statusDistribution.BLOCKED || 0, color: COLORS.BLOCKED },
      ].filter((item) => item.value > 0)
    : [];

  const overallScore = summary?.upcomingJoiners > 0
    ? Math.round((summary.ready / summary.upcomingJoiners) * 100)
    : 0;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Executive Overview
              </span>
              <span className="text-slate-400 text-xs font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Onboarding Readiness & Compliance Command
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time pre-joining metrics, compliance risk detection, and department onboarding readiness scores for upcoming joiners.
            </p>
          </div>

          {/* Quick Action Toolbar & Readiness Score Meter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 font-black text-lg border border-blue-500/30">
                {overallScore}%
              </div>
              <div>
                <p className="text-xs font-bold text-white">Compliance Score</p>
                <p className="text-[11px] text-slate-400">Ready to Join</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/candidates/new"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
              >
                <Plus className="w-3.5 h-3.5" /> New Candidate
              </Link>
              <button
                onClick={fetchDashboardData}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-colors"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, code, email, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Joining Today</option>
              <option value="7_DAYS">Next 7 Days</option>
              <option value="14_DAYS">Next 14 Days</option>
              <option value="30_DAYS">Next 30 Days</option>
            </select>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">READY</option>
              <option value="PARTIALLY_READY">PARTIALLY READY</option>
              <option value="DELAYED">DELAYED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Scorecard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Joiners */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Joiners</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{summary?.upcomingJoiners ?? 0}</div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Upcoming onboarding pipeline</p>
          </div>
        </div>

        {/* Ready */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Ready to Join</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-700">{summary?.ready ?? 0}</div>
            <p className="text-[11px] text-emerald-600/80 font-medium mt-1">100% compliance verified</p>
          </div>
        </div>

        {/* Partially Ready */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Partially Ready</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-blue-700">{summary?.partiallyReady ?? 0}</div>
            <p className="text-[11px] text-blue-600/80 font-medium mt-1">Non-critical tasks pending</p>
          </div>
        </div>

        {/* Delayed */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Delayed Risk</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-700">{summary?.delayed ?? 0}</div>
            <p className="text-[11px] text-amber-600/80 font-medium mt-1">Near joining date warning</p>
          </div>
        </div>

        {/* Blocked */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Blocked Issues</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-700">{summary?.blocked ?? 0}</div>
            <p className="text-[11px] text-rose-600/80 font-medium mt-1">Immediate action required</p>
          </div>
        </div>
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Readiness Distribution</h3>
                <p className="text-xs text-slate-500">Live breakdown of onboarding status</p>
              </div>
              <span className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <Layers className="w-4 h-4" />
              </span>
            </div>

            {pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No status data matching current filters
              </div>
            ) : (
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{overallScore}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ready Rate</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Ready: <strong>{analytics?.statusDistribution?.READY || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600">Partially: <strong>{analytics?.statusDistribution?.PARTIALLY_READY || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">Delayed: <strong>{analytics?.statusDistribution?.DELAYED || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600">Blocked: <strong>{analytics?.statusDistribution?.BLOCKED || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Department Compliance Breakdown Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Compliance Summary</h3>
                <p className="text-xs text-slate-500">Readiness & risk metrics by department</p>
              </div>
              <Link href="/employees" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Total Joiners</th>
                    <th className="py-2.5 px-3 text-center">Ready</th>
                    <th className="py-2.5 px-3 text-center">Delayed</th>
                    <th className="py-2.5 px-3 text-center">Blocked</th>
                    <th className="py-2.5 px-3 text-right">Compliance Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.departmentBreakdown?.map((dept: any) => {
                    const readyPct = dept.totalEmployees > 0 ? Math.round((dept.readyCount / dept.totalEmployees) * 100) : 0;
                    return (
                      <tr key={dept.department} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dept.department}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700">{dept.totalEmployees}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">{dept.readyCount}</td>
                        <td className="py-3 px-3 text-center font-bold text-amber-600">{dept.delayedCount}</td>
                        <td className="py-3 px-3 text-center font-bold text-rose-600">{dept.blockedCount}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${readyPct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700">{readyPct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* High-Priority Attention Required Banner */}
      {attentionList.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-rose-900/50 shadow-lg text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5 pulse-red" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  High-Priority Attention Required ({attentionList.length})
                </h3>
                <p className="text-xs text-rose-200/80">Employees with blocked compliance items or critical joining delays</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attentionList.map((emp) => (
              <div
                key={emp.id}
                className="bg-slate-900/90 p-4 rounded-xl border border-rose-800/40 hover:border-rose-700 transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{emp.firstName} {emp.lastName}</h4>
                    <p className="text-xs text-slate-400">{emp.designation} • {emp.department}</p>
                  </div>
                  {getStatusBadge(emp.onboardingStatus)}
                </div>

                {emp.issues && emp.issues.length > 0 && (
                  <div className="space-y-1 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/30 text-xs text-rose-200">
                    <p className="font-bold text-[10px] uppercase text-rose-400">Critical Issues:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {emp.issues.map((iss: string, idx: number) => (
                        <li key={idx} className="truncate">{iss}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">Joining: <strong>{new Date(emp.joiningDate).toLocaleDateString()}</strong></span>
                  <Link
                    href={`/employees/${emp.id}`}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    Resolve <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Joiners Interactive Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Joiners Pipeline</h3>
            <p className="text-xs text-slate-500">Real-time status and compliance overview of onboarding joiners</p>
          </div>
          <Link
            href="/employees"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View Full Employee Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingJoiners.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No upcoming joiners match your current filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4 text-center">Urgency</th>
                  <th className="py-3 px-4 text-center">Compliance Status</th>
                  <th className="py-3 px-4 text-center">Readiness Progress</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingJoiners.map((emp) => {
                  const score = emp.readinessScore || 0;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{emp.employeeId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-bold block">{emp.designation}</span>
                        <span className="text-[11px] text-slate-500">{emp.department} • {emp.location}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                        {new Date(emp.joiningDate).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.urgencyLabel || 'Upcoming'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center flex justify-center">
                        {getStatusBadge(emp.onboardingStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{score}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
