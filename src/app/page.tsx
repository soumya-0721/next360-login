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

  function handleQuickLogin(userEmail: string, userPassword: string) {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Top - Logo & Name */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Image src="/images/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Next360</h1>
                <p className="text-green-200/70 text-xs font-medium">Organic Products</p>
              </div>
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="w-14 h-1 bg-white/30 rounded-full mb-8" />
              <h2 className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-4">
                Office Attendance<br />& Team Dashboard
              </h2>
              <p className="text-green-100/60 text-sm leading-relaxed mb-10">
                Track attendance, manage tasks, and stay connected with your team — all in one place.
              </p>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-6 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {[
                { num: '6', label: 'Team Members' },
                { num: '360', label: 'Degree View' },
                { num: '24/7', label: 'Live Tracking' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-white text-2xl font-bold">{stat.num}</p>
                  <p className="text-green-200/50 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-3 text-green-200/40 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Secure & Encrypted</span>
              <span className="mx-1">|</span>
              <span>SSL Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50/50">
        <div className={`w-full max-w-md transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Image src="/images/logo.png" alt="Logo" width={24} height={24} className="rounded-md" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-base">Next360</h1>
              <p className="text-gray-400 text-xs">Organic Products</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-gray-900 text-2xl font-bold">Sign in</h2>
            <p className="text-gray-500 text-sm mt-1.5">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                placeholder="name@company.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10 pr-11"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">or sign in as</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Quick Login */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLoginUsers.map((u) => (
              <button
                key={u.email}
                onClick={() => handleQuickLogin(u.email, u.password)}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/50 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm group-hover:bg-green-200 transition-colors flex-shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">Employee</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Next360 Organic Products</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              <span>Secured with SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
