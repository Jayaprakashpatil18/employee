'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

const candidateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string().min(2, 'Department is required'),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.string().min(2, 'Employment type is required'),
  expectedJoiningDate: z.string().min(1, 'Expected joining date is required'),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

export default function CreateCandidatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      location: 'Bengaluru',
      employmentType: 'Full Time',
      department: 'Engineering',
    },
  });

  const onSubmit = async (values: CandidateFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const response = await apiClient.post('/candidates', values);
      router.push(`/candidates/${response.data.id || ''}`);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to create candidate record. Please check the details and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/candidates"
          className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Candidate</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add prospective hire details for offer conversion and pre-joining onboarding.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('firstName')}
                placeholder="e.g. Rahul"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.firstName && (
                <p className="text-red-500 text-2xs mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('lastName')}
                placeholder="e.g. Sharma"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.lastName && (
                <p className="text-red-500 text-2xs mt-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="rahul.sharma@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.email && (
                <p className="text-red-500 text-2xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+91-9876543210"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.phone && (
                <p className="text-red-500 text-2xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('designation')}
                placeholder="Software Engineer"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.designation && (
                <p className="text-red-500 text-2xs mt-1">{errors.designation.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                {...register('department')}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              >
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
                <option value="Quantum Robotics">Quantum Robotics (Unmatched Test)</option>
              </select>
              {errors.department && (
                <p className="text-red-500 text-2xs mt-1">{errors.department.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder="Bengaluru"
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.location && (
                <p className="text-red-500 text-2xs mt-1">{errors.location.message}</p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('employmentType')}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
              {errors.employmentType && (
                <p className="text-red-500 text-2xs mt-1">{errors.employmentType.message}</p>
              )}
            </div>

            {/* Joining Date */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('expectedJoiningDate')}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {errors.expectedJoiningDate && (
                <p className="text-red-500 text-2xs mt-1">{errors.expectedJoiningDate.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/candidates"
              className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Saving Candidate...' : 'Save Candidate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
