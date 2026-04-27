'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <nav className="border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-primary-600 dark:text-primary-500" />
            <span className="font-bold text-xl tracking-tight">InterviewCopilot</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:opacity-80"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
