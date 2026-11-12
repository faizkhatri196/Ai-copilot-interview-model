'use client';

import React from 'react';
import { LifeBuoy, Mail, MessageSquare, BookOpen, Sparkles } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function HelpAndSupportPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Support & Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Help & Support Center</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Frequently asked questions, platform architecture guides, and customer care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <BookOpen className="h-6 w-6 text-brand-accent" />
            <h3 className="text-sm font-bold text-white">Platform Guide</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Read how our multi-round interview state machine and isolated code execution works.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <MessageSquare className="h-6 w-6 text-brand-purple" />
            <h3 className="text-sm font-bold text-white">Community & Feedback</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Join discussions on interview questions and report newly observed recruitment patterns.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-3">
            <Mail className="h-6 w-6 text-system-success" />
            <h3 className="text-sm font-bold text-white">Priority Support</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Contact our engineering team directly at support@interviewcopilot.ai.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-background-secondary border border-border/60 space-y-1">
              <h4 className="font-bold text-white">How does the isolated code runner evaluate submissions?</h4>
              <p className="text-content-secondary">
                Submissions run in dedicated sandbox workers with strict memory and time quotas, executing against hidden test suites.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-background-secondary border border-border/60 space-y-1">
              <h4 className="font-bold text-white">How is company intelligence gathered?</h4>
              <p className="text-content-secondary">
                We prioritize official career portals and corroborated engineering interview debriefs, explicitly tagging sources with confidence scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

