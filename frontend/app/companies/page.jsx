'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Users,
  Loader2,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await api.get(`/companies?query=${encodeURIComponent(search)}`);
        setCompanies(data);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [search]);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-World Recruitment Patterns</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Company Intelligence</h1>
            <p className="text-xs sm:text-sm text-content-secondary mt-1">
              Official careers research, reported DSA stages, and cultural values for premier tech organizations.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies (e.g. Amazon, Google)..."
              className="w-full bg-brand-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((comp) => {
              const slug = comp.slug || comp.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <div
                  key={comp.name}
                  className="p-6 rounded-3xl bg-brand-card border border-border hover:border-brand-accent/40 transition-all duration-300 hover:shadow-card-glow flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-sidebar flex items-center justify-center text-white font-black text-base shadow-purple-glow">
                        {comp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-system-success/10 text-system-success border border-system-success/20 font-bold uppercase">
                        Verified Intel
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-content-secondary mt-1">
                        {comp.industry || 'Technology & Cloud Solutions'}
                      </p>
                    </div>

                    <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
                      {comp.description || `Explore verified interview stages, DSA problem patterns, and behavioral principles for ${comp.name}.`}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <Link
                      href={`/interview/setup?company=${encodeURIComponent(comp.name)}`}
                      className="text-xs font-semibold text-content-secondary hover:text-white"
                    >
                      Start Mock
                    </Link>
                    <Link
                      href={`/companies/${slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95"
                    >
                      <span>Deep Intel</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

