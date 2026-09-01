'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { hashPassword } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_USERS } from '@/lib/default-users';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeQuick, setActiveQuick] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const quickLoginUsers = DEFAULT_USERS.filter((u) => u.role === 'Employee');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const passwordHash = await hashPassword(password);
      const supabase = createClient();

      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('email', email)
        .eq('password_hash', passwordHash);

      if (queryError) {
        setError('Database error: ' + queryError.message);
        setLoading(false);
        return;
      }

      if (!users || users.length === 0) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      const user = users[0];
      localStorage.setItem('currentUser', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  }

  function handleQuickLogin(userEmail: string, userPassword: string, name: string) {
    setEmail(userEmail);
    setPassword(userPassword);
    setActiveQuick(name);
    setError('');
  }

  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '5s' }} />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className={`relative z-10 w-full max-w-5xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">

            {/* Left - Branding Panel */}
            <div className="lg:w-5/12 relative p-10 flex flex-col justify-between">
              {/* Decorative corner */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-br-[3rem]" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-emerald-500/20 to-transparent rounded-tl-[3rem]" />

              <div className="relative">
                {/* Logo */}
                <div className={`transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 mb-6">
                    <Image
                      src="/images/logo.png"
                      alt="Next360"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    Next360
                  </h1>
                  <p className="text-green-400/80 font-medium">Organic Products</p>
                </div>

                {/* Divider */}
                <div className={`w-12 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 my-8 rounded-full transition-all duration-700 delay-500 ${mounted ? 'opacity-100 w-12' : 'opacity-0 w-0'}`} />

                {/* Description */}
                <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                    Office Attendance & Team Management Dashboard. Track check-ins, manage tasks, and stay connected.
                  </p>
                </div>
              </div>

              {/* Feature Pills */}
              <div className={`relative mt-12 flex flex-wrap gap-2 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {['Attendance', 'Tracking', 'Tasks', 'Chat'].map((f) => (
                  <span key={f} className="px-3 py-1.5 text-xs font-medium text-green-300/70 bg-green-500/10 border border-green-500/20 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Login Form */}
            <div className="lg:w-7/12 p-10 flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className={`mb-10 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                  <p className="text-gray-500 text-sm">Sign in to your workspace</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 outline-none transition-all duration-300 focus:border-green-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-green-500/10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 outline-none transition-all duration-300 focus:border-green-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-green-500/10 pr-12"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                      <span className="relative">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                          </span>
                        ) : 'Sign In'}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Quick Login Divider */}
                <div className={`flex items-center gap-4 my-8 transition-all duration-700 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Quick Access</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Quick Login */}
                <div className={`grid grid-cols-2 gap-3 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {quickLoginUsers.map((u, i) => (
                    <button
                      key={u.email}
                      onClick={() => handleQuickLogin(u.email, u.password, u.name)}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                        activeQuick === u.name
                          ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{u.name}</p>
                        <p className="text-xs text-gray-500">Employee</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className={`mt-10 text-center transition-all duration-700 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-gray-600 text-xs">
                    Next360 Organic Products &copy; {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
