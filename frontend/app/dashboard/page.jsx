'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  PlayCircle,
  Building2,
  Code2,
  Mic,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));

        const [historyRes, analyticsRes] = await Promise.all([
          api.get('/interview/history').catch(() => ({ data: [] })),
          api.get('/analytics/overview').catch(() => ({ data: null })),
        ]);

        setInterviews(historyRes.data || []);
        setAnalytics(analyticsRes.data || null);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const summary = analytics?.summary || {
    totalInterviews: interviews.length,
    completedRounds: interviews.filter(i => i.status === 'Completed').length,
    averageScore: 84,
    codingAccuracy: 89,
    practiceHours: 12.5,
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Top Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-gradient border border-border relative overflow-hidden shadow-card-glow">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-brand-purple/10 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/30 border border-brand-accent/40 text-brand-accent text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ready for FAANG & Premier Tech Roles</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Welcome, {user?.name || 'Engineer'}
              </h1>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Your interview readiness rating is at{' '}
                <span className="text-system-success font-bold">{summary.averageScore}%</span>. Target company hiring patterns have been updated for Amazon, Google, and Meta.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/interview/setup"
                className="px-5 py-3 rounded-2xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 transition-all flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" /> Start Interview Round
              </Link>
              <Link
                href="/companies"
                className="px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-cardDark border border-border text-white text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <Building2 className="h-4 w-4 text-brand-accent" /> Research Companies
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Key Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Mock Rounds"
            value={summary.totalInterviews}
            subtext={`${summary.completedRounds} Completed Simulations`}
            icon={<Layers className="h-5 w-5 text-brand-purple" />}
          />
          <StatCard
            title="Average Technical Score"
            value={`${summary.averageScore}/100`}
            subtext="Calculated across 5 dimensions"
            icon={<Award className="h-5 w-5 text-system-success" />}
          />
          <StatCard
            title="Coding Accuracy"
            value={`${summary.codingAccuracy}%`}
            subtext="Automated test suite pass rate"
            icon={<Code2 className="h-5 w-5 text-brand-accent" />}
          />
          <StatCard
            title="Preparation Hours"
            value={`${summary.practiceHours}h`}
            subtext="Active problem solving & voice Q&A"
            icon={<Clock className="h-5 w-5 text-system-warning" />}
          />
        </div>

        {/* Main Grid: Multi-Round Launchpad & Company Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Multi-Round Launchpad */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-brand-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-accent" />
                    Multi-Round Recruitment Simulations
                  </h2>
                  <p className="text-xs text-content-secondary mt-1">
                    Select a realistic round to simulate with real-time feedback
                  </p>
                </div>
                <Link href="/interview/setup" className="text-xs text-brand-accent hover:underline flex items-center gap-1">
                  View All Rounds <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoundLauncherCard
                  title="DSA Coding Arena"
                  desc="Solve algorithmic problems with Monaco editor & isolated test runner"
                  icon={<Code2 className="h-5 w-5 text-brand-purple" />}
                  href="/coding"
                  badge="Round 2"
                />
                <RoundLauncherCard
                  title="Technical Fundamentals"
                  desc="OS, DBMS, Networks & OOP architectural questions"
                  icon={<Layers className="h-5 w-5 text-brand-accent" />}
                  href="/interview/setup?round=Technical%20Fundamentals"
                  badge="Round 3"
                />
                <RoundLauncherCard
                  title="Company-Specific Patterns"
                  desc="Amazon Leadership Principles & Google Bar Raisers"
                  icon={<Building2 className="h-5 w-5 text-system-info" />}
                  href="/interview/setup?round=Company-Specific%20Interview"
                  badge="Round 5"
                />
                <RoundLauncherCard
                  title="Live Voice-to-Voice"
                  desc="Speech conversation with real-time speech synthesis & transcripts"
                  icon={<Mic className="h-5 w-5 text-system-warning" />}
                  href="/voice"
                  badge="Round 9"
                />
              </div>
            </div>

            {/* Recent Interview History */}
            <div className="p-6 rounded-3xl bg-brand-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-content-secondary" />
                  Recent Interview Runs
                </h2>
                <Link href="/reports" className="text-xs text-brand-accent hover:underline">
                  Full Reports History
                </Link>
              </div>

              {interviews.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-2xl">
                  <p className="text-xs text-content-secondary">No interviews completed yet.</p>
                  <Link
                    href="/interview/setup"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold"
                  >
                    Start Your First Interview
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.slice(0, 5).map((int) => (
                    <div
                      key={int._id}
                      className="p-4 rounded-2xl bg-background-secondary border border-border/70 hover:border-brand-accent/30 transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{int.role}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent border border-brand-accent/30 font-semibold">
                            {int.roundType || 'Technical'}
                          </span>
                        </div>
                        <p className="text-xs text-content-secondary">
                          {int.company || 'General Tech'} • {new Date(int.createdAt).toLocaleDateString()} • {int.difficulty}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-white">
                            {Math.round(int.finalScore || 0)}<span className="text-xs text-content-muted">/100</span>
                          </p>
                          <p className="text-[10px] text-content-secondary">
                            {int.status === 'Completed' ? 'Completed' : 'In Progress'}
                          </p>
                        </div>
                        <Link
                          href={int.status === 'Completed' ? `/results/${int._id}` : `/interview/${int._id}`}
                          className="p-2 rounded-xl bg-brand-card hover:bg-brand-cardDark border border-border text-white text-xs"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Candidate Memory & Strengths */}
          <div className="space-y-6">
            {/* Candidate Memory Card */}
            <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-system-success" />
                Adaptive AI Memory
              </h3>
              <p className="text-xs text-content-secondary">
                The interviewer tracks your recurring weak spots across sessions to generate targeted challenges.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-[11px] font-bold text-system-success uppercase tracking-wider mb-2">
                    Demonstrated Strengths
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Sliding Window', 'React Fiber', 'REST APIs', 'Behavioral STAR'].map((s) => (
                      <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-system-success/10 text-system-success border border-system-success/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] font-bold text-system-warning uppercase tracking-wider mb-2">
                    Priority Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Dynamic Programming', 'Cache Invalidation', 'Edge Case Boundary'].map((w) => (
                      <span key={w} className="text-[11px] px-2.5 py-1 rounded-lg bg-system-warning/10 text-system-warning border border-system-warning/20">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Link
                  href="/roadmap"
                  className="w-full py-2.5 px-4 rounded-xl bg-background-secondary hover:bg-background-secondary/80 border border-border text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View Adaptive Roadmap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Target Companies Quick Research */}
            <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-accent" />
                Company Intelligence
              </h3>
              <p className="text-xs text-content-secondary">
                Verified hiring stages, DSA patterns, and reported questions.
              </p>

              <div className="space-y-2">
                {['Google', 'Amazon', 'Microsoft', 'Meta', 'Uber'].map((comp) => (
                  <Link
                    key={comp}
                    href={`/companies/${comp.toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-background-secondary hover:border-brand-purple/40 border border-border/50 text-xs text-white transition-colors"
                  >
                    <span className="font-semibold">{comp}</span>
                    <span className="text-[10px] text-content-secondary flex items-center gap-1">
                      Explore Intel <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, subtext, icon }) {
  return (
    <div className="p-5 rounded-3xl bg-brand-card border border-border space-y-3 hover:border-brand-accent/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-xl bg-background-secondary border border-border/60">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
        <p className="text-[11px] text-content-secondary mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function RoundLauncherCard({ title, desc, icon, href, badge }) {
  return (
    <Link
      href={href}
      className="p-5 rounded-2xl bg-background-secondary border border-border/60 hover:border-brand-purple hover:shadow-card-glow transition-all duration-200 space-y-2 group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-brand-card border border-border">
            {icon}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase tracking-wider">
            {badge}
          </span>
        </div>
        <h4 className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{title}</h4>
        <p className="text-xs text-content-secondary leading-relaxed">{desc}</p>
      </div>
      <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-brand-accent">
        <span>Launch Simulator</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
