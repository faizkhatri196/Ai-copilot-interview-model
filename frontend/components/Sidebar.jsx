'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Activity,
  Building2,
  Workflow,
  Briefcase,
  HelpCircle,
  User,
  FileText,
  Sparkles,
  Award,
  PlayCircle,
  Code2,
  Cpu,
  Users2,
  Mic,
  BarChart3,
  FileCheck2,
  LineChart,
  Compass,
  Bell,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bot
} from 'lucide-react';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Preparation', href: '/preparation', icon: CalendarCheck },
      { name: 'Recent Activity', href: '/activity', icon: Activity },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Company Research', href: '/companies', icon: Building2 },
      { name: 'Interview Patterns', href: '/patterns', icon: Workflow },
      { name: 'Job Positions', href: '/positions', icon: Briefcase },
      { name: 'Question Intelligence', href: '/questions', icon: HelpCircle },
    ],
  },
  {
    title: 'MY PROFILE',
    items: [
      { name: 'Candidate Profile', href: '/profile', icon: User },
      { name: 'Resume Intelligence', href: '/resume', icon: FileText },
      { name: 'My Skills', href: '/skills', icon: Sparkles },
      { name: 'Experience', href: '/experience', icon: Award },
    ],
  },
  {
    title: 'PRACTICE',
    items: [
      { name: 'Start Interview', href: '/interview/setup', icon: PlayCircle, highlight: true },
      { name: 'Coding Arena', href: '/coding', icon: Code2 },
      { name: 'Technical Interview', href: '/interview/technical', icon: Cpu },
      { name: 'HR Interview', href: '/interview/hr', icon: Users2 },
      { name: 'Voice Interview', href: '/voice', icon: Mic },
    ],
  },
  {
    title: 'PERFORMANCE',
    items: [
      { name: 'Interview Reports', href: '/reports', icon: BarChart3 },
      { name: 'AI Evaluation', href: '/evaluation', icon: FileCheck2 },
      { name: 'Skill Analytics', href: '/analytics', icon: LineChart },
      { name: 'Preparation Roadmap', href: '/roadmap', icon: Compass },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Help & Support', href: '/support', icon: LifeBuoy },
    ],
  },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-sidebar border-r border-white/10 transition-all duration-300 ease-in-out shadow-2xl
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-sidebar-hover/40">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-purple flex items-center justify-center shadow-purple-glow flex-shrink-0">
              <Bot className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wide text-white leading-tight">
                  AI INTERVIEW
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                  Intelligence
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Button (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-white/50 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                      ${isActive
                        ? 'bg-white text-sidebar shadow-md font-semibold'
                        : item.highlight
                          ? 'bg-brand-purple/40 text-white hover:bg-brand-purple/60 border border-brand-accent/30'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-sidebar' : 'text-white'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}

                    {/* Collapsed Tooltip */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-brand-card text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl border border-white/20">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Profile Mini Card */}
        <div className="p-3 border-t border-white/10 bg-sidebar-active/30">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Pro Candidate</p>
                <p className="text-[10px] text-white/60 truncate">Interview Ready</p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}

