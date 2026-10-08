'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCheck,
  FileCheck,
  CheckSquare,
  Package,
  ListChecks,
  ShieldCheck,
  Building,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Upload,
  Download,
  Eye,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  User,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function EmployeeDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals & Interactivity State
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'VERIFY' | 'REJECT' | 'RESUBMIT'>('VERIFY');
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Background Verification Modal State
  const [selectedVerif, setSelectedVerif] = useState<any>(null);
  const [showVerifModal, setShowVerifModal] = useState(false);
  const [verifResult, setVerifResult] = useState<'CLEAR' | 'FAILED' | 'NEEDS_REVIEW'>('CLEAR');
  const [verifRemarks, setVerifRemarks] = useState('');
  const [completingVerif, setCompletingVerif] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const [empRes, readRes, chkRes] = await Promise.all([
        apiClient.get(`/employees/${id}`).catch(() => null),
        apiClient.get(`/readiness/employees/${id}`).catch(() => null),
        apiClient.get(`/employees/${id}/checklist`).catch(() => null),
      ]);

      if (empRes?.data) setEmployee(empRes.data);
      if (readRes?.data) setReadiness(readRes.data);
      if (chkRes?.data) setChecklistData(chkRes.data);
    } catch (err) {
      console.error('Failed to load employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Checklist Actions
  const handleToggleChecklist = async (itemId: string, isCompleted: boolean) => {
    try {
      const endpoint = isCompleted ? `/checklist/${itemId}/reopen` : `/checklist/${itemId}/complete`;
      await apiClient.post(endpoint);
      fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update checklist item status.');
    }
  };

  // Upload Document Handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedDoc) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await apiClient.post(`/documents/${selectedDoc.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setUploadFile(null);
      fetchEmployeeDetails();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload document. Max file size is 10 MB.');
    } finally {
      setUploading(false);
    }
  };

  // HR Verification Handler
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setVerifying(true);
    try {
      let endpoint = `/documents/${selectedDoc.id}/verify`;
      let payload: any = { remarks: verificationRemarks };

      if (verifyAction === 'REJECT') {
        endpoint = `/documents/${selectedDoc.id}/reject`;
        payload = { rejectionReason, remarks: verificationRemarks };
      } else if (verifyAction === 'RESUBMIT') {
        endpoint = `/documents/${selectedDoc.id}/resubmit`;
        payload = { remarks: verificationRemarks || 'Please upload a clearer copy.' };
      }

      await apiClient.post(endpoint, payload);
      setShowVerifyModal(false);
      setRejectionReason('');
      setVerificationRemarks('');
      fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process document verification.');
    } finally {
      setVerifying(false);
    }
  };

  // Start Background Verification
  const handleStartVerif = async (verifId: string) => {
    try {
      await apiClient.post(`/verifications/${verifId}/start`);
      fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start background verification.');
    }
  };

  // Complete Background Verification Handler
  const handleCompleteVerifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerif) return;

    setCompletingVerif(true);
    try {
      await apiClient.post(`/verifications/${selectedVerif.id}/complete`, {
        result: verifResult,
        remarks: verifRemarks,
      });
      setShowVerifModal(false);
      setVerifRemarks('');
      fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete background verification.');
    } finally {
      setCompletingVerif(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading onboarding details...</div>;
  if (!employee) return <div className="p-8 text-center text-xs text-red-500">Employee record not found.</div>;

  const docs = employee.documents || [];
  const verifs = employee.verifications || [];
  const tasks = employee.tasks || [];
  const assets = employee.assets || [];
  const checklistItems = checklistData?.items || employee.checklist || [];

  const readinessStatus = readiness?.status || employee.onboardingStatus || 'PARTIALLY_READY';
  const readinessPct = readiness?.readinessPercentage !== undefined ? readiness.readinessPercentage : 75;

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'READY':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> READY</span>;
      case 'PARTIALLY_READY':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-600" /> PARTIALLY READY</span>;
      case 'DELAYED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> DELAYED</span>;
      case 'BLOCKED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5"><XCircle className="w-4 h-4 text-rose-600" /> BLOCKED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">{st}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.designation} • {employee.department} • {employee.location}
            </p>
          </div>
        </div>

        <div>{getStatusBadge(readinessStatus)}</div>
      </div>

      {/* Onboarding Readiness Summary Scorecard */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Onboarding Compliance & Readiness Score</span>
            </h3>
            <p className="text-2xs text-slate-500">Evaluates mandatory documents, background checks, tasks, assets, and joining checklist.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xs font-semibold text-slate-400 block uppercase">Overall Readiness</span>
              <span className="text-2xl font-black text-slate-900">{readinessPct}%</span>
            </div>
            <div className="w-24 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  readinessStatus === 'READY'
                    ? 'bg-emerald-500'
                    : readinessStatus === 'BLOCKED'
                    ? 'bg-rose-500'
                    : readinessStatus === 'DELAYED'
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-2xs">
          {[
            { key: 'documents', label: 'Documents', data: readiness?.categories?.documents, total: docs.length, done: docs.filter((d: any) => d.verificationStatus === 'VERIFIED').length },
            { key: 'verifications', label: 'Verifications', data: readiness?.categories?.verifications, total: verifs.length, done: verifs.filter((v: any) => v.status === 'COMPLETED').length },
            { key: 'tasks', label: 'Tasks', data: readiness?.categories?.tasks, total: tasks.length, done: tasks.filter((t: any) => t.status === 'COMPLETED').length },
            { key: 'assets', label: 'Assets', data: readiness?.categories?.assets, total: assets.length, done: assets.filter((a: any) => a.status === 'READY' || a.status === 'ASSIGNED').length },
            { key: 'checklist', label: 'Checklist', data: readiness?.categories?.checklist, total: checklistItems.length, done: checklistItems.filter((c: any) => c.isCompleted).length },
          ].map((cat) => {
            const tot = cat.data ? cat.data.total : cat.total;
            const com = cat.data ? cat.data.completed : cat.done;
            const pct = tot > 0 ? Math.round((com / tot) * 100) : 100;
            return (
              <div key={cat.key} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center font-semibold text-slate-700">
                  <span>{cat.label}</span>
                  <span className="font-bold text-slate-900">{com}/{tot}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-slate-400 block text-2xs text-right font-medium">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Journey Timeline */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-600" /> Onboarding Journey Timeline
        </h4>
        <div className="flex items-center justify-between overflow-x-auto py-2 px-1">
          {[
            { stage: 'Candidate', done: true },
            { stage: 'Plan Assigned', done: !!employee.onboardingPlanId },
            { stage: 'Documents', done: docs.length > 0 && docs.every((d: any) => d.verificationStatus === 'VERIFIED'), warning: docs.some((d: any) => d.verificationStatus === 'REJECTED') },
            { stage: 'Verification', done: verifs.length > 0 && verifs.every((v: any) => v.status === 'COMPLETED' && v.result === 'CLEAR'), warning: verifs.some((v: any) => v.result === 'FAILED') },
            { stage: 'Department Tasks', done: tasks.length > 0 && tasks.every((t: any) => t.status === 'COMPLETED'), warning: tasks.some((t: any) => t.status === 'BLOCKED') },
            { stage: 'Assets', done: assets.length > 0 && assets.every((a: any) => a.status === 'READY' || a.status === 'ASSIGNED'), warning: assets.some((a: any) => a.status === 'BLOCKED') },
            { stage: 'Joining Checklist', done: checklistItems.length > 0 && checklistItems.every((c: any) => c.isCompleted) },
            { stage: 'Ready for Joining', done: readinessStatus === 'READY' },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.stage}>
              <div className="flex flex-col items-center min-w-20 text-center space-y-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                    item.warning
                      ? 'bg-rose-100 border-rose-300 text-rose-700'
                      : item.done
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                >
                  {item.warning ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : item.done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={`text-2xs font-semibold ${item.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.stage}
                </span>
              </div>
              {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mx-0.5" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: UserCheck },
          { id: 'checklist', label: `Checklist (${checklistItems.length})`, icon: ListChecks },
          { id: 'documents', label: `Documents (${docs.length})`, icon: FileCheck },
          { id: 'verifications', label: `Background Checks (${verifs.length})`, icon: ShieldCheck },
          { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          { id: 'assets', label: `Assets (${assets.length})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Critical Issues / Attention Required */}
          {readiness?.issues && readiness.issues.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-rose-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Attention Required ({readiness.issues.length} Issues)</span>
              </h3>
              <div className="divide-y divide-rose-100">
                {readiness.issues.map((iss: any, i: number) => (
                  <div key={i} className="py-2.5 flex items-start justify-between text-xs gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{iss.name}</span>
                        <span className="font-mono text-2xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">{iss.category}</span>
                      </div>
                      <p className="text-slate-600 text-2xs">{iss.message}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border uppercase shrink-0 ${
                        iss.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : iss.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {iss.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              Employee Profile Details
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-2xs">Employee Code</span>
                <span className="font-mono font-bold text-slate-900">{employee.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Designation</span>
                <span className="font-semibold text-slate-900">{employee.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Department</span>
                <span className="font-semibold text-slate-900">{employee.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Location</span>
                <span className="font-semibold text-slate-900">{employee.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Joining Date</span>
                <span className="font-semibold text-slate-900">{new Date(employee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Email</span>
                <span className="font-semibold text-slate-900">{employee.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST TAB */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ListChecks className="w-4.5 h-4.5 text-blue-600" />
                  <span>Final Joining Checklist</span>
                </h3>
                <p className="text-2xs text-slate-500">Track and verify pre-joining requirements prior to employee start date.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800">
                  {checklistItems.filter((c: any) => c.isCompleted).length} / {checklistItems.length} completed
                </span>
                <div className="w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${
                        checklistItems.length > 0
                          ? Math.round((checklistItems.filter((c: any) => c.isCompleted).length / checklistItems.length) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {checklistItems.map((item: any) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isCompleted ? 'bg-slate-50/70 border-slate-200/80' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleChecklist(item.id, item.isCompleted)}
                      className={`w-5 h-5 rounded mt-0.5 border flex items-center justify-center transition-colors shrink-0 ${
                        item.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-600 bg-white'
                      }`}
                    >
                      {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item.title || item.item}
                        </span>
                        {item.isMandatory ? (
                          <span className="text-2xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Mandatory</span>
                        ) : (
                          <span className="text-2xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                        )}
                      </div>
                      {item.isCompleted && item.completedBy && (
                        <p className="text-2xs text-slate-400 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Completed by <strong>{item.completedBy.name || item.completedBy.email}</strong> on {new Date(item.completedAt).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleChecklist(item.id, item.isCompleted)}
                    className={`px-3 py-1 rounded-md text-2xs font-semibold border transition-colors ${
                      item.isCompleted
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200'
                    }`}
                  >
                    {item.isCompleted ? 'Reopen Item' : 'Mark Completed'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Required Compliance Documents</h3>
                <p className="text-2xs text-slate-500">Upload PDF, JPG, or PNG files under 10 MB.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="px-6 py-3">Document Type</th>
                    <th className="px-6 py-3">Submission</th>
                    <th className="px-6 py-3">Verification</th>
                    <th className="px-6 py-3">Submitted File</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {docs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div>{doc.documentType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold border ${
                          doc.submissionStatus === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {doc.submissionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold border ${
                          doc.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : doc.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {doc.documentName ? (
                          <a href={`http://localhost:4000/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> {doc.documentName}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedDoc(doc); setShowUploadModal(true); }} className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-2xs font-semibold border border-blue-200">
                            Upload
                          </button>
                          {doc.submissionStatus === 'SUBMITTED' && doc.verificationStatus !== 'VERIFIED' && (
                            <button onClick={() => { setSelectedDoc(doc); setShowVerifyModal(true); }} className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-2xs font-semibold border border-emerald-200">
                              Verify
                            </button>
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
      )}

      {/* BACKGROUND VERIFICATIONS TAB */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Background Verification Checks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="px-6 py-3">Verification Type</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Result</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {verifs.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{v.verificationType}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-2xs bg-slate-100 font-semibold">{v.status}</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold border ${
                          v.result === 'CLEAR' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : v.result === 'FAILED' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {v.result || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {v.status === 'REQUESTED' && (
                            <button onClick={() => handleStartVerif(v.id)} className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-2xs font-semibold border border-amber-200">
                              Start
                            </button>
                          )}
                          {v.status !== 'COMPLETED' && (
                            <button onClick={() => { setSelectedVerif(v); setShowVerifModal(true); }} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-2xs font-semibold border border-emerald-200">
                              Complete
                            </button>
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
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Departmental Tasks</h3>
          <div className="space-y-2">
            {tasks.map((t: any) => (
              <div key={t.id} className="p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">{t.title}</span>
                  <p className="text-2xs text-slate-500">Department: {t.assignedDepartment}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-2xs font-bold border ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Employee Assets</h3>
          <div className="space-y-2">
            {assets.map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">{a.assetName}</span>
                  <p className="text-2xs text-slate-500">Type: {a.assetType}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-2xs font-bold border ${a.status === 'READY' || a.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD DOCUMENT MODAL */}
      {showUploadModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload {selectedDoc.documentType}</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select File (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs"
                />
                <p className="text-2xs text-slate-400 mt-1">Maximum file size: 10 MB.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: HR DOCUMENT VERIFICATION MODAL */}
      {showVerifyModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>HR Review: {selectedDoc.documentType}</span>
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select HR Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyAction('VERIFY')}
                    className={`py-2 rounded-md text-xs font-semibold border transition-all ${
                      verifyAction === 'VERIFY'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyAction('REJECT')}
                    className={`py-2 rounded-md text-xs font-semibold border transition-all ${
                      verifyAction === 'REJECT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyAction('RESUBMIT')}
                    className={`py-2 rounded-md text-xs font-semibold border transition-all ${
                      verifyAction === 'RESUBMIT'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    Resubmit
                  </button>
                </div>
              </div>

              {verifyAction === 'REJECT' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Uploaded document is unclear or expired"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HR Verification Remarks</label>
                <textarea
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  placeholder="Optional remarks for audit history..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifying ? 'Saving...' : 'Submit Action'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPLETE BACKGROUND VERIFICATION MODAL */}
      {showVerifModal && selectedVerif && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Complete Verification: {selectedVerif.verificationType}</span>
              </h3>
              <button onClick={() => setShowVerifModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteVerifSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verification Result <span className="text-red-500">*</span>
                </label>
                <select
                  value={verifResult}
                  onChange={(e: any) => setVerifResult(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-semibold"
                >
                  <option value="CLEAR">CLEAR (Passed all checks)</option>
                  <option value="FAILED">FAILED (Discrepancy / Risk detected)</option>
                  <option value="NEEDS_REVIEW">NEEDS REVIEW (Requires HR escalation)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks & Agency Notes</label>
                <textarea
                  value={verifRemarks}
                  onChange={(e) => setVerifRemarks(e.target.value)}
                  placeholder="Enter verification report summary..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completingVerif}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completingVerif ? 'Completing...' : 'Save Result'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
