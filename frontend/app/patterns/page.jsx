'use client';

import React from 'react';
import Link from 'next/link';
import { Workflow, Sparkles, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function PatternsPage() {
  const patterns = [
    {
      company: 'Amazon',
      role: 'SDE 1 / SDE 2',
      reportedRounds: 'OA (HackerRank) -> Technical Screen -> 4 Onsite Rounds (2 DSA, 1 LLD/System Design, 1 Bar Raiser)',
      topTopics: ['Sliding Window', 'Topological Sort', 'Lowest Common Ancestor', 'Leadership Principles (STAR)'],
      frequency: 'High Frequency'
    },
    {
      company: 'Google',
      role: 'L3 / L4 Software Engineer',
      reportedRounds: 'Recruiter Chat -> Technical Phone Screen -> 4-5 Onsite Rounds (Coding, Algorithms, Googleyness)',
      topTopics: ['Dynamic Programming', 'Graph BFS/DFS', 'Binary Search Variants', 'Googleyness & Ambiguity'],
      frequency: 'High Frequency'
    },
    {
      company: 'Microsoft',
      role: 'SDE 1 / SDE 2',
      reportedRounds: 'Codility OA -> 3-4 Rounds (DSA, Object Oriented Design, Azure/Cloud Scenarios, Hiring Manager)',
      topTopics: ['Binary Trees', 'Design Patterns (Strategy/Factory)', 'Linked List Manipulation', 'Concurrency'],
      frequency: 'High Frequency'
    },
    {
      company: 'Meta',
      role: 'E4 / E5 Software Engineer',
      reportedRounds: 'Initial Screen (2 Mediums in 45m) -> Full Loop (2 Coding, 1 System Design, 1 Behavioral)',
      topTopics: ['Fast & Slow Pointers', 'Array Monotonic Stacks', 'High-Scale Feed Architecture', 'Conflict Resolution'],
      frequency: 'High Frequency'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interview Pattern Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Interview Patterns & Frequency</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Aggregated recruitment stages, question distributions, and topic frequencies analyzed across verified interview loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.map((p) => (
            <div key={p.company} className="p-6 rounded-3xl bg-brand-card border border-border space-y-4 hover:border-brand-accent/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sidebar flex items-center justify-center text-white font-bold text-sm">
                    {p.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{p.company}</h3>
                    <p className="text-xs text-content-muted">{p.role}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-system-success/15 text-system-success font-bold">
                  {p.frequency}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-content-secondary uppercase tracking-wider mb-1">Standard Recruitment Loop:</p>
                <p className="text-xs text-content-secondary bg-background-secondary p-3 rounded-xl border border-border/50">
                  {p.reportedRounds}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-content-secondary uppercase tracking-wider mb-2">High-Frequency Question Themes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.topTopics.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-xl bg-background-secondary border border-border text-brand-light">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/interview/setup?company=${encodeURIComponent(p.company)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
                >
                  <span>Simulate {p.company} Pattern</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

