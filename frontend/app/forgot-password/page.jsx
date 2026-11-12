'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../lib/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4 selection:bg-brand-purple selection:text-white relative">
      <div className="w-full max-w-md bg-brand-card border border-border rounded-3xl p-8 sm:p-10 shadow-modal-glow">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-white mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sidebar flex items-center justify-center mx-auto mb-4 shadow-purple-glow">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
          <p className="text-xs text-content-secondary mt-1">
            Enter your account email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-system-success/10 border border-system-success/30 text-center space-y-2">
            <CheckCircle2 className="h-6 w-6 text-system-success mx-auto" />
            <p className="text-xs text-white font-semibold">Password reset instructions sent.</p>
            <p className="text-[11px] text-content-secondary">Check your email inbox for your secure recovery link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full bg-background-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send Recovery Instructions</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

