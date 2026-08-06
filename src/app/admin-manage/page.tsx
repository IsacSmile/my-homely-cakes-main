'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cake, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin-manage/overview');
        router.refresh();
      } else {
        setError(data.error || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bakery-chocolate via-bakery-chocolateLight to-bakery-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 border border-amber-900/20">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-700 mx-auto flex items-center justify-center border border-amber-500/20">
            <Cake className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-bakery-chocolate">
            MyHomelyCake Admin
          </h1>
          <p className="text-xs text-bakery-600">
            Sign in to manage Trivandrum cake orders & catalog
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-bakery-800 block mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@myhomelycakes.com"
                className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-4 py-3 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600 pl-10"
              />
              <Mail className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-800 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-4 py-3 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600 pl-10"
              />
              <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs shadow-soft transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-bakery-100 text-center">
          <span className="text-[11px] text-bakery-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Protected Authenticated Admin Portal
          </span>
        </div>
      </div>
    </div>
  );
}
