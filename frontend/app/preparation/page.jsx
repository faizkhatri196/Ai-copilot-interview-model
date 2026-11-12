'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarCheck, Compass, Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function PreparationPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Target Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">My Preparation Tracker</h1>
            <p className="text-xs sm:text-sm text-content-secondary mt-1">
              Active milestones, weekly study goals, and preparation velocity tracking.
            </p>
          </div>

          <Link
            href="/roadmap"
            className="px-5 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2"
          >
            <Compass className="h-4 w-4" /> Go to Full Roadmap
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-2">
            <span className="text-xs font-bold text-content-secondary uppercase">Weekly Target</span>
            <p className="text-3xl font-black text-white">12.5 / 15 hrs</p>
            <p className="text-[11px] text-system-success font-semibold">83% of weekly objective reached</p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-2">
            <span className="text-xs font-bold text-content-secondary uppercase">DSA Exercises Solved</span>
            <p className="text-3xl font-black text-brand-accent">28 Problems</p>
            <p className="text-[11px] text-content-secondary">Across Arrays, Sliding Window, Trees</p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-2">
            <span className="text-xs font-bold text-content-secondary uppercase">Mock Interview Streak</span>
            <p className="text-3xl font-black text-system-warning">4 Days</p>
            <p className="text-[11px] text-content-secondary">Consecutive daily simulations</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white">Today's Recommended Preparation Plan</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-background-secondary border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-system-success" />
                <div>
                  <p className="text-xs font-bold text-white">Solve 2 Sliding Window Problems in Coding Arena</p>
                  <p className="text-[11px] text-content-secondary">Focus on variable window lengths</p>
                </div>
              </div>
              <Link href="/coding" className="text-xs font-bold text-brand-accent hover:underline">
                Open Arena
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-background-secondary border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-brand-accent" />
                <div>
                  <p className="text-xs font-bold text-white">15-minute Amazon Bar Raiser Behavioral Session</p>
                  <p className="text-[11px] text-content-secondary">Leadership Principle: Customer Obsession & Ownership</p>
                </div>
              </div>
              <Link href="/interview/setup?round=Behavioral%20Interview" className="text-xs font-bold text-brand-accent hover:underline">
                Launch Mock
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

