'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Header({ onOpenMobileSidebar }) {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background-primary/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
      {/* Left Search / Mobile Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-content-secondary hover:text-white hover:bg-brand-card transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
          <input
            type="text"
            placeholder="Search companies, interview patterns, DSA topics..."
            className="w-full bg-brand-card/70 border border-border text-xs rounded-xl pl-10 pr-4 py-2 text-white placeholder-content-muted focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Practice Pill */}
        <Link
          href="/interview/setup"
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-gradient text-white text-xs font-semibold shadow-card-glow hover:opacity-95 transition-opacity"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>New Simulation</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="p-2 rounded-xl text-content-secondary hover:text-white hover:bg-brand-card border border-transparent hover:border-border transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-system-warning ring-2 ring-background-primary" />
        </Link>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-brand-card border border-transparent hover:border-border transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-sidebar flex items-center justify-center text-white text-xs font-bold border border-white/20">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{user.name || 'Candidate'}</span>
                <span className="text-[10px] text-content-secondary">Candidate</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-content-muted" />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-brand-card border border-border shadow-modal-glow py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-border/50">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-content-secondary truncate">{user.email}</p>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-content-secondary hover:text-white hover:bg-white/5"
                >
                  <User className="h-3.5 w-3.5" /> Profile Settings
                </Link>
                <Link
                  href="/onboarding"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-content-secondary hover:text-white hover:bg-white/5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Onboarding Wizard
                </Link>

                <div className="border-t border-border/50 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-system-error hover:bg-system-error/10 text-left"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-white hover:bg-brand-card transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-purple hover:bg-brand-purple/90 text-white transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

