import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { supabase } from '@/lib/supabase';
import { generateSystemPrompt } from '@/lib/ai/prompts';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { messages, childId } = await req.json();

  if (!childId) {
    return new Response('Child ID is required', { status: 400 });
  }

  // Retrieve child profile
  const { data: childProfile, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .single();

  if (error || !childProfile) {
    return new Response('Child not found', { status: 404 });
  }

  const systemPrompt = generateSystemPrompt(childProfile);

  const result = await streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages,
    temperature: 0.7, // Balances creativity with consistency
  });

  return result.toTextStreamResponse();
}