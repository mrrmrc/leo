// src/app/play/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { EXERCISE_LIBRARY } from '@/lib/pedagogy/exercises';
import { recommendInternalApplications } from '@/lib/pedagogy/recommendations';
import { ChildProfile } from '@/types';

function ChoiceContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('leo_mock_children');
    const mockChildren: ChildProfile[] = stored ? JSON.parse(stored) : [];
    const found = mockChildren.find((c) => c.id === childId);
    setProfile(found ?? null);
  }, [childId]);

  if (!profile) return <div className="flex h-screen items-center justify-center font-bold text-blue-600 animate-pulse">Leo sta arrivando...</div>;

  // Filter activities based on doctor's assignment
  const assignedIds = profile.assigned_exercises || [];
  
  const recommendedApps = recommendInternalApplications(profile as ChildProfile & Record<string, unknown>);

  let activities: Array<{ id: string; title: string; icon: string; color: string; href: string; description: string; isDoctorPrescribed?: boolean; isRecommended?: boolean }> = recommendedApps.map((app) => ({
    id: app.id,
    title: app.title,
    icon: app.category === 'chat' ? '💬' : app.category === 'vision' ? '👁️' : '🎯',
    color: app.category === 'chat' ? 'bg-blue-500' : app.category === 'vision' ? 'bg-green-500' : 'bg-purple-500',
    href: app.href,
    description: app.reason,
    isRecommended: true,
  }));
  
  if (assignedIds.length > 0) {
    const assignedActivities = assignedIds.map((id: string) => {
      const ex = EXERCISE_LIBRARY.find(e => e.id === id);
      if (!ex) return null;
      return {
        id: ex.id,
        title: ex.name,
        icon: ex.area === 1 ? '👄' : ex.area === 2 ? '🌬️' : ex.area === 5 ? '🖼️' : '🎮',
        color: ex.area === 1 ? 'bg-orange-400' : ex.area === 2 ? 'bg-blue-400' : ex.area === 5 ? 'bg-purple-400' : 'bg-green-400',
        href: `/chat?childId=${childId}&exId=${ex.id}`,
        description: ex.objective,
        isDoctorPrescribed: true
      };
    }).filter(Boolean);

    activities = [...activities, ...assignedActivities as Array<{ id: string; title: string; icon: string; color: string; href: string; description: string; isDoctorPrescribed?: boolean }>];
  } else {
    activities = [
      ...activities,
      { id: 'stories', title: 'Storie Magiche', icon: '📚', color: 'bg-purple-500', href: `/chat?childId=${childId}&mode=story`, description: 'Inventiamo una storia insieme partendo dai tuoi interessi.' }
    ];
  }

  const uniqueActivities = Array.from(new Map(activities.map((activity) => [activity.id, activity])).values());

  return (
    <div className="min-h-screen bg-brand-soft p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Ciao {profile.name}! 👋</h1>
        <p className="text-xl text-blue-700 font-medium">Leo ti propone le attivita piu adatte e puoi sempre parlare liberamente con lui.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {uniqueActivities.map((act, i: number) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              href={act.href}
              className="block group relative overflow-hidden bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-blue-200 active:scale-95"
            >
              {act.isDoctorPrescribed && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md animate-pulse">
                  Prescritto dal Medico
                </div>
              )}
              {act.isRecommended && !act.isDoctorPrescribed && (
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  Consigliato da Leo
                </div>
              )}
              <div className={`w-20 h-20 ${act.color} rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                {act.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{act.title}</h2>
              <p className="text-gray-500 font-medium">{act.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => router.back()}
        className="mt-12 text-blue-600 font-bold flex items-center gap-2 hover:underline"
      >
        ← Torna ai genitori
      </button>
    </div>
  );
}

export default function PlayChoicePage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <ChoiceContent />
    </Suspense>
  );
}
