'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileCheck,
  CheckSquare,
  Package,
  Bell,
  Settings,
  ShieldCheck,
  Compass,
  Zap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Candidates', href: '/candidates', icon: UserCheck },
  { name: 'Onboarding Plans', href: '/onboarding-plans', icon: Compass },
  { name: 'Documents', href: '/documents', icon: FileCheck },
  { name: 'Department Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Asset Readiness', href: '/assets', icon: Package },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Audit Trail', href: '/dashboard/audit', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen flex flex-col border-r border-slate-800/80 shadow-2xl relative z-20 select-none">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/80 gap-3 bg-slate-950/50 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base text-white tracking-tight">OnboardPro</h1>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Enterprise Compliance</p>
        </div>
      </div>

      {/* Navigation Label */}
      <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Main Navigation
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}`));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 ring-1 ring-white/10'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-blue-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="tracking-wide">{item.name}</span>
              </div>

              {item.badge && !isActive && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live Engine Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-inner flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-green" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-200">Compliance Engine</p>
              <p className="text-[10px] text-slate-400">Monitoring 24/7</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
      </div>
    </aside>
  );
}
