// src/app/api/vision/route.ts
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { supabase } from '@/lib/supabase';
import { generateVisionPrompt } from '@/lib/ai/prompts';
import { NextRequest } from 'next/server';
import { ChildProfile } from '@/types';
import { z } from 'zod';

export const runtime = 'nodejs';

function buildFallbackVisionReply(task: string) {
  return {
    message: `Sto ancora aiutandoti con questa missione: ${task}. Per adesso guardiamo una cosa alla volta: colore, forma e posizione. Se vuoi, scatta una nuova immagine piu vicina.`,
    objectFound: false,
    safetyWarning: '',
  };
}

export async function POST(req: NextRequest) {
  const { image, childId, task } = await req.json();

  if (!childId || !image) {
    return new Response('Child ID and image are required', { status: 400 });
  }

  // 1. Fetch profile
  let profile: ChildProfile | null = null;
  if (childId.startsWith('mock-')) {
    profile = {
      id: childId,
      name: childId === 'mock-1' ? 'Giulio' : 'Sofia',
      age: childId === 'mock-1' ? 6 : 4,
      diagnosis: childId === 'mock-1' ? 'Ritardo del linguaggio' : 'Autismo lieve',
      special_interests: childId === 'mock-1' ? 'Dinosauri' : 'Musica',
      communication_level: childId === 'mock-1' ? 'basic' : 'non-verbal',
      has_adhd: childId === 'mock-1',
      has_autism: childId === 'mock-2'
    };
  } else {
    const { data } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .single();
    profile = data;
  }

  if (!profile) return new Response('Profile not found', { status: 404 });

  // 2. Build instructions
  const systemPrompt = generateVisionPrompt(profile, task);

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(buildFallbackVisionReply(task));
  }

  // 3. Analyze image with GPT-4o Vision
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        message: z.string().describe('Gentle, supportive feedback for the child based on what is seen'),
        objectFound: z.boolean().describe('Whether the target object was identified'),
        safetyWarning: z.string().optional().describe('Any immediate safety concern (e.g., sharp object nearby)')
      }),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Sto guardando questo. Ho trovato ${task}?` },
            { type: 'image', image }
          ],
        },
      ],
    });

    return Response.json(result.object);
  } catch {
    return Response.json(buildFallbackVisionReply(task));
  }
}
