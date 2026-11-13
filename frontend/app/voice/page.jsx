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
  Square,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  Loader2,
  Send,
  MessageSquare,
  Award,
  AlertCircle,
  Settings2,
  CheckCircle2
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function LiveVoiceInterviewPage() {
  const router = useRouter();

  // Interview Configuration
  const [company, setCompany] = useState('Amazon');
  const [role, setRole] = useState('Senior Software Engineer');
  const [roundType, setRoundType] = useState('System Design & Distributed Scalability');
  const [difficulty, setDifficulty] = useState('Senior');

  // Session State
  const [isStarted, setIsStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentScore, setCurrentScore] = useState(85);
  const [latestFeedback, setLatestFeedback] = useState(null);

  // Chat History
  const [chatLog, setChatLog] = useState([]);
  const [turnCount, setTurnCount] = useState(0);

  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Setup Web Speech Recognition
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

  // Auto-scroll chat history
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatLog, evaluating]);

  // Text to Speech
  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setIsSpeaking(true);
        toggleListening(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Automatically start listening after AI finishes speaking
        toggleListening(true);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
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
        // Recognition already in requested state
      }
    }
  };

  // Start Voice Interview Session using AI
  const startVoiceInterview = async () => {
    setIsStarted(true);
    setEvaluating(true);
    setChatLog([]);
    setTurnCount(0);

    try {
      // Call AI backend to generate dynamic tailored opening question
      const { data } = await api.post('/interview/voice-turn', {
        userSpokenText: `Candidate is ready to start the interview for ${role} at ${company} (${roundType}, ${difficulty} level). Give a 2-sentence opening greeting and present the first in-depth technical interview question.`,
        history: [],
        role,
        company,
        difficulty,
        roundType
      });

      const openingText = data.speechResponse || `Welcome to your ${company} technical interview for the ${role} position. Let's begin: how do you approach data consistency and failover across multi-region microservices?`;

      const aiMsg = {
        role: 'ai',
        text: openingText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatLog([aiMsg]);
      setTurnCount(1);
      setEvaluating(false);
      speakText(openingText);
    } catch (err) {
      console.error('Failed to start voice interview with AI:', err);
      const fallbackText = `Welcome to your ${company} voice interview. Could you explain how you design distributed systems for fault tolerance and zero-data-loss under network partitions?`;
      setChatLog([{
        role: 'ai',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTurnCount(1);
      setEvaluating(false);
      speakText(fallbackText);
    }
  };

  // Submit Spoken Answer to AI Engine
  const submitCandidateVoiceAnswer = async () => {
    if (!transcriptText.trim()) return;

    toggleListening(false);
    const candidateAnswer = transcriptText.trim();
    setTranscriptText('');

    const userMsg = {
      role: 'user',
      text: candidateAnswer,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedLog = [...chatLog, userMsg];
    setChatLog(updatedLog);
    setEvaluating(true);

    try {
      // Call backend AI Voice Turn Engine
      const { data } = await api.post('/interview/voice-turn', {
        userSpokenText: candidateAnswer,
        history: updatedLog,
        role,
        company,
        difficulty,
        roundType
      });

      if (data.score) setCurrentScore(data.score);
      setLatestFeedback({
        feedback: data.feedbackSnippet,
        strengths: data.strengths || [],
        gaps: data.gaps || []
      });

      const nextSpeech = data.speechResponse || data.nextQuestion || "Thank you. Let's move to the next topic.";

      const aiMsg = {
        role: 'ai',
        text: nextSpeech,
        feedback: data.feedbackSnippet,
        score: data.score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatLog(prev => [...prev, aiMsg]);
      setTurnCount(prev => prev + 1);
      setEvaluating(false);

      speakText(nextSpeech);
    } catch (err) {
      console.error('AI Voice turn error:', err);
      setEvaluating(false);
      const fallbackNext = "That makes sense. When scaling that architecture to 100,000 requests per second, how would you prevent cache stampedes and database bottlenecks?";
      setChatLog(prev => [...prev, {
        role: 'ai',
        text: fallbackNext,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakText(fallbackNext);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-white mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white">{company} Voice Interview</h1>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-accent border border-brand-accent/30 font-bold uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Live AI Engine
              </span>
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              {role} • {roundType} ({difficulty})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isStarted ? (
              <button
                onClick={startVoiceInterview}
                disabled={evaluating}
                className="px-6 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2 disabled:opacity-50"
              >
                {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                <span>Start AI Voice Session</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  toggleListening(false);
                  setIsStarted(false);
                }}
                className="px-4 py-2 rounded-xl bg-system-error/20 border border-system-error/40 text-system-error text-xs font-bold hover:bg-system-error/30 flex items-center gap-2"
              >
                <Square className="h-3.5 w-3.5 fill-current" /> End Session
              </button>
            )}
          </div>
        </div>

        {/* Configuration Bar (When not started) */}
        {!isStarted && (
          <div className="p-4 rounded-2xl bg-brand-card border border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold text-content-muted block mb-1.5">Target Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Meta">Meta</option>
                <option value="Uber">Uber</option>
                <option value="Netflix">Netflix</option>
                <option value="Stripe">Stripe</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Apple">Apple</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-content-muted block mb-1.5">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="Senior Software Engineer">Senior Software Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Distributed Systems Engineer">Distributed Systems Engineer</option>
                <option value="AI / Generative AI Engineer">AI / Generative AI Engineer</option>
                <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-content-muted block mb-1.5">Interview Round</label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="System Design & Distributed Scalability">System Design & Scalability</option>
                <option value="Technical Architecture & Concurrency">Technical Architecture & Concurrency</option>
                <option value="Deep Coding & Algorithmic Problem Solving">Deep Coding & Algorithms</option>
                <option value="Behavioral & Leadership Principles">Behavioral & Leadership</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-content-muted block mb-1.5">Seniority Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option value="Senior">Senior (L5 / SDE 3)</option>
                <option value="Staff">Staff / Principal (L6+)</option>
                <option value="Intermediate">Intermediate (L4 / SDE 2)</option>
                <option value="Fresher">Entry / Fresher (L3 / SDE 1)</option>
              </select>
            </div>
          </div>
        )}

        {/* Voice Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-250px)]">
          {/* Main Visualizer Stage */}
          <div className="lg:col-span-2 p-4 sm:p-6 lg:p-8 rounded-3xl bg-brand-card border border-border flex flex-col items-center justify-between relative overflow-hidden min-h-[460px]">
            {/* Visualizer Aura Glow */}
            <div className={`absolute w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
              isSpeaking ? 'bg-brand-purple/40 scale-125' : isListening ? 'bg-system-success/30 scale-110' : 'bg-brand-cardDark'
            }`} />

            <div className="w-full flex items-center justify-between text-xs text-content-secondary relative z-10 gap-2 flex-wrap">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isStarted ? (isSpeaking ? 'bg-brand-accent animate-ping' : isListening ? 'bg-system-success animate-pulse' : 'bg-system-success') : 'bg-content-muted'}`} />
                {isStarted
                  ? (isSpeaking ? 'AI Speaking aloud...' : isListening ? 'Listening to Candidate (Speak now)...' : 'AI Evaluating...')
                  : 'Ready to Start Voice Session'}
              </span>
              <span className="font-bold text-white shrink-0">
                Turn {turnCount} • Score: <span className="text-brand-accent">{currentScore}/100</span>
              </span>
            </div>

            {/* AI Avatar Pulse Ring */}
            <div className="relative z-10 flex flex-col items-center justify-center my-6 sm:my-8">
              <div className={`w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-sidebar flex items-center justify-center shadow-purple-glow transition-all duration-500 ${
                isSpeaking
                  ? 'scale-110 ring-8 ring-brand-purple/40 shadow-card-glow'
                  : isListening
                  ? 'ring-8 ring-system-success/30 scale-105'
                  : ''
              }`}>
                <Bot className="h-12 sm:h-16 w-12 sm:w-16 text-white" />
              </div>

              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 h-10">
                {[12, 28, 40, 24, 48, 32, 16, 44, 20, 10, 36, 18].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isSpeaking ? 'bg-brand-accent' : isListening ? 'bg-system-success' : 'bg-content-muted/30'
                    }`}
                    style={{
                      height: (isSpeaking || isListening)
                        ? `${Math.max(6, Math.min(48, h * (Math.sin((Date.now() / 150) + i) * 0.5 + 0.8))).toFixed(0)}px`
                        : '6px'
                    }}
                  />
                ))}
              </div>

              <p className="text-xs text-content-muted mt-4">
                {isSpeaking
                  ? 'Interviewer is speaking. Listen carefully.'
                  : isListening
                  ? 'Microphone is active. Speak your technical answer.'
                  : isStarted
                  ? 'Processing evaluation with AI...'
                  : 'Click Start AI Voice Session above to begin'}
              </p>
            </div>

            {/* Microphone & Input Controls */}
            <div className="w-full relative z-10 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isMuted
                      ? 'bg-system-error/20 border-system-error/40 text-system-error'
                      : 'bg-background-secondary border-border text-white hover:bg-white/5'
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
                  title={isListening ? 'Pause Microphone' : 'Activate Microphone'}
                >
                  {isListening ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
                </button>

                {transcriptText && (
                  <button
                    onClick={submitCandidateVoiceAnswer}
                    disabled={evaluating}
                    className="px-5 py-3 rounded-2xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-1.5"
                  >
                    {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Submit Answer</span>
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
                  disabled={!isStarted}
                  placeholder={isListening ? "Listening to your voice... (or edit transcript here)" : "Type answer here if microphone is muted or unavailable..."}
                  className="w-full bg-background-secondary border border-border rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-purple disabled:opacity-50"
                />
                <button
                  onClick={submitCandidateVoiceAnswer}
                  disabled={!transcriptText.trim() || evaluating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-accent hover:text-white disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Transcript & AI Feedback */}
          <div className="p-6 rounded-3xl bg-brand-card border border-border flex flex-col justify-between max-h-[720px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-brand-accent" />
                  Live Conversational Transcript
                </h3>
                <span className="text-xs text-brand-accent font-semibold flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Score: {currentScore}
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 my-3 scrollbar-thin">
              {chatLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted text-xs">
                  <Bot className="h-10 w-10 text-brand-purple/40 mb-3" />
                  <p>Configure your target company and role, then click <b>Start AI Voice Session</b> to begin the dynamic simulation.</p>
                </div>
              ) : (
                chatLog.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-content-muted flex items-center gap-1">
                      {msg.role === 'user' ? (
                        <>You <User className="h-2.5 w-2.5" /></>
                      ) : (
                        <>Interviewer <Bot className="h-2.5 w-2.5 text-brand-accent" /></>
                      )} • {msg.time}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] ${
                        msg.role === 'user'
                          ? 'bg-brand-purple text-white rounded-tr-none shadow-card-glow'
                          : 'bg-background-secondary text-content-secondary border border-border/60 rounded-tl-none'
                      }`}
                    >
                      {msg.text}

                      {msg.feedback && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/40 text-[11px] text-brand-accent/90">
                          <b>AI Assessment:</b> {msg.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {evaluating && (
                <div className="flex items-center gap-2 text-xs text-content-muted p-3 rounded-xl bg-background-secondary border border-border/50 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-purple" />
                  <span>AI interviewer is evaluating your technical depth and formulating follow-up...</span>
                </div>
              )}
            </div>

            {/* Bottom Real-Time Analysis Card */}
            {latestFeedback && (
              <div className="p-3.5 rounded-2xl bg-background-secondary border border-border/60 space-y-2 mb-2">
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                  Real-time Candidate Insights
                </div>
                {latestFeedback.strengths?.length > 0 && (
                  <div className="text-[11px] text-system-success flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                    <span><b>Strengths:</b> {latestFeedback.strengths.join(', ')}</span>
                  </div>
                )}
                {latestFeedback.gaps?.length > 0 && (
                  <div className="text-[11px] text-system-warning flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span><b>Gaps to address:</b> {latestFeedback.gaps.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-border/50 text-[11px] text-content-muted flex items-center justify-between">
              <span>Speech Engine: Web Speech API</span>
              <span>AI Model: Groq / Gemini Active</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
