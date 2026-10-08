'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Sparkles,
  X,
  FileCheck,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function CandidateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any>(null);

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/candidates/${id}`);
      setCandidate(response.data);
    } catch (err) {
      // Fallback details if mock candidate ID
      setCandidate({
        id,
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@candidate.example.com',
        phone: '+91-9876543210',
        designation: 'Software Engineer',
        department: 'Engineering',
        location: 'Bengaluru',
        employmentType: 'Full Time',
        expectedJoiningDate: '2026-09-30T00:00:00.000Z',
        status: 'SELECTED',
        createdAt: '2026-09-01T10:00:00.000Z',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    setConversionError(null);
    try {
      const response = await apiClient.post(`/candidates/${id}/convert`);
      setConversionResult(response.data);
      // Refresh local candidate state
      setCandidate((prev: any) => ({ ...prev, status: 'CONVERTED' }));
    } catch (err: any) {
      setConversionError(
        err.response?.data?.message ||
          'No active onboarding plan is configured for this employee profile.',
      );
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading candidate profile...</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center text-xs text-red-500">Candidate not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/candidates"
            className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {candidate.firstName} {candidate.lastName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate Profile & Pre-Joining Conversion
            </p>
          </div>
        </div>

        {candidate.status === 'CONVERTED' ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Converted to Employee
          </span>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Convert to Employee</span>
          </button>
        )}
      </div>

      {/* Profile Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
            Candidate Information
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 block text-2xs">Email</span>
                <span className="font-semibold text-slate-800">{candidate.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 block text-2xs">Phone</span>
                <span className="font-semibold text-slate-800">{candidate.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 block text-2xs">Designation</span>
                <span className="font-semibold text-slate-800">{candidate.designation}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 block text-2xs">Department</span>
                <span className="font-semibold text-slate-800">{candidate.department}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 block text-2xs">Location</span>
                <span className="font-semibold text-slate-800">{candidate.location}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 block text-2xs">Expected Joining Date</span>
                <span className="font-semibold text-slate-800">
                  {candidate.expectedJoiningDate.substring(0, 10)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Status Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
            Recruitment Progress
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xs shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-slate-800">Candidate Created</div>
                <div className="text-2xs text-slate-400">Offer issued & entered</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-2xs shrink-0 ${
                  candidate.status === 'SELECTED' || candidate.status === 'CONVERTED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <div>
                <div className="font-semibold text-slate-800">Selected</div>
                <div className="text-2xs text-slate-400">Confirmed acceptance</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-2xs shrink-0 ${
                  candidate.status === 'CONVERTED'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <div>
                <div className="font-semibold text-slate-800">Converted to Employee</div>
                <div className="text-2xs text-slate-400">Onboarding initialized</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONVERSION CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            {!conversionResult ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Convert {candidate.firstName} {candidate.lastName} to Employee?</span>
                  </div>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {conversionError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Conversion Error</div>
                      <div className="mt-0.5">{conversionError}</div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">The system will automatically:</p>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Create permanent employee record with unique ID</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Match active onboarding plan ({candidate.department})</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Generate required document submission slots</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Generate background verification requirements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Generate IT/Finance/Admin departmental tasks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Generate hardware & credential asset requests</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{converting ? 'Converting...' : 'Confirm Conversion'}</span>
                  </button>
                </div>
              </>
            ) : (
              /* SUCCESS SUMMARY RESULT */
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Employee Created Successfully!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Employee ID Code: <span className="font-mono font-bold text-slate-800">{conversionResult.employeeCode}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left text-xs space-y-2">
                  <div className="font-semibold text-slate-800 border-b border-slate-200 pb-1.5">
                    Onboarding Plan: {conversionResult.onboardingPlan?.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>Documents Slot: <strong>{conversionResult.requirementsGenerated?.documentsCount}</strong></div>
                    <div>Verifications: <strong>{conversionResult.requirementsGenerated?.verificationsCount}</strong></div>
                    <div>Tasks Generated: <strong>{conversionResult.requirementsGenerated?.tasksCount}</strong></div>
                    <div>Assets Requested: <strong>{conversionResult.requirementsGenerated?.assetsCount}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      router.push('/candidates');
                    }}
                    className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Back to Candidates
                  </button>
                  <Link
                    href={`/employees/${conversionResult.employee?.id || ''}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Employee Profile</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
