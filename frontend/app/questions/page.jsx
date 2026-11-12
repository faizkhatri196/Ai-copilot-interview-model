'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function QuestionIntelligencePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const questions = [
    {
      id: 'q1',
      question: 'How does React 18 Concurrent Mode handle rendering interruptions, and what role do Fiber lanes play?',
      topic: 'Frontend Architecture',
      difficulty: 'Intermediate',
      company: 'Meta',
      criteria: 'Fiber work-in-progress trees, lane bitmasks, priority levels, useTransition vs useDeferredValue.'
    },
    {
      id: 'q2',
      question: 'Explain the difference between Optimistic Concurrency Control and Pessimistic Locking in high-throughput databases.',
      topic: 'System Design',
      difficulty: 'Advanced',
      company: 'Amazon',
      criteria: 'Version columns, retry loops, database deadlocks, trade-offs under write contention.'
    },
    {
      id: 'q3',
      question: 'Given an array of integers, design an algorithm to find the maximum sum of a contiguous subarray in O(n) time (Kadane\'s Algorithm).',
      topic: 'DSA',
      difficulty: 'Medium',
      company: 'Google',
      criteria: 'Dynamic programming state: max(nums[i], current_max + nums[i]), maintaining global max.'
    },
    {
      id: 'q4',
      question: 'Walk me through a time when you received harsh critical feedback on a pull request. How did you handle it and what was the outcome?',
      topic: 'Behavioral STAR',
      difficulty: 'Intermediate',
      company: 'Amazon',
      criteria: 'Separating ego from engineering, understanding root feedback, actionable improvements, team collaboration.'
    },
    {
      id: 'q5',
      question: 'How does the TCP three-way handshake and slow-start congestion control mechanism operate? How does HTTP/3 with QUIC improve upon it?',
      topic: 'Core CS & Networking',
      difficulty: 'Intermediate',
      company: 'Cloudflare',
      criteria: 'SYN, SYN-ACK, ACK, congestion window growth, head-of-line blocking elimination in UDP-based QUIC.'
    }
  ];

  const filtered = questions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTopic = selectedTopic === 'All' || q.topic.includes(selectedTopic);
    return matchSearch && matchTopic;
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Question Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Question Intelligence Bank</h1>
            <p className="text-xs sm:text-sm text-content-secondary mt-1">
              Curated interview questions mapped to specific rubrics, expected criteria, and follow-ups.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions or topics..."
              className="w-full bg-brand-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>

        {/* Questions Cards */}
        <div className="space-y-4">
          {filtered.map((q) => (
            <div key={q.id} className="p-6 rounded-3xl bg-brand-card border border-border hover:border-brand-accent/30 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase">
                    {q.topic}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-background-secondary border border-border text-content-muted">
                    {q.company} Standard
                  </span>
                </div>
                <span className="text-xs font-semibold text-content-secondary">{q.difficulty}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white">{q.question}</h3>

              <div className="p-3.5 rounded-xl bg-background-secondary border border-border/50 text-xs text-content-secondary">
                <span className="font-bold text-brand-accent">Expected Evidence Criteria: </span>
                {q.criteria}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/interview/setup?role=${encodeURIComponent(q.topic)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
                >
                  <span>Practice In Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

