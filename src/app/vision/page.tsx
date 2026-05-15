// src/app/vision/page.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { generateVisionPrompt } from '@/lib/ai/prompts';
import { supabase } from '@/lib/supabase';
import { ChildProfile } from '@/types';
import { getPhpApiCandidates, postJsonWithFallback } from '@/lib/http';

import { Suspense, useEffect } from 'react';

function VisionContent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('Pronto ad aiutarvi! Cosa cerchiamo? 🍎');
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const router = useRouter();

  useEffect(() => {
    if (childId) {
      if (childId.startsWith('mock-')) {
        setProfile({
          id: childId,
          name: childId === 'mock-1' ? 'Giulio' : 'Sofia',
          age: childId === 'mock-1' ? 6 : 4,
          diagnosis: childId === 'mock-1' ? 'Ritardo del linguaggio' : 'Autismo lieve',
          special_interests: childId === 'mock-1' ? 'Dinosauri' : 'Musica',
          communication_level: childId === 'mock-1' ? 'basic' : 'non-verbal'
        });
      } else {
        supabase.from('child_profiles').select('*').eq('id', childId).single().then(({ data }) => setProfile(data));
      }
    }
  }, [childId]);

  const capture = useCallback(async () => {
    if (!webcamRef.current || !profile) return;
    setIsAnalyzing(true);
    setFeedback('Leo sta guardando... 🤔');

    const imageSrc = webcamRef.current.getScreenshot();
    const task = 'Trova le uova al supermercato';
    
    try {
      const data = await postJsonWithFallback<{ message?: string }>(
        getPhpApiCandidates('vision'),
        { 
          image: imageSrc, 
          childId, 
          task,
          systemPrompt: generateVisionPrompt(profile, task)
        },
      );
      setFeedback(data.message || 'Leo ha guardato l immagine, ma ha bisogno di un nuovo tentativo piu chiaro.');
    } catch {
      setFeedback('Ops, riproviamo! 🦁');
    } finally {
      setIsAnalyzing(false);
    }
  }, [webcamRef, childId, profile]);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Camera View */}
      <div className="relative flex-1">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
          videoConstraints={{ facingMode: 'environment' }}
        />
        
        {/* Overlays */}
        <div className="absolute top-6 left-6 right-6">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-6 bg-white/90 shadow-2xl"
          >
            <p className="text-xl font-bold text-blue-900 leading-tight">
              {feedback}
            </p>
          </motion.div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center px-10 gap-6">
           <button 
             onClick={() => router.back()}
             className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
           </button>
           
           <button
            onClick={capture}
            disabled={isAnalyzing}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
              isAnalyzing ? 'bg-gray-400' : 'bg-brand-primary'
            }`}
          >
            {isAnalyzing ? (
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VisionMode() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white">Caricamento...</div>}>
      <VisionContent />
    </Suspense>
  );
}
