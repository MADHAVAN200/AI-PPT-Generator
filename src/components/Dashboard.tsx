import React, { useEffect, useState } from 'react';
import { Presentation, Template } from '../types';
import { AUTH_TOKEN_KEY, request } from '../utils/api';
import { useToast } from './Toast';
import {
  Plus,
  Play,
  Download,
  Calendar,
  Layers,
  Palette,
  LayoutTemplate,
  Loader,
  BarChart3,
  Presentation as PresentationIcon,
  Compass,
  FileDown,
  Database,
  Shield,
  Check,
  Copy,
  Terminal,
  AlertTriangle,
  Edit
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: 'login' | 'register' | 'dashboard' | 'generator' | 'editor', id?: string | null) => void;
  userName: string;
}

export function Dashboard({ onNavigate, userName }: DashboardProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ initialized: boolean; connected?: boolean; tableAvailable: boolean; usersTableAvailable: boolean; errors?: any } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const { showToast } = useToast();

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await request('/api/presentations');
      setPresentations(data.presentations);
    } catch (err: any) {
      setError(err.message || 'Could not fetch your active slide decks');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupabaseStatus = async () => {
    try {
      const data = await request('/api/supabase/status');
      setSupabaseStatus(data);
    } catch (_) {
      // Graceful ignore
    }
  };

  useEffect(() => {
    fetchDecks();
    fetchSupabaseStatus();
  }, []);

  const handleDownload = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      showToast('Authentication expired. Please log in again.', 'error', 'Authentication Failed');
      return;
    }

    try {
      setDownloadingId(id);
      // Directly download from standard browser location. 
      // Safe to assign location href with query token
      window.location.href = `/api/presentations/${id}/download?token=${encodeURIComponent(token)}`;
      showToast(`Export started! Your widescreen PPTX file "${title}" is ready and downloading.`, 'export', 'Export Ready');
    } catch (err) {
      showToast('Failed to launch downloader for PPTX output.', 'error', 'Download Error');
    } finally {
      setTimeout(() => setDownloadingId(null), 3000);
    }
  };

  // Stats calculation
  const totalSlides = presentations.reduce((acc, curr) => acc + (curr.slideData?.length || 0), 0);
  const themeCounts = presentations.reduce((acc, curr) => {
    acc[curr.theme] = (acc[curr.theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsedTheme = Object.keys(themeCounts).length > 0 
    ? Object.entries(themeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : "None yet";

  const filteredDecks = presentations.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.prompt && p.prompt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold uppercase tracking-wider block mb-1">
            Secure workspace
          </span>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-50">
            Welcome back, <span className="text-slate-750 dark:text-slate-300">{userName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-450 text-sm mt-1">
            Instantly formulate educational grids, slide layouts, and corporate briefs.
          </p>
        </div>

        <button
          onClick={() => onNavigate('generator')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15 transition active:scale-[0.98]"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New AI Presentation</span>
        </button>
      </div>

      {/* Database Setup & Diagnostic Banner */}
      {supabaseStatus && (supabaseStatus.errors?.presentations || supabaseStatus.errors?.users || !supabaseStatus.tableAvailable || !supabaseStatus.usersTableAvailable) && (
        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 text-base">
                <Database className="h-4.5 w-4.5" />
                {supabaseStatus.errors?.presentations?.code === '42501' || supabaseStatus.errors?.users?.code === '42501' 
                  ? "Supabase Row-Level Security (RLS) Policy Required"
                  : "Supabase Schema Configuration Needed"
                }
              </h3>
              <p className="text-xs text-amber-700/85 dark:text-amber-400/80 leading-relaxed max-w-4xl">
                {supabaseStatus.errors?.presentations?.code === '42501' || supabaseStatus.errors?.users?.code === '42501'
                  ? "Your Supabase tables have Row-Level Security (RLS) enabled, but no policies allow inserts or updates from the server. To fix this and sync your files to the cloud database, run the following SQL commands in your Supabase SQL Editor:"
                  : "To initialize your Supabase cloud storage, please make sure the public.presentations and public.users tables are fully created with the correct columns. Run this SQL script in your Supabase SQL Editor:"
                }
              </p>

              {/* SQL box */}
              <div className="mt-4 relative bg-[#090d16]/95 dark:bg-[#070a11] rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-normal border border-slate-800 select-all overflow-x-auto max-h-64">
                <pre className="whitespace-pre-wrap">
{supabaseStatus.errors?.presentations?.code === '42501' || supabaseStatus.errors?.users?.code === '42501'
  ? `-- Solution (Run this in Supabase SQL Editor to allow writes):
ALTER TABLE presentations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;`
  : `-- Create the required PostgreSQL tables structure in Supabase:
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presentations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT,
  extra_data TEXT,
  num_slides INTEGER DEFAULT 0,
  slide_data JSONB NOT NULL,
  theme TEXT,
  colors JSONB,
  font_title TEXT,
  font_body TEXT,
  status TEXT DEFAULT 'done',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row-Level Security (RLS) for server insertions/selections and active queries:
ALTER TABLE presentations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;`
}
                </pre>
                
                <button
                  type="button"
                  onClick={() => {
                    const sqlText = supabaseStatus.errors?.presentations?.code === '42501' || supabaseStatus.errors?.users?.code === '42501'
                      ? `ALTER TABLE presentations DISABLE ROW LEVEL SECURITY;\nALTER TABLE users DISABLE ROW LEVEL SECURITY;`
                      : `CREATE TABLE IF NOT EXISTS users (\n  id TEXT PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL,\n  password_hash TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nCREATE TABLE IF NOT EXISTS presentations (\n  id TEXT PRIMARY KEY,\n  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,\n  title TEXT NOT NULL,\n  prompt TEXT,\n  extra_data TEXT,\n  num_slides INTEGER DEFAULT 0,\n  slide_data JSONB NOT NULL,\n  theme TEXT,\n  colors JSONB,\n  font_title TEXT,\n  font_body TEXT,\n  status TEXT DEFAULT 'done',\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nALTER TABLE presentations DISABLE ROW LEVEL SECURITY;\nALTER TABLE users DISABLE ROW LEVEL SECURITY;`;
                    
                    navigator.clipboard.writeText(sqlText);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-md transition"
                >
                  {copiedSql ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-400 font-sans font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="font-sans font-bold">Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="pt-2 text-[11px] text-amber-800/80 dark:text-amber-400/60 flex items-center gap-1.5 select-none">
                <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 font-semibold" />
                <span>Note: While configuration is incomplete, the workspace will seamlessly preserve all your slide decks locally inside the robust backend storage (db.json).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards block */}
      {presentations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 select-none">
          <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <PresentationIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Decks</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{presentations.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider font-sans">Total Outline Slides</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{totalSlides}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Primary Theme Genre</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 capitalize">{mostUsedTheme}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database decks list */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader className="h-10 w-10 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-450 text-sm">Synchronizing presentational index...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-650 dark:text-red-400 rounded-2xl text-sm mb-6 flex items-center gap-3">
          <BarChart3 className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : presentations.length === 0 ? (
        <div className="bg-white dark:bg-[#0f1524] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto mt-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl inline-flex mb-4">
            <Compass className="h-8 w-8 text-indigo-400 dark:text-indigo-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">No presentations found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto mt-2 leading-relaxed">
            Formulate your first AI presentation. Type any concept, choose color palettes, customize slide rules, and download standard PPTX.
          </p>
          <button
            onClick={() => onNavigate('generator')}
            className="mt-6 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Generate slide deck</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-md font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block font-display">
              Recent Formulations ({filteredDecks.length})
            </h2>
            <input
              type="text"
              placeholder="Search by topic, Title, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#0f1524] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl text-xs w-64 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={item.id}
                  onClick={() => onNavigate('editor', item.id)}
                  className="bg-white dark:bg-[#0f1524] border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-1 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group"
                >
                  {/* Card Mini Header with Color Swatch Theme preview */}
                  <div className="h-32 p-5 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: item.colors?.bg || '#F8FAFC' }}>
                    {/* Visual pattern representation */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{ backgroundColor: item.colors?.primary }} />
                      <div className="absolute bottom-4 left-6 w-16 h-16 rounded" style={{ backgroundColor: item.colors?.accent }} />
                    </div>

                    <div className="flex justify-between items-start z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold text-white inline-block shadow-inner" style={{ backgroundColor: item.colors?.primary }}>
                        {item.theme}
                      </span>
                      <span className="text-xs font-semibold text-slate-800" style={{ color: item.colors?.heading }}>
                        {item.slideData?.length || 0} Slides
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 z-10">
                      <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: item.colors?.primary }} title="Primary" />
                      <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: item.colors?.secondary }} title="Secondary" />
                      <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: item.colors?.accent }} title="Accent" />
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" style={{ fontFamily: item.fontTitle }}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed" style={{ fontFamily: item.fontBody }}>
                        Prompt: "{item.prompt || 'No details specified'}"
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 select-none">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onNavigate('editor', item.id); }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 rounded-lg flex items-center gap-1 cursor-pointer transition mr-1 font-bold text-xs"
                          title="Open Slide Editor"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDownload(item.id, item.title, e)}
                          disabled={downloadingId === item.id}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-350 disabled:opacity-50 rounded-lg cursor-pointer transition"
                          title="Instant Download PPTX"
                        >
                          {downloadingId === item.id ? (
                            <Loader className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
