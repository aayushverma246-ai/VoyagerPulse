'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { LogoIcon } from '@/components/shared/logo';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError(null);

    // Create or login standard demo account
    const demoEmail = 'demo@voyagerpulse.com';
    const demoPassword = 'Password123!';

    // Try signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInError) {
      // If demo user doesn't exist, try signing them up
      const { error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: 'Jane Doe (Demo)',
          }
        }
      });

      if (signUpError) {
        setError('Demo system offline. Please create a fresh account.');
        setDemoLoading(false);
        return;
      }

      // Automatically sign in after sign up
      const { error: autoSignInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (autoSignInError) {
        setError(autoSignInError.message);
        setDemoLoading(false);
        return;
      }
    }

    // Seed mock data for the demo user
    try {
      await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo: true }),
      });
    } catch (e) {
      console.error('Failed to auto-seed demo data', e);
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-white dot-grid flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background radial overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl glow-primary"
      >
        {/* Brand logo & header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <LogoIcon className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-zinc-400 text-sm mt-1">Sign in to your VoyagerPulse account</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || demoLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl py-3.5 font-medium transition-all cursor-pointer font-sans"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-zinc-600 text-xs font-medium uppercase tracking-wider">or test drive</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <button 
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="w-full inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 disabled:border-zinc-800/20 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-xl py-3.5 font-medium transition-colors cursor-pointer font-sans"
        >
          <Sparkles className="h-4 w-4 text-indigo-400" />
          {demoLoading ? 'Seeding Demo Data...' : 'Explore Demo Dashboard'}
        </button>

        <p className="text-zinc-500 text-xs text-center mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-400 hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
