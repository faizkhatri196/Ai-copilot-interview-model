'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  ArrowLeft,
  Loader2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import api from '../../../lib/axios';
import AppLayout from '../../../components/AppLayout';

export default function CodingWorkspacePage() {
  const { slug } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await api.get(`/coding/${slug}`);
        setChallenge(data);
        setCode(data.starterTemplates?.[language] || data.starterTemplates?.javascript || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [slug, language]);

  const handleRunCode = async () => {
    setRunning(true);
    setExecutionResult(null);

    try {
      const { data } = await api.post(`/coding/${slug}/submit`, {
        code,
        language,
      });
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({
        status: 'Runtime Error',
        errorMessage: err.response?.data?.message || err.message,
        testsPassed: 0,
        testsTotal: challenge?.testCases?.length || 1,
      });
    } finally {
      setRunning(false);
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

  if (!challenge) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-white">Challenge not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Mini Bar */}
        <div className="flex items-center justify-between">
          <Link href="/coding" className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Problem List
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-content-muted">Targeting {challenge.companyTags?.join(', ')}</span>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center p-1 rounded-xl bg-brand-card border border-border">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'description' ? 'bg-brand-purple text-white shadow-md' : 'text-content-secondary hover:text-white'
            }`}
          >
            Problem Description
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'editor' ? 'bg-brand-purple text-white shadow-md' : 'text-content-secondary hover:text-white'
            }`}
          >
            Code Editor & Tests
          </button>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Panel: Problem Spec */}
          <div className={`p-4 sm:p-6 rounded-3xl bg-brand-card border border-border flex flex-col justify-between overflow-y-auto max-h-[750px] ${
            activeTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    challenge.difficulty === 'Easy' ? 'bg-system-success/10 text-system-success' : 'bg-system-warning/10 text-system-warning'
                  }`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-semibold">
                    {challenge.topic}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white">{challenge.title}</h1>
              </div>

              <div className="text-xs text-content-secondary leading-relaxed space-y-4">
                <p>{challenge.description}</p>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Examples:</h3>
                {challenge.examples?.map((ex, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-background-secondary border border-border/60 text-xs space-y-1">
                    <p><span className="text-brand-accent font-semibold">Input:</span> <code className="text-white">{ex.input}</code></p>
                    <p><span className="text-system-success font-semibold">Output:</span> <code className="text-white">{ex.output}</code></p>
                    {ex.explanation && <p className="text-content-muted text-[11px] pt-1">{ex.explanation}</p>}
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Constraints:</h3>
                <ul className="list-disc list-inside text-xs text-content-secondary space-y-1">
                  {challenge.constraints?.map((c, idx) => (
                    <li key={idx}><code className="text-brand-light">{c}</code></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex items-center justify-between text-[11px] text-content-muted">
              <span>Time Limit: {challenge.timeLimitMs || 2000}ms</span>
              <span>Memory Limit: {challenge.memoryLimitMb || 128}MB</span>
            </div>
          </div>

          {/* Right Panel: Editor & Isolated Runner */}
          <div className={`flex flex-col rounded-3xl bg-brand-card border border-border overflow-hidden min-h-[450px] ${
            activeTab === 'description' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Editor Action Bar */}
            <div className="h-14 px-4 bg-background-secondary border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="h-4 w-4 text-brand-purple" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-brand-card border border-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="javascript">JavaScript (ES2024)</option>
                  <option value="python">Python 3.11</option>
                </select>
              </div>

              <button
                onClick={handleRunCode}
                disabled={running}
                className="px-4 py-2 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2 disabled:opacity-50"
              >
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                <span>{running ? 'Running Tests...' : 'Run & Submit Solution'}</span>
              </button>
            </div>

            {/* Code Input Area */}
            <div className="flex-1 relative bg-[#090414]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                className="w-full h-full min-h-[350px] bg-transparent p-4 text-xs font-mono text-white resize-none focus:outline-none leading-relaxed"
                placeholder="// Write your algorithmic solution here..."
              />
            </div>

            {/* Bottom Test Execution Drawer */}
            <div className="p-4 bg-background-secondary border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-brand-accent" /> Test Results & Feedback
                </span>
                {executionResult && (
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    executionResult.status === 'Accepted'
                      ? 'bg-system-success/15 text-system-success border border-system-success/30'
                      : 'bg-system-error/15 text-system-error border border-system-error/30'
                  }`}>
                    {executionResult.status} ({executionResult.testsPassed}/{executionResult.testsTotal} Passed)
                  </span>
                )}
              </div>

              {executionResult ? (
                <div className="space-y-2 text-xs">
                  <p className="text-content-secondary leading-relaxed">{executionResult.feedback}</p>
                  <div className="flex items-center gap-4 text-[11px] text-content-muted pt-1">
                    <span>Runtime: <b className="text-white">{executionResult.runtimeMs}ms</b></span>
                    <span>Memory: <b className="text-white">{executionResult.memoryMb}MB</b></span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-content-muted">
                  Click 'Run & Submit Solution' to validate your solution against both public and hidden test cases.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

