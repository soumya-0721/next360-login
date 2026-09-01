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
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen bg-[#2b7a3e] flex items-center justify-center p-4 sm:p-6">
      {/* Main Card */}
      <div className={`w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex flex-col lg:flex-row min-h-[520px]">

          {/* Left Panel - Branded */}
          <div className="lg:w-[42%] relative bg-gradient-to-br from-[#2b7a3e] via-[#237034] to-[#1a5c28] overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/[0.06] rounded-full" />
            <div className="absolute top-1/3 -right-16 w-48 h-48 bg-white/[0.05] rounded-full" />
            <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-white/[0.04] rounded-full" />
            <div className="absolute bottom-10 right-6 w-24 h-24 bg-white/[0.07] rounded-full" />
            <div className="absolute top-10 right-20 w-16 h-16 bg-white/[0.05] rounded-full" />

            {/* Diagonal decorative shape */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/[0.08] to-transparent" />

            <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-10 py-12">
              {/* Logo */}
              <div className="mb-8">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-5">
                  <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="rounded-md" />
                </div>
              </div>

              {/* Welcome Text */}
              <div>
                <h1 className="text-white text-3xl lg:text-4xl font-extrabold tracking-wide uppercase mb-1">
                  Welcome
                </h1>
                <h2 className="text-white/90 text-lg font-semibold mb-4">
                  Next360 Organic Products
                </h2>
                <p className="text-green-100/50 text-sm leading-relaxed max-w-[280px]">
                  Office Attendance & Team Management Dashboard. Track attendance, manage tasks, and stay connected with your team.
                </p>
              </div>

              {/* Dots indicator */}
              <div className="flex gap-2 mt-8">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <div className="w-2 h-2 rounded-full bg-white/30" />
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:w-[58%] flex items-center justify-center p-8 lg:p-10 bg-white">
            <div className="w-full max-w-[380px]">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-gray-900 text-2xl font-bold mb-1">Sign in</h2>
                <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                      placeholder="Email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                    Forgot Password?
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2b7a3e] hover:bg-[#237034] disabled:bg-green-400 text-white font-bold py-3 rounded-lg transition-all text-sm tracking-wide shadow-md hover:shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Quick Login */}
              <div className="space-y-2.5">
                {quickLoginUsers.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => handleQuickLogin(u.email, u.password)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50/30 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs group-hover:bg-green-200 transition-colors flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">{u.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
