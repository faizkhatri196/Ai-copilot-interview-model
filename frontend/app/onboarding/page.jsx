'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  GraduationCap,
  Briefcase,
  Cpu,
  Code2,
  Building2,
  Target,
  Languages,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User, desc: 'Contact info & location' },
  { id: 2, title: 'Education', icon: GraduationCap, desc: 'University & field of study' },
  { id: 3, title: 'Experience Level', icon: Briefcase, desc: 'Current career seniority' },
  { id: 4, title: 'Technical Skills', icon: Cpu, desc: 'Frameworks, DBs, and tools' },
  { id: 5, title: 'Programming Languages', icon: Code2, desc: 'Languages you code in' },
  { id: 6, title: 'Target Companies', icon: Building2, desc: 'Top tier dream companies' },
  { id: 7, title: 'Target Positions', icon: Target, desc: 'Specific roles to prepare for' },
  { id: 8, title: 'Interview Language', icon: Languages, desc: 'Voice & text preference' },
  { id: 9, title: 'Preparation Goals', icon: CheckCircle2, desc: 'Weekly target & milestones' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    headline: 'Software Engineer',
    location: 'Bangalore / Remote',
    phone: '',
    institution: 'National Institute of Technology',
    degree: 'B.Tech in Computer Science',
    graduationYear: 2026,
    experienceLevel: 'Fresher',
    technicalSkills: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Git'],
    programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
    targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Uber'],
    targetPositions: ['SDE 1', 'Frontend Developer', 'Full Stack Developer'],
    preferredLanguage: 'English',
    weeklyTargetHours: 12,
    preparationGoals: ['Crack Amazon SDE 1', 'Master Dynamic Programming & Graphs', 'Ace System Design rounds'],
  });

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const payload = {
        onboardingCompleted: true,
        onboardingStep: 9,
        profile: {
          headline: formData.headline,
          location: formData.location,
          phone: formData.phone,
          experienceLevel: formData.experienceLevel,
          education: [{
            institution: formData.institution,
            degree: formData.degree,
            graduationYear: Number(formData.graduationYear),
          }],
          technicalSkills: formData.technicalSkills,
          programmingLanguages: formData.programmingLanguages,
          targetCompanies: formData.targetCompanies,
          targetPositions: formData.targetPositions,
          preferredLanguage: formData.preferredLanguage,
          weeklyTargetHours: Number(formData.weeklyTargetHours),
          preparationGoals: formData.preparationGoals,
        }
      };

      await api.put('/auth/profile', payload);

      // Update local storage user info
      const local = localStorage.getItem('userInfo');
      if (local) {
        const parsed = JSON.parse(local);
        parsed.onboardingCompleted = true;
        localStorage.setItem('userInfo', JSON.stringify(parsed));
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      // Still forward to dashboard if local session is valid
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (key, item) => {
    setFormData(prev => {
      const exists = prev[key].includes(item);
      return {
        ...prev,
        [key]: exists ? prev[key].filter(i => i !== item) : [...prev[key], item]
      };
    });
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-brand-purple selection:text-white">
      <div className="w-full max-w-3xl bg-brand-card border border-border rounded-3xl p-6 sm:p-10 shadow-modal-glow relative">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-border/40">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-accent">
              Step {currentStep} of 9
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {STEPS[currentStep - 1].title}
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">
              {STEPS[currentStep - 1].desc}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-sidebar flex items-center justify-center shadow-card-glow">
            {React.createElement(STEPS[currentStep - 1].icon, { className: 'h-6 w-6 text-white' })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-background-secondary h-2 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-purple-gradient h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          />
        </div>

        {/* Dynamic Step Content */}
        <div className="min-h-[280px]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Professional Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                  placeholder="e.g. Senior Frontend Engineer / CS Undergraduate"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                  placeholder="e.g. San Francisco / Bangalore / Remote"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">Institution / University</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-2">Degree & Major</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-2">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Student', 'Fresher', '1-3 Years', '3-5 Years', '5+ Years'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    formData.experienceLevel === lvl
                      ? 'bg-brand-purple/30 border-brand-accent text-white shadow-card-glow'
                      : 'bg-background-secondary border-border text-content-secondary hover:text-white'
                  }`}
                >
                  <p className="font-bold text-base text-white">{lvl}</p>
                  <p className="text-xs text-content-secondary mt-1">Calibrated interview standards for this tier</p>
                </button>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <p className="text-xs text-content-secondary mb-4">Select all technologies you are proficient with:</p>
              <div className="flex flex-wrap gap-2.5">
                {['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Spring Boot', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'Kafka'].map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleArrayItem('technicalSkills', tech)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      formData.technicalSkills.includes(tech)
                        ? 'bg-brand-purple text-white border-brand-accent shadow-card-glow'
                        : 'bg-background-secondary text-content-secondary border-border hover:border-white/40'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <p className="text-xs text-content-secondary mb-4">Select the primary languages you use in coding assessments:</p>
              <div className="flex flex-wrap gap-2.5">
                {['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Golang', 'Rust', 'C#', 'SQL'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleArrayItem('programmingLanguages', lang)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      formData.programmingLanguages.includes(lang)
                        ? 'bg-sidebar text-white border-brand-accent shadow-card-glow'
                        : 'bg-background-secondary text-content-secondary border-border hover:border-white/40'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <p className="text-xs text-content-secondary mb-4">Choose your priority target organizations:</p>
              <div className="flex flex-wrap gap-2.5">
                {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Salesforce', 'Atlassian', 'Adobe', 'Oracle', 'NVIDIA', 'Stripe', 'Flipkart'].map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleArrayItem('targetCompanies', comp)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      formData.targetCompanies.includes(comp)
                        ? 'bg-brand-purple text-white border-brand-accent shadow-card-glow'
                        : 'bg-background-secondary text-content-secondary border-border hover:border-white/40'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div>
              <p className="text-xs text-content-secondary mb-4">Target engineering roles:</p>
              <div className="flex flex-wrap gap-2.5">
                {['SDE Intern', 'SDE 1', 'SDE 2', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI Engineer', 'DevOps Engineer'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => toggleArrayItem('targetPositions', pos)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      formData.targetPositions.includes(pos)
                        ? 'bg-sidebar text-white border-brand-accent shadow-card-glow'
                        : 'bg-background-secondary text-content-secondary border-border hover:border-white/40'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-4">
              <p className="text-xs text-content-secondary">Choose your preferred interview speech language:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['English (US / UK / Global)', 'Spanish', 'German', 'French', 'Hindi'].map((lng) => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredLanguage: lng })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      formData.preferredLanguage === lng
                        ? 'bg-brand-purple/30 border-brand-accent text-white shadow-card-glow'
                        : 'bg-background-secondary border-border text-content-secondary hover:text-white'
                    }`}
                  >
                    <p className="font-bold text-sm text-white">{lng}</p>
                    <p className="text-[11px] text-content-secondary mt-1">Audio synthesis & transcript speech locale</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">
                  Target Preparation Hours per Week: {formData.weeklyTargetHours} hrs
                </label>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={formData.weeklyTargetHours}
                  onChange={(e) => setFormData({ ...formData, weeklyTargetHours: Number(e.target.value) })}
                  className="w-full accent-brand-purple cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-2 mt-4">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Your Personalized AI Strategy Summary:</p>
                <ul className="text-xs text-content-secondary space-y-1">
                  <li>• Target Companies: {formData.targetCompanies.join(', ')}</li>
                  <li>• Target Roles: {formData.targetPositions.join(', ')}</li>
                  <li>• Seniority Calibration: {formData.experienceLevel}</li>
                  <li>• Core Stack: {formData.technicalSkills.slice(0, 5).join(', ')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-border/40">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-content-secondary hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 transition-all"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentStep === 9 ? (
              <>
                <span>Complete & Launch Dashboard</span>
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

