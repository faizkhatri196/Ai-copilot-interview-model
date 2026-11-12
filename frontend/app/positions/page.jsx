'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const { data } = await api.get('/positions');
        setPositions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, []);

  const categories = ['All', 'Software Development', 'AI and Data', 'Infrastructure'];
  const filtered = activeCategory === 'All' ? positions : positions.filter(p => p.category === activeCategory);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Position Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Engineering Roles & Ladders</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Skill requirements, expected rounds, and evaluation ladders calibrated by engineering seniority.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                activeCategory === cat
                  ? 'bg-brand-purple text-white border-brand-accent shadow-card-glow'
                  : 'bg-brand-card text-content-secondary border-border hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((pos) => (
              <div
                key={pos.slug}
                className="p-6 rounded-3xl bg-brand-card border border-border hover:border-brand-accent/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase">
                      {pos.category}
                    </span>
                    <span className="text-xs text-content-muted">
                      {pos.levels?.[0]?.typicalYearsExp || 'All Levels'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{pos.title}</h3>

                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-content-secondary uppercase tracking-wider">Mandatory Competencies:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(pos.skillRequirements?.mandatory || ['Data Structures', 'Clean Code', 'REST APIs']).map((s) => (
                        <span key={s} className="text-[11px] px-2.5 py-1 rounded-xl bg-background-secondary border border-border text-white">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-content-secondary uppercase tracking-wider">Computer Science Fundamentals:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(pos.skillRequirements?.fundamentals || ['OS', 'DBMS', 'Networks']).map((f) => (
                        <span key={f} className="text-[11px] px-2.5 py-1 rounded-xl bg-background-secondary/80 border border-border/70 text-brand-accent">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-content-muted">Standard 4-Round Loop</span>
                  <Link
                    href={`/interview/setup?role=${encodeURIComponent(pos.title)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95"
                  >
                    <span>Practice Role</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

