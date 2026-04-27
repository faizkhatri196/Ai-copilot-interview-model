'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bot, Zap, Shield, LineChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary-50 to-white dark:from-dark-bg dark:to-dark-bg/90">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
          Ace Your Next Tech Interview
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10">
          Practice with an advanced AI interviewer that asks dynamic questions, evaluates your answers in real-time, and provides actionable feedback.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
            Start Practicing Now
          </Link>
          <Link href="/login" className="bg-white dark:bg-dark-card dark:border-dark-border border border-slate-200 text-slate-800 dark:text-white font-semibold py-4 px-8 rounded-full shadow transition-transform transform hover:scale-105">
            View Dashboard
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full">
        <FeatureCard 
          icon={<Bot className="h-8 w-8 text-indigo-500" />}
          title="Dynamic AI Persona"
          desc="Our AI adapts its questions based on your target role and experience level."
        />
        <FeatureCard 
          icon={<Zap className="h-8 w-8 text-yellow-500" />}
          title="Real-time Evaluation"
          desc="Get instant scores on correctness, clarity, and technical depth as you answer."
        />
        <FeatureCard 
          icon={<LineChart className="h-8 w-8 text-emerald-500" />}
          title="Actionable Feedback"
          desc="Review comprehensive reports to identify your weak spots and improve."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-border"
    >
      <div className="bg-slate-50 dark:bg-dark-bg w-14 h-14 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{desc}</p>
    </motion.div>
  )
}
