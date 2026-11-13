'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Layers,
  Building2,
  Briefcase,
  PlayCircle,
  Shield,
  Loader2,
  CheckCircle2,
  Cpu,
  Code2,
  Mic,
  Users2,
  BrainCircuit,
  Clock,
  Target
} from 'lucide-react';
import api from '../../../lib/axios';
import AppLayout from '../../../components/AppLayout';

const ROUND_TYPES = [
  { id: 'Technical Fundamentals', title: 'Technical Fundamentals', desc: 'Core CS, OS, DBMS, Networks, OOP & Language deep dive', icon: Cpu, badge: 'Round 3' },
  { id: 'DSA Coding Interview', title: 'DSA Coding Interview', desc: 'Live algorithmic problem solving in isolated code editor', icon: Code2, badge: 'Round 2' },
  { id: 'System Design', title: 'System Design & High Scale', desc: 'Architecture, microservices, databases, caching & queues', icon: Layers, badge: 'Round 6' },
  { id: 'Company-Specific Interview', title: 'Company-Specific Interview', desc: 'Tailored to Amazon, Google, Meta, or any custom target', icon: Building2, badge: 'Round 5' },
  { id: 'Resume-Based Interview', title: 'Resume-Based Interview', desc: 'Probing questions based on your uploaded projects & stack', icon: BrainCircuit, badge: 'Round 4' },
  { id: 'Behavioral Interview', title: 'Behavioral & Leadership', desc: 'STAR method questions on ownership, collaboration & conflict', icon: Users2, badge: 'Round 7' },
  { id: 'HR Interview', title: 'HR & Culture Fit', desc: 'Career motivations, salary expectations, company values', icon: Users2, badge: 'Round 8' },
  { id: 'AI Voice Interview', title: 'Live Voice-to-Voice', desc: 'Real-time conversational speech interview simulation', icon: Mic, badge: 'Round 9' },
];

const PERSONALITIES = [
  { id: 'Professional', label: 'Professional', desc: 'Polished, objective, balanced' },
  { id: 'Senior Engineer', label: 'Senior Engineer', desc: 'In-depth trade-off probing' },
  { id: 'Strict', label: 'Strict Bar Raiser', desc: 'Zero tolerance for vague answers' },
  { id: 'Friendly', label: 'Friendly & Supportive', desc: 'Encouraging, guides through hints' },
  { id: 'Behavioral', label: 'Cultural Bar Raiser', desc: 'Focused on ownership & impact' },
];

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roleSelect, setRoleSelect] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [companySelect, setCompanySelect] = useState('Amazon');
  const [customCompany, setCustomCompany] = useState('');
  const [roundType, setRoundType] = useState('Technical Fundamentals');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [personality, setPersonality] = useState('Professional');
  const [targetTurns, setTargetTurns] = useState(5);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const queryCompany = searchParams?.get('company');
    const queryRound = searchParams?.get('round');
    if (queryCompany) {
      const known = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Uber', 'Netflix', 'Apple', 'Atlassian', 'Salesforce', 'OpenAI', 'Citadel', 'Stripe'];
      if (known.includes(queryCompany)) {
        setCompanySelect(queryCompany);
      } else {
        setCompanySelect('Custom');
        setCustomCompany(queryCompany);
      }
    }
    if (queryRound) setRoundType(queryRound);
  }, [searchParams]);

  const effectiveCompany = companySelect === 'Custom'
    ? (customCompany.trim() || 'Tech Enterprise')
    : companySelect;

  const effectiveRole = roleSelect === 'Custom'
    ? (customRole.trim() || 'Software Engineer')
    : roleSelect;

  const handleLaunch = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      if (roundType === 'DSA Coding Interview') {
        router.push('/coding');
        return;
      }
      if (roundType === 'AI Voice Interview') {
        router.push('/voice');
        return;
      }

      const { data } = await api.post('/interview/create', {
        role: effectiveRole,
        company: effectiveCompany,
        difficulty,
        roundType,
        interviewerPersonality: personality,
        targetTurns: Number(targetTurns) || 5
      });

      router.push(`/interview/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start interview.');
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Recruitment Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Configure Interview Simulation</h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Prepare for any company and role worldwide with configurable interview lengths, specific round rubrics, and targeted personas.
        </p>
      </div>

      <form onSubmit={handleLaunch} className="space-y-8">
        {/* Section 1: Choose Round Type */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-accent" />
            1. Select Interview Round Type
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROUND_TYPES.map((rt) => {
              const Icon = rt.icon;
              const isSelected = roundType === rt.id;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setRoundType(rt.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-brand-purple/30 border-brand-accent shadow-card-glow text-white'
                      : 'bg-background-secondary border-border text-content-secondary hover:text-white hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-5 w-5 text-brand-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent/80">
                        {rt.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-white leading-snug">{rt.title}</h3>
                    <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">{rt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Role, Company, Length & Difficulty */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-purple" />
            2. Target Company, Position & Session Depth
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">Target Company</label>
              <select
                value={companySelect}
                onChange={(e) => setCompanySelect(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Meta">Meta</option>
                <option value="OpenAI">OpenAI</option>
                <option value="Citadel">Citadel</option>
                <option value="Stripe">Stripe</option>
                <option value="Netflix">Netflix</option>
                <option value="Uber">Uber</option>
                <option value="Apple">Apple</option>
                <option value="Atlassian">Atlassian</option>
                <option value="Salesforce">Salesforce</option>
                <option value="Custom">Custom Company (Any)...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">Target Position</label>
              <select
                value={roleSelect}
                onChange={(e) => setRoleSelect(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="SDE 1 (Entry Software Engineer)">SDE 1 (Entry Software Engineer)</option>
                <option value="SDE 2 (Mid-Level Engineer)">SDE 2 (Mid-Level Engineer)</option>
                <option value="Senior Software Engineer">Senior Software Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Distributed Systems Engineer">Distributed Systems Engineer</option>
                <option value="AI / Generative AI Engineer">AI / Generative AI Engineer</option>
                <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
                <option value="Custom">Custom Role (Any)...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">Difficulty Tier</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="Beginner">Beginner (L3 / Intern)</option>
                <option value="Intermediate">Intermediate (L4 / SDE 2)</option>
                <option value="Advanced">Advanced (L5 / Senior)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">Interview Length</label>
              <select
                value={targetTurns}
                onChange={(e) => setTargetTurns(Number(e.target.value))}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value={3}>3 Questions (Quick ~10 mins)</option>
                <option value={5}>5 Questions (Standard ~20 mins)</option>
                <option value={8}>8 Questions (Deep ~35 mins)</option>
              </select>
            </div>
          </div>

          {/* Conditional Custom Input Fields */}
          {(companySelect === 'Custom' || roleSelect === 'Custom') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {companySelect === 'Custom' && (
                <div>
                  <label className="block text-xs font-semibold text-brand-accent mb-1.5">Enter Target Company Name</label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. Palantir, Datadog, Snowflake, Early Stage AI Startup..."
                    className="w-full bg-background-secondary border border-brand-accent/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    required
                  />
                </div>
              )}
              {roleSelect === 'Custom' && (
                <div>
                  <label className="block text-xs font-semibold text-brand-accent mb-1.5">Enter Target Role Title</label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Lead Systems Architect, MLOps Engineer, Rust Core Dev..."
                    className="w-full bg-background-secondary border border-brand-accent/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Interviewer Persona */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-system-warning" />
            3. Interviewer Persona Calibration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PERSONALITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonality(p.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  personality === p.id
                    ? 'bg-brand-purple/30 border-brand-accent text-white shadow-card-glow'
                    : 'bg-background-secondary border-border text-content-secondary hover:text-white'
                }`}
              >
                <p className="font-bold text-xs text-white">{p.label}</p>
                <p className="text-[10px] text-content-secondary mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Launch Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-card border border-border">
          <div className="text-xs text-content-secondary">
            Simulating <span className="font-bold text-white">{roundType}</span> for{' '}
            <span className="font-bold text-brand-accent">{effectiveCompany}</span> ({effectiveRole}) • {targetTurns} Turns
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-purple-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Launch Interview Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function InterviewSetupPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      }>
        <InterviewSetupContent />
      </Suspense>
    </AppLayout>
  );
}
