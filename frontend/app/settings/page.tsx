'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Platform Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure global role permissions, integrations, and email triggers.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
        <Settings className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="font-semibold text-slate-800 text-sm">System Settings Workspace</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Role-Based Access Control (RBAC) configured across 7 system roles.
        </p>
      </div>
    </div>
  );
}
