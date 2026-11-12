'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck2, Sparkles, CheckCircle2, AlertCircle, ArrowRight, BarChart3 } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function EvaluationOverviewPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Rubric Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">AI Evaluation Methodology</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Understanding the multi-dimensional scoring engine, transparent rubrics, and automated feedback loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-system-success" /> Technical Correctness (30%)
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Verifies factual and architectural accuracy, correct algorithmic complexity, absence of hallucinations, and language runtime semantics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-accent" /> Depth & Reasoning (25%)
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Assesses candidate justification of architectural choices, trade-offs, boundary condition handling, and scalability bottlenecks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-system-warning" /> Communication & Delivery (25%)
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Evaluates structured technical articulation, concise delivery without rambling, and proactive clarification of ambiguous requirements.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-brand-purple" /> Code Quality & Best Practices (20%)
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Modular variable naming, clean decomposition, edge-case coverage, and pass rate against both public and hidden test cases.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card-gradient border border-border flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Ready to test your abilities?</h4>
            <p className="text-xs text-content-secondary">Launch a calibrated mock round with instant multi-dimensional evaluation.</p>
          </div>
          <Link
            href="/interview/setup"
            className="px-5 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2"
          >
            <span>Start Simulation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

