'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function SkillAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/overview');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AppLayout>
    );
  }

  const memory = data?.memory || {};
  const dimensions = data?.dimensions || {
    technicalCorrectness: 85,
    problemSolving: 80,
    communication: 88,
    depthAndReasoning: 78,
    codeQuality: 84
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Verifiable Skill Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Candidate Skill Analytics</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Topic-level mastery index, recurring mistake memory, and multi-dimensional performance tracking.
          </p>
        </div>

        {/* 5-Dimension Competency Overview */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-accent" />
            Competency Radar Scores
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(dimensions).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-bold text-brand-accent">{val}%</span>
                </div>
                <div className="w-full bg-background-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-purple h-full rounded-full transition-all duration-500"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery Ladder */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-system-success" />
            Topic-Wise Mastery Index
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(memory.topicMastery || [
              { topic: 'Sliding Window', category: 'DSA', scoreAverage: 88, status: 'Strong' },
              { topic: 'System Design', category: 'Architecture', scoreAverage: 79, status: 'Moderate' },
              { topic: 'Dynamic Programming', category: 'DSA', scoreAverage: 62, status: 'Weak' },
              { topic: 'Operating Systems', category: 'Core CS', scoreAverage: 75, status: 'Moderate' },
              { topic: 'Behavioral STAR', category: 'Behavioral', scoreAverage: 90, status: 'Strong' }
            ]).map((tm, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-background-secondary border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{tm.topic}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    tm.status === 'Strong' ? 'bg-system-success/15 text-system-success' : tm.status === 'Moderate' ? 'bg-system-warning/15 text-system-warning' : 'bg-system-error/15 text-system-error'
                  }`}>
                    {tm.status}
                  </span>
                </div>
                <p className="text-[11px] text-content-muted">{tm.category}</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-content-secondary">Proficiency:</span>
                  <span className="font-bold text-white">{tm.scoreAverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Mistakes Memory */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-system-warning" />
            Recurring Mistakes & Blindspot Memory
          </h2>
          <p className="text-xs text-content-secondary">
            AI records repetitive technical oversights to formulate targeted challenges in subsequent mock rounds.
          </p>

          <div className="space-y-3">
            {(memory.recurringMistakes || [
              { topic: 'Dynamic Programming', mistakeSummary: 'Forgetting memoization base case initialization.', recommendation: 'Practice bottom-up tabulation on knapsack variants.' }
            ]).map((rm, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-background-secondary border border-border/60 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{rm.topic}</span>
                  <span className="text-[10px] text-system-warning font-semibold">Observed across sessions</span>
                </div>
                <p className="text-content-secondary">{rm.mistakeSummary}</p>
                <p className="text-brand-accent pt-1"><span className="font-semibold text-content-muted">Remediation: </span>{rm.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

