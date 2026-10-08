'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Compass,
  FileCheck,
  CheckSquare,
  Package,
  ListChecks,
  CheckCircle,
  XCircle,
  Power,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/onboarding-plans/${id}`);
      setPlan(res.data);
    } catch (err) {
      setPlan({
        id,
        title: 'Engineering New Hire Plan',
        description: 'Standard technical onboarding covering workstation, S3 access, and buddy allocation.',
        department: 'Engineering',
        designation: 'Software Engineer',
        location: 'Bengaluru',
        employmentType: 'Full Time',
        isActive: true,
        documentRequirements: [
          { id: '1', documentType: 'ID Proof (Aadhaar / Passport)', verificationRequired: true },
          { id: '2', documentType: 'PAN Card', verificationRequired: true },
          { id: '3', documentType: 'Education Certificate', verificationRequired: true },
        ],
        taskRequirements: [
          { id: '1', title: 'Prepare Developer Laptop', assignedDepartment: 'IT', dueDaysFromJoining: -3 },
          { id: '2', title: 'Create Email Account & System Access', assignedDepartment: 'IT', dueDaysFromJoining: -1 },
        ],
        assetRequirements: [
          { id: '1', assetType: 'Laptop (MacBook Pro)', isMandatory: true },
          { id: '2', assetType: 'Proximity ID Card', isMandatory: true },
        ],
        checklistRequirements: [
          { id: '1', title: 'Manager Assigned & Welcome 1-on-1 scheduled', category: 'MANAGEMENT' },
          { id: '2', title: 'HR Orientation Attended', category: 'HR' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const endpoint = plan.isActive ? `/onboarding-plans/${id}/deactivate` : `/onboarding-plans/${id}/activate`;
      await apiClient.post(endpoint);
      setPlan((prev: any) => ({ ...prev, isActive: !prev.isActive }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update plan status.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading plan template...</div>;
  }

  if (!plan) {
    return <div className="p-8 text-center text-xs text-red-500">Plan not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/onboarding-plans"
            className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{plan.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Department Template Specs & Requirement Definitions
            </p>
          </div>
        </div>

        <button
          onClick={toggleStatus}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
            plan.isActive
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}</span>
        </button>
      </div>

      {/* Plan Details Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-blue-100 text-blue-800">
            {plan.department}
          </span>
          {plan.isActive ? (
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800">
              Active Template
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-200 text-slate-600">
              Inactive
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600">{plan.description || 'No description available.'}</p>
        <div className="grid grid-cols-3 gap-4 text-2xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600">
          <div>Designation: <span className="font-semibold text-slate-800">{plan.designation || 'All'}</span></div>
          <div>Location: <span className="font-semibold text-slate-800">{plan.location || 'All Locations'}</span></div>
          <div>Employment Type: <span className="font-semibold text-slate-800">{plan.employmentType || 'All Types'}</span></div>
        </div>
      </div>

      {/* Grid of Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Document Requirements ({plan.documentRequirements?.length || 0})</span>
          </h3>
          <ul className="space-y-2 text-xs">
            {plan.documentRequirements?.map((doc: any) => (
              <li key={doc.id || doc.documentType} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <span className="font-medium text-slate-800">{doc.documentType}</span>
                {doc.verificationRequired && (
                  <span className="text-2xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                    BGV Required
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>Departmental Tasks ({plan.taskRequirements?.length || 0})</span>
          </h3>
          <ul className="space-y-2 text-xs">
            {plan.taskRequirements?.map((task: any) => (
              <li key={task.id || task.title} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <div>
                  <div className="font-medium text-slate-800">{task.title}</div>
                  <div className="text-2xs text-slate-400">Assigned: {task.assignedDepartment}</div>
                </div>
                <span className="text-2xs font-mono font-medium text-slate-600 bg-white px-2 py-0.5 rounded-sm border border-slate-200">
                  {task.dueDaysFromJoining} days
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Assets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
            <Package className="w-4 h-4 text-purple-600" />
            <span>Asset Requirements ({plan.assetRequirements?.length || 0})</span>
          </h3>
          <ul className="space-y-2 text-xs">
            {plan.assetRequirements?.map((asset: any) => (
              <li key={asset.id || asset.assetType} className="bg-slate-50 p-2.5 rounded-md border border-slate-200 font-medium text-slate-800">
                {asset.assetType}
              </li>
            ))}
          </ul>
        </div>

        {/* Checklist */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
            <ListChecks className="w-4 h-4 text-emerald-600" />
            <span>Joining Checklist ({plan.checklistRequirements?.length || 0})</span>
          </h3>
          <ul className="space-y-2 text-xs">
            {plan.checklistRequirements?.map((item: any) => (
              <li key={item.id || item.title} className="bg-slate-50 p-2.5 rounded-md border border-slate-200 font-medium text-slate-800">
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
