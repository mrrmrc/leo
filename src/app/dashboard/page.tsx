'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import type { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [childProfiles, setChildProfiles] = useState<{ id: string; name: string; age: number; parent_id: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profiles, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id);

      if (!error && profiles) {
        setChildProfiles(profiles);
      }
    };

    fetchUserAndProfiles();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Leo - Area Genitori</h1>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold leading-tight text-gray-900">
              Profili dei Bambini
            </h2>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Aggiungi Profilo
            </Link>
          </div>

          {childProfiles.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-lg shadow">
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun profilo trovato</h3>
              <p className="mt-1 text-sm text-gray-500">
                Inizia creando un profilo per il tuo bambino.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Crea Profilo
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {childProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="relative flex flex-col items-center space-y-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-gray-400"
                >
                  <div className="flex-1 min-w-0 text-center">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-xl font-medium text-gray-900">{profile.name}</p>
                    <p className="truncate text-sm text-gray-500">{profile.age} anni</p>
                  </div>
                  <div className="mt-4 flex flex-col w-full space-y-2">
                     <Link
                        href={`/chat?childId=${profile.id}`}
                        className="w-full text-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
                     >
                       Gioca con Leo
                     </Link>
                     <Link
                        href={`/vision?childId=${profile.id}`}
                        className="w-full text-center rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-600"
                     >
                       Modalità Esplora
                     </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}