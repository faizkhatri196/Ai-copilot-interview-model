'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      if (!data.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4 sm:p-6 selection:bg-brand-purple selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-purple/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-brand-card border border-border rounded-3xl p-8 sm:p-10 shadow-modal-glow relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sidebar flex items-center justify-center shadow-purple-glow">
              <Bot className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-2">
            Sign in to access your interview intelligence cockpit
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-system-error/10 border border-system-error/30 flex items-center gap-3 text-system-error text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
              Work or Personal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@google.com"
                className="w-full bg-background-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-content-muted focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-brand-accent hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-background-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-content-muted focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-purple-gradient text-white text-sm font-bold shadow-card-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign In to Dashboard</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-content-secondary">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-brand-accent font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
