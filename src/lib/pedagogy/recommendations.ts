import { ChildProfile } from '@/types';
import { EXERCISE_LIBRARY } from './exercises';

export type InternalApplicationRecommendation = {
  id: string;
  title: string;
  href: string;
  reason: string;
  priority: 'high' | 'medium';
  category: 'chat' | 'vision' | 'exercise';
};

function normalize(value?: string | null) {
  return (value || '').toLowerCase();
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

export function recommendInternalApplications(profile: Partial<ChildProfile> & Record<string, unknown>) {
  const diagnosis = normalize(profile.diagnosis as string | undefined);
  const communication = normalize((profile.communication_level as string | undefined) || (profile.comm_modality as string | undefined));
  const vocabularyGoals = normalize(profile.vocabulary_goals as string | undefined);
  const pronunciationGoals = normalize(profile.pronunciation_goals as string | undefined);
  const autonomyGoals = normalize(profile.autonomy_goals as string | undefined);
  const emotionalGoals = normalize(profile.emotional_regulation_goals as string | undefined);
  const attentionMinutes = Number(profile.attention_span_minutes ?? 0);
  const age = Number(profile.age ?? 0);

  const childId = typeof profile.id === 'string' ? profile.id : '';
  const routeParam = childId ? `?childId=${childId}` : '';

  const recommendations: InternalApplicationRecommendation[] = [
    {
      id: 'chat',
      title: 'Parla con Leo',
      href: `/chat${routeParam}`,
      reason: 'Base trasversale: conversazione guidata, spiegazioni brevi, scaffolding e scelta del prossimo passo.',
      priority: 'high',
      category: 'chat',
    },
  ];

  if (
    includesAny(communication, ['caa', 'assente', 'non-verbal', 'limitato']) ||
    includesAny(diagnosis, ['autismo', 'disturbo del linguaggio', 'disprass', 'intellett'])
  ) {
    recommendations.push(
      {
        id: 'caa-1',
        title: "CAA - Voglio l'Oggetto",
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=caa-1`,
        reason: 'Coerente con supporto AAC/CAA e richiesta funzionale attraverso simboli.',
        priority: 'high',
        category: 'exercise',
      },
      {
        id: 'caa-2',
        title: 'CAA - Costruisci la Frase',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=caa-2`,
        reason: 'Utile per combinare soggetto, azione e oggetto in forma multimodale.',
        priority: 'high',
        category: 'exercise',
      },
      {
        id: 'caa-3',
        title: 'CAA - Agenda Visiva',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=caa-3`,
        reason: 'Molto utile per routine, prevedibilita e riduzione del carico nelle transizioni.',
        priority: 'high',
        category: 'exercise',
      },
    );
  }

  if (
    includesAny(diagnosis, ['linguaggio', 'fonolog', 'articol', 'disfas', 'disprass']) ||
    includesAny(vocabularyGoals, ['parole', 'vocabol']) ||
    includesAny(pronunciationGoals, ['suoni', 'articol', 'fonos'])
  ) {
    recommendations.push(
      {
        id: 'verb-1',
        title: 'Produzione Verbale - Onomatopee',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=verb-1`,
        reason: 'Adatta per iniziare con output vocale semplice e fortemente supportato.',
        priority: 'high',
        category: 'exercise',
      },
      {
        id: 'verb-2',
        title: 'Produzione Verbale - Naming della Stanza',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=verb-2`,
        reason: 'Promuove generalizzazione lessicale in contesto reale.',
        priority: 'medium',
        category: 'exercise',
      },
    );
  }

  if (
    includesAny(diagnosis, ['adhd', 'attenzione', 'autismo', 'intellett']) ||
    attentionMinutes > 0 && attentionMinutes < 8 ||
    age > 0 && age < 7
  ) {
    recommendations.push(
      {
        id: 'att-1',
        title: 'Attenzione - Simon Dice',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=att-1`,
        reason: 'Buona per inibizione, turn taking e istruzione singola.',
        priority: 'high',
        category: 'exercise',
      },
      {
        id: 'att-2',
        title: 'Attenzione - Memory delle Immagini',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=att-2`,
        reason: 'Utile per matching, memoria visiva e carico cognitivo regolabile.',
        priority: 'medium',
        category: 'exercise',
      },
    );
  }

  if (
    includesAny(diagnosis, ['intellett', 'autonomia', 'autismo']) ||
    includesAny(autonomyGoals, ['spesa', 'routine', 'autonomia', 'generalizz'])
  ) {
    recommendations.push(
      {
        id: 'cog-1',
        title: 'Stimolazione Cognitiva - Super Puzzle',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=cog-1`,
        reason: 'Adatta per pianificazione visiva, incastro e problem solving graduato.',
        priority: 'medium',
        category: 'exercise',
      },
      {
        id: 'cog-2',
        title: 'Stimolazione Cognitiva - Ordina per Colore',
        href: `/chat${routeParam}${routeParam ? '&' : '?'}exId=cog-2`,
        reason: 'Utile per categorizzazione, regola semplice e rinforzo visivo.',
        priority: 'medium',
        category: 'exercise',
      },
    );

    recommendations.push({
      id: 'vision',
      title: 'Guarda con Leo',
      href: `/vision${routeParam}`,
      reason: 'Più adatta alla generalizzazione nel mondo reale con guida passo-passo.',
      priority: 'high',
      category: 'vision',
    });
  }

  if (includesAny(emotionalGoals, ['regolazione', 'ansia', 'emoz'])) {
    recommendations.push({
      id: 'stories',
      title: 'Chat narrativa guidata',
      href: `/chat${routeParam}${routeParam ? '&' : '?'}mode=story`,
      reason: 'Può sostenere regolazione, anticipazione e linguaggio emotivo con tono calmo.',
      priority: 'medium',
      category: 'chat',
    });
  }

  const unique = new Map<string, InternalApplicationRecommendation>();
  recommendations.forEach((recommendation) => {
    if (!unique.has(recommendation.id)) {
      unique.set(recommendation.id, recommendation);
    }
  });

  return Array.from(unique.values());
}

export function getExerciseById(exerciseId: string) {
  return EXERCISE_LIBRARY.find((exercise) => exercise.id === exerciseId) ?? null;
}
