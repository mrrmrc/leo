'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mock Authentication
    if (username === 'duemme.mail@gmail.com' && password === '!LEIbniz2018') {
      localStorage.setItem('leo_user_role', 'parent');
      router.push('/dashboard');
      return;
    }

    if (username === 'medico' && password === 'medico') {
      localStorage.setItem('leo_user_role', 'expert');
      router.push('/expert');
      return;
    }

    setError('Credenziali non valide. Riprova.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-blue-900 via-blue-100 to-blue-900 px-4">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Portale LEO
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Accesso riservato a genitori ed esperti
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100 animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email o Username
              </label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white/50 focus:bg-white"
                placeholder="es. nome@email.com o medico"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white/50 focus:bg-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all hover:scale-[1.02] active:scale-95"
          >
            Accedi all'area riservata
          </button>
        </form>
      </div>
    </div>
  );
}
