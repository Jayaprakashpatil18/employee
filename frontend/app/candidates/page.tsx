'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  UserPlus,
  ArrowRight,
  CheckCircle,
  Eye,
  Edit,
  UserCheck,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  location: string;
  employmentType: string;
  expectedJoiningDate: string;
  status: 'ACTIVE' | 'SELECTED' | 'REJECTED' | 'CONVERTED';
}

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  useEffect(() => {
    fetchCandidates();
  }, [selectedStatus, selectedDept]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (searchQuery) params.search = searchQuery;

      const response = await apiClient.get('/candidates', { params });
      setCandidates(response.data);
    } catch (err) {
      // Fallback sample data if backend API is connecting
      setCandidates([
        {
          id: 'cand-1',
          firstName: 'Rahul',
          lastName: 'Sharma',
          email: 'rahul.sharma@candidate.example.com',
          phone: '+91-9876543210',
          designation: 'Software Engineer',
          department: 'Engineering',
          location: 'Bengaluru',
          employmentType: 'Full Time',
          expectedJoiningDate: '2026-09-30',
          status: 'SELECTED',
        },
        {
          id: 'cand-2',
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'marcus.vance@candidate.example.com',
          phone: '+1-555-0199',
          designation: 'Financial Analyst',
          department: 'Finance',
          location: 'New York HQ',
          employmentType: 'Full Time',
          expectedJoiningDate: '2026-10-05',
          status: 'SELECTED',
        },
        {
          id: 'cand-3',
          firstName: 'David',
          lastName: 'Unmatched',
          email: 'david.unmatched@candidate.example.com',
          phone: '+1-555-9999',
          designation: 'Research Scientist',
          department: 'Quantum Robotics',
          location: 'Tokyo',
          employmentType: 'Contract',
          expectedJoiningDate: '2026-10-15',
          status: 'SELECTED',
        },
        {
          id: 'cand-4',
          firstName: 'Alex',
          lastName: 'Turner',
          email: 'alex.turner@corp.example.com',
          phone: '+1-555-0177',
          designation: 'Fullstack Engineer',
          department: 'Engineering',
          location: 'New York HQ',
          employmentType: 'Full Time',
          expectedJoiningDate: '2026-09-10',
          status: 'CONVERTED',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Selected</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Active</span>;
      case 'CONVERTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Converted</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage prospective hires, recruitment statuses, and initiate automated onboarding conversion.
          </p>
        </div>
        <Link
          href="/candidates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Candidate</span>
        </Link>
      </div>

      {/* Table & Controls Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Search and Filters Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate by name, email, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SELECTED">Selected</option>
                <option value="CONVERTED">Converted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Joining Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {candidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div>{cand.firstName} {cand.lastName}</div>
                    <div className="text-2xs text-slate-400 font-normal">{cand.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{cand.designation}</td>
                  <td className="px-6 py-4">{cand.department}</td>
                  <td className="px-6 py-4">{cand.location}</td>
                  <td className="px-6 py-4">{cand.employmentType}</td>
                  <td className="px-6 py-4 font-medium">{cand.expectedJoiningDate.substring(0, 10)}</td>
                  <td className="px-6 py-4">{getStatusBadge(cand.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/candidates/${cand.id}`}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/candidates/${cand.id}/edit`}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {cand.status === 'CONVERTED' ? (
                        <button
                          disabled
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-400 font-medium text-2xs cursor-not-allowed border border-slate-200"
                        >
                          Converted
                        </button>
                      ) : (
                        <Link
                          href={`/candidates/${cand.id}`}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-medium text-2xs transition-colors border border-emerald-200 flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Convert</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
