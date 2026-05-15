'use client';

import PedagogicalForm from '@/components/PedagogicalForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
         <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-bold">
            ← Torna alla Dashboard
         </Link>
         <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">Nuovo Profilo Bambino</h1>
         <p className="mt-2 text-gray-600">Compila questo form dettagliato. I dati aiuteranno Leo ad adattarsi perfettamente alle esigenze del bambino.</p>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PedagogicalForm onSuccess={() => router.push('/dashboard')} />
      </div>
    </div>
  );
}