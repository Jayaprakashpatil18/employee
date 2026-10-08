'use client';

import React from 'react';
import { FileCheck } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Document Verification Center</h2>
        <p className="text-xs text-slate-500 mt-1">Review, verify, and track employee compliance document submissions.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
        <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="font-semibold text-slate-800 text-sm">Document Management Infrastructure</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Prisma models and status enums (`PENDING`, `VERIFIED`, `REJECTED`, `RESUBMISSION_REQUIRED`) are initialized.
        </p>
      </div>
    </div>
  );
}
