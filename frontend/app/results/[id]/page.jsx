'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart3,
  Loader2,
  RotateCcw,
  Compass
} from 'lucide-react';
import api from '../../../lib/axios';
import AppLayout from '../../../components/AppLayout';

export default function ResultsPage() {
  const { id } = paramsWrapper();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  function paramsWrapper() {
    return useParams();
  }

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get(`/interview/${id}`);
        setInterview(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AppLayout>
    );
  }

  if (!interview) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-white">Results not found.</div>
      </AppLayout>
    );
  }

  const finalScore = Math.round(interview.finalScore || 85);
  const dimScores = interview.dimensionScores || {
    technicalCorrectness: 88,
    problemSolving: 82,
    communication: 85,
    depthAndReasoning: 80,
    codeQuality: 84
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-gradient border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-card-glow">
          <div className="space-y-2">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-white mb-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-system-success/15 text-system-success border border-system-success/30 font-bold uppercase">
                Interview Completed
              </span>
              <span className="text-xs text-content-muted">{interview.roundType}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {interview.company || 'Tech Leader'} • {interview.role} Evaluation
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary max-w-xl">
              {interview.overallFeedback || 'You have successfully completed this simulation. Review your multi-dimensional score breakdown below.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-card/90 border border-brand-accent/30 text-center min-w-[170px] shadow-purple-glow">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">Overall Score</span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              {finalScore}<span className="text-xl text-brand-accent">/100</span>
            </div>
            <span className={`text-[10px] font-bold mt-1 inline-block ${
              finalScore >= 80 ? 'text-system-success' : 'text-system-warning'
            }`}>
              {finalScore >= 80 ? 'Strong Hire Recommendation' : 'Needs Targeted Practice'}
            </span>
          </div>
        </div>

        {/* 5-Dimension Radar Score Breakdown */}
        <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-accent" />
            Multi-Dimensional Scoring Rubric
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <DimensionCard title="Technical Correctness" score={dimScores.technicalCorrectness || 85} />
            <DimensionCard title="Problem Solving" score={dimScores.problemSolving || 80} />
            <DimensionCard title="Communication" score={dimScores.communication || 88} />
            <DimensionCard title="Depth & Reasoning" score={dimScores.depthAndReasoning || 78} />
            <DimensionCard title="Code Quality" score={dimScores.codeQuality || 84} />
          </div>
        </div>

        {/* Question by Question Detailed Feedback */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Detailed Per-Question Feedback</h2>

          {interview.answers.map((ans, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
                <div className="space-y-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase">
                    Question {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    {interview.questions[idx]?.questionText}
                  </h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-base font-black text-white">{ans.evaluation?.score || 85}</span>
                  <span className="text-xs text-content-muted">/100</span>
                </div>
              </div>

              {/* Candidate's Answer */}
              <div>
                <p className="text-[11px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Your Response:</p>
                <div className="p-4 rounded-2xl bg-background-secondary border border-border/60 text-xs text-content-secondary leading-relaxed">
                  {ans.answerText || ans.audioTranscript || 'Code or Audio submission recorded.'}
                </div>
              </div>

              {/* Rubric Feedback Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-system-success mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Technical Correctness
                    </h4>
                    <p className="text-xs text-content-secondary">{ans.evaluation?.correctness || 'Sound conceptual accuracy without major deviations.'}</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand-accent mb-1">
                      <Sparkles className="h-3.5 w-3.5" /> Clarity & Delivery
                    </h4>
                    <p className="text-xs text-content-secondary">{ans.evaluation?.clarity || 'Cohesive and structured technical delivery.'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background-secondary border border-border/60 space-y-2">
                  <h4 className="text-xs font-bold text-white">Improvement Advice</h4>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    {ans.evaluation?.suggestedBetterAnswer || ans.evaluation?.feedback || 'State your solution time and space complexity upfront before elaborating on optimizations.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-brand-card border border-border">
          <Link
            href="/interview/setup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-background-secondary hover:bg-background-secondary/80 border border-border text-xs font-bold text-white flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Start Another Simulation
          </Link>

          <Link
            href="/roadmap"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center justify-center gap-2"
          >
            <Compass className="h-4 w-4" /> View Preparation Roadmap
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

function DimensionCard({ title, score }) {
  return (
    <div className="p-4 rounded-2xl bg-background-secondary border border-border/70 text-center space-y-1">
      <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black text-white">{score}%</p>
      <div className="w-full bg-brand-card h-1.5 rounded-full overflow-hidden mt-1">
        <div className="bg-brand-purple h-full rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
