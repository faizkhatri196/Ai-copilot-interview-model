'use client';

import React from 'react';
import { Bell, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function NotificationsPage() {
  const notifications = [
    {
      title: 'Company Intelligence Updated',
      desc: 'Amazon reported DSA patterns and Leadership Principles refreshed with latest verified interview debriefs.',
      time: '1 hour ago',
      type: 'intel'
    },
    {
      title: 'Milestone Progress',
      desc: 'You completed Week 1 Day 1 of your SDE 1 Preparation Roadmap.',
      time: '1 day ago',
      type: 'roadmap'
    },
    {
      title: 'Evaluation Available',
      desc: 'Your Full Stack Developer Technical Fundamentals session has been scored (85/100).',
      time: '2 days ago',
      type: 'evaluation'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Notifications</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Stay informed on company research refreshes, evaluation scores, and roadmap alerts.
          </p>
        </div>

        <div className="space-y-3">
          {notifications.map((n, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-brand-card border border-border flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-background-secondary border border-border/60 text-brand-accent">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white">{n.title}</h3>
                  <p className="text-xs text-content-secondary leading-relaxed">{n.desc}</p>
                </div>
              </div>
              <span className="text-[10px] text-content-muted whitespace-nowrap">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

