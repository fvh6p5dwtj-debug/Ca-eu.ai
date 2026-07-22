'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Candy.ai
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start chatting with AI companions for free</p>
        </div>

        <div className="bg-[#120a24] border border-purple-500/20 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a0a2e] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a0a2e] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1a0a2e] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold hover:from-purple-400 hover:to-fuchsia-400 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-purple-400 hover:text-fuchsia-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
