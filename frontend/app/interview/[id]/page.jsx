'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  Sparkles,
  ArrowLeft,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FastForward,
  Pause,
  Play,
  Layers,
  Award,
  Mic,
  MicOff
} from 'lucide-react';
import api from '../../../lib/axios';
import socket from '../../../lib/socket';
import AppLayout from '../../../components/AppLayout';

export default function InterviewRoomPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiStateLabel, setAiStateLabel] = useState('Interviewer is evaluating your response...');
  const [chat, setChat] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [clarificationModal, setClarificationModal] = useState(false);
  const [clarificationQuery, setClarificationQuery] = useState('');
  const [clarificationLoading, setClarificationLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const scrollRef = useRef(null);
  const dictationRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          current += event.results[i][0].transcript;
        }
        if (current.trim()) {
          setAnswer(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${current.trim()}` : current.trim();
          });
        }
      };

      recog.onerror = (e) => {
        console.warn('Dictation recognition error:', e);
        setIsDictating(false);
      };

      recog.onend = () => {
        setIsDictating(false);
      };

      dictationRef.current = recog;
    }
  }, []);

  const toggleDictation = () => {
    if (!dictationRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isDictating) {
      dictationRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        dictationRef.current.start();
        setIsDictating(true);
      } catch (e) {
        console.warn('Dictation start failed:', e);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get(`/interview/${id}`);
        setInterview(data);

        // Reconstruct dynamic conversation turns
        const initialChat = [];
        data.questions.forEach((q, index) => {
          initialChat.push({
            role: 'ai',
            text: q.questionText,
            questionType: q.questionType,
            topic: q.topic,
            questionId: q.questionId,
            time: q.askedAt ? new Date(q.askedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM'
          });
          if (data.answers[index]) {
            initialChat.push({
              role: 'user',
              text: data.answers[index].answerText || data.answers[index].audioTranscript,
              evaluation: data.answers[index].evaluation,
              time: data.answers[index].submittedAt ? new Date(data.answers[index].submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
            });
          }
        });

        setChat(initialChat);
        const lastQ = data.questions[data.questions.length - 1];
        setActiveQuestion(lastQ);

        if (data.status === 'Completed') {
          router.push(`/results/${data._id}`);
          return;
        }

        socket.connect();
        socket.emit('join-interview', id);

        socket.on('ai-typing', ({ isTyping, state }) => {
          setIsAiTyping(isTyping);
          if (state === 'GENERATING_FOLLOWUP') {
            setAiStateLabel('Formulating contextual follow-up question...');
          } else if (state === 'ANALYZING_RESPONSE') {
            setAiStateLabel('Analyzing technical correctness & depth...');
          } else {
            setAiStateLabel('Interviewer is responding...');
          }
        });

        socket.on('evaluation-result', (payload) => {
          setIsAiTyping(false);
          const { evaluation, nextQuestion, isCompleted, interview: updated } = payload;
          if (updated) setInterview(updated);

          if (isCompleted) {
            router.push(`/results/${id}`);
          } else if (nextQuestion) {
            setActiveQuestion(nextQuestion);
            setChat(prev => [...prev, {
              role: 'ai',
              text: nextQuestion.questionText,
              questionType: nextQuestion.questionType,
              topic: nextQuestion.topic,
              questionId: nextQuestion.questionId,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }
        });

        socket.on('clarification-response', ({ clarification }) => {
          setClarificationLoading(false);
          setClarificationModal(false);
          setClarificationQuery('');
          setChat(prev => [...prev, {
            role: 'ai',
            isClarification: true,
            text: `[Clarification] ${clarification}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        });

        socket.on('question-skipped', ({ nextQuestion, interview: updated }) => {
          if (updated) setInterview(updated);
          if (nextQuestion) {
            setActiveQuestion(nextQuestion);
            setChat(prev => [...prev, {
              role: 'ai',
              text: nextQuestion.questionText,
              questionType: nextQuestion.questionType,
              topic: nextQuestion.topic,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }
        });

      } catch (error) {
        console.error('Failed to load interview room:', error);
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      socket.disconnect();
    };
  }, [id, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isAiTyping]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() || isAiTyping) return;

    const userText = answer;
    setAnswer('');
    setChat(prev => [...prev, {
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsAiTyping(true);
    setAiStateLabel('Interviewer is analyzing your response...');

    const idempotencyKey = 'ans_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    try {
      if (socket.connected) {
        socket.emit('submit-answer', {
          interviewId: id,
          questionId: activeQuestion?.questionId,
          idempotencyKey,
          answerText: userText
        });
      } else {
        const { data } = await api.post(`/interview/${id}/submit`, {
          questionId: activeQuestion?.questionId,
          idempotencyKey,
          answerText: userText
        });

        setIsAiTyping(false);
        if (data.interview) setInterview(data.interview);

        if (data.isCompleted) {
          router.push(`/results/${id}`);
        } else if (data.nextQuestion) {
          setActiveQuestion(data.nextQuestion);
          setChat(prev => [...prev, {
            role: 'ai',
            text: data.nextQuestion.questionText,
            questionType: data.nextQuestion.questionType,
            topic: data.nextQuestion.topic,
            questionId: data.nextQuestion.questionId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }
    } catch (err) {
      console.error(err);
      setIsAiTyping(false);
    }
  };

  const handleAskClarification = async () => {
    if (!clarificationQuery.trim()) return;
    setClarificationLoading(true);

    try {
      if (socket.connected) {
        socket.emit('request-clarification', {
          interviewId: id,
          questionId: activeQuestion?.questionId,
          candidateQuery: clarificationQuery
        });
      } else {
        const { data } = await api.post(`/interview/${id}/clarify`, {
          questionId: activeQuestion?.questionId,
          candidateQuery: clarificationQuery
        });
        setClarificationLoading(false);
        setClarificationModal(false);
        setClarificationQuery('');
        setChat(prev => [...prev, {
          role: 'ai',
          isClarification: true,
          text: `[Clarification] ${data.clarification}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      alert('Failed to get clarification: ' + (err.response?.data?.message || err.message));
      setClarificationLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm('Are you sure you want to skip this topic? The interviewer will transition to another area.')) return;
    try {
      if (socket.connected) {
        socket.emit('skip-question', {
          interviewId: id,
          questionId: activeQuestion?.questionId
        });
      } else {
        const { data } = await api.post(`/interview/${id}/skip`, {
          questionId: activeQuestion?.questionId
        });
        if (data.nextQuestion) {
          setActiveQuestion(data.nextQuestion);
          setChat(prev => [...prev, {
            role: 'ai',
            text: data.nextQuestion.questionText,
            questionType: data.nextQuestion.questionType,
            topic: data.nextQuestion.topic,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }
    } catch (err) {
      alert('Skip failed: ' + (err.response?.data?.message || err.message));
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

  if (!interview) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-white">Interview session not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Session Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-brand-card border border-border gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl bg-background-secondary border border-border text-content-secondary hover:text-white shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                  {interview.company || 'Tech Leader'} • {interview.role}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-accent font-bold uppercase shrink-0">
                  Adaptive 2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-content-secondary truncate">
                {interview.roundType} • {interview.difficulty} ({interview.interviewerPersonality})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto">
            <button
              onClick={() => setClarificationModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-background-secondary border border-border text-content-secondary hover:text-white text-xs font-semibold flex items-center gap-1.5"
              title="Ask interviewer for scope/parameter clarification"
            >
              <HelpCircle className="h-3.5 w-3.5 text-brand-accent" />
              <span>Clarification</span>
            </button>

            <button
              onClick={handleSkip}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-background-secondary border border-border text-content-secondary hover:text-system-warning text-xs font-semibold flex items-center gap-1.5"
              title="Skip this question"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Skip</span>
            </button>

            <span className="text-xs text-brand-accent font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 shrink-0">
              Turn {chat.filter(m => m.role === 'user').length + 1}
            </span>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div
          ref={scrollRef}
          className="p-3.5 sm:p-6 rounded-3xl bg-brand-card border border-border h-[52vh] sm:h-[58vh] min-h-[340px] max-h-[620px] overflow-y-auto space-y-4 sm:space-y-6 shadow-modal-glow scrollbar-thin"
        >
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  msg.role === 'user' ? 'bg-sidebar text-white' : 'bg-brand-purple text-white'
                }`}
              >
                {msg.role === 'user' ? <UserIcon className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-purple-gradient text-white rounded-tr-none shadow-card-glow'
                    : msg.isClarification
                    ? 'bg-background-secondary border border-brand-accent/40 text-brand-light rounded-tl-none'
                    : 'bg-background-secondary text-content-primary border border-border/70 rounded-tl-none'
                }`}
              >
                {/* Question Type & Topic Pill */}
                {msg.role === 'ai' && !msg.isClarification && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      msg.questionType === 'FOLLOW_UP'
                        ? 'bg-system-warning/15 text-system-warning border border-system-warning/30'
                        : msg.questionType === 'PROJECT_DRILL_DOWN'
                        ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30'
                        : 'bg-brand-purple/20 text-brand-accent border border-brand-accent/20'
                    }`}>
                      {msg.questionType === 'FOLLOW_UP' ? '⚡ Contextual Follow-Up' : msg.questionType === 'PROJECT_DRILL_DOWN' ? '🔬 Project Deep Dive' : '🎯 Primary Architecture'}
                    </span>
                    {msg.topic && (
                      <span className="text-[11px] text-content-muted font-medium">
                        • {msg.topic}
                      </span>
                    )}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Instant Score Badge if evaluated */}
                {msg.evaluation && (
                  <div className="pt-2 mt-2 border-t border-white/20 flex flex-wrap items-center justify-between text-[11px] gap-2">
                    <span className="font-semibold text-white/95 flex items-center gap-1">
                      <Award className="h-3 w-3 text-system-warning" />
                      Score: {msg.evaluation.score}/100
                    </span>
                    {msg.evaluation.missedConcepts?.length > 0 && (
                      <span className="text-white/80">
                        Probing: {msg.evaluation.missedConcepts[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-purple flex items-center justify-center text-white flex-shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-background-secondary border border-border/70 rounded-2xl p-4 rounded-tl-none flex items-center gap-2">
                <span className="text-xs text-content-secondary">{aiStateLabel}</span>
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Answer Submission Form with Live Voice Dictation */}
        <form onSubmit={submitAnswer} className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAiTyping}
            placeholder={isDictating ? "Listening to your voice... Speak your technical explanation..." : "Structure your answer with reasoning, trade-offs, and failure recovery... (Press Enter to submit, or use mic)"}
            className={`w-full bg-brand-card border rounded-2xl p-4 pr-24 sm:pr-28 text-xs sm:text-sm text-white placeholder-content-muted focus:outline-none transition-all h-28 resize-none leading-relaxed disabled:opacity-50 ${
              isDictating ? 'border-system-success ring-1 ring-system-success/50' : 'border-border focus:border-brand-purple'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitAnswer(e);
              }
            }}
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleDictation}
              disabled={isAiTyping}
              className={`p-2.5 rounded-xl border transition-all ${
                isDictating 
                  ? 'bg-system-success text-black border-system-success animate-pulse shadow-md' 
                  : 'bg-background-secondary border-border text-content-secondary hover:text-white hover:border-brand-purple'
              }`}
              title={isDictating ? "Stop voice dictation" : "Dictate your answer via voice"}
            >
              {isDictating ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>

            <button
              type="submit"
              disabled={isAiTyping || !answer.trim()}
              className="p-2.5 rounded-xl bg-purple-gradient text-white shadow-card-glow hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
              title="Send Answer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Clarification Modal */}
        {clarificationModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-card border border-border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-modal-glow">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-brand-accent" />
                  Ask Interviewer for Clarification
                </h3>
                <button
                  onClick={() => setClarificationModal(false)}
                  className="text-content-muted hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-content-secondary">
                Like in a real FAANG/tier-1 technical interview, you can clarify ambiguous requirements, peak throughput, or expected SLAs before presenting your solution.
              </p>
              <textarea
                value={clarificationQuery}
                onChange={(e) => setClarificationQuery(e.target.value)}
                placeholder="e.g. Should I optimize for read-heavy or write-heavy latency? Are network partitions expected across multi-region deployments?"
                className="w-full bg-background-secondary border border-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-purple h-24 resize-none"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setClarificationModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs text-content-secondary hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={handleAskClarification}
                  disabled={clarificationLoading || !clarificationQuery.trim()}
                  className="px-5 py-2 rounded-xl bg-purple-gradient text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {clarificationLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Ask Interviewer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
