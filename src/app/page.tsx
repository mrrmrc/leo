// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Check for Mock Credentials (as requested by user)
    if (!isRegistering) {
      if (email === 'admin' && password === '!LEIbniz2018') {
        localStorage.setItem('leo_mock_user', 'admin');
        localStorage.setItem('leo_user_role', 'admin');
        router.push('/admin');
        return;
      }

      if (email === 'medico' && password === 'medico') {
        localStorage.setItem('leo_mock_user', 'medico');
        localStorage.setItem('leo_user_role', 'expert');
        router.push('/expert');
        return;
      }
      
      if (email === 'duemme.mail@gmail.com' && password === '!LEIbniz2018') {
        localStorage.setItem('leo_mock_user', email);
        localStorage.setItem('leo_user_role', 'parent');
        router.push('/dashboard');
        return;
      }
    }
    
    // 2. Fallback to real Supabase Auth
    const { error: authError } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 overflow-hidden">
      {/* Hero Section */}
      <main className="relative pt-20 pb-32 px-6 flex flex-col items-center text-center">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-5xl leo-float shadow-2xl mb-8"
        >
          🦁
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-6xl font-extrabold tracking-tighter mb-4"
        >
          Ciao, sono Leo!
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-soft max-w-md mb-12"
        >
          L&apos;amico intelligente che aiuta il tuo bambino a crescere, parlare e scoprire il mondo.
        </motion.p>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card w-full max-w-md p-10 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6">
            {isRegistering ? 'Crea un account genitore' : 'Accedi all\'area riservata'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}
            
            <input 
              type="text"
              placeholder="Email o Nome Utente"
              className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
            
            <input 
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
            />

            <button type="submit" className="btn-leo btn-leo-primary w-full text-lg mt-4">
              {isRegistering ? 'Inizia Ora' : 'Entra'}
            </button>
          </form>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-6 text-sm font-bold text-blue-500 hover:text-blue-700 transition-colors"
          >
            {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </motion.div>
      </main>

      {/* Decorative Background */}
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-green-50 rounded-full blur-3xl opacity-50 -z-10"></div>
    </div>
  );
}
