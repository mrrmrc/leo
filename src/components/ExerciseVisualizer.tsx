'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Exercise } from '@/lib/pedagogy/exercises';

type InteractionPayload =
  | { type: 'caa'; value: string }
  | { type: 'coach'; value: string };

interface Props {
  exercise: Exercise;
  onInteraction?: (data: InteractionPayload) => void;
}

export default function ExerciseVisualizer({ exercise, onInteraction }: Props) {
  const [micLevel, setMicLevel] = useState(0);
  const [ballPos, setBallPos] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number | null>(null);

  const hasCamera = exercise.tools.includes('camera');
  const hasMic = exercise.tools.includes('mic');
  const hasTouch = exercise.tools.includes('touch');

  useEffect(() => {
    let mounted = true;
    const mediaStreams: MediaStream[] = [];

    const startCamera = async () => {
      if (!hasCamera) {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreams.push(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access error:', error);
      }
    };

    const startMic = async () => {
      if (!hasMic) {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreams.push(stream);
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          if (!analyserRef.current) {
            return;
          }

          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalized = Math.min(average * 1.5, 255);
          setMicLevel(normalized);

          if (exercise.id === 'oro-2' && normalized > 30) {
            setBallPos((current) => Math.min(current + normalized / 50, 100));
          }

          frameRef.current = requestAnimationFrame(update);
        };

        update();
      } catch (error) {
        console.error('Mic access error:', error);
      }
    };

    void startCamera();
    void startMic();

    return () => {
      mounted = false;
      mediaStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      audioContextRef.current?.close();
      analyserRef.current = null;
    };
  }, [exercise, hasCamera, hasMic]);

  const coachActions = useMemo(
    () => [
      `Spiegami come fare ${exercise.name} con un linguaggio molto semplice.`,
      `Dammi un esempio pratico per ${exercise.name}.`,
      'Controlla se ho capito il passaggio precedente.',
    ],
    [exercise.name],
  );

  return (
    <div className="relative w-full min-h-[420px] bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
      {hasCamera && (
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
      )}

      {!hasCamera && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="absolute top-4 left-4 right-4 glass-card p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">Area {exercise.area}</span>
          {exercise.tools.map((tool) => (
            <span key={tool} className="px-3 py-1 rounded-full bg-white text-slate-700 text-[10px] font-bold uppercase">
              {tool}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-black text-blue-900">{exercise.name}</h3>
        <p className="text-sm text-slate-600 mt-1">{exercise.objective}</p>
      </div>

      {exercise.id === 'caa-2' && exercise.symbols && (
        <div className="absolute inset-x-6 top-28 bottom-24 bg-white/95 rounded-[2rem] p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Persone', color: 'bg-blue-500', items: exercise.symbols.people },
              { title: 'Azioni', color: 'bg-red-500', items: exercise.symbols.actions },
              { title: 'Oggetti', color: 'bg-yellow-400', items: exercise.symbols.objects },
            ].map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="text-[11px] font-black uppercase text-center text-slate-500">{section.title}</p>
                {section.items.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onInteraction?.({ type: 'caa', value: item.name })}
                    className={`${section.color} aspect-square rounded-3xl flex flex-col items-center justify-center text-white shadow-lg w-full`}
                  >
                    <span className="text-4xl mb-2">{item.icon}</span>
                    <span className="text-[10px] font-black">{item.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {exercise.id === 'oro-2' && (
        <div className="absolute inset-x-8 bottom-28 pointer-events-none">
          <div className="relative">
            <div className="h-3 w-full bg-white/15 rounded-full" />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-blue-500"
              animate={{ left: `${ballPos}%` }}
              transition={{ type: 'spring', damping: 20 }}
            >
              ⚽
            </motion.div>
          </div>
        </div>
      )}

      {hasMic && (
        <div className="absolute inset-x-8 bottom-16">
          <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-blue-400"
              animate={{ width: `${(micLevel / 255) * 100}%` }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </div>
          <p className="text-white text-[10px] font-black uppercase tracking-widest text-center opacity-80">
            {exercise.id === 'oro-2' ? 'Soffia forte per muovere la palla.' : 'Leo ascolta intensita, ritmo e partecipazione.'}
          </p>
        </div>
      )}

      {hasTouch && exercise.id !== 'caa-2' && (
        <div className="absolute left-6 right-6 bottom-20 glass-card p-4">
          <p className="text-sm font-black text-blue-900 mb-2">Guida AI per questa attivita</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {coachActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => onInteraction?.({ type: 'coach', value: action })}
                className="px-3 py-3 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors text-left"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasTouch && (
        <div className="absolute left-6 right-6 bottom-20 glass-card p-4">
          <p className="text-sm font-black text-blue-900 mb-1">Leo guida l attivita in tempo reale</p>
          <p className="text-sm text-slate-600">
            Segui un solo passaggio alla volta. Se vuoi, chiedi a Leo di semplificare, ripetere o mostrarti un esempio.
          </p>
        </div>
      )}
    </div>
  );
}
