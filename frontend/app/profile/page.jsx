'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Cpu,
  Code2,
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../../lib/axios';
import AppLayout from '../../components/AppLayout';

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [targetCompanies, setTargetCompanies] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
        setName(data.name || '');
        setHeadline(data.profile?.headline || 'Software Engineer');
        setLocation(data.profile?.location || 'Remote');
        setExperienceLevel(data.profile?.experienceLevel || 'Fresher');
        setInstitution(data.profile?.education?.[0]?.institution || '');
        setDegree(data.profile?.education?.[0]?.degree || '');
        setTechnicalSkills(data.profile?.technicalSkills || ['React', 'Node.js', 'MongoDB']);
        setTargetCompanies(data.profile?.targetCompanies || ['Amazon', 'Google']);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        name,
        profile: {
          headline,
          location,
          experienceLevel,
          education: [{ institution, degree }],
          technicalSkills,
          targetCompanies,
        }
      };

      const { data } = await api.put('/auth/profile', payload);
      setUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-accent/30 text-brand-accent text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Profile Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Candidate Profile & Skills</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Manage your background, target companies, and verified competencies.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-system-success/15 border border-system-success/30 flex items-center gap-2 text-xs text-system-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile settings successfully saved.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-brand-accent" />
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Email (Account)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-background-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-xs text-content-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand-purple" />
              Education & Experience Level
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Experience Tier</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
                >
                  <option>Student</option>
                  <option>Fresher</option>
                  <option>1-3 Years</option>
                  <option>3-5 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

