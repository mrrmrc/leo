import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';
import { generateSystemPrompt } from '@/lib/ai/prompts';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
      const { image, childId, history } = await req.json();

      if (!childId || !image) {
        return new NextResponse('Child ID and image are required', { status: 400 });
      }

      // Retrieve child profile
      const { data: childProfile, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single();

      if (error || !childProfile) {
        return new NextResponse('Child not found', { status: 404 });
      }

      const basePrompt = generateSystemPrompt(childProfile);
      const visionPrompt = `${basePrompt}\n\nMODALITÀ VISIONE (Es. Supermercato, Cucina):\nOra stai guardando attraverso la fotocamera del bambino. Descrivi in modo semplice cosa vedi, fai una domanda o proponi un piccolo gioco/esercizio basato su ciò che vedi (es. "Vedo delle mele rosse! Riusciamo a trovare qualcosa di giallo?"). Ricorda di essere sempre incoraggiante e usare frasi brevi.`;

      const result = await generateText({
        model: openai('gpt-4o'),
        system: visionPrompt,
        messages: [
            ...history.map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })),
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Cosa vedi in questa immagine? Guidami!' },
                    { type: 'image', image: image } // The base64 data URL from react-webcam
                ]
            }
        ],
        temperature: 0.7,
      });

      return NextResponse.json({ reply: result.text });
  } catch (error) {
      console.error("Error in Vision API:", error);
      return new NextResponse('Internal Server Error', { status: 500 });
  }
}