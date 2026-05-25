import React, { useState } from 'react';
import { AUTH_TOKEN_KEY, request } from '../utils/api';
import { LogIn, UserPlus, Presentation, AlertCircle, KeyRound, User } from 'lucide-react';
import { useToast } from './Toast';

interface LoginRegisterProps {
  onAuthSuccess: (token: string, user: { id: string; name: string }) => void;
  initialType: 'login' | 'register';
  onToggleType: (type: 'login' | 'register') => void;
}

export function LoginRegister({ onAuthSuccess, initialType, onToggleType }: LoginRegisterProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError("Please fill out all fields");
      return;
    }
    setError(null);
    setLoading(true);

    const endpoint = initialType === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ name, password })
      });

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      showToast(
        initialType === 'login' 
          ? `Logged in successfully! Welcome back.` 
          : 'Your account was successfully registered!', 
        'login', 
        initialType === 'login' ? 'Welcome Back' : 'Created Account'
      );
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-50 to-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
        
        {/* Banner */}
        <div className="bg-slate-900 px-6 py-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono font-medium text-[#fbbf24]">
            v1.2.0-Alpha
          </div>
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-slate-800 rounded-xl inline-flex border border-slate-700">
              <Presentation className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white mb-1">
            SlideAI Generator
          </h1>
          <p className="text-slate-400 text-xs">
            Generate stunning widescreen reports and decks in seconds
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block uppercase tracking-wider">
                Name / Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm outline-none transition"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-slate-900/10 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : initialType === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Access Platform</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5 text-xs text-slate-500 select-none">
            {initialType === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onToggleType('register')}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Create free account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onToggleType('login')}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
