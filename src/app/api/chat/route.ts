import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';
import { generateSystemPrompt } from '@/lib/ai/prompts';
import { NextRequest } from 'next/server';
import { ChildProfile } from '@/types';

export const runtime = 'nodejs';

function buildFallbackReply(
  lastUserMessage: string,
  childProfile: ChildProfile,
  isExerciseMode: boolean,
): string {
  const name = childProfile.name || 'amico';

  if (isExerciseMode) {
    return [
      `Ciao ${name}, facciamo un passo alla volta.`,
      `Hai scritto: "${lastUserMessage}".`,
      'Ti aiuto cosi:',
      '1. Fermiamoci su una sola azione.',
      '2. La facciamo insieme con parole semplici.',
      '3. Poi controlliamo se vuoi ripetere o passare oltre.',
      'Dimmi se preferisci: spiegazione, esempio, oppure prossimo passo.',
    ].join('\n');
  }

  return [
    `Ciao ${name}, sono qui con te.`,
    `Ho letto: "${lastUserMessage}".`,
    'Possiamo continuare in modo semplice e umano.',
    'Se vuoi, posso:',
    '1. ascoltarti,',
    '2. aiutarti a scegliere un attivita,',
    '3. guidarti con un solo passo alla volta.',
    'Dimmi da quale di queste tre cose vuoi partire.',
  ].join('\n');
}

export async function POST(req: NextRequest) {
  const { messages, childId, systemPrompt: overridePrompt } = await req.json();

  // Retrieve child profile
  let childProfile: ChildProfile | null = null;

  if (!childId) {
    childProfile = {
      id: 'default-chat',
      name: 'amico',
      age: 8,
      diagnosis: 'Profilo non specificato',
      communication_level: 'supportato',
      special_interests: 'gioco, curiosita, scoperta',
      emotional_triggers: 'Da osservare con calma',
      school_support: 'Da definire con il caregiver',
    };
  } else if (childId.startsWith('mock-')) {
    childProfile = {
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
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .single();
    
    if (error || !data) {
      return new Response('Child not found', { status: 404 });
    }
    childProfile = data;
  }

  if (!childProfile) {
    return new Response('Child not found', { status: 404 });
  }

  const systemPrompt = typeof overridePrompt === 'string' && overridePrompt.trim()
    ? overridePrompt
    : generateSystemPrompt(childProfile);

  const lastUserMessage = Array.isArray(messages)
    ? [...messages].reverse().find((message) => message?.role === 'user')?.content ?? ''
    : '';

  if (!process.env.OPENAI_API_KEY) {
    return new Response(buildFallbackReply(lastUserMessage, childProfile, systemPrompt.toLowerCase().includes('esercizio')), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return new Response(result.text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response(buildFallbackReply(lastUserMessage, childProfile, systemPrompt.toLowerCase().includes('esercizio')), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
