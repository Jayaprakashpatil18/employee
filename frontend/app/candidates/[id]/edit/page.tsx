'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function EditCandidatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Engineering',
    location: 'Bengaluru',
    employmentType: 'Full Time',
    expectedJoiningDate: '',
    status: 'SELECTED',
  });

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const res = await apiClient.get(`/candidates/${id}`);
      const data = res.data;
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        designation: data.designation || '',
        department: data.department || 'Engineering',
        location: data.location || 'Bengaluru',
        employmentType: data.employmentType || 'Full Time',
        expectedJoiningDate: data.expectedJoiningDate
          ? data.expectedJoiningDate.substring(0, 10)
          : '',
        status: data.status || 'SELECTED',
      });
    } catch (err) {
      // Fallback defaults
      setFormData({
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
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await apiClient.patch(`/candidates/${id}`, formData);
      router.push(`/candidates/${id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update candidate information.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading candidate form...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/candidates/${id}`}
          className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit Candidate Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">Modify candidate contact, designation, or expected joining date.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Joining Date</label>
              <input
                type="date"
                value={formData.expectedJoiningDate}
                onChange={(e) => setFormData({ ...formData, expectedJoiningDate: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href={`/candidates/${id}`}
              className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Edit className="w-4 h-4" />
              <span>{submitting ? 'Updating...' : 'Update Candidate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
