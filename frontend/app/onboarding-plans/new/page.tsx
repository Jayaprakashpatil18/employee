'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Compass,
  FileCheck,
  CheckSquare,
  Package,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function CreateOnboardingPlanPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Plan Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Document Requirements
  const [documents, setDocuments] = useState([
    { documentType: 'ID Proof (Aadhaar / Passport)', isRequired: true, verificationRequired: true },
    { documentType: 'PAN Card', isRequired: true, verificationRequired: true },
    { documentType: 'Education Certificate', isRequired: true, verificationRequired: true },
  ]);

  // Task Requirements
  const [tasks, setTasks] = useState([
    { title: 'Prepare Developer Laptop', description: 'Configure Macbook Pro M3', assignedDepartment: 'IT', defaultAssigneeRole: 'IT', isMandatory: true, dueDaysFromJoining: -3 },
    { title: 'Create Email Account & System Access', description: 'Grant IAM & repo permissions', assignedDepartment: 'IT', defaultAssigneeRole: 'IT', isMandatory: true, dueDaysFromJoining: -1 },
  ]);

  // Asset Requirements
  const [assets, setAssets] = useState([
    { assetType: 'Laptop (MacBook Pro)', isMandatory: true },
    { assetType: 'Proximity ID Card', isMandatory: true },
  ]);

  // Checklist Requirements
  const [checklist, setChecklist] = useState([
    { title: 'Manager Assigned & Welcome 1-on-1 scheduled', category: 'MANAGEMENT', isMandatory: true },
    { title: 'HR Orientation Attended', category: 'HR', isMandatory: true },
  ]);

  // Helpers for adding dynamic rows
  const addDocument = () => {
    setDocuments([...documents, { documentType: '', isRequired: true, verificationRequired: true }]);
  };
  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const addTask = () => {
    setTasks([...tasks, { title: '', description: '', assignedDepartment: 'IT', defaultAssigneeRole: 'IT', isMandatory: true, dueDaysFromJoining: 0 }]);
  };
  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const addAsset = () => {
    setAssets([...assets, { assetType: '', isMandatory: true }]);
  };
  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, { title: '', category: 'GENERAL', isMandatory: true }]);
  };
  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setErrorMsg('Plan title is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        title,
        description,
        department,
        designation: designation || null,
        location: location || null,
        employmentType: employmentType || null,
        isActive,
        documentRequirements: documents.filter((d) => d.documentType.trim() !== ''),
        taskRequirements: tasks.filter((t) => t.title.trim() !== ''),
        assetRequirements: assets.filter((a) => a.assetType.trim() !== ''),
        checklistRequirements: checklist.filter((c) => c.title.trim() !== ''),
      };

      const res = await apiClient.post('/onboarding-plans', payload);
      router.push(`/onboarding-plans/${res.data.id}`);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Failed to create onboarding plan. Duplicate active plan combination detected.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/onboarding-plans"
          className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create Onboarding Plan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure department rules, required documents, tasks, and asset specifications.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>1. Plan Information & Matching Scope</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Engineering Software Engineer Onboarding Plan"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Standard onboarding requirements for software developers..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation Match (Optional)</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Software Engineer (Leave blank for all)"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location Match (Optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru (Leave blank for all locations)"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employment Type (Optional)</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employment Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Documents */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>2. Required Compliance Documents</span>
            </h3>
            <button
              type="button"
              onClick={addDocument}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Document
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={doc.documentType}
                  onChange={(e) => {
                    const updated = [...documents];
                    updated[idx].documentType = e.target.value;
                    setDocuments(updated);
                  }}
                  placeholder="e.g. Passport, Education Certificate"
                  className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.verificationRequired}
                    onChange={(e) => {
                      const updated = [...documents];
                      updated[idx].verificationRequired = e.target.checked;
                      setDocuments(updated);
                    }}
                    className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Verification Required</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeDocument(idx)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Tasks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>3. Departmental Tasks</span>
            </h3>
            <button
              type="button"
              onClick={addTask}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => {
                      const updated = [...tasks];
                      updated[idx].title = e.target.value;
                      setTasks(updated);
                    }}
                    placeholder="Task Title (e.g. Provision Laptop)"
                    className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-medium"
                  />
                  <select
                    value={task.assignedDepartment}
                    onChange={(e) => {
                      const updated = [...tasks];
                      updated[idx].assignedDepartment = e.target.value;
                      setTasks(updated);
                    }}
                    className="bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs"
                  >
                    <option value="IT">IT</option>
                    <option value="FINANCE">Finance</option>
                    <option value="ADMINISTRATION">Admin</option>
                    <option value="HR">HR</option>
                  </select>
                  <input
                    type="number"
                    value={task.dueDaysFromJoining}
                    onChange={(e) => {
                      const updated = [...tasks];
                      updated[idx].dueDaysFromJoining = parseInt(e.target.value) || 0;
                      setTasks(updated);
                    }}
                    placeholder="Days offset (-3 = 3 days before)"
                    className="w-24 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(idx)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Assets & Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                <span>4. Required Assets</span>
              </h3>
              <button
                type="button"
                onClick={addAsset}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Asset
              </button>
            </div>
            <div className="space-y-2">
              {assets.map((asset, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={asset.assetType}
                    onChange={(e) => {
                      const updated = [...assets];
                      updated[idx].assetType = e.target.value;
                      setAssets(updated);
                    }}
                    placeholder="e.g. Laptop, ID Card"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeAsset(idx)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-600" />
                <span>5. Joining Checklist</span>
              </h3>
              <button
                type="button"
                onClick={addChecklistItem}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...checklist];
                      updated[idx].title = e.target.value;
                      setChecklist(updated);
                    }}
                    placeholder="e.g. Manager Assigned"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(idx)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 bg-white p-4 rounded-xl border border-slate-200">
          <Link
            href="/onboarding-plans"
            className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Compass className="w-4 h-4" />
            <span>{submitting ? 'Saving Plan...' : 'Save Onboarding Plan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
