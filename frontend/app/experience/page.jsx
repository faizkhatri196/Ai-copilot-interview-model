'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Briefcase, Plus, Sparkles, ArrowRight } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function ExperiencePage() {
  const experiences = [
    {
      role: 'Full Stack Engineer Intern',
      company: 'Tech Solutions Inc.',
      duration: 'May 2025 - Aug 2025',
      summary: 'Architected high-throughput REST APIs and optimized React client rendering, reducing initial load latency by 28%.'
    },
    {
      role: 'Lead Project Contributor',
      company: 'Open Source Distributed Systems',
      duration: 'Jan 2025 - Present',
      summary: 'Implemented raft consensus leader election modules and distributed key-value storage benchmarks.'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Practical Background</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Work & Project Experience</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Projects and internships leveraged by the AI to formulate behavioral and technical probing questions.
          </p>
        </div>

        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{exp.role}</h3>
                  <p className="text-xs text-brand-accent">{exp.company}</p>
                </div>
                <span className="text-xs text-content-muted">{exp.duration}</span>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed bg-background-secondary p-3.5 rounded-2xl border border-border/50">
                {exp.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

