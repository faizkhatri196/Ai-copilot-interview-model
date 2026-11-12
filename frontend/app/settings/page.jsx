'use client';

import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, Volume2, Save, CheckCircle2 } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function SettingsPage() {
  const [personality, setPersonality] = useState('Professional');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Settings</h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Configure default interviewer behavior, speech synthesis speed, and theme preferences.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-2xl bg-system-success/15 border border-system-success/30 flex items-center gap-2 text-xs text-system-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings successfully updated.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-accent" />
              Interviewer Persona Calibration
            </h2>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-2">
                Default Interviewer Persona
              </label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                <option>Professional</option>
                <option>Senior Engineer</option>
                <option>Strict Bar Raiser</option>
                <option>Friendly & Supportive</option>
                <option>Behavioral Cultural Lead</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-brand-card border border-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-system-warning" />
              Voice-to-Voice Speech Engine
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-2">
                  Speech Rate: {voiceSpeed}x
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full accent-brand-purple cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-background-secondary border border-border/60">
                <div>
                  <p className="text-xs font-bold text-white">Auto-Speak AI Responses</p>
                  <p className="text-[11px] text-content-secondary">Automatically synthesize audio when new interview questions arrive</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-purple-gradient text-white text-xs font-bold shadow-card-glow hover:opacity-95 flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

