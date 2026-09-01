'use client';

import { useState } from 'react';
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

  const quickLoginUsers = DEFAULT_USERS.filter(
    (u) => u.role === 'Employee'
  );

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
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleQuickLogin(userEmail: string, userPassword: string) {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold text-green-700">
              Next360 Organic Products
            </h1>
            <p className="text-gray-500 mt-1">Office Attendance Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all pr-11"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Login</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickLoginUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => handleQuickLogin(u.email, u.password)}
                  className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-full border border-green-200 transition-colors"
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
