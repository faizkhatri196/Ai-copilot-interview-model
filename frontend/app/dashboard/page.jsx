'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { Plus, History, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('Frontend Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/interview/history');
        setInterviews(data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/interview/create', { role, difficulty });
      router.push(`/interview/${data._id}`);
    } catch (error) {
      console.error('Failed to create interview', error);
      const backendMessage = error.response?.data?.message || error.message;
      alert(`Failed to create interview. Error: ${backendMessage}`);
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Interview Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Start New Interview
            </h2>
            <form onSubmit={handleCreateInterview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Role</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-border bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Interview'}
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-6 h-full">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <History className="h-5 w-5" /> Past Interviews
            </h2>
            {interviews.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                No past interviews found. Start one to see it here!
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                {interviews.map((int) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={int._id} 
                    className="p-4 border border-slate-100 dark:border-dark-border rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{int.role}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(int.createdAt).toLocaleDateString()} • {int.difficulty} • Score: {int.finalScore || 'N/A'}
                      </p>
                    </div>
                    {int.status === 'Completed' ? (
                      <Link href={`/results/${int._id}`} className="text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                        View Results <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link href={`/interview/${int._id}`} className="text-yellow-600 dark:text-yellow-500 flex items-center gap-1 hover:underline">
                        Resume <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
