'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExpertDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('leo_user_role');
    if (role !== 'expert') {
      router.push('/');
      return;
    }
    setIsLoaded(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('leo_user_role');
    router.push('/');
  };

  if (!isLoaded) return <div className="flex justify-center items-center h-screen">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">LEO - Portale Medici</h1>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 font-medium transition-colors"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Pannello di Controllo</h2>
          <p className="mt-1 text-gray-500">Panoramica sui pazienti e progressi clinici.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="text-sm font-medium text-gray-500">Pazienti Attivi</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="bg-green-50 text-green-600 p-4 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">45</div>
              <div className="text-sm font-medium text-gray-500">Sessioni completate</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="text-sm font-medium text-gray-500">Aggiornamenti recenti</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Pazienti Recenti</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Vedi tutti</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {[
              { id: 1, name: 'Giulio', age: 6, diagnosis: 'Ritardo del linguaggio', date: 'Oggi' },
              { id: 2, name: 'Sofia', age: 4, diagnosis: 'Spettro autistico', date: 'Ieri' },
            ].map((patient) => (
              <li key={patient.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patient.name} <span className="text-sm text-gray-500 font-normal ml-2">{patient.age} anni</span></p>
                    <p className="text-sm text-gray-500">{patient.diagnosis}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{patient.date}</span>
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                    Vedi Scheda
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
