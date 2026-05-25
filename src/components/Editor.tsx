import React, { useState, useEffect } from 'react';
import { Presentation, Slide } from '../types';
import { AUTH_TOKEN_KEY, request } from '../utils/api';
import { useToast } from './Toast';
import {
  Save,
  Download,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Palette,
  FileDown,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  XCircle,
  Type as FontIcon,
  MonitorPlay,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Columns,
  Grid,
  Upload
} from 'lucide-react';

interface EditorProps {
  presentationId: string;
  onNavigate: (view: 'login' | 'register' | 'dashboard' | 'generator' | 'editor', id?: string | null) => void;
  darkMode?: boolean;
  setDarkMode?: (dark: boolean) => void;
}

const EXPERT_THEMES: Record<string, {
  name: string;
  bgBgClass: string;
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    heading: string;
    muted: string;
  };
  fontTitle: string;
  fontBody: string;
}> = {
  business: {
    name: 'Business Strategy',
    bgBgClass: 'from-blue-50 to-indigo-50',
    colors: { bg: '#FFFFFF', primary: '#0B3C5D', secondary: '#328CC1', accent: '#D9B310', text: '#1D2731', heading: '#0B3C5D', muted: '#666666' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  technology: {
    name: 'Tech & Silicon',
    bgBgClass: 'from-slate-900 to-indigo-950',
    colors: { bg: '#0B0F19', primary: '#6366F1', secondary: '#4F46E5', accent: '#10B981', text: '#9CA3AF', heading: '#FFFFFF', muted: '#4B5563' },
    fontTitle: 'JetBrains Mono',
    fontBody: 'Inter'
  },
  education: {
    name: 'Academic Mind',
    bgBgClass: 'from-emerald-50 to-teal-50',
    colors: { bg: '#F4F7F6', primary: '#1B3B32', secondary: '#3D8B7A', accent: '#82C1A6', text: '#2E3B36', heading: '#1B3B32', muted: '#718982' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  healthcare: {
    name: 'Medical Clinic',
    bgBgClass: 'from-teal-50 to-cyan-50',
    colors: { bg: '#F0FDF4', primary: '#0D9488', secondary: '#0F766E', accent: '#34D399', text: '#1F2937', heading: '#111827', muted: '#6B7280' },
    fontTitle: 'Inter',
    fontBody: 'Inter'
  },
  marketing: {
    name: 'Brand Campaign',
    bgBgClass: 'from-red-50 to-amber-50',
    colors: { bg: '#FFFBEB', primary: '#DC2626', secondary: '#F59E0B', accent: '#EF4444', text: '#1F2937', heading: '#111827', muted: '#6B7280' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  finance: {
    name: 'Investor Pitch',
    bgBgClass: 'from-gray-900 to-slate-950',
    colors: { bg: '#111827', primary: '#F59E0B', secondary: '#D97706', accent: '#10B981', text: '#D1D5DB', heading: '#F9FAFB', muted: '#9CA3AF' },
    fontTitle: 'Inter',
    fontBody: 'Inter'
  },
  creative: {
    name: 'Design Portfolio',
    bgBgClass: 'from-purple-50 to-pink-50',
    colors: { bg: '#FAF5FF', primary: '#7C3AED', secondary: '#EC4899', accent: '#F43F5E', text: '#374151', heading: '#111827', muted: '#6B7280' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  general: {
    name: 'Minimal Clean',
    bgBgClass: 'from-slate-50 to-slate-100',
    colors: { bg: '#F8FAFC', primary: '#1E293B', secondary: '#3B82F6', accent: '#06B6D4', text: '#334155', heading: '#0F172A', muted: '#64748B' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  cosmic: {
    name: 'Cosmic Space',
    bgBgClass: 'from-[#0b0b1c] to-[#15152f]',
    colors: { bg: '#090915', primary: '#8B5CF6', secondary: '#D946EF', accent: '#EC4899', text: '#94A3B8', heading: '#FFFFFF', muted: '#475569' },
    fontTitle: 'Outfit',
    fontBody: 'Inter'
  },
  editorial: {
    name: 'Editorial Serif',
    bgBgClass: 'from-amber-50/40 to-emerald-50/25',
    colors: { bg: '#FBF9F4', primary: '#B45309', secondary: '#0F5132', accent: '#78350F', text: '#2D2D2D', heading: '#0F5132', muted: '#5D5D5D' },
    fontTitle: 'Playfair Display',
    fontBody: 'Lora'
  },
  brutalist: {
    name: 'Swiss Brutalist',
    bgBgClass: 'from-neutral-900 to-black',
    colors: { bg: '#000000', primary: '#FF5A00', secondary: '#E2E8F0', accent: '#FF5A00', text: '#CBD5E1', heading: '#FFFFFF', muted: '#94A3B8' },
    fontTitle: 'JetBrains Mono',
    fontBody: 'JetBrains Mono'
  },
  charcoal: {
    name: 'Charcoal Bronze',
    bgBgClass: 'from-slate-800 to-slate-950',
    colors: { bg: '#1A1D20', primary: '#CD7F32', secondary: '#A3704C', accent: '#CD7F32', text: '#D1D5DB', heading: '#FFFFFF', muted: '#8E959E' },
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  forest: {
    name: 'Forest Glow',
    bgBgClass: 'from-emerald-950/80 to-teal-950/90',
    colors: { bg: '#061C15', primary: '#10B981', secondary: '#F59E0B', accent: '#F59E0B', text: '#A7F3D0', heading: '#FFFFFF', muted: '#047857' },
    fontTitle: 'Outfit',
    fontBody: 'Inter'
  },
  neon: {
    name: 'Neon Cyberpunk',
    bgBgClass: 'from-[#05050C] to-[#140b20]',
    colors: { bg: '#05050C', primary: '#FB7185', secondary: '#38BDF8', accent: '#FB7185', text: '#94A3B8', heading: '#FFFFFF', muted: '#475569' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  sunset: {
    name: 'Warm Sunset',
    bgBgClass: 'from-amber-50 to-[#fcf5e9]',
    colors: { bg: '#FDFBF7', primary: '#9C4221', secondary: '#D9A752', accent: '#D9A752', text: '#4E3629', heading: '#9C4221', muted: '#8C7365' },
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  sand: {
    name: 'Sage Garden',
    bgBgClass: 'from-emerald-50/20 to-stone-100',
    colors: { bg: '#F4F6F4', primary: '#2C3E35', secondary: '#6B8E7D', accent: '#C06C5C', text: '#384A41', heading: '#2C3E35', muted: '#7B8C83' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  royal: {
    name: 'Royal Gold',
    bgBgClass: 'from-indigo-950 to-[#0c1a30]',
    colors: { bg: '#0B132B', primary: '#E0A96D', secondary: '#3A506B', accent: '#E0A96D', text: '#B0C4DE', heading: '#FFFFFF', muted: '#5C6B73' },
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  nord: {
    name: 'Nordic Frost',
    bgBgClass: 'from-slate-100 to-indigo-50/40',
    colors: { bg: '#ECEFF4', primary: '#2E3440', secondary: '#4C566A', accent: '#88C0D0', text: '#3B4252', heading: '#2E3440', muted: '#4C566A' },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  ocean: {
    name: 'Pacific Blue',
    bgBgClass: 'from-blue-50 to-emerald-50/10',
    colors: { bg: '#F0F8FF', primary: '#1E3A8A', secondary: '#3B82F6', accent: '#34D399', text: '#1E293B', heading: '#0F172A', muted: '#64748B' },
    fontTitle: 'Outfit',
    fontBody: 'Inter'
  }
};

export function Editor({ presentationId, onNavigate, darkMode, setDarkMode }: EditorProps) {
  const [deck, setDeck] = useState<Presentation | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const { showToast } = useToast();



  // Helper to dynamically calculate bullet size and padding to prevent scrolling
  const getDynamicBulletConfig = () => {
    const activeSld = deck?.slideData?.[activeSlideIndex];
    if (!activeSld || !activeSld.bullets) return { fontSize: '13px', spacing: 'space-y-3' };
    const count = activeSld.bullets.length;
    const totalChars = activeSld.bullets.reduce((acc, b) => acc + (b || '').length, 0);

    if (count <= 2 && totalChars < 120) {
      return { fontSize: '15px', spacing: 'space-y-4' };
    }
    if (count <= 3 && totalChars < 250) {
      return { fontSize: '13px', spacing: 'space-y-3' };
    }
    if (count <= 5 && totalChars < 450) {
      return { fontSize: '11px', spacing: 'space-y-2' };
    }
    return { fontSize: '9.5px', spacing: 'space-y-1' };
  };

  const bulletConfig = getDynamicBulletConfig();

  // Dynamically load Google Fonts on the fly based on title/body font faces
  useEffect(() => {
    if (!deck) return;
    const loadFont = (fontName: string) => {
      if (!fontName) return;
      const linkId = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
      if (document.getElementById(linkId)) return;

      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    };

    loadFont(deck.fontTitle);
    loadFont(deck.fontBody);
  }, [deck?.fontTitle, deck?.fontBody]);

  // Listen for navigation keys inside presentation mode
  useEffect(() => {
    if (!isPresenting || !deck) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveSlideIndex(prev => Math.min(deck.slideData.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, deck]);

  // Synchronizers
  const loadDeck = async () => {
    try {
      setLoading(true);
      const data = await request(`/api/presentations/${presentationId}`);
      setDeck(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load requested AI slideshow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (presentationId) {
      loadDeck();
    }
  }, [presentationId]);

  if (loading) {
    return (
      <div className="py-24 text-center select-none">
        <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Compiling editable slide blocks...</p>
      </div>
    );
  }

  if (errorMessage || !deck) {
    return (
      <div className="max-w-md mx-auto py-16 text-center select-none font-sans">
        <HelpCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-md font-bold text-slate-800">Problem accessing presentation</h2>
        <p className="text-sm text-slate-500 mt-2">{errorMessage || "Outline is not available."}</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-6 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const activeSlide = deck.slideData[activeSlideIndex];

  // Action methods
  const handleThemeChange = (themeKey: string) => {
    const preset = EXPERT_THEMES[themeKey];
    if (!preset) return;

    setDeck(prev => {
      if (!prev) return null;
      return {
        ...prev,
        theme: themeKey,
        colors: preset.colors,
        fontTitle: preset.fontTitle,
        fontBody: preset.fontBody
      };
    });
  };

  const handleUpdateSlideField = (field: keyof Slide, value: any) => {
    setDeck(prev => {
      if (!prev) return null;
      const slides = [...prev.slideData];
      slides[activeSlideIndex] = {
        ...slides[activeSlideIndex],
        [field]: value
      };
      return { ...prev, slideData: slides };
    });
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const currentImages = [...(activeSlide?.images || [])];
      currentImages[index] = base64;
      handleUpdateSlideField('images', currentImages);
      // Also update standard single fallback image for backward compatibility
      if (index === 0) {
        handleUpdateSlideField('image', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = [...(activeSlide?.images || [])];
    currentImages[index] = "";
    handleUpdateSlideField('images', currentImages);
    if (index === 0) {
      handleUpdateSlideField('image', "");
    }
  };

  const handleUpdateBullet = (bulletIndex: number, text: string) => {
    const currentBullets = [...(activeSlide?.bullets || [])];
    currentBullets[bulletIndex] = text;
    handleUpdateSlideField('bullets', currentBullets);
  };

  const handleAddBullet = () => {
    const currentBullets = [...(activeSlide?.bullets || [])];
    if (currentBullets.length >= 6) {
      alert("We advise a maximum of 6 bullets per slide to guarantee PPTX text scaling is clean.");
      return;
    }
    currentBullets.push("New informative takeaway bullet point.");
    handleUpdateSlideField('bullets', currentBullets);
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    const currentBullets = (activeSlide?.bullets || []).filter((_, idx) => idx !== bulletIndex);
    handleUpdateSlideField('bullets', currentBullets);
  };

  // Reorder methods
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!deck) return;
    const slides = [...deck.slideData];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= slides.length) return;

    // Swap
    const temp = slides[index];
    slides[index] = slides[targetIndex];
    slides[targetIndex] = temp;

    setDeck({ ...deck, slideData: slides });
    setActiveSlideIndex(targetIndex);
  };

  const handleAddSlide = () => {
    if (!deck) return;
    const newSlide: Slide = {
      id: `slide_added_${Date.now()}`,
      type: 'content',
      title: 'New Slides Title',
      subtitle: 'Optional supporting line',
      bullets: ['Insightful takeaway points', 'Additional analytical content']
    };

    setDeck({
      ...deck,
      slideData: [...deck.slideData, newSlide]
    });
    // Set active index to last items
    setActiveSlideIndex(deck.slideData.length);
  };

  const handleDeleteSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deck) return;
    if (deck.slideData.length <= 1) {
      alert("A presentation requires at least 1 slide!");
      return;
    }

    if (!confirm("Are you sure you want to delete this slide from the deck?")) {
      return;
    }

    const modified = deck.slideData.filter((_, idx) => idx !== index);
    setDeck({ ...deck, slideData: modified });
    setActiveSlideIndex(prev => Math.max(0, Math.min(modified.length - 1, prev)));
  };

  const handleSaveDeck = async () => {
    if (!deck) return;
    setSaveStatus('saving');

    try {
      await request(`/api/presentations/${deck.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: deck.title,
          slideData: deck.slideData,
          theme: deck.theme,
          colors: deck.colors,
          fontTitle: deck.fontTitle,
          fontBody: deck.fontBody,
          hideFooter: deck.hideFooter
        })
      });

      setSaveStatus('saved');
      showToast(`Widescreen presentation "${deck.title}" saved successfully!`, 'save', 'Changes Saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err.message || 'Failed to sync with presentation server storage.', 'error', 'Save Failed');
    }
  };

  const handleDownloadDeck = async () => {
    if (!deck) return;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      showToast("Authentication token expired. Please reload details page.", 'error', 'Security Expired');
      return;
    }

    try {
      setDownloading(true);
      // Auto save first to ensure download matches current live state
      await request(`/api/presentations/${deck.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: deck.title,
          slideData: deck.slideData,
          theme: deck.theme,
          colors: deck.colors,
          fontTitle: deck.fontTitle,
          fontBody: deck.fontBody,
          hideFooter: deck.hideFooter
        })
      });

      // Stream PPTX
      window.location.href = `/api/presentations/${deck.id}/download?token=${encodeURIComponent(token)}`;
      showToast(`Export initiated! Compiling a highly-polished, content-dense widescreen PowerPoint presentation.`, 'export', 'Export Started');
    } catch (err) {
      showToast("Failed to compile or output PPTX file on backend server.", 'error', 'Export Failed');
    } finally {
      setTimeout(() => setDownloading(false), 3000);
    }
  };

  // Preview styling setups
  const activePreset = EXPERT_THEMES[deck.theme] || EXPERT_THEMES.general;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Dynamic Top bar */}
      <header className="bg-slate-950 text-white h-14 shrink-0 flex items-center justify-between px-6 z-10 shadow-md select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          
          <div className="h-4.5 w-px bg-slate-800" />

          {/* Quick title editing inside header bar directly */}
          <input
            type="text"
            value={deck.title}
            onChange={(e) => setDeck({ ...deck, title: e.target.value })}
            className="bg-transparent text-white font-bold text-sm tracking-tight border-b border-transparent focus:border-indigo-500 py-0.5 px-1 outline-none font-display max-w-sm"
          />
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-3">
          
          {saveStatus === 'saved' && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>All changes saved</span>
            </span>
          )}

          <button
            onClick={() => setIsPresenting(true)}
            className="bg-indigo-650 hover:bg-indigo-700 hover:text-white text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border border-indigo-500 transition shadow-sm hover:shadow active:scale-95"
          >
            <MonitorPlay className="h-3.5 w-3.5 text-indigo-200" />
            <span>Present (Slideshow)</span>
          </button>

          <button
            onClick={handleSaveDeck}
            disabled={saveStatus === 'saving'}
            className="bg-slate-800 hover:bg-slate-700 hover:text-white disabled:opacity-50 text-slate-300 font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saveStatus === 'saving' ? 'Saving Outline...' : 'Save Changes'}</span>
          </button>

          <button
            onClick={handleDownloadDeck}
            disabled={downloading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? 'Compiling PPTX...' : 'Download PPTX'}</span>
          </button>



          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer transition flex items-center justify-center shrink-0"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          )}

        </div>
      </header>

      {/* Editor Main Content Panelled Structure Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL LEVEL 1: LEFT SIDEBAR (Thumbnails overview) */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-slate-800 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
            Slide Layout Array ({deck.slideData.length})
          </div>

          {/* Vertical scrollbar cards list */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {deck.slideData.map((item, idx) => {
              const themeColors = deck.colors;
              const isActive = idx === activeSlideIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`border rounded-xl p-3 cursor-pointer transition relative overflow-hidden group select-none ${
                    isActive 
                      ? 'border-indigo-500 bg-slate-800/80 ring-2 ring-indigo-500/20' 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">SLIDE {idx + 1}</span>
                    <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-white inline-block scale-90" style={{ backgroundColor: themeColors.primary }}>
                      {item.type}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 truncate font-display">{item.title || "Untitled slide"}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{item.bullets?.length || 0} Key points listed.</p>

                  {/* Thumbnail control buttons */}
                  <div className="absolute right-2 bottom-1.5 hidden group-hover:flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-md z-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'up'); }}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'down'); }}
                      disabled={idx === deck.slideData.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSlide(idx, e)}
                      className="p-1 text-red-500 hover:text-red-400 cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Float Add Slides widget */}
            <button
              onClick={handleAddSlide}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 rounded-xl border border-dashed border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition font-sans"
            >
              <Plus className="h-4 w-4" />
              <span>Add blank slide</span>
            </button>
          </div>
        </aside>

        {/* PANEL LEVEL 2: CENTER (Live Canvas and Editing forms) */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Active Worksite Area */}
          <div className="p-8 flex-1 flex flex-col items-center justify-start max-w-4xl mx-auto w-full space-y-6">
            
            <div className="flex justify-between items-center w-full select-none">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Active Worksite</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-semibold text-slate-600 capitalize">{deck.theme} template preview</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full uppercase">
                Slide layout: {activeSlide?.type}
              </span>
            </div>

            {/* THE VISUAL PRESENTATION CANVAS PREVIEW (Conforming precisely to template styling guidelines) */}
            {activeSlide ? (() => {
              const align = activeSlide.align || 'left';
              const layoutStyle = activeSlide.layoutStyle || 'default';
              const textStyle = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
              const itemsStyle = align === 'center' ? 'items-center text-center justify-center' : align === 'right' ? 'items-end text-right justify-end' : 'items-start text-left';
              const marginStyle = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';
              
              return (
                <div
                  className={`w-full aspect-[16/9] rounded-2xl shadow-xl border overflow-hidden relative flex flex-col justify-between transition-all duration-300 group ${
                    layoutStyle === 'card' 
                      ? 'border-indigo-200 shadow-2xl p-12 ring-2 ring-indigo-100/50' 
                      : layoutStyle === 'minimal'
                        ? 'border-slate-100 p-6'
                        : 'border-slate-200 p-10'
                  }`}
                  style={{
                    backgroundColor: deck.colors.bg || '#ffffff',
                    fontFamily: deck.fontBody || 'sans-serif'
                  }}
                >
                  {/* Background layout highlights depending on template rules */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                    {deck.theme === 'business' && (
                      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: deck.colors.primary }} />
                    )}
                    {deck.theme === 'technology' && (
                      <div className="absolute top-0 right-4 w-48 h-48 bg-radial from-violet-600/40 to-transparent blur-3xl" />
                    )}
                    {deck.theme === 'creative' && (
                      <div className="absolute top-10 right-10 w-24 h-24 rounded-full" style={{ backgroundColor: deck.colors.primary, opacity: 0.2 }} />
                    )}
                  </div>

                  {/* Split layout coloring band */}
                  {layoutStyle === 'split' && (
                    <div className="absolute left-0 top-0 bottom-0 w-[33%] bg-black/5 dark:bg-white/5 border-r border-slate-200/30 z-0 pointer-events-none" />
                  )}

                  {/* Outer flex container to allow centering or card formatting */}
                  <div className={`flex-1 flex flex-col min-h-0 relative z-10 w-full h-full ${
                    layoutStyle === 'card' 
                      ? 'p-5 rounded-xl border border-slate-205/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm' 
                      : ''
                  }`}>

                {/* Render Canvas logic matching exact pptx.ts styles */}
                {activeSlide.type === 'title' ? (
                  <div className="absolute inset-0 flex flex-col justify-between p-12">
                    {/* Left designer border block */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: deck.colors.primary }} />

                    <div className="mt-6 flex-1 flex flex-col justify-center">
                      <textarea
                        value={deck.title}
                        onChange={(e) => setDeck({ ...deck, title: e.target.value })}
                        className="w-full bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight rounded-xl py-1 px-1 transition duration-150 resize-none leading-snug"
                        style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                        rows={2}
                        placeholder="Click to enter presentation title..."
                        title="Presentation Title (Double click to edit on-screen)"
                      />
                      {activeSlide.title !== deck.title && (
                        <input
                          type="text"
                          value={activeSlide.title || ''}
                          onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                          className="w-full bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-xs sm:text-sm font-semibold mt-4 rounded-lg py-1 px-1 transition"
                          style={{ color: deck.colors.secondary }}
                          placeholder="Slide subtitle or sub-label (optional)..."
                          title="Slide Sub-Label (Click to edit)"
                        />
                      )}
                    </div>

                    <div className="mt-auto">
                      <input
                        type="text"
                        value={activeSlide.subtitle || ''}
                        onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
                        className="w-full bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-xs italic rounded-lg py-1 px-1 transition"
                        style={{ color: deck.colors.muted }}
                        placeholder="Presenter statement or subtitle (optional)..."
                        title="Presenter metadata (Click to edit)"
                      />
                      <p className="text-[10px] mt-2 font-semibold font-mono tracking-wide uppercase" style={{ color: deck.colors.accent }}>
                        Widescreen Presentation Deck
                      </p>
                    </div>
                  </div>
                ) : activeSlide.type === 'section' ? (
                  <div className="absolute inset-0 flex flex-col justify-center p-12 text-center" style={{ backgroundColor: deck.colors.primary }}>
                    <textarea
                      value={activeSlide.title}
                      onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                      className="w-full bg-transparent border border-dashed border-transparent hover:border-white/20 focus:border-white/50 focus:bg-white/5 outline-none text-2xl sm:text-3xl md:text-4xl font-black text-white text-center rounded-xl py-1 resize-none transition leading-normal"
                      style={{ fontFamily: deck.fontTitle }}
                      rows={2}
                      placeholder="Click to enter section name..."
                      title="Section Separation Title (Click to edit)"
                    />
                    <input
                      type="text"
                      value={activeSlide.subtitle || ''}
                      onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
                      className="w-full bg-transparent border border-dashed border-transparent hover:border-white/20 focus:border-white/50 focus:bg-white/5 outline-none text-xs sm:text-sm text-indigo-100 mt-4 text-center rounded-lg py-1 font-semibold transition"
                      placeholder="Enter section description tagline (optional)..."
                      title="Section Tagline (Click to edit)"
                    />
                  </div>
                ) : activeSlide.type === 'two-column' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <input
                      type="text"
                      value={activeSlide.title || ''}
                      onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                      className="bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-xl sm:text-2xl font-bold tracking-tight rounded-xl py-1 px-1 transition"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                      placeholder="Slide Heading..."
                    />
                    <div className="w-12 h-1 rounded mt-2 shrink-0" style={{ backgroundColor: deck.colors.accent }} />
                    
                    <div className="grid grid-cols-2 gap-6 mt-4 flex-1">
                      {/* Left Column */}
                      <div className="border-r border-slate-150 pr-4 space-y-3 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75 font-mono" style={{ color: deck.colors.secondary }}>Section Focus A</span>
                        {(activeSlide.bullets || []).slice(0, Math.max(1, Math.ceil((activeSlide.bullets || []).length / 2))).map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-2 relative">
                            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 animate-pulse" style={{ backgroundColor: deck.colors.accent }} />
                            <textarea
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                              className="flex-1 bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none font-semibold leading-relaxed rounded-xl py-0.5 pl-1 text-[11px] resize-none"
                              style={{ color: deck.colors.text }}
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3 flex flex-col justify-center pl-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75 font-mono" style={{ color: deck.colors.secondary }}>Section Focus B</span>
                        {(activeSlide.bullets || []).slice(Math.max(1, Math.ceil((activeSlide.bullets || []).length / 2))).map((bullet, idx) => {
                          const originalIdx = Math.max(1, Math.ceil((activeSlide.bullets || []).length / 2)) + idx;
                          return (
                            <div key={originalIdx} className="flex items-start gap-2 relative">
                              <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: deck.colors.secondary }} />
                              <textarea
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(originalIdx, e.target.value)}
                                className="flex-1 bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none font-semibold leading-relaxed rounded-xl py-0.5 pl-1 text-[11px] resize-none"
                                style={{ color: deck.colors.text }}
                                rows={2}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] border-t pt-3.5 mt-4 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                      <span className="font-semibold uppercase tracking-wider">Two-Column Comparison</span>
                      <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                    </div>
                  </div>
                ) : activeSlide.type === 'stat' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <input
                      type="text"
                      value={activeSlide.title || ''}
                      onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                      className="bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-xl sm:text-2xl font-bold tracking-tight rounded-xl py-1 px-1 transition"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                      placeholder="Slide Heading..."
                    />
                    
                    <div className="flex items-center gap-8 mt-6 flex-1">
                      <div className="flex flex-col items-center">
                        <textarea
                          value={activeSlide.bullets[0] || '10x'}
                          onChange={(e) => handleUpdateBullet(0, e.target.value)}
                          className="bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-4xl sm:text-5xl font-extrabold tracking-tight text-center rounded-xl py-1 resize-none overflow-hidden max-w-[160px]"
                          style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                          rows={1}
                          placeholder="84%"
                        />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest mt-1" style={{ color: deck.colors.accent }}>Performance Metric</span>
                      </div>
                      
                      <div className="flex-1 pl-6 border-l border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-center">
                        {(activeSlide.bullets || []).slice(1).map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: deck.colors.accent }} />
                            <textarea
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(idx + 1, e.target.value)}
                              className="flex-1 bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-55/15 outline-none font-semibold leading-relaxed rounded-xl text-[11px] resize-none"
                              style={{ color: deck.colors.text }}
                              rows={2}
                              placeholder="Explanation takeaway point..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] border-t pt-3.5 mt-4 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                      <span className="font-semibold uppercase tracking-wider">Metrics Spotlight</span>
                      <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                    </div>
                  </div>
                ) : activeSlide.type === 'quote' ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center px-6 relative">
                    <span className="text-4xl leading-none select-none italic text-indigo-400 block h-6 font-serif">“</span>
                    
                    <textarea
                      value={activeSlide.bullets[0] || ''}
                      onChange={(e) => handleUpdateBullet(0, e.target.value)}
                      className="w-full bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-[13px] sm:text-[14px] font-medium italic text-center rounded-xl py-1.5 leading-relaxed resize-none mt-2"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                      rows={3}
                      placeholder="Type impressive quote..."
                    />

                    <div className="mt-4 flex items-center justify-center gap-1.5">
                      <span className="text-xs" style={{ color: deck.colors.muted }}>—</span>
                      <input
                        type="text"
                        value={activeSlide.bullets[1] || ''}
                        onChange={(e) => handleUpdateBullet(1, e.target.value)}
                        className="bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-[10px] font-bold uppercase tracking-wider text-center rounded py-0.5 px-1 w-44"
                        style={{ color: deck.colors.accent }}
                        placeholder="Citation or Author name"
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] border-t pt-3.5 mt-auto w-full select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                      <span className="font-semibold uppercase tracking-wider">Key Quote Testimonial</span>
                      <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                    </div>
                  </div>
                ) : activeSlide.type === 'timeline' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <input
                      type="text"
                      value={activeSlide.title || ''}
                      onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                      className="bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-xl sm:text-2xl font-bold tracking-tight rounded-xl py-1 px-1 transition"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                      placeholder="Slide Heading..."
                    />
                    <div className="w-12 h-1 rounded mt-2 shrink-0" style={{ backgroundColor: deck.colors.accent }} />

                    <div className="grid grid-cols-3 gap-3 mt-5 flex-1 items-stretch">
                      {[(activeSlide.bullets[0] || ''), (activeSlide.bullets[1] || ''), (activeSlide.bullets[2] || '')].map((bullet, idx) => (
                        <div key={idx} className="bg-slate-50/40 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-55/40 flex flex-col justify-between transition relative">
                          <span className="text-[9px] font-bold font-mono text-indigo-500 uppercase tracking-widest block">Phase {idx + 1}</span>
                          <textarea
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                            className="flex-1 bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 outline-none font-semibold text-[11px] leading-relaxed mt-2 resize-none"
                            style={{ color: deck.colors.text }}
                            placeholder={`Type content step details for Phase ${idx + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[9px] border-t pt-3.5 mt-4 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                      <span className="font-semibold uppercase tracking-wider">Project Timeline Workflow</span>
                      <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Core standard layout slide format */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-start justify-between gap-4">
                        <input
                          type="text"
                          value={activeSlide.title || ''}
                          onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                          className="bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none text-xl sm:text-2xl font-bold tracking-tight rounded-xl py-1 px-1 flex-1 min-w-0 transition"
                          style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                          placeholder="Slide Heading..."
                          title="Slide Heading (Click to edit)"
                        />
                      </div>

                      {/* Underline bar item matching colors */}
                      <div className="w-12 h-1 rounded mt-2 shrink-0 animate-pulse" style={{ backgroundColor: deck.colors.accent }} />

                      {/* Bullet lists - Styled dynamically without scrollability */}
                      {(() => {
                        const uploadImages = activeSlide.images || [];
                        const imageCountSetting = activeSlide.imageCount !== undefined ? activeSlide.imageCount : (uploadImages.length > 0 ? uploadImages.length : (activeSlide.image ? 1 : 0));
                        
                        return (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-10 gap-6 mt-4 min-h-0">
                            {/* Text content taking up 6 columns if image present, else 10 columns */}
                            <div className={`flex flex-col justify-center min-h-0 ${imageCountSetting > 0 ? 'col-span-6' : 'col-span-10'}`}>
                              {activeSlide.bullets && activeSlide.bullets.length > 0 ? (
                                <div className={bulletConfig.spacing}>
                                  {activeSlide.bullets.map((bullet, bidx) => (
                                    <div key={bidx} className="flex items-start gap-2.5 group/bullet relative">
                                      <span 
                                        className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover/bullet:scale-125 mt-2" 
                                        style={{ 
                                          backgroundColor: deck.colors.accent,
                                          height: bulletConfig.fontSize === '9.5px' ? '5px' : '6px',
                                          width: bulletConfig.fontSize === '9.5px' ? '5px' : '6px'
                                        }} 
                                      />
                                      <textarea
                                        value={bullet}
                                        onChange={(e) => handleUpdateBullet(bidx, e.target.value)}
                                        className="flex-1 bg-transparent border border-dashed border-transparent hover:border-indigo-400 focus:border-indigo-500 focus:bg-indigo-50/10 outline-none font-semibold leading-relaxed rounded-xl py-0.5 shadow-none focus:shadow-sm"
                                        style={{ 
                                          color: deck.colors.text, 
                                          fontSize: bulletConfig.fontSize 
                                        }}
                                        rows={1}
                                        placeholder="Type interesting takeaway point..."
                                      />
                                      <div className="absolute right-1 top-0.5 hidden group-hover/bullet:flex items-center gap-1 bg-white shadow-md border border-slate-200/80 rounded-md p-0.5 z-10 transition">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveBullet(bidx)}
                                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={handleAddBullet}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200/50 hover:border-slate-300 transition cursor-pointer shadow-sm select-none"
                                  >
                                    <PlusCircle className="h-3.5 w-3.5 text-indigo-500" />
                                    <span>Add Bullet Point Inline</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                  <p className="mb-2">There are currently no bullet takeaways on this slide.</p>
                                  <button
                                    type="button"
                                    onClick={handleAddBullet}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-bold rounded-lg hover:shadow-sm"
                                  >
                                    Create Bullet Point
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Dynamic visual preview panel (taking remaining space) */}
                            {imageCountSetting > 0 && (
                              <div className="col-span-4 flex flex-col gap-3 justify-center">
                                {imageCountSetting === 1 ? (
                                  <div className="w-full h-full aspect-[4/3] rounded-xl border border-slate-200/60 shadow-sm bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group/image border-dashed">
                                    {uploadImages[0] || activeSlide.image ? (
                                      <>
                                        <img
                                          src={uploadImages[0] || activeSlide.image}
                                          alt="Visual Content"
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveImage(0)}
                                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition shadow"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <label className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-indigo-500 p-4 text-center transition">
                                        <ImageIcon className="h-6 w-6 stroke-[1.5]" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Upload device image</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            if (e.target.files?.[0]) handleImageUpload(0, e.target.files[0]);
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2 h-full justify-center">
                                    {[0, 1].map((imgIndex) => (
                                      <div key={imgIndex} className="w-full h-24 rounded-xl border border-slate-200/60 shadow-sm bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group/image border-dashed">
                                        {uploadImages[imgIndex] ? (
                                          <>
                                            <img
                                              src={uploadImages[imgIndex]}
                                              alt={`Visual ${imgIndex + 1}`}
                                              className="w-full h-full object-cover"
                                              referrerPolicy="no-referrer"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveImage(imgIndex)}
                                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition shadow"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </>
                                        ) : (
                                          <label className="flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-indigo-500 transition">
                                            <Upload className="h-4 w-4 stroke-[1.5]" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Img {imgIndex + 1}</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                if (e.target.files?.[0]) handleImageUpload(imgIndex, e.target.files[0]);
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Footer bar preview */}
                    <div className="flex justify-between items-center text-[9px] border-t pt-3.5 mt-4 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                      <span className="font-semibold uppercase tracking-wider">Presentation Slide Deck</span>
                      <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                    </div>
                  </>
                )}
                  </div>
                </div>
              );
            })() : (
              <div className="py-16 text-center text-slate-400">Select slide thumbnail to view and edit outline data arrays.</div>
            )}

            {/* FORM FIELD INPUT FOR ACTIVE SLIDE (Direct fields to customize content) */}
            {activeSlide && (
              <>
                <div className="w-full bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
                    <FontIcon className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest block font-sans dark:text-slate-200">Active Copywriter Fields</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title editor */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Slide Title</label>
                      <input
                        type="text"
                        value={activeSlide.title}
                        onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-[#0b0e17] transition font-sans"
                      />
                    </div>

                    {/* Layout selector dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Layout Format Style</label>
                      <select
                        value={activeSlide.type}
                        onChange={(e) => handleUpdateSlideField('type', e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs outline-none focus:border-indigo-400 font-semibold transition cursor-pointer"
                      >
                        <option value="content">Content Layout (Bullets list)</option>
                        <option value="two-column">Two-Column Comparison Layout</option>
                        <option value="stat">Spotlight Stat Callout Layout</option>
                        <option value="quote">Central Testimonial / Quote Layout</option>
                        <option value="timeline">Horizontal Workflow Timeline Layout</option>
                        <option value="title">First Screen Widescreen Title Layout</option>
                        <option value="agenda">Agenda Layout (Overview list)</option>
                        <option value="section">Section Separation (Full background color)</option>
                        <option value="conclusion">Takeaway Summary Layout</option>
                      </select>
                    </div>
                  </div>

                  {/* Real-time Layout Structure & Alignment Settings */}
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Alignment options */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Text/Content Real-time Alignment</label>
                      <div className="flex items-center gap-1">
                        {[
                          { val: 'left', label: 'Left Aligned', icon: AlignLeft },
                          { val: 'center', label: 'Centered Layout', icon: AlignCenter },
                          { val: 'right', label: 'Right Aligned', icon: AlignRight }
                        ].map(alignOpt => {
                          const AlignIcon = alignOpt.icon;
                          const isSel = (activeSlide.align || 'left') === alignOpt.val;
                          return (
                            <button
                              key={alignOpt.val}
                              type="button"
                              onClick={() => handleUpdateSlideField('align', alignOpt.val)}
                              className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition select-none ${
                                isSel
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400 font-bold'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                              }`}
                              title={alignOpt.label}
                            >
                              <AlignIcon className="h-3 w-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                              <span className="uppercase">{alignOpt.val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Structure Framing Style */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Layout Structural Frame Style</label>
                      <div className="flex items-center gap-1">
                        {[
                          { val: 'default', label: 'Default Structure', icon: Layers },
                          { val: 'card', label: 'Dynamic Card Box', icon: Grid },
                          { val: 'split', label: 'Executive Split-Screen', icon: Columns },
                          { val: 'minimal', label: 'Clean Minimalism', icon: FontIcon }
                        ].map(styleOpt => {
                          const StyleIcon = styleOpt.icon;
                          const isSel = (activeSlide.layoutStyle || 'default') === styleOpt.val;
                          return (
                            <button
                              key={styleOpt.val}
                              type="button"
                              onClick={() => handleUpdateSlideField('layoutStyle', styleOpt.val)}
                              className={`flex-1 py-1.5 px-1 rounded-xl border text-[9px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition select-none ${
                                isSel
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400 font-bold'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                              }`}
                              title={styleOpt.label}
                            >
                              <StyleIcon className="h-3 w-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                              <span className="capitalize">{styleOpt.val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Color (only if 'card' layout style is checked) */}
                  {activeSlide.layoutStyle === 'card' && (
                    <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">Custom Card Background Color</label>
                        <span className="text-[9px] text-slate-400">Card Layout Preset</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="cardBgColorPicker"
                          value={activeSlide.cardColor || '#FAFAFB'}
                          onChange={(e) => handleUpdateSlideField('cardColor', e.target.value)}
                          className="w-8 h-8 rounded-md cursor-pointer border border-slate-205"
                        />
                        <input
                          type="text"
                          value={activeSlide.cardColor || '#FAFAFB'}
                          onChange={(e) => handleUpdateSlideField('cardColor', e.target.value)}
                          placeholder="#FAFAFB"
                          className="p-1 px-2.5 bg-white dark:bg-slate-900 text-xs rounded-lg border border-slate-200 outline-none w-28 uppercase font-mono text-slate-800 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSlideField('cardColor', '#FAFAFB')}
                          className="text-[9px] font-bold text-indigo-500 hover:underline"
                        >
                          Default Light
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateSlideField('cardColor', '#131A26')}
                          className="text-[9px] font-bold text-indigo-500 hover:underline"
                        >
                          Dark Slate
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Device Image Grid & Count Setup */}
                  {activeSlide.type !== 'section' && activeSlide.type !== 'title' && (
                    <div className="p-3.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Device Image Slots Layout Settings</label>
                        <span className="text-[9px] text-slate-400 font-mono">Dynamic Grids</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Selected Count */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold block">Images count in slide</span>
                          <select
                            value={activeSlide.imageCount !== undefined ? activeSlide.imageCount : ((activeSlide.images || []).length > 0 ? (activeSlide.images || []).length : (activeSlide.image ? 1 : 0))}
                            onChange={(e) => handleUpdateSlideField('imageCount', parseInt(e.target.value))}
                            className="bg-white dark:bg-slate-800 p-2 text-xs rounded-lg border border-slate-200 w-full outline-none text-slate-850 dark:text-slate-150"
                          >
                            <option value={0}>No Images (Pure Text Columns)</option>
                            <option value={1}>1 Image (Standard Grid column)</option>
                            <option value={2}>2 Images (Vertical Split column)</option>
                          </select>
                        </div>

                        {/* Image uploads if > 0 */}
                        {(activeSlide.imageCount !== undefined ? activeSlide.imageCount : ((activeSlide.images || []).length > 0 ? (activeSlide.images || []).length : (activeSlide.image ? 1 : 0))) > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-slate-500 font-bold block">Upload devices files</span>
                            <div className="flex flex-col gap-2">
                              {Array.from({ length: activeSlide.imageCount || 1 }).map((_, idx) => {
                                const currentImages = activeSlide.images || [];
                                const hasUploaded = !!currentImages[idx];
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-slate-400">File {idx + 1}:</span>
                                    {hasUploaded ? (
                                      <div className="flex items-center justify-between bg-white dark:bg-slate-805 border border-slate-202 p-1 px-2 rounded-lg text-[10px] flex-1 text-slate-800 dark:text-slate-100">
                                        <span className="truncate max-w-[80px] text-emerald-600 font-bold">✓ Ready</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveImage(idx)}
                                          className="text-red-500 hover:underline font-bold text-[9px]"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-850 border border-slate-200 p-1 px-2 rounded-lg text-[9px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer text-center block tracking-wide truncate">
                                        Select Image {idx + 1}...
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            if (e.target.files?.[0]) handleImageUpload(idx, e.target.files[0]);
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subtitle fields */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Slide Subtitle or Description Line</label>
                    <input
                      type="text"
                      value={activeSlide.subtitle || ""}
                      onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-[#0b0e17] transition"
                      placeholder="Short supportive summary highlights..."
                    />
                  </div>

                  {/* Bullet items array editor */}
                  {activeSlide.type !== 'section' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Bullet Content lists</label>
                        <button
                          type="button"
                          onClick={handleAddBullet}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-450 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono inline-flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Add points</span>
                        </button>
                      </div>

                      <div className="space-y-3.5">
                        {activeSlide.bullets?.map((bullet, bulletIdx) => (
                          <div key={bulletIdx} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-550 shrink-0 w-4">{bulletIdx + 1}.</span>
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(bulletIdx, e.target.value)}
                              className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-[#0b0e17] transition"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(bulletIdx)}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                              title="Remove Bullet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>

        {/* PANEL LEVEL 3: RIGHT PANEL (Theme templates selector) */}
        <aside className="w-80 bg-white dark:bg-[#0f1524] border-l border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 select-none text-slate-800 dark:text-slate-100 transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-display select-none">
              <Palette className="h-4 w-4 text-indigo-500" />
              <span>Theme Preset Hub</span>
            </span>
          </div>

          <div className="p-4 space-y-4">
            
            {/* Visual themes selector */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-sans">Switch Active Layout theme</span>
              
              <div className="space-y-3">
                {Object.entries(EXPERT_THEMES).map(([themeKey, themePreset]) => {
                  const isCurrent = deck.theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => handleThemeChange(themeKey)}
                      className={`w-full p-3.5 border rounded-xl text-left cursor-pointer transition flex items-center justify-between select-none ${
                        isCurrent 
                          ? 'border-indigo-500 dark:border-indigo-400 bg-slate-50 dark:bg-slate-900 ring-2 ring-indigo-500/10' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-220 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {themePreset.name}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono block">
                          Fonts: {themePreset.fontTitle} / {themePreset.fontBody}
                        </span>
                      </div>

                      {/* Small Swatches Row */}
                      <div className="flex items-center gap-1 shadow-inner border border-slate-130 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 rounded-lg">
                        <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: themePreset.colors.primary }} title="Primary" />
                        <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: themePreset.colors.secondary }} title="Secondary" />
                        <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: themePreset.colors.accent }} title="Accent" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Typography Customization */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block font-sans">
                Customize Custom Typography
              </span>

              <div className="space-y-3.5">
                {/* Heading Font Face Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                    Heading Font
                  </label>
                  <select
                    value={deck.fontTitle}
                    onChange={(e) => setDeck({ ...deck, fontTitle: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-400 transition"
                  >
                    <option value="Space Grotesk">Space Grotesk (Tech / Modern)</option>
                    <option value="Outfit">Outfit (Clean Geometric)</option>
                    <option value="Inter">Inter (Premium Utility Sans)</option>
                    <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                    <option value="Lora">Lora (Modern Editorial Serif)</option>
                    <option value="Merriweather">Merriweather (Classic Editorial Serif)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Logical Technical Mono)</option>
                  </select>
                </div>

                {/* Body Font Face Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                    Body Content Font
                  </label>
                  <select
                    value={deck.fontBody}
                    onChange={(e) => setDeck({ ...deck, fontBody: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-400 transition"
                  >
                    <option value="Inter">Inter (Premium Utility Sans)</option>
                    <option value="Outfit">Outfit (Clean Geometric)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech / Modern)</option>
                    <option value="Lora">Lora (Modern Editorial Serif)</option>
                    <option value="Merriweather">Merriweather (Classic Editorial Serif)</option>
                    <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Logical Technical Mono)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Color Palette Tool */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block font-sans">
                Fine-tune Palette Colors
              </span>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* Background color */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100/80 dark:border-slate-800">
                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Background</label>
                  <div className="flex items-center gap-1.5 font-mono text-slate-850 dark:text-slate-150">
                    <input
                      type="color"
                      value={deck.colors.bg || '#ffffff'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, bg: e.target.value }
                      })}
                      className="w-7 h-7 rounded-md cursor-pointer border border-slate-200 dark:border-slate-800 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={deck.colors.bg || '#ffffff'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, bg: e.target.value }
                      })}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Primary header color */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100/80 dark:border-slate-800">
                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Headings</label>
                  <div className="flex items-center gap-1.5 font-mono text-slate-850 dark:text-slate-150">
                    <input
                      type="color"
                      value={deck.colors.primary || '#000000'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, primary: e.target.value, heading: e.target.value }
                      })}
                      className="w-7 h-7 rounded-md cursor-pointer border border-slate-200 dark:border-slate-800 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={deck.colors.primary || '#000000'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, primary: e.target.value, heading: e.target.value }
                      })}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Secondary color */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100/80 dark:border-slate-800">
                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Subtitles</label>
                  <div className="flex items-center gap-1.5 font-mono text-slate-850 dark:text-slate-150">
                    <input
                      type="color"
                      value={deck.colors.secondary || '#666666'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, secondary: e.target.value }
                      })}
                      className="w-7 h-7 rounded-md cursor-pointer border border-slate-200 dark:border-slate-800 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={deck.colors.secondary || '#666666'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, secondary: e.target.value }
                      })}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Accent Highlight */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100/80 dark:border-slate-800">
                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Accent Line</label>
                  <div className="flex items-center gap-1.5 font-mono text-slate-850 dark:text-slate-150">
                    <input
                      type="color"
                      value={deck.colors.accent || '#4f46e5'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, accent: e.target.value }
                      })}
                      className="w-7 h-7 rounded-md cursor-pointer border border-slate-200 dark:border-slate-800 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={deck.colors.accent || '#4f46e5'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, accent: e.target.value }
                      })}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100/80 dark:border-slate-800 col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Body Bullet Text</label>
                  <div className="flex items-center gap-1.5 font-mono text-slate-850 dark:text-slate-150">
                    <input
                      type="color"
                      value={deck.colors.text || '#1f2937'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, text: e.target.value }
                      })}
                      className="w-7 h-7 rounded-md cursor-pointer border border-slate-200 dark:border-slate-800 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={deck.colors.text || '#1f2937'}
                      onChange={(e) => setDeck({
                        ...deck,
                        colors: { ...deck.colors, text: e.target.value }
                      })}
                      className="w-full text-[10px] font-mono font-bold bg-transparent outline-none uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Global Branding & Watermark settings */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block font-sans">
                Global PowerPoint Layout Branding
              </span>
              
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-350">Remove Slide Footers & Watermarks</span>
                  <input
                    type="checkbox"
                    id="hideFooterToggleCheckbox"
                    checked={deck.hideFooter === true}
                    onChange={(e) => setDeck({ ...deck, hideFooter: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                  />
                </div>
                <p className="text-[9.5px] text-slate-400 leading-normal">
                  Checking this option completely removes the default footer, slide page numbers, and corporate watermarks from downloaded PowerPoint slides.
                </p>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* IMMERSIVE LIVE SLIDESHOW PRESENTATION VIEWER */}
      {isPresenting && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between p-6 select-none animate-fade-in font-sans">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center text-slate-400 text-xs px-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">{deck?.title}</span>
              <span className="text-slate-600">|</span>
              <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px]">Slideshow Playback Mode</span>
            </div>
            
            <button
              onClick={() => setIsPresenting(false)}
              className="px-4 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg font-bold text-xs text-slate-300 cursor-pointer transition uppercase tracking-wider"
              title="Exit Presentation"
            >
              Exit (Esc)
            </button>
          </div>

          {/* Centered Slide Canvas block */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className="w-full max-w-5xl aspect-[16/9] bg-white rounded-2xl shadow-2xl relative flex flex-col justify-between p-12 transition-all duration-300"
              style={{
                backgroundColor: deck.colors.bg || '#ffffff',
                fontFamily: deck.fontBody || 'sans-serif'
              }}
            >
              {/* Background styling layout accents exactly matching standard layouts */}
              <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                {deck.theme === 'business' && (
                  <div className="absolute left-0 top-0 bottom-0 w-4" style={{ backgroundColor: deck.colors.primary }} />
                )}
                {deck.theme === 'technology' && (
                  <div className="absolute top-0 right-4 w-72 h-72 bg-radial from-violet-600/40 to-transparent blur-3xl" />
                )}
                {deck.theme === 'creative' && (
                  <div className="absolute top-10 right-10 w-32 h-32 rounded-full" style={{ backgroundColor: deck.colors.primary, opacity: 0.2 }} />
                )}
              </div>

              {/* Renders active visual slide block in slideshow presenter mode */}
              {activeSlide?.type === 'title' ? (
                <div className="absolute inset-0 flex flex-col justify-between p-16">
                  <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: deck.colors.primary }} />
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h1
                      className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                    >
                      {deck.title}
                    </h1>
                    {activeSlide.title !== deck.title && activeSlide.title && (
                      <p className="text-base sm:text-lg font-semibold mt-6 opacity-90" style={{ color: deck.colors.secondary }}>
                        {activeSlide.title}
                      </p>
                    )}
                  </div>

                  {activeSlide.subtitle && (
                    <div className="mt-auto">
                      <p className="text-sm italic font-medium opacity-80" style={{ color: deck.colors.muted }}>
                        {activeSlide.subtitle}
                      </p>
                    </div>
                  )}
                </div>
              ) : activeSlide?.type === 'section' ? (
                <div className="absolute inset-0 flex flex-col justify-center items-center p-16 text-center" style={{ backgroundColor: deck.colors.primary }}>
                  <h2
                    className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-normal uppercase tracking-wide px-8"
                    style={{ fontFamily: deck.fontTitle }}
                  >
                    {activeSlide.title}
                  </h2>
                  {activeSlide.subtitle && (
                    <p className="text-md sm:text-lg text-indigo-150 mt-6 max-w-2xl leading-relaxed text-indigo-100 font-semibold italic">
                      {activeSlide.subtitle}
                    </p>
                  )}
                </div>
              ) : activeSlide?.type === 'two-column' ? (
                <div className="absolute inset-0 flex flex-col justify-between p-16">
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                    >
                      {activeSlide?.title || "Overview"}
                    </h3>
                    <div className="w-16 h-1 rounded mt-3 shrink-0" style={{ backgroundColor: deck.colors.accent }} />

                    <div className="grid grid-cols-2 gap-10 mt-10 flex-1">
                      {/* Left Column */}
                      <div className="border-r border-slate-100 pr-5 space-y-4 flex flex-col justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest block opacity-75 font-mono" style={{ color: deck.colors.secondary }}>Section Focus A</span>
                        {(activeSlide.bullets || []).slice(0, Math.max(1, Math.ceil((activeSlide.bullets || []).length / 2))).map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: deck.colors.accent }} />
                            <p className="font-bold leading-relaxed text-slate-800 dark:text-slate-100 text-sm md:text-base" style={{ color: deck.colors.text }}>{bullet}</p>
                          </div>
                        ))}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4 flex flex-col justify-center pl-4">
                        <span className="text-xs font-bold uppercase tracking-widest block opacity-75 font-mono" style={{ color: deck.colors.secondary }}>Section Focus B</span>
                        {(activeSlide.bullets || []).slice(Math.max(1, Math.ceil((activeSlide.bullets || []).length / 2))).map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: deck.colors.secondary }} />
                            <p className="font-bold leading-relaxed text-slate-800 dark:text-slate-100 text-sm md:text-base" style={{ color: deck.colors.text }}>{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t pt-4 mt-6 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                    <span className="font-semibold uppercase tracking-wider">Two-Column Comparison</span>
                    <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                  </div>
                </div>
              ) : activeSlide?.type === 'stat' ? (
                <div className="absolute inset-0 flex flex-col justify-between p-16">
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                    >
                      {activeSlide?.title}
                    </h3>

                    <div className="flex items-center gap-12 mt-12 flex-1">
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-6xl sm:text-7xl font-extrabold tracking-tight" style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}>
                          {activeSlide.bullets[0] || '10x'}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest mt-2" style={{ color: deck.colors.accent }}>Key Metric Focus</span>
                      </div>

                      <div className="flex-1 pl-10 border-l border-slate-150 space-y-6 flex flex-col justify-center">
                        {(activeSlide.bullets || []).slice(1).map((bullet, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            <span className="w-2.5 h-2.5 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: deck.colors.accent }} />
                            <p className="font-bold leading-relaxed text-slate-800 dark:text-slate-100 text-sm md:text-base" style={{ color: deck.colors.text }}>{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t pt-4 mt-6 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                    <span className="font-semibold uppercase tracking-wider">Metrics Performance Spotlight</span>
                    <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                  </div>
                </div>
              ) : activeSlide?.type === 'quote' ? (
                <div className="absolute inset-0 flex flex-col justify-between p-16">
                  <div className="flex-1 flex flex-col justify-center items-center text-center px-10 relative">
                    <span className="text-5xl leading-none select-none italic text-indigo-400 block h-8 font-serif mb-4">“</span>
                    
                    <p className="text-lg sm:text-2xl font-bold italic leading-relaxed text-slate-900 dark:text-slate-50" style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}>
                      {activeSlide.bullets[0]}
                    </p>

                    {activeSlide.bullets[1] && (
                      <p className="text-xs uppercase tracking-widest mt-6 font-bold font-mono" style={{ color: deck.colors.accent }}>
                        — {activeSlide.bullets[1]}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t pt-4 mt-6 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                    <span className="font-semibold uppercase tracking-wider">Key Quote Testimonial</span>
                    <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                  </div>
                </div>
              ) : activeSlide?.type === 'timeline' ? (
                <div className="absolute inset-0 flex flex-col justify-between p-16">
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                    >
                      {activeSlide?.title}
                    </h3>
                    <div className="w-16 h-1 rounded mt-3 shrink-0" style={{ backgroundColor: deck.colors.accent }} />

                    <div className="grid grid-cols-3 gap-6 mt-12 flex-1 items-stretch">
                      {[(activeSlide.bullets[0] || ''), (activeSlide.bullets[1] || ''), (activeSlide.bullets[2] || '')].map((bullet, idx) => (
                        <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between relative">
                          <span className="text-xs font-bold font-mono text-indigo-500 uppercase tracking-widest block">Phase {idx + 1}</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-relaxed mt-4" style={{ color: deck.colors.text }}>{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t pt-4 mt-6 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                    <span className="font-semibold uppercase tracking-wider">Project Timeline Workflow</span>
                    <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Standard Slide View Content (Clean layout, no label, scaled text) */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: deck.colors.primary, fontFamily: deck.fontTitle }}
                    >
                      {activeSlide?.title || "Bullet items list overview"}
                    </h3>
                    
                    <div className="w-16 h-1 rounded mt-3 shrink-0" style={{ backgroundColor: deck.colors.accent }} />

                    {/* Bullet items scaled properly to fit */}
                    <div className="mt-10 flex-1 overflow-hidden select-text pr-1 flex flex-col justify-center">
                      {activeSlide?.bullets && activeSlide.bullets.length > 0 ? (
                        <ul className={bulletConfig.spacing}>
                          {activeSlide.bullets.map((bullet, bidx) => (
                            <li
                              key={bidx} 
                              className="flex items-start gap-4 font-bold leading-relaxed" 
                              style={{ 
                                color: deck.colors.text,
                                fontSize: bulletConfig.fontSize === '9.5px' ? '14px' : bulletConfig.fontSize === '11px' ? '16px' : '20px' 
                              }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-2.5" style={{ backgroundColor: deck.colors.accent }} />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 text-center italic">Empty page slide contents.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t pt-4 mt-6 select-none shrink-0" style={{ borderColor: 'rgba(0,0,0,0.05)', color: deck.colors.muted }}>
                    <span className="font-semibold uppercase tracking-wider">Slide Presentation Deck</span>
                    <span>Slide {activeSlideIndex + 1} of {deck.slideData.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Floating Slideshow Controls underneath the slide layout */}
          <div className="flex items-center justify-between px-16 max-w-5xl w-full mx-auto select-none py-2 text-slate-400">
            <span className="text-xs font-semibold">
              Slide <span className="text-white font-bold">{activeSlideIndex + 1}</span> of <span className="text-white font-bold">{deck.slideData.length}</span>
            </span>

            {/* Navigation buttons */}
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
              <button
                onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="p-2 hover:bg-slate-800 disabled:opacity-20 text-slate-300 rounded-lg cursor-pointer transition font-bold text-xs"
                title="Previous Slide (←)"
              >
                Previous
              </button>
              
              <div className="w-px h-5 bg-slate-800" />
              
              <button
                onClick={() => setActiveSlideIndex(prev => Math.min(deck.slideData.length - 1, prev + 1))}
                disabled={activeSlideIndex === deck.slideData.length - 1}
                className="p-2 hover:bg-slate-800 disabled:opacity-20 text-indigo-400 hover:text-indigo-300 rounded-lg cursor-pointer transition font-bold text-xs"
                title="Next Slide (→ or Space)"
              >
                Next
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
              Tip: Use Left/Right Arrow keyboard keys to navigate slide. Press Esc to exit.
            </div>
          </div>

        </div>
      )}



    </div>
  );
}
