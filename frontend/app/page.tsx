'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileCheck,
  CheckSquare,
  Package,
  Bell,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Layers,
  ChevronRight,
  Lock,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building,
  UserCheck,
  Compass,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">OnboardPro</span>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Enterprise Onboarding & Compliance</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#readiness" className="hover:text-white transition-colors">Readiness Engine</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Audit</a>
            <Link href="/dashboard/audit" className="hover:text-white transition-colors">Audit Trail</Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02]"
            >
              <span>Launch HR Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 max-w-7xl mx-auto text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-8 shadow-inner animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Next-Gen Enterprise HR Pre-Joining Compliance Platform</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
          Transform Candidate Conversion into{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
            Day-One Onboarding Excellence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          Automate document verification, background checks, IT hardware provisioning, and compliance readiness scoring before your new hire&apos;s start date.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl text-sm font-extrabold transition-all shadow-xl shadow-blue-600/35 hover:shadow-blue-600/50 hover:-translate-y-0.5"
          >
            <span>Open HR Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/candidates"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-8 py-4 rounded-2xl text-sm font-extrabold transition-all"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>View Candidate Pipeline</span>
          </Link>
        </div>

        {/* Trust & Live Stats */}
        <div className="mt-16 pt-12 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-black text-white">99.4%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Readiness Score Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400">&lt; 24 hrs</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Avg Document Verification</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">0 Days</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Day-One IT Setup Delays</div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Audit Trail Transparency</div>
          </div>
        </div>
      </section>

      {/* Interactive Hero Dashboard Preview Mockup */}
      <section className="px-6 max-w-6xl mx-auto pb-24">
        <div className="relative rounded-2xl p-2 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden group">
          {/* Top Browser Header Bar */}
          <div className="h-10 bg-slate-900 px-4 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-4 py-1 rounded-md border border-slate-800 flex items-center gap-2">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>https://onboardpro.company.com/dashboard</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Interactive Mockup Body */}
          <div className="p-6 md:p-8 bg-slate-950 space-y-6 text-left">
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Upcoming Joiners</span>
                <div className="text-2xl font-black text-white">24</div>
                <span className="text-[11px] text-blue-400 font-medium">Active Pipeline</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-900/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">100% Ready</span>
                <div className="text-2xl font-black text-emerald-400">18</div>
                <span className="text-[11px] text-emerald-500">Cleared for Day 1</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-blue-900/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-400">Partially Ready</span>
                <div className="text-2xl font-black text-blue-400">4</div>
                <span className="text-[11px] text-blue-500">Non-critical pending</span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-rose-900/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400">Blocked Issues</span>
                <div className="text-2xl font-black text-rose-400">2</div>
                <span className="text-[11px] text-rose-400">Action Required</span>
              </div>
            </div>

            {/* Sample Table Mock */}
            <div className="bg-slate-900/70 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                <span>Recent Candidate Conversions</span>
                <span className="text-blue-400">Live Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      AT
                    </div>
                    <div>
                      <span className="font-bold text-white block">Alex Turner</span>
                      <span className="text-[10px] text-slate-400">Software Engineer • Engineering</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    READY (100%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      RS
                    </div>
                    <div>
                      <span className="font-bold text-white block">Rahul Sharma</span>
                      <span className="text-[10px] text-slate-400">Product Manager • Product</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    PARTIALLY READY (75%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Built for Modern HR & Compliance Teams
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Everything required to manage pre-joining onboarding compliance without spreadsheets, phone calls, or day-one surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold border border-blue-500/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Candidate-to-Employee Conversion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convert selected candidates into employee records with single-click auto-matching to department onboarding plan templates.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Readiness Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic rule engine evaluating document completeness, background check clearance, task progress, and hardware readiness.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Document Collection & Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure upload portal with MIME type & extension whitelisting, private streaming, HR verification, and resubmission requests.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-violet-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold border border-violet-500/20 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Department Task Workflows</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Role-based task management for IT, Finance, Administration, and Reporting Managers to complete provisioning before day one.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">IT Hardware & Asset Readiness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track developer laptops, proximity ID cards, and peripherals from initial request through preparation, ready, and assignment.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold border border-rose-500/20 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deadline Reminders & Overdue Escalations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated deadline countdown alerts (7d, 3d, 1d) and automatic task priority upgrades with HR notification escalations.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Audit Section */}
      <section id="security" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8 md:p-12 rounded-3xl border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Enterprise Security & Audit
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Bank-Grade Protection & Complete Audit Trail
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every operation is authorized server-side and recorded in an immutable audit log with sensitive payload redaction.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Server-Side RBAC & Insecure Direct Object Reference (IDOR) Protections</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Document Extension Whitelisting & Path Traversal Sanitization</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic Sensitive Metadata Redaction (Passwords, Tokens, Keys)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sanitized Exception Filters & System Health Monitoring</span>
              </div>
            </div>

            <Link
              href="/dashboard/audit"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Explore Audit Trail Dashboard</span>
            </Link>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>SYSTEM AUDIT EVENT LOG</span>
              <span className="text-emerald-400">IMMUTABLE</span>
            </div>
            <div className="space-y-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800/80">
                <span className="text-blue-400 font-bold">CANDIDATE_CONVERTED</span>
                <span className="text-slate-400 block text-[10px]">Actor: HR Admin (Sarah Jenkins) • Target: EMP-2026-0001</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800/80">
                <span className="text-emerald-400 font-bold">DOCUMENT_VERIFIED</span>
                <span className="text-slate-400 block text-[10px]">Actor: HR Manager • Item: Aadhaar Card Verified</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800/80">
                <span className="text-amber-400 font-bold">READINESS_STATUS_CHANGED</span>
                <span className="text-slate-400 block text-[10px]">New Status: READY (100% Compliance Cleared)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-12 rounded-3xl shadow-2xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Ready to Eliminate Day-One Onboarding Delays?
          </h2>
          <p className="text-sm text-blue-100 max-w-xl mx-auto">
            Experience the enterprise compliance platform for candidates, employees, document verification, and department task workflows.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-slate-100 px-8 py-4 rounded-2xl text-sm font-extrabold transition-all shadow-xl hover:-translate-y-0.5"
            >
              <span>Launch HR Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">OnboardPro 2.0</span>
              <p className="text-[11px] text-slate-500">Enterprise Employee Onboarding & Compliance Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/employees" className="hover:text-white transition-colors">Employees</Link>
            <Link href="/candidates" className="hover:text-white transition-colors">Candidates</Link>
            <Link href="/documents" className="hover:text-white transition-colors">Documents</Link>
            <Link href="/dashboard/audit" className="hover:text-white transition-colors">Audit Trail</Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
