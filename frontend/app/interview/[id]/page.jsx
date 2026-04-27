'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';
import socket from '../../../lib/socket';
import { Send, Loader2, Bot, User as UserIcon } from 'lucide-react';

export default function InterviewRoom({ params }) {
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
            initialChat.push({ role: 'user', text: data.answers[index].answerText });
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
          if (isCompleted) {
            router.push(`/results/${id}`);
          } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setChat(prev => [...prev, { role: 'ai', text: data.questions[questionIndex + 1].questionText }]);
          }
        });

      } catch (error) {
        console.error(error);
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

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const userText = answer;
    setAnswer('');
    setChat(prev => [...prev, { role: 'user', text: userText }]);
    
    socket.emit('submit-answer', {
      interviewId: id,
      questionIndex: currentQuestionIndex,
      answerText: userText
    });
  };

  if (loading) return <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  if (!interview) return <div className="p-8">Interview not found.</div>;

  return (
    <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full p-4 h-[calc(100vh-64px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{interview.role} Interview</h1>
        <p className="text-slate-500">Question {currentQuestionIndex + 1} of {interview.questions.length}</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4 mb-4 space-y-6 shadow-sm"
      >
        <AnimatePresence>
          {chat.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-slate-800'}`}>
                {msg.role === 'user' ? <UserIcon className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isAiTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-800">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-slate-100 dark:bg-dark-bg rounded-2xl p-4 rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={submitAnswer} className="relative">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isAiTyping}
          placeholder="Type your answer here..."
          className="w-full pl-4 pr-14 py-4 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24 shadow-sm disabled:opacity-50"
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
          className="absolute right-4 bottom-4 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
