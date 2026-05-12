'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Il nome deve avere almeno 2 caratteri'),
  age: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().min(1).max(18)) as unknown as z.ZodNumber,
  diagnosis: z.string().optional(),
  communication_level: z.string().optional(),

  // Difficulties
  phonetic_errors: z.string().optional(),
  language_delays: z.string().optional(),
  cognitive_difficulties: z.string().optional(),
  adhd: z.boolean().optional().default(false),
  autism: z.boolean().optional().default(false),
  attention_span: z.coerce.number().optional(),

  // Sensory
  noise_hypersensitivity: z.boolean().optional().default(false),
  visual_sensitivity: z.boolean().optional().default(false),
  emotional_triggers: z.string().optional(),

  // Strengths
  special_interests: z.string().optional(),
  favorite_games: z.string().optional(),
  favorite_activities: z.string().optional(),
  motivations: z.string().optional(),

  // Goals
  vocabulary_goals: z.string().optional(),
  turn_taking_goals: z.string().optional(),
  autonomy_goals: z.string().optional(),
  emotional_regulation_goals: z.string().optional(),
  pronunciation_goals: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PedagogicalForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adhd: false,
      autism: false,
      noise_hypersensitivity: false,
      visual_sensitivity: false,
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        setError("Devi essere loggato per salvare un profilo.");
        setIsSubmitting(false);
        return;
    }

    const { error: insertError } = await supabase
      .from('child_profiles')
      .insert([
        {
          parent_id: user.id,
          ...data
        }
      ]);

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow max-w-4xl mx-auto">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Dati Base</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Età</label>
            <input type="number" {...register('age')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosi (opzionale)</label>
            <input {...register('diagnosis')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Livello Comunicativo</label>
            <input {...register('communication_level')} placeholder="es. non verbale, frasi brevi" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
        </div>
      </div>

      <hr />

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Difficoltà</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Errori Fonetici</label>
            <textarea {...register('phonetic_errors')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Ritardi Linguistici</label>
            <textarea {...register('language_delays')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center">
                <input type="checkbox" {...register('adhd')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label className="ml-2 block text-sm text-gray-900">ADHD</label>
             </div>
             <div className="flex items-center">
                <input type="checkbox" {...register('autism')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label className="ml-2 block text-sm text-gray-900">Autismo</label>
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tempi di attenzione (minuti)</label>
            <input type="number" {...register('attention_span')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
        </div>
      </div>

      <hr />

       <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Sensorialità</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div className="flex items-center space-x-4">
             <div className="flex items-center">
                <input type="checkbox" {...register('noise_hypersensitivity')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label className="ml-2 block text-sm text-gray-900">Ipersensibilità rumori</label>
             </div>
             <div className="flex items-center">
                <input type="checkbox" {...register('visual_sensitivity')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label className="ml-2 block text-sm text-gray-900">Sensibilità visiva</label>
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trigger Emotivi</label>
            <textarea {...register('emotional_triggers')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
        </div>
      </div>

      <hr />

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Punti di Forza</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Interessi Speciali</label>
            <input {...register('special_interests')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giochi Preferiti</label>
            <input {...register('favorite_games')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
        </div>
      </div>

       <hr />

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Obiettivi Educativi</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Vocabolario</label>
            <textarea {...register('vocabulary_goals')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Regolazione Emotiva</label>
            <textarea {...register('emotional_regulation_goals')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Profilo'}
          </button>
        </div>
      </div>
    </form>
  );
}