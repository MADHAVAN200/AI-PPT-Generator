import React, { useState, useEffect } from 'react';
import { AUTH_TOKEN_KEY, request } from './utils/api';
import { LoginRegister } from './components/LoginRegister';
import { Dashboard } from './components/Dashboard';
import { Generator } from './components/Generator';
import { Editor } from './components/Editor';
import { Presentation as PresentationIcon, LogOut, User, Menu, Compass, Sun, Moon } from 'lucide-react';

type ViewState = 'login' | 'register' | 'dashboard' | 'generator' | 'editor';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('login');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Authenticate on initial load
  const loadUser = async () => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) {
      setInitializing(false);
      setActiveView('login');
      return;
    }

    try {
      setToken(savedToken);
      const res = await request('/api/auth/me');
      setUser(res.user);
      setActiveView('dashboard');
    } catch (err) {
      // Token invalid or expired
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
      setActiveView('login');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleAuthSuccess = (newToken: string, authedUser: { id: string; name: string }) => {
    setToken(newToken);
    setUser(authedUser);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setActiveView('login');
  };

  const handleNavigate = (view: ViewState, id: string | null = null) => {
    setActiveView(view);
    if (id) {
      setEditingId(id);
    } else {
      setEditingId(null);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans select-none text-slate-400">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-12 h-12 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin"></div>
            <PresentationIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Initializing platform...</p>
        </div>
      </div>
    );
  }

  // Visual View dispatch logic
  const renderView = () => {
    switch (activeView) {
      case 'login':
        return (
          <LoginRegister
            initialType="login"
            onAuthSuccess={handleAuthSuccess}
            onToggleType={(t) => setActiveView(t === 'register' ? 'register' : 'login')}
          />
        );
      case 'register':
        return (
          <LoginRegister
            initialType="register"
            onAuthSuccess={handleAuthSuccess}
            onToggleType={(t) => setActiveView(t === 'register' ? 'register' : 'login')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            userName={user?.name || 'User Account'}
          />
        );
      case 'generator':
        return (
          <Generator
            onNavigate={handleNavigate}
            onSuccess={(id) => handleNavigate('editor', id)}
          />
        );
      case 'editor':
        return (
          <Editor
            presentationId={editingId || ''}
            onNavigate={handleNavigate}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        );
      default:
        return <div className="p-8">View layout unknown.</div>;
    }
  };

  const showNavbar = activeView !== 'login' && activeView !== 'register' && activeView !== 'editor';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col h-full font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Platform Navigation Header (Only render outside authentication views & editor panels) */}
      {showNavbar && (
        <nav className="bg-white dark:bg-[#0f1524] border-b border-slate-200 dark:border-slate-800/80 h-16 shrink-0 flex items-center justify-between px-6 z-10 select-none shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <PresentationIcon className="h-5 w-5" />
            </div>
            <span 
              onClick={() => handleNavigate('dashboard')} 
              className="font-bold text-slate-800 dark:text-slate-100 font-display tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              SlideAI Platform
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Theme Toggle Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-xl cursor-pointer flex items-center gap-2 select-text font-mono transition">
              <User className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{user?.name}</span>
            </span>

            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 font-bold"
              title="Logout session"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      )}

      {/* Main viewport Container */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>

    </div>
  );
}
