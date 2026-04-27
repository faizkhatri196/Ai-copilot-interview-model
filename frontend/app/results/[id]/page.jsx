'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Results({ params }) {
  const { id } = params;
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get(`/interview/${id}`);
        setInterview(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) return <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  if (!interview) return <div className="p-8">Results not found.</div>;

  return (
    <div className="flex-grow p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-primary-600 flex items-center gap-2 mb-4 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <p className="text-slate-500 mt-2">{interview.role} • {interview.difficulty}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-primary-600">
            {Math.round(interview.finalScore)}<span className="text-2xl text-slate-400">/100</span>
          </div>
          <p className="text-sm font-medium mt-1">Final Score</p>
        </div>
      </div>

      <div className="space-y-8">
        {interview.answers.map((ans, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-dark-bg p-4 border-b border-slate-200 dark:border-dark-border">
              <h3 className="font-semibold text-lg flex items-start gap-2">
                <span className="text-primary-500 mt-1">Q{idx + 1}:</span>
                {interview.questions[idx].questionText}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Answer</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  {ans.answerText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-emerald-600 font-semibold mb-1">
                      <CheckCircle2 className="h-4 w-4" /> Correctness
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{ans.evaluation.correctness}</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
                      <AlertCircle className="h-4 w-4" /> Clarity
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{ans.evaluation.clarity}</p>
                  </div>
                </div>
                
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30">
                  <h4 className="font-semibold text-primary-800 dark:text-primary-300 mb-2 flex justify-between">
                    Overall Feedback
                    <span className="font-bold bg-white dark:bg-dark-bg px-2 py-1 rounded text-sm">
                      Score: {ans.evaluation.score}/100
                    </span>
                  </h4>
                  <p className="text-sm text-primary-900 dark:text-primary-200">
                    {ans.evaluation.feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
