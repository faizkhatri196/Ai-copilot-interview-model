'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function ActivityFeedPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/interview/history');
        setInterviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Recent Candidate Activity</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Timeline of interview simulations, submissions, evaluations, and roadmap milestones.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((int) => (
              <div key={int._id} className="p-5 rounded-2xl bg-brand-card border border-border flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{int.role} Simulation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-bold">
                      {int.roundType}
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary">
                    {int.company || 'General Tech'} • {new Date(int.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-white">{Math.round(int.finalScore || 0)}/100</span>
                  <Link
                    href={`/results/${int._id}`}
                    className="p-2 rounded-xl bg-background-secondary border border-border text-white hover:border-brand-purple"
                  >
                    <ArrowRight className="h-4 w-4" />
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

