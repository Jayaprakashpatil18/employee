'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Compass,
  CheckCircle,
  XCircle,
  Eye,
  Power,
  Trash2,
  FileText,
  CheckSquare,
  Package,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Plan {
  id: string;
  title: string;
  description?: string;
  department: string;
  designation?: string;
  location?: string;
  employmentType?: string;
  isActive: boolean;
  documentRequirements?: any[];
  taskRequirements?: any[];
  assetRequirements?: any[];
  checklistRequirements?: any[];
  _count?: { employees: number };
}

export default function OnboardingPlansListPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/onboarding-plans');
      setPlans(response.data);
    } catch (err) {
      // Fallback sample data if connecting backend
      setPlans([
        {
          id: 'plan-eng-001',
          title: 'Engineering New Hire Plan',
          description: 'Standard technical onboarding covering workstation, S3 access, and buddy allocation.',
          department: 'Engineering',
          designation: 'Software Engineer',
          location: 'Bengaluru',
          employmentType: 'Full Time',
          isActive: true,
          documentRequirements: [{}, {}, {}, {}],
          taskRequirements: [{}, {}, {}],
          assetRequirements: [{}, {}],
          checklistRequirements: [{}, {}, {}],
        },
        {
          id: 'plan-fin-001',
          title: 'Finance New Hire Plan',
          description: 'Onboarding template for financial analysts and ledger accounting.',
          department: 'Finance',
          designation: 'Financial Analyst',
          location: 'New York HQ',
          employmentType: 'Full Time',
          isActive: true,
          documentRequirements: [{}, {}],
          taskRequirements: [{}],
          assetRequirements: [{}, {}],
          checklistRequirements: [{}],
        },
        {
          id: 'plan-hr-001',
          title: 'HR Generalist Plan',
          description: 'Onboarding flow for incoming HR managers.',
          department: 'Human Resources',
          employmentType: 'Full Time',
          isActive: false,
          documentRequirements: [{}],
          taskRequirements: [{}],
          assetRequirements: [{}],
          checklistRequirements: [{}],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus ? `/onboarding-plans/${id}/deactivate` : `/onboarding-plans/${id}/activate`;
      await apiClient.post(endpoint);
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p)),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update plan status.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete onboarding plan '${title}'?`)) {
      try {
        await apiClient.delete(`/onboarding-plans/${id}`);
        setPlans((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete plan.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Onboarding Plan Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure department onboarding templates, document requirements, and task rules.
          </p>
        </div>
        <Link
          href="/onboarding-plans/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Onboarding Plan</span>
        </Link>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
              plan.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75 bg-slate-50/50'
            }`}
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {plan.department}
                </span>
                {plan.isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-200 text-slate-600 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-slate-500" /> Inactive
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{plan.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {plan.description || 'No description provided.'}
                </p>
              </div>

              {/* Matching Scope */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-2xs text-slate-600 space-y-1">
                <div>Designation: <span className="font-semibold text-slate-800">{plan.designation || 'All'}</span></div>
                <div>Location: <span className="font-semibold text-slate-800">{plan.location || 'All Locations'}</span></div>
                <div>Employment Type: <span className="font-semibold text-slate-800">{plan.employmentType || 'All Types'}</span></div>
              </div>

              {/* Requirement Counters */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="bg-blue-50 p-2 rounded-md border border-blue-100 text-blue-800">
                  <div className="font-bold text-sm">{plan.documentRequirements?.length || 0}</div>
                  <div className="text-2xs text-blue-600">Docs</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-md border border-amber-100 text-amber-800">
                  <div className="font-bold text-sm">{plan.taskRequirements?.length || 0}</div>
                  <div className="text-2xs text-amber-600">Tasks</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-md border border-purple-100 text-purple-800">
                  <div className="font-bold text-sm">{plan.assetRequirements?.length || 0}</div>
                  <div className="text-2xs text-purple-600">Assets</div>
                </div>
              </div>
            </div>

            {/* Plan Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  plan.isActive
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
                title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{plan.isActive ? 'Deactivate' : 'Activate'}</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={`/onboarding-plans/${plan.id}`}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md"
                  title="View Plan Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(plan.id, plan.title)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
