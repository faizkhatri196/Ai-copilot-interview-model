'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Cpu, Code2, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function MySkillsPage() {
  const [skills, setSkills] = useState(['React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Data Structures & Algorithms', 'System Design']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const removeSkill = (s) => {
    setSkills(skills.filter(i => i !== s));
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Candidate Competency Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Technical Skills</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Technologies and core fundamentals evaluated during your personalized interview rounds.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-accent" /> Add Competency
          </h2>
          <form onSubmit={addSkill} className="flex gap-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Apache Kafka, Redis, Kubernetes, Golang..."
              className="flex-1 bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95"
            >
              Add Skill
            </button>
          </form>
        </div>

        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white">Verified Stack Skills ({skills.length})</h2>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((s) => (
              <span
                key={s}
                className="px-4 py-2 rounded-xl bg-background-secondary border border-border hover:border-brand-purple/50 text-xs font-semibold text-white flex items-center gap-2 transition-all"
              >
                <span>{s}</span>
                <button
                  onClick={() => removeSkill(s)}
                  className="text-content-muted hover:text-system-error ml-1 text-sm font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

