'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseVisualizer from '@/components/ExerciseVisualizer';
import { EXERCISE_LIBRARY, type Exercise } from '@/lib/pedagogy/exercises';
import { generateSystemPrompt } from '@/lib/ai/prompts';
import { ChildProfile } from '@/types';
import { extractAssistantText, getPhpApiCandidates, postJsonWithFallback } from '@/lib/http';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type VisualizerInteraction =
  | { type: 'caa'; value: string }
  | { type: 'coach'; value: string };

type SpeechRecognitionEventResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onstart: null | (() => void);
  onend: null | (() => void);
  onresult: null | ((event: SpeechRecognitionEventResult) => void);
  start: () => void;
  stop?: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const GENERIC_PROFILE: ChildProfile = {
  id: 'default-chat',
  name: 'amico',
  age: 8,
  diagnosis: 'Profilo non specificato',
  communication_level: 'supportato',
  special_interests: 'gioco, curiosita, scoperta',
  school_support: 'Da definire con il caregiver',
  emotional_triggers: 'Da osservare con calma',
};

const WELCOME_MESSAGE = 'Ciao! Sono Leo. Possiamo parlare, giocare, fare esercizi o esplorare il mondo insieme. Dimmi da dove vuoi iniziare.';

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function getStoredProfile(childId: string | null): ChildProfile | null {
  if (typeof window === 'undefined' || !childId) {
    return null;
  }

  const stored = localStorage.getItem('leo_mock_children');
  const mockChildren: ChildProfile[] = stored ? JSON.parse(stored) : [];
  const found = mockChildren.find((child) => child.id === childId);
  return found ?? null;
}

function pickBestItalianVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const scored = voices
    .filter((voice) => voice.lang.toLowerCase().startsWith('it'))
    .map((voice) => {
      const name = voice.name.toLowerCase();
      let score = 0;

      if (name.includes('natural')) score += 5;
      if (name.includes('premium')) score += 4;
      if (name.includes('enhanced')) score += 4;
      if (name.includes('neural')) score += 4;
      if (name.includes('elsa')) score += 3;
      if (name.includes('alice')) score += 3;
      if (name.includes('luca')) score += 3;
      if (name.includes('cosimo')) score += 3;
      if (name.includes('microsoft')) score += 2;
      if (name.includes('google')) score += 2;
      if (voice.localService) score += 1;

      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice ?? null;
}

function splitForSpeech(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function buildLocalAssistantReply(
  userText: string,
  profile: ChildProfile | null,
  exercise: Exercise | null,
): string {
  const name = profile?.name || 'amico';
  const normalized = userText.toLowerCase();

  if (exercise) {
    if (exercise.id === 'caa-2') {
      return `Ciao ${name}, facciamolo insieme. Scegli prima la persona. Poi scegli l azione. Infine scegli la cosa. Se vuoi, posso anche darti un esempio completo.`;
    }

    if (exercise.id === 'caa-1') {
      return `Ciao ${name}, guarda poche opzioni alla volta e tocca il simbolo di quello che vuoi. Se sei indeciso, Leo puo proporti due scelte soltanto.`;
    }

    return `Ciao ${name}, lavoriamo su ${exercise.name}. Facciamo un solo passo alla volta: ${exercise.instructions[0]}. Se vuoi, posso spiegarti meglio o darti un esempio semplice.`;
  }

  if (normalized.includes('come stai') || normalized.includes('ciao leo')) {
    return `Ciao ${name}, sto bene e sono qui con te. Possiamo parlare, scegliere un attivita oppure fare un piccolo esercizio insieme.`;
  }

  if (normalized.includes('attivita') || normalized.includes('scegliere')) {
    return `Per iniziare bene ti proporrei tre strade semplici: parlare con Leo, fare una attivita di comunicazione, oppure esplorare qualcosa con la fotocamera. Dimmi quale vuoi provare.`;
  }

  return `Ti ascolto, ${name}. Continuiamo con calma: dimmi cosa vuoi fare, oppure chiedimi di proporti la prossima attivita giusta per te.`;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const exId = searchParams.get('exId');
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceUnlocked, setIsVoiceUnlocked] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [adminTraining] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return localStorage.getItem('leo_ai_training') || '';
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const speechQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    const refreshVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const foundExercise = exId ? EXERCISE_LIBRARY.find((item) => item.id === exId) ?? null : null;
    setExercise(foundExercise);
  }, [exId]);

  useEffect(() => {
    const nextProfile = getStoredProfile(childId);
    setProfile(nextProfile ?? (childId ? { ...GENERIC_PROFILE, id: childId, name: 'amico' } : GENERIC_PROFILE));
  }, [childId]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const welcome = exercise
      ? `Ciao ${profile.name}! Oggi lavoriamo insieme su ${exercise.name}. ${exercise.instructions[0]}`
      : WELCOME_MESSAGE;

    setMessages([createMessage('assistant', welcome)]);
  }, [exercise, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const systemPrompt = useMemo(() => {
    const baseProfile = profile ?? GENERIC_PROFILE;
    const context = exercise ? `Esercizio guidato: ${exercise.name}` : 'Chat libera orientata alla persona';
    const activity = exercise
      ? [
          `OBIETTIVO: ${exercise.objective}`,
          'ISTRUZIONI:',
          ...exercise.instructions.map((instruction, index) => `${index + 1}. ${instruction}`),
          `VARIANTE BASE: ${exercise.variants.level1}`,
          'COMPITO DI LEO: guida la persona passo per passo, verifica la comprensione e proponi un solo step alla volta.',
        ].join('\n')
      : 'COMPITO DI LEO: comportati come una chat sempre disponibile, calda, pratica e molto orientata ai bisogni della persona che ti sta usando. Fai domande brevi, ascolta e proponi aiuto concreto.';

    return generateSystemPrompt(baseProfile, context, activity, adminTraining);
  }, [adminTraining, exercise, profile]);

  const speakText = useCallback(
    (text: string) => {
      if (!isVoiceEnabled || !isVoiceUnlocked || typeof window === 'undefined' || !text.trim()) {
        return;
      }

      window.speechSynthesis.cancel();
      speechQueueRef.current = [];

      const bestVoice = pickBestItalianVoice(voices);
      const chunks = splitForSpeech(text);

      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = 'it-IT';
        utterance.rate = 0.92;
        utterance.pitch = 1.02;
        utterance.volume = 1;

        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        if (index === chunks.length - 1) {
          utterance.onend = () => {
            if (isHandsFree) {
              window.setTimeout(() => {
                const recognition = recognitionRef.current;
                if (!recognition) {
                  return;
                }
                recognition.start();
              }, 700);
            }
          };
        }

        speechQueueRef.current.push(utterance);
      });

      speechQueueRef.current.forEach((utterance) => window.speechSynthesis.speak(utterance));
    },
    [isHandsFree, isVoiceEnabled, isVoiceUnlocked, voices],
  );

  const unlockVoice = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'it-IT';

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsVoiceUnlocked(true);
    } catch {
      setIsVoiceUnlocked(false);
    }
  }, []);

  const confirmVoicePlayback = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.setTimeout(() => {
      if (isVoiceEnabled) {
        speakText('Ciao, ora dovresti sentirmi. Possiamo iniziare insieme.');
      }
    }, 250);
  }, [isVoiceEnabled, speakText]);

  const sendMessage = useCallback(
    async (rawContent?: string) => {
      const content = (rawContent ?? input).trim();
      if (!content || isLoading) {
        return;
      }

      const userMessage = createMessage('user', content);
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput('');
      setIsLoading(true);

      try {
        const payload = await postJsonWithFallback<{ text?: string; message?: string; choices?: Array<{ message?: { content?: string } }> }>(
          getPhpApiCandidates('chat'),
          {
            childId,
            messages: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            systemPrompt,
          },
        );
        const assistantText = extractAssistantText(payload) || 'Sono qui con te. Riproviamo insieme con un passo ancora piu semplice.';
        const assistantMessage = createMessage('assistant', assistantText);
        setMessages((current) => [...current, assistantMessage]);
        speakText(assistantText);
      } catch {
        const fallbackText = buildLocalAssistantReply(content, profile, exercise);
        setMessages((current) => [
          ...current,
          createMessage('assistant', fallbackText),
        ]);
        speakText(fallbackText);
      } finally {
        setIsLoading(false);
      }
    },
    [childId, exercise, input, isLoading, messages, profile, speakText, systemPrompt],
  );

  const startListening = useCallback(() => {
    if (isListening) {
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() || '';
      if (!transcript) {
        return;
      }

      setInput(transcript);

      if (isHandsFree) {
        void sendMessage(transcript);
      }
    };

    recognition.start();
  }, [isHandsFree, isListening, sendMessage]);

  const handleVisualizerInteraction = useCallback(
    (data: VisualizerInteraction) => {
      void sendMessage(data.value);
    },
    [sendMessage],
  );

  const quickPrompts = useMemo(() => {
    if (exercise) {
      return [
        `Spiegami con calma come fare ${exercise.name}.`,
        `Fammi un esempio semplice per ${exercise.name}.`,
        'Dimmi solo il prossimo passo.',
      ];
    }

    return [
      'Parliamo un po insieme.',
      'Aiutami a scegliere un attivita giusta per oggi.',
      'Fammi una domanda semplice per iniziare.',
    ];
  }, [exercise]);

  const currentName = profile?.name || 'amico';

  return (
    <div className="flex flex-col h-screen bg-brand-soft">
      <header className="p-6 bg-white/70 backdrop-blur-md border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl leo-float shadow-lg">
            🦁
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-blue-900">Leo</h1>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest truncate">
              {exercise ? `${exercise.name} con ${currentName}` : `Chat personale con ${currentName}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              unlockVoice();
              setIsHandsFree((current) => {
                const next = !current;
                if (next) {
                  setIsVoiceEnabled(true);
                  confirmVoicePlayback();
                }
                return next;
              });
            }}
            className={`px-4 h-12 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm ${isHandsFree ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-orange-500 border border-orange-100'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isHandsFree ? 'bg-white animate-pulse' : 'bg-orange-500'}`} />
            {isHandsFree ? 'VIVAVOCE ATTIVO' : 'ATTIVA VIVAVOCE'}
          </button>

          <button
            onClick={() => {
              unlockVoice();
              setIsVoiceEnabled((current) => {
                const next = !current;
                if (next) {
                  confirmVoicePlayback();
                }
                return next;
              });
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isVoiceEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
            aria-label="Attiva o disattiva la voce"
          >
            {isVoiceEnabled ? '🔊' : '🔈'}
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {exercise && (
          <div className="max-w-4xl mx-auto space-y-4">
            <ExerciseVisualizer exercise={exercise} onInteraction={handleVisualizerInteraction} />
            <div className="glass-card p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">Aiuto rapido di Leo</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!exercise && (
          <div className="max-w-4xl mx-auto glass-card p-4">
            <p className="text-sm font-bold text-blue-900 mb-2">Chat libera orientata alla persona</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                onClick={() => {
                  if (message.role === 'assistant') {
                    speakText(message.content);
                  }
                }}
                className={`max-w-[85%] p-5 rounded-3xl shadow-sm text-lg font-medium leading-relaxed cursor-pointer transition-all ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-blue-900 rounded-tl-none border border-blue-50'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(isLoading || isListening) && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-3xl flex gap-2 ${isListening ? 'bg-orange-100' : 'bg-white animate-pulse'}`}>
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-orange-500 animate-bounce' : 'bg-blue-300'}`} />
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-orange-500 animate-bounce delay-75' : 'bg-blue-300'}`} />
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-orange-500 animate-bounce delay-150' : 'bg-blue-300'}`} />
              {isListening && <span className="text-xs font-bold text-orange-600 ml-2">LEO TI ASCOLTA...</span>}
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 bg-white/85 backdrop-blur-lg border-t pb-10">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <button
            type="button"
            onClick={startListening}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-transform ${isListening ? 'bg-orange-500 text-white' : 'bg-gray-100 text-blue-600'}`}
          >
            🎙️
          </button>
          <input
            className="flex-1 p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-lg shadow-inner"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={isHandsFree ? 'Leo ti ascolta... parla pure.' : 'Scrivi a Leo come faresti in una vera chat.'}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg disabled:opacity-50"
          >
            ➤
          </button>
        </form>
      </footer>
    </div>
  );
}

export default function LeoChat() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Caricamento...</div>}>
      <ChatContent />
    </Suspense>
  );
}
