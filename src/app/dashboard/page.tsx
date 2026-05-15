// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PedagogicalForm from '@/components/PedagogicalForm';

export default function ParentDashboard() {
  const [children, setChildren] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    
    // Check for Mock User first
    const mockUserEmail = localStorage.getItem('leo_user_email');
    const stored = localStorage.getItem('leo_mock_children');
    let mockChildren = stored ? JSON.parse(stored) : [];

    if (mockUserEmail) {
      // Filter children by parent_email if we have a logged in email
      mockChildren = mockChildren.filter((c: any) => c.parent_email === mockUserEmail || !c.parent_email);
    }
    
    setChildren(mockChildren);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Leo sta preparando la cameretta... 🧸</div>;

  return (
    <div className="min-h-screen bg-brand-soft pb-32">
      <header className="p-8 bg-white/50 backdrop-blur-md">
        <h1 className="text-4xl font-extrabold text-blue-900">Bentornato! 👋</h1>
        <p className="text-soft mt-1">Ecco come sta crescendo il tuo piccolo.</p>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {showForm ? (
          <div>
            <button onClick={() => setShowForm(false)} className="mb-6 text-sm font-bold text-blue-600 flex items-center gap-2">
              ← Torna alla dashboard
            </button>
            <PedagogicalForm onSuccess={() => { setShowForm(false); fetchData(); }} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">Profili Attivi</h2>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold shadow-sm border border-blue-100 hover:bg-blue-50 transition-all"
              >
                + Aggiungi bambino
              </button>
            </div>

            {children.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">🧸</div>
                <h3 className="text-xl font-bold mb-2">Ancora nessun profilo</h3>
                <p className="text-soft mb-8">Crea il primo profilo per iniziare il percorso educativo con Leo.</p>
                <button onClick={() => setShowForm(true)} className="btn-leo btn-leo-primary">
                  Crea Profilo Ora
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {children.map(child => (
                  <div key={child.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
                        👶
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-blue-900">{child.name}</h3>
                        <p className="text-soft font-medium">{child.age} anni • {child.diagnosis || 'Sviluppo generale'}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <Link 
                        href={`/play?childId=${child.id}`}
                        className="flex-1 md:flex-none px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-lg text-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        Inizia a giocare 🦁✨
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile-first Nav fallback */}
      {!showForm && (
        <nav className="mobile-nav">
          <Link href="/dashboard" className="nav-item active">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <div className="nav-item opacity-40">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Progressi
          </div>
          <div className="nav-item opacity-40">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Impostazioni
          </div>
        </nav>
      )}
    </div>
  );
}