'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronRight,
  ShieldAlert,
  Building,
  UserCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedStatus, selectedDepartment]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedDepartment !== 'ALL') params.department = selectedDepartment;

      const res = await apiClient.get('/readiness/upcoming-joiners', { params });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch upcoming joiners readiness:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'READY':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-green" />
            READY
          </span>
        );
      case 'PARTIALLY_READY':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            PARTIALLY READY
          </span>
        );
      case 'DELAYED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            DELAYED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 pulse-red" />
            BLOCKED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory & Readiness</h1>
              <p className="text-xs text-slate-500">Monitor employee onboarding readiness scores, compliance status, and start dates</p>
            </div>
          </div>
        </div>

        <Link
          href="/candidates"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
        >
          <UserCheck className="w-4 h-4" /> Manage Candidates Pipeline
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
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

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="READY">READY</option>
              <option value="PARTIALLY_READY">PARTIALLY READY</option>
              <option value="DELAYED">DELAYED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading employee directory...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No employees match your current search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Employee Name</th>
                  <th className="py-3.5 px-4">Role & Department</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4 text-center">Compliance Status</th>
                  <th className="py-3.5 px-4 text-center">Readiness Progress</th>
                  <th className="py-3.5 px-4 text-center">Critical Issues</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const score = emp.readinessPercentage || emp.readinessScore || 0;
                  const issues = emp.criticalIssuesCount || (emp.issues ? emp.issues.length : 0);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{emp.employeeId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-bold block text-xs">{emp.designation}</span>
                        <span className="text-[11px] text-slate-500">{emp.department}</span>
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-semibold whitespace-nowrap">
                        {new Date(emp.joiningDate).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 text-center flex justify-center">
                        {getStatusBadge(emp.status || emp.onboardingStatus)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-slate-800">{score}%</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {issues > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            {issues} Issue{issues > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">None</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="px-3.5 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
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
