'use client';

import React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { Search, User, ShieldCheck, Sparkles, Command } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { NotificationBell } from '../notifications/notification-bell';

export function Header() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isRealClerkKey =
    clerkKey &&
    !clerkKey.includes('ZXhhbXBsZS') &&
    clerkKey !== 'pk_test_...' &&
    !clerkKey.includes('placeholder');

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Breadcrumbs & Page Context */}
      <div className="flex items-center gap-3">
        <Breadcrumbs />
      </div>

      {/* Right: Search, Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Global Search Input with Hotkey Display */}
        <div className="relative w-72 hidden lg:block group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search employees, candidates, docs..."
            className="w-full bg-slate-100/70 border border-slate-200/80 rounded-xl pl-10 pr-10 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400 shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Dynamic Notifications Bell */}
        <NotificationBell />

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* System User Status Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>HR Administrator</span>
        </div>

        {/* Clerk Auth / Dev Profile */}
        <div className="flex items-center pl-1">
          {isRealClerkKey ? (
            <>
              <SignedIn>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8 rounded-full ring-2 ring-blue-600/20 hover:ring-blue-600 transition-all' } }} />
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <User className="w-4 h-4 text-slate-500" />
                  <SignInButton mode="modal">
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/20">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-600/20">
              HR
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
