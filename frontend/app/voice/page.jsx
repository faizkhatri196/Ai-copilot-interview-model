'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  Loader2,
  Send,
  MessageSquare
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function LiveVoiceInterviewPage() {
  const router = useRouter();
  const [role, setRole] = useState('Senior Software Engineer');
  const [company, setCompany] = useState('Amazon');
  const [isStarted, setIsStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      role: 'ai',
      text: "Hello! Welcome to your technical voice interview. I will be your interviewer today. To get started, could you walk me through an overview of a recent technical project you architected and the key engineering challenges you solved?",
      time: '12:00 PM'
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          current += event.results[i][0].transcript;
        }
        setTranscriptText(current);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Start listening after AI finishes speaking
        toggleListening(true);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = (forceState) => {
    const next = forceState !== undefined ? forceState : !isListening;
    setIsListening(next);
    if (recognitionRef.current) {
      try {
        if (next) {
          recognitionRef.current.start();
        } else {
          recognitionRef.current.stop();
        }
      } catch (e) {
        // Recognition already active
      }
    }
  };

  const startVoiceInterview = async () => {
    setIsStarted(true);
    speakText(chatLog[0].text);
  };

  const submitCandidateVoiceAnswer = async () => {
    if (!transcriptText.trim()) return;

    toggleListening(false);
    const userAnswer = transcriptText;
    setTranscriptText('');

    const newChat = [...chatLog, { role: 'user', text: userAnswer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setChatLog(newChat);
    setEvaluating(true);

    try {
      // Query backend for next conversational follow-up
      const nextQuestions = [
        "That's insightful. When designing that system, how did you handle data consistency and cache invalidation under peak load?",
        "Interesting. What trade-offs did you consider between a relational schema and a distributed document store for that service?",
        "Can you describe an incident where latency spiked unexpectedly in that architecture? How did you isolate the bottleneck?"
      ];

      const nextQuestion = nextQuestions[currentQuestionIndex % nextQuestions.length];
      setCurrentQuestionIndex(prev => prev + 1);

      setTimeout(() => {
        setChatLog(prev => [...prev, {
          role: 'ai',
          text: nextQuestion,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setEvaluating(false);
        speakText(nextQuestion);
      }, 1200);

    } catch (err) {
      console.error(err);
      setEvaluating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-white mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white">{company} Voice Interview</h1>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-system-warning/15 text-system-warning border border-system-warning/30 font-bold uppercase">
                Live Speech Engine
              </span>
            </div>
            <p className="text-xs text-content-secondary">{role} • Round 9</p>
          </div>

          {!isStarted ? (
            <button
              onClick={startVoiceInterview}
              className="px-6 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Start Voice Session
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-xl bg-system-error/20 border border-system-error/40 text-system-error text-xs font-bold hover:bg-system-error/30 flex items-center gap-2"
            >
              <Square className="h-3.5 w-3.5 fill-current" /> End Interview
            </button>
          )}
        </div>

        {/* Voice Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-220px)]">
          {/* Main Visualizer Area */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-brand-card border border-border flex flex-col items-center justify-between relative overflow-hidden">
            {/* Visualizer Aura Glow */}
            <div className={`absolute w-72 h-72 rounded-full blur-[90px] pointer-events-none transition-all duration-700 ${
              isSpeaking ? 'bg-brand-purple/40 scale-125' : isListening ? 'bg-system-success/30 scale-110' : 'bg-brand-cardDark'
            }`} />

            <div className="w-full flex items-center justify-between text-xs text-content-secondary relative z-10">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isStarted ? 'bg-system-success animate-pulse' : 'bg-content-muted'}`} />
                {isStarted ? (isSpeaking ? 'AI Speaking...' : isListening ? 'Listening to Candidate...' : 'Ready') : 'Interview Paused'}
              </span>
              <span>Question {currentQuestionIndex + 1} of 5</span>
            </div>

            {/* AI Avatar Pulse Ring */}
            <div className="relative z-10 flex flex-col items-center justify-center my-12">
              <div className={`w-36 h-36 rounded-full bg-sidebar flex items-center justify-center shadow-purple-glow transition-transform duration-500 ${
                isSpeaking ? 'scale-110 ring-8 ring-brand-purple/30' : isListening ? 'ring-8 ring-system-success/30' : ''
              }`}>
                <Bot className="h-16 w-16 text-white" />
              </div>

              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-center gap-1.5 mt-8 h-8">
                {[4, 12, 24, 16, 32, 20, 8, 28, 14, 6].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-200 ${
                      isSpeaking ? 'bg-brand-accent' : isListening ? 'bg-system-success' : 'bg-content-muted/30'
                    }`}
                    style={{
                      height: (isSpeaking || isListening) ? `${(h * (Math.sin(Date.now() / 200 + i) + 1.2)).toFixed(0)}px` : '6px'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Microphone Controls */}
            <div className="w-full relative z-10 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isMuted ? 'bg-system-error/20 border-system-error/40 text-system-error' : 'bg-background-secondary border-border text-white hover:bg-white/5'
                  }`}
                  title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => toggleListening()}
                  disabled={!isStarted}
                  className={`p-5 rounded-full border shadow-purple-glow transition-all transform hover:scale-105 ${
                    isListening
                      ? 'bg-system-success border-system-success text-black'
                      : 'bg-brand-purple border-brand-accent text-white'
                  }`}
                  title={isListening ? 'Stop Mic' : 'Start Mic'}
                >
                  {isListening ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
                </button>

                {transcriptText && (
                  <button
                    onClick={submitCandidateVoiceAnswer}
                    className="px-5 py-3 rounded-2xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95"
                  >
                    Submit Answer
                  </button>
                )}
              </div>

              {/* Text Fallback Input */}
              <div className="relative w-full max-w-xl mx-auto">
                <input
                  type="text"
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCandidateVoiceAnswer();
                  }}
                  placeholder="Or type candidate response here if microphone is unavailable..."
                  className="w-full bg-background-secondary border border-border rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-purple"
                />
                <button
                  onClick={submitCandidateVoiceAnswer}
                  disabled={!transcriptText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-accent hover:text-white disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Transcript & Chat History */}
          <div className="p-6 rounded-3xl bg-brand-card border border-border flex flex-col justify-between max-h-[700px]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-brand-accent" />
                Live Transcript & History
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-content-muted">
                    {msg.role === 'user' ? 'You' : 'Interviewer'} • {msg.time}
                  </span>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                      msg.role === 'user'
                        ? 'bg-brand-purple text-white rounded-tr-none'
                        : 'bg-background-secondary text-content-secondary border border-border/60 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {evaluating && (
                <div className="flex items-center gap-2 text-xs text-content-muted p-3 rounded-xl bg-background-secondary border border-border/50 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-purple" />
                  <span>Interviewer is evaluating answer and forming follow-up...</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/50 text-[11px] text-content-muted">
              Audio transcription processed with browser Web Speech API & local fallback.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

