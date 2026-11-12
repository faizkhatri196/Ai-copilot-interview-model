'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function PreparationRoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      const { data } = await api.get('/analytics/roadmap');
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const toggleTask = async (taskId, currentStatus) => {
    try {
      const { data } = await api.post('/analytics/roadmap/task', {
        taskId,
        isCompleted: !currentStatus
      });
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AppLayout>
    );
  }

  const milestones = roadmap?.milestones || [];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-gradient border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-card-glow">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personalized Preparation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {roadmap?.targetCompany || 'Amazon'} {roadmap?.targetPosition || 'SDE 1'} Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary max-w-xl">
              Dynamically adapted to your previous weak topics and target recruitment standards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-brand-card border border-border text-center min-w-[160px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Completion</span>
            <p className="text-3xl font-black text-brand-accent mt-1">
              {roadmap?.completionPercentage || 35}%
            </p>
            <div className="w-full bg-background-secondary h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-brand-purple h-full rounded-full transition-all"
                style={{ width: `${roadmap?.completionPercentage || 35}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Weeks */}
        <div className="space-y-6">
          {milestones.map((m) => (
            <div key={m.weekNumber} className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase">
                    Week {m.weekNumber}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{m.theme}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                  <Clock className="h-3.5 w-3.5" />
                  <span>2 hrs / day</span>
                </div>
              </div>

              {/* Days & Tasks */}
              <div className="space-y-4 pt-2">
                {m.days.map((d) => (
                  <div key={d.dayNumber} className="p-4 rounded-2xl bg-background-secondary border border-border/60 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Day {d.dayNumber}: {d.title}
                    </h4>

                    <div className="space-y-2">
                      {d.tasks.map((t) => (
                        <div
                          key={t.taskId}
                          onClick={() => toggleTask(t.taskId, t.isCompleted)}
                          className="flex items-center justify-between p-3 rounded-xl bg-brand-card hover:border-brand-purple/40 border border-border/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {t.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-system-success flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-content-muted flex-shrink-0" />
                            )}
                            <span className={`text-xs ${t.isCompleted ? 'line-through text-content-muted' : 'text-white'}`}>
                              {t.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-background-secondary text-content-secondary font-medium">
                              {t.category}
                            </span>
                            <span className="text-[10px] text-content-muted">
                              {t.estimatedMinutes}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

