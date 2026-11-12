'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Zap,
  Shield,
  Building2,
  Code2,
  Mic,
  ArrowRight,
  CheckCircle2,
  LineChart,
  BrainCircuit,
  Compass,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col selection:bg-brand-purple selection:text-white">
      {/* Top Navigation */}
      <header className="h-20 border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background-primary/80 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar flex items-center justify-center shadow-purple-glow">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wide text-white leading-tight">
              AI INTERVIEW
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
              Intelligence Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-content-secondary hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-purple-gradient shadow-card-glow hover:opacity-95 transition-all transform hover:scale-[1.02]"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Violet Gradient Glow Behind */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-purple/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card/80 border border-brand-accent/30 text-brand-accent text-xs font-semibold backdrop-blur-md shadow-card-glow">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation AI Interview Intelligence • Ultra-Elite Edition</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Simulate Realistic Tech Interviews with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-brand-purple to-purple-400">
              Deep Company Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-content-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Not a generic chatbot. Train with adaptive multi-round simulations, live coding arenas, voice-to-voice dialogues, and verified company recruitment intelligence for Google, Amazon, Meta, and beyond.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-purple-gradient text-white text-base font-bold shadow-purple-glow hover:opacity-95 transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Begin Candidate Simulation</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-card hover:bg-brand-cardDark border border-border text-white text-base font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Platform Dashboard</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto border-t border-border/40">
            <div>
              <p className="text-3xl font-black text-white">9 Rounds</p>
              <p className="text-xs text-content-secondary mt-1">Realistic Recruiter Stages</p>
            </div>
            <div>
              <p className="text-3xl font-black text-brand-accent">100+ Top Orgs</p>
              <p className="text-xs text-content-secondary mt-1">Verified Company Patterns</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">Voice-to-Voice</p>
              <p className="text-xs text-content-secondary mt-1">Real-Time Speech Engine</p>
            </div>
            <div>
              <p className="text-3xl font-black text-system-success">Monaco IDE</p>
              <p className="text-xs text-content-secondary mt-1">Isolated Test Runner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Elite Software Engineers
          </h2>
          <p className="text-content-secondary text-sm sm:text-base">
            Every feature connects to a verified intelligence pipeline rather than static question templates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Building2 className="h-6 w-6 text-brand-accent" />}
            title="Company Intelligence Engine"
            desc="Explore public hiring patterns, verified recruitment stages, and reported interview topics for Amazon, Google, Microsoft, and startups."
          />
          <FeatureCard
            icon={<Code2 className="h-6 w-6 text-system-success" />}
            title="Isolated Coding Arena"
            desc="Practice real-world algorithms in Monaco Editor with public & hidden test cases, runtime analysis, and time complexity evaluations."
          />
          <FeatureCard
            icon={<Mic className="h-6 w-6 text-system-warning" />}
            title="Voice-to-Voice Simulation"
            desc="Interactive speech interviews with real-time transcription, pause/resume, interviewer personalities, and speech synthesis."
          />
          <FeatureCard
            icon={<BrainCircuit className="h-6 w-6 text-brand-purple" />}
            title="Candidate Interview Memory"
            desc="Persistent recollection of your previous mistakes, weak topics, and repeated gaps to target your blind spots in future rounds."
          />
          <FeatureCard
            icon={<Compass className="h-6 w-6 text-system-info" />}
            title="Adaptive Preparation Roadmap"
            desc="Personalized 4-week daily schedules tailored to your target company, role level, and performance improvements."
          />
          <FeatureCard
            icon={<LineChart className="h-6 w-6 text-emerald-400" />}
            title="Multi-Dimensional Rubrics"
            desc="Objective scoring across Technical Correctness, Communication, Problem Solving, Conceptual Depth, and Code Quality."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 text-center text-xs text-content-muted">
        <p>© 2026 AI Interview Intelligence Platform • Ultra-Elite Edition. Built with verifiable backend architecture.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-brand-card border border-border hover:border-brand-accent/40 transition-all duration-300 hover:shadow-card-glow text-left space-y-3">
      <div className="w-12 h-12 rounded-xl bg-background-secondary flex items-center justify-center border border-border">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-content-secondary text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
