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
  AlertCircle
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
  const [chat, setChat] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get(`/interview/${id}`);
        setInterview(data);

        // Reconstruct chat history
        const initialChat = [];
        data.questions.forEach((q, index) => {
          if (index <= data.answers.length) {
            initialChat.push({ role: 'ai', text: q.questionText });
          }
          if (data.answers[index]) {
            initialChat.push({
              role: 'user',
              text: data.answers[index].answerText || data.answers[index].audioTranscript,
              evaluation: data.answers[index].evaluation
            });
          }
        });

        setChat(initialChat);
        setCurrentQuestionIndex(data.answers.length);

        if (data.status === 'Completed') {
          router.push(`/results/${data._id}`);
          return;
        }

        socket.connect();
        socket.emit('join-interview', id);

        socket.on('ai-typing', ({ isTyping }) => setIsAiTyping(isTyping));

        socket.on('evaluation-result', ({ questionIndex, evaluation, isCompleted }) => {
          setIsAiTyping(false);
          if (isCompleted) {
            router.push(`/results/${id}`);
          } else {
            setCurrentQuestionIndex(prev => prev + 1);
            if (data.questions[questionIndex + 1]) {
              setChat(prev => [...prev, { role: 'ai', text: data.questions[questionIndex + 1].questionText }]);
            }
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
    setChat(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiTyping(true);

    try {
      // First try real-time WebSocket
      if (socket.connected) {
        socket.emit('submit-answer', {
          interviewId: id,
          questionIndex: currentQuestionIndex,
          answerText: userText
        });
      } else {
        // Fallback REST endpoint
        const { data } = await api.post(`/interview/${id}/submit`, {
          questionIndex: currentQuestionIndex,
          answerText: userText
        });

        setIsAiTyping(false);
        if (data.isCompleted) {
          router.push(`/results/${id}`);
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          if (interview.questions[currentQuestionIndex + 1]) {
            setChat(prev => [...prev, { role: 'ai', text: interview.questions[currentQuestionIndex + 1].questionText }]);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setIsAiTyping(false);
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
        <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-card border border-border">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl bg-background-secondary border border-border text-content-secondary hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                {interview.company || 'Tech Leader'} • {interview.role}
              </h1>
              <p className="text-[11px] text-content-secondary">
                {interview.roundType} • {interview.difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-brand-accent font-semibold px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30">
              Question {Math.min(currentQuestionIndex + 1, interview.questions.length)} of {interview.questions.length}
            </span>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div
          ref={scrollRef}
          className="p-6 rounded-3xl bg-brand-card border border-border min-h-[500px] max-h-[600px] overflow-y-auto space-y-6 shadow-modal-glow"
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
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-purple-gradient text-white rounded-tr-none shadow-card-glow'
                    : 'bg-background-secondary text-content-primary border border-border/70 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {/* Instant Score Badge if evaluated */}
                {msg.evaluation && (
                  <div className="pt-2 mt-2 border-t border-white/20 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white/90">Score: {msg.evaluation.score}/100</span>
                    <span className="text-white/80">{msg.evaluation.clarity}</span>
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
                <span className="text-xs text-content-secondary">Interviewer is evaluating your response</span>
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Answer Submission Form */}
        <form onSubmit={submitAnswer} className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAiTyping}
            placeholder="Structure your answer clearly with reasoning, trade-offs, and examples... (Press Enter to submit, Shift+Enter for newline)"
            className="w-full bg-brand-card border border-border rounded-2xl p-4 pr-16 text-xs sm:text-sm text-white placeholder-content-muted focus:outline-none focus:border-brand-purple h-28 resize-none leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitAnswer(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={isAiTyping || !answer.trim()}
            className="absolute right-4 bottom-4 p-3 rounded-xl bg-purple-gradient text-white shadow-card-glow hover:opacity-95 disabled:opacity-40 transition-all"
            title="Send Answer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
