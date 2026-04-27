'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '../../lib/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-dark-border"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-border bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-border bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-border bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
