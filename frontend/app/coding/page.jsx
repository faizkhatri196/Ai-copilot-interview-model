'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code2,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function CodingArenaDirectory() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        let url = '/coding?';
        if (filterTopic) url += `topic=${encodeURIComponent(filterTopic)}&`;
        if (filterDifficulty) url += `difficulty=${encodeURIComponent(filterDifficulty)}`;
        const { data } = await api.get(url);
        setChallenges(data);
      } catch (err) {
        console.error('Failed to fetch coding challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [filterTopic, filterDifficulty]);

  const topics = [
    'All Topics',
    'Arrays',
    'Strings',
    'Sliding Window',
    'Binary Search',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Linked Lists',
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Isolated Sandboxed Code Runner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Coding Interview Arena</h1>
            <p className="text-xs sm:text-sm text-content-secondary mt-1">
              Solve algorithmic problems with automated test case validation and time/space complexity analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-brand-card border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Topics Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {topics.map((t) => {
            const isSelected = (t === 'All Topics' && !filterTopic) || filterTopic === t;
            return (
              <button
                key={t}
                onClick={() => setFilterTopic(t === 'All Topics' ? '' : t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-brand-purple text-white border-brand-accent shadow-card-glow'
                    : 'bg-brand-card text-content-secondary border-border hover:text-white'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Problem List */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((c) => (
              <div
                key={c.slug}
                className="p-5 sm:p-6 rounded-2xl bg-brand-card border border-border hover:border-brand-accent/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white hover:text-brand-accent transition-colors">
                      <Link href={`/coding/${c.slug}`}>{c.title}</Link>
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        c.difficulty === 'Easy'
                          ? 'bg-system-success/10 text-system-success border border-system-success/20'
                          : c.difficulty === 'Medium'
                          ? 'bg-system-warning/10 text-system-warning border border-system-warning/20'
                          : 'bg-system-error/10 text-system-error border border-system-error/20'
                      }`}
                    >
                      {c.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-semibold">
                      {c.topic}
                    </span>
                  </div>

                  <p className="text-xs text-content-secondary line-clamp-1 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-content-muted pt-1">
                    <span>Optimal Time: {c.optimalComplexity?.time || 'O(n)'}</span>
                    <span>•</span>
                    <span>Space: {c.optimalComplexity?.space || 'O(1)'}</span>
                    <span>•</span>
                    <span>Tags: {(c.companyTags || ['Amazon', 'Google']).join(', ')}</span>
                  </div>
                </div>

                <Link
                  href={`/coding/${c.slug}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Open Code Workspace</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

