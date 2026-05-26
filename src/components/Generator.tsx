import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import {
  Sparkles,
  ArrowLeft,
  Settings,
  HelpCircle,
  Clock,
  Layers,
  MonitorPlay,
  Palette,
  CheckCircle,
  FileText,
  Users
} from 'lucide-react';

interface GeneratorProps {
  onNavigate: (view: 'login' | 'register' | 'dashboard' | 'generator' | 'editor', id?: string | null) => void;
  onSuccess: (id: string) => void;
}

const TEMPLATE_PRESETS = [
  { id: 'auto', name: 'Smart Match', desc: 'Auto-detect from prompt keywords', bg: '#F1F5F9', border: 'border-slate-300' },
  { id: 'business', name: 'Business Strategy', desc: 'Deep Navy & Accent Gold', bg: '#0B3C5D', accent: '#D9B310', textColor: 'text-white' },
  { id: 'technology', name: 'Tech & Silicon', desc: 'Space Indigo & Cyber Teal', bg: '#0B0F19', accent: '#10B981', textColor: 'text-white' },
  { id: 'education', name: 'Academic Mind', desc: 'Forest Green & Soft Mint', bg: '#1B3B32', accent: '#82C1A6', textColor: 'text-white' },
  { id: 'healthcare', name: 'Medical Clinic', desc: 'Lagoon Teal & Clean Mint', bg: '#0D9488', accent: '#34D399', textColor: 'text-white' },
  { id: 'marketing', name: 'Brand Campaign', desc: 'Vivid Crimson & Sunkissed Gold', bg: '#DC2626', accent: '#F59E0B', textColor: 'text-white' },
  { id: 'finance', name: 'Investor Pitch', desc: 'Obsidian Velvet & Amber Glow', bg: '#111827', accent: '#F59E0B', textColor: 'text-white' },
  { id: 'creative', name: 'Design Portfolio', desc: 'Royal Amethyst & Hot Magenta', bg: '#7C3AED', accent: '#F43F5E', textColor: 'text-white' },
  { id: 'general', name: 'Minimal Slate', desc: 'Slate Dust & Ice Blue', bg: '#1E293B', accent: '#06B6D4', textColor: 'text-white' },
  { id: 'cosmic', name: 'Cosmic Space', desc: 'Deep Space Violet & Pulse Fuchsia', bg: '#090915', accent: '#8B5CF6', textColor: 'text-white' },
  { id: 'editorial', name: 'Editorial Serif', desc: 'Warm Sand, Sage & Copper', bg: '#FBF9F4', accent: '#B45309', textColor: 'text-slate-800' },
  { id: 'brutalist', name: 'Swiss Brutalist', desc: 'Stark Contrast Neo-Swiss Orange', bg: '#000000', accent: '#FF5A00', textColor: 'text-white' },
  { id: 'charcoal', name: 'Charcoal Bronze', desc: 'Matte Slate with Soft Bronze', bg: '#1A1D20', accent: '#CD7F32', textColor: 'text-white' },
  { id: 'forest', name: 'Forest Glow', desc: 'Enchanted Forest & Honey Glow', bg: '#061C15', accent: '#F59E0B', textColor: 'text-white' }
];

export function Generator({ onNavigate, onSuccess }: GeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [extraData, setExtraData] = useState('');
  const [numSlides, setNumSlides] = useState(6);
  const [templateCategory, setTemplateCategory] = useState('auto');
  const [stylePreference, setStylePreference] = useState('professional');
  const [audienceType, setAudienceType] = useState('general');
  const [includeAgenda, setIncludeAgenda] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Informative loading step sequencer
  useEffect(() => {
    if (!loading) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, [loading]);

  const getStepText = () => {
    switch (step) {
      case 0: return "Analyzing slide metrics and topic concepts...";
      case 1: return "Matching keyword categories to responsive design presets...";
      case 2: return "Employing Gemini model to draft content, slide titles, subtitles, and informative bullet blocks...";
      case 3: return "Formatting presentation architecture and applying color hex alignments...";
      case 4: return "Finalizing slide structure in SQLite server layer. redirecting to editor...";
      default: return "Synthesizing AI Presentational Deck...";
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please outline a presentation topic prompt");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await request('/api/presentations/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: prompt.trim(),
          extraData: extraData.trim() || undefined,
          numSlides,
          templateCategory,
          stylePreference,
          audienceType,
          includeAgenda,
          includeSummary
        })
      });

      onSuccess(data.id);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Synthesizer failed to organize slide contents. Please review keyword density and try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Back to dashboard */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition flex items-center gap-1.5 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>

      {loading ? (
        <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800 rounded-3xl p-12 shadow-xl text-center select-none py-20 max-w-xl mx-auto mt-8 animate-pulse">
          <div className="relative inline-block mb-8">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <Sparkles className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-200">Compiling Presentation Outline...</h2>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-6 mb-4 max-w-sm mx-auto">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-[2000ms]" 
              style={{ width: `${(step + 1) * 20}%` }}
            />
          </div>
          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-widest block mb-2">Step {step + 1} of 5</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed h-12">
            {getStepText()}
          </p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-8">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
            <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-indigo-500 shrink-0" />
              <span>AI Presentational Synthesizer</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
              Formulate real, structured PowerPoint presentations directly based on your descriptive sentences, transcripts, or notes.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-start gap-2 max-w-2xl">
              <HelpCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Prompt Input */}
          <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-450 shrink-0" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Concept Proposal</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-widest block font-sans">
                Presentation Topic or Goal Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'A 10-slide quarterly financial strategy review for medical clinics highlighting revenue splits, staff structures, and technical telehealth transitions...'"
                rows={4}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0f1524] rounded-xl text-sm outline-none transition resize-none leading-relaxed"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-widest block font-sans">
                Supporting Transcripts, Data or Statistics (Optional)
              </label>
              <textarea
                value={extraData}
                onChange={(e) => setExtraData(e.target.value)}
                placeholder="Paste supporting content, speaker notes, custom transcripts, or numerical statistics you wish the Gemini architect model to integrate inside individual bullet lists."
                rows={4}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0f1524] rounded-xl text-sm outline-none transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Choose Template Group */}
          <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <Palette className="h-5 w-5 text-indigo-500 dark:text-indigo-450 shrink-0" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Design Style Preset</h3>
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-455 uppercase tracking-widest block">
              Colors & Accent Presets Switcher
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATE_PRESETS.map((t) => {
                const isSelected = templateCategory === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateCategory(t.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 relative overflow-hidden group select-none ${
                      isSelected 
                        ? 'border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/20 transform -translate-y-0.5' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    {/* Tiny Color Swatch preview right side */}
                    {t.id !== 'auto' && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                        <span className="w-3.5 h-3.5 rounded-full border border-white inline-block" style={{ backgroundColor: t.bg }} />
                        {t.accent && <span className="w-3.5 h-3.5 rounded-full border border-white inline-block" style={{ backgroundColor: t.accent }} />}
                      </div>
                    )}

                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase block z-10">{t.name}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block leading-relaxed z-10 max-w-[85%]">{t.desc}</span>

                    {/* Left vertical border swatch indicator for chosen */}
                    <span 
                      className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${
                        isSelected ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Fine Tune Settings */}
          <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
              <Settings className="h-5 w-5 text-indigo-500 dark:text-indigo-455 shrink-0" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Presentational Layout Parameters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Slides Range slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center select-none">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-widest block font-sans">
                    Scope Slide count
                  </label>
                  <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full font-mono">{numSlides} slides</span>
                </div>
                <div className="pt-2 pb-1">
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={numSlides}
                    onChange={(e) => setNumSlides(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">Optimized between 3 and 12 slides to retain deep content quality metrics.</p>
              </div>

              {/* Style tone Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-widest block font-sans">
                  Slide copywriting Style
                </label>
                <select
                  value={stylePreference}
                  onChange={(e) => setStylePreference(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-150 rounded-xl text-xs outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-[#0f1524] transition"
                >
                  <option value="professional">Professional / Corporate</option>
                  <option value="academic">Academic / Insightful</option>
                  <option value="creative">Creative / Visionary</option>
                  <option value="minimalist">Minimalist / Direct</option>
                </select>
              </div>

              {/* Target audience selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-widest block font-sans">
                  Target Audience Profile
                </label>
                <select
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-150 rounded-xl text-xs outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-[#0f1524] transition"
                >
                  <option value="general">General Public</option>
                  <option value="executives">Executive Board Members</option>
                  <option value="investors">Investors & Shareholders</option>
                  <option value="students">Students & Researchers</option>
                </select>
              </div>

            </div>

            {/* Inclusions Toggle Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-5">
              
              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none">
                <input
                  type="checkbox"
                  checked={includeAgenda}
                  onChange={(e) => setIncludeAgenda(e.target.checked)}
                  className="mt-1 accent-indigo-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Inject Agenda Slide</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Appends a structured outline slide after the main title layout.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="mt-1 accent-indigo-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Inject Conclusion Slide</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Appends an actionable summary/takeaway slide at the end.</span>
                </div>
              </label>

            </div>
          </div>

          {/* Form Action Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 dark:shadow-indigo-600/15 cursor-pointer transition transform active:scale-[0.98]"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span>Compile Widescreen Slide Deck</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
