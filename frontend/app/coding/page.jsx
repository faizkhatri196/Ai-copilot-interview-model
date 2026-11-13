'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  PlusCircle,
  X,
  Building2,
  Cpu,
  BrainCircuit
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function CodingArenaDirectory() {
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Generator Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('Sliding Window');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genCompany, setGenCompany] = useState('Google');
  const [customCompany, setCustomCompany] = useState('');
  const [genPrompt, setGenPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

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

  const handleGenerateChallenge = async (e) => {
    e.preventDefault();
    setGenerating(true);

    const targetCompany = genCompany === 'Custom' ? (customCompany.trim() || 'Tech Leader') : genCompany;

    try {
      const { data } = await api.post('/coding/generate', {
        topic: genTopic,
        difficulty: genDifficulty,
        company: targetCompany,
        prompt: genPrompt.trim()
      });

      setShowGenModal(false);
      setGenerating(false);
      router.push(`/coding/${data.slug}`);
    } catch (err) {
      alert('Failed to generate AI challenge: ' + (err.response?.data?.message || err.message));
      setGenerating(false);
    }
  };

  const topics = [
    'All Topics',
    'Arrays',
    'Sliding Window',
    'Graphs',
    'Dynamic Programming',
    'Cache Architecture & Data Structures',
    'Distributed Systems & Concurrency',
    'Trees',
    'Strings',
    'Linked Lists',
  ];

  const filteredChallenges = challenges.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.topic?.toLowerCase().includes(q) ||
      c.companyTags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Isolated Sandboxed Code Runner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Coding Interview Arena</h1>
            <p className="text-xs sm:text-sm text-content-secondary mt-1">
              Solve real-world algorithmic challenges with automated test execution, time complexity audits, and on-demand AI generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-purple-glow hover:opacity-95 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Custom AI Challenge</span>
            </button>

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

        {/* Search Bar & Topics Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-content-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges by title, company (Google, Citadel, OpenAI), or algorithmic pattern..."
              className="w-full bg-brand-card border border-border rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
            />
          </div>

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
        </div>

        {/* Problem List */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-brand-card border border-border space-y-4">
            <BrainCircuit className="h-10 w-10 text-brand-accent mx-auto" />
            <h3 className="text-base font-bold text-white">No challenges match your current filter</h3>
            <p className="text-xs text-content-secondary max-w-md mx-auto">
              Want a challenge for this exact topic or company? Use our AI generator to synthesize a custom problem instantly.
            </p>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-6 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95"
            >
              Generate Challenge with AI
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChallenges.map((c) => (
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

                  <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-content-muted pt-1">
                    <span>Optimal Time: <b className="text-white">{c.optimalComplexity?.time || 'O(N)'}</b></span>
                    <span>•</span>
                    <span>Space: <b className="text-white">{c.optimalComplexity?.space || 'O(1)'}</b></span>
                    <span>•</span>
                    <span>Targeting: <b className="text-brand-accent">{(c.companyTags || ['Tech Leader']).join(', ')}</b></span>
                  </div>
                </div>

                <Link
                  href={`/coding/${c.slug}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Solve Challenge</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Generate Custom AI Challenge Modal */}
        {showGenModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-card border border-brand-accent/40 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-purple-glow relative">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-purple/20 text-brand-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Generate AI Coding Challenge</h2>
                    <p className="text-xs text-content-muted">Tailor an algorithmic problem to any company & topic</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenModal(false)}
                  className="text-content-muted hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateChallenge} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-content-secondary block mb-1.5">Algorithmic Topic</label>
                  <select
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    className="w-full bg-background-secondary border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                  >
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Graphs">Graphs & Topological Sort</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Distributed Systems & Concurrency">Distributed Systems & Concurrency</option>
                    <option value="Cache Architecture & Data Structures">Cache Architecture & Data Structures</option>
                    <option value="Trees">Trees & DFS/BFS</option>
                    <option value="Arrays">Arrays & Two Pointers</option>
                    <option value="Strings">String Processing & Tries</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-content-secondary block mb-1.5">Difficulty</label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value)}
                      className="w-full bg-background-secondary border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-content-secondary block mb-1.5">Target Company</label>
                    <select
                      value={genCompany}
                      onChange={(e) => setGenCompany(e.target.value)}
                      className="w-full bg-background-secondary border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    >
                      <option value="Google">Google</option>
                      <option value="OpenAI">OpenAI</option>
                      <option value="Meta">Meta</option>
                      <option value="Citadel">Citadel</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Stripe">Stripe</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Netflix">Netflix</option>
                      <option value="Uber">Uber</option>
                      <option value="Custom">Custom Company...</option>
                    </select>
                  </div>
                </div>

                {genCompany === 'Custom' && (
                  <div>
                    <label className="text-xs font-semibold text-brand-accent block mb-1.5">Enter Custom Company Name</label>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      placeholder="e.g. Palantir, Snowflake, Datadog, Early Stage AI Startup..."
                      className="w-full bg-background-secondary border border-brand-accent/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-content-secondary block mb-1.5">Focus Instructions (Optional)</label>
                  <textarea
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="e.g. Include real-time streaming, strict O(N) constraint, or memory efficiency..."
                    rows={2}
                    className="w-full bg-background-secondary border border-border rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-background-secondary text-content-secondary hover:text-white text-xs font-semibold border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-6 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Synthesizing Challenge...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate & Start Solving</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
