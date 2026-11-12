'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Clock, ArrowRight, Loader2, Award, Calendar } from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function ReportsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/interview/history');
        setInterviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Interview Reports Archive</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Historical logs of all completed mock simulations, scoring rubrics, and detailed feedback.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-brand-card border border-dashed border-border space-y-4">
            <Clock className="h-10 w-10 text-content-muted mx-auto" />
            <p className="text-sm text-content-secondary">No interview reports on record yet.</p>
            <Link
              href="/interview/setup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold"
            >
              Start New Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((int) => (
              <div
                key={int._id}
                className="p-6 rounded-3xl bg-brand-card border border-border hover:border-brand-accent/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase">
                      {int.roundType}
                    </span>
                    <h3 className="text-base font-bold text-white">{int.role}</h3>
                  </div>

                  <p className="text-xs text-content-secondary">
                    Company: <span className="text-white font-semibold">{int.company || 'General Tech'}</span> • Difficulty: {int.difficulty} • Date: {new Date(int.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-xs text-content-muted line-clamp-1 pt-1">
                    {int.overallFeedback || 'Completed evaluation available.'}
                  </p>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">
                      {Math.round(int.finalScore || 0)}<span className="text-xs text-content-muted">/100</span>
                    </p>
                    <p className="text-[10px] text-content-secondary">
                      {int.status === 'Completed' ? 'Completed' : 'In Progress'}
                    </p>
                  </div>

                  <Link
                    href={int.status === 'Completed' ? `/results/${int._id}` : `/interview/${int._id}`}
                    className="px-4 py-2 rounded-xl bg-background-secondary hover:bg-background-secondary/80 border border-border text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <span>View Breakdown</span>
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

