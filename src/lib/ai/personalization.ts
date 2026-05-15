// src/lib/ai/personalization.ts
import { ChildProfile } from '@/types';

export interface LeoConfiguration {
  modalita_attive: string[];
  modalita_consigliate: string[];
  modalita_da_nascondere: string[];
  prompt_da_usare: string[];
  livello_linguaggio: string;
  tono: string;
  lunghezza_risposte: string;
  uso_immagini: boolean;
  uso_audio: boolean;
  uso_scelte_binarie: boolean;
  livello_supervisione_adulto: string;
  attenzioni_specifiche: string[];
  motivazione_della_scelta: string;
}

/**
 * Advanced Pedagogical Personalization Engine for LEO
 */
export function getLeoPersonalization(profile: ChildProfile, context?: string, objective?: string): LeoConfiguration {
  const {
    age,
    communication_level,
    diagnosis,
    has_adhd,
    has_autism,
    noise_hypersensitivity,
    visual_sensitivity,
    attention_span_minutes,
    autonomy_goals,
    turn_taking_goals,
    emotional_triggers
  } = profile;

  let config: LeoConfiguration = {
    modalita_attive: ['chat'],
    modalita_consigliate: [],
    modalita_da_nascondere: [],
    prompt_da_usare: ['BASE_PEDAGOGICAL_RULES'],
    livello_linguaggio: 'semplice',
    tono: 'gentile e motivante',
    lunghezza_risposte: 'brevi',
    uso_immagini: true,
    uso_audio: true,
    uso_scelte_binarie: false,
    livello_supervisione_adulto: 'media',
    attenzioni_specifiche: [],
    motivazione_della_scelta: ''
  };

  const motivations: string[] = [];

  // 1. Diagnosis & Specialized Supports
  const diag = diagnosis?.toLowerCase() || '';
  
  if (has_autism || diag.includes('autismo')) {
    config.prompt_da_usare.push('AUTISM_SUPPORT');
    config.tono = 'calmo, concreto e prevedibile';
    config.uso_scelte_binarie = true;
    config.attenzioni_specifiche.push("Struttura Prima/Poi/Dopo", "No metafore");
    motivations.push("Profilo autismo: attivazione routine di prevedibilità e linguaggio letterale.");
  }

  if (has_adhd || diag.includes('adhd') || (attention_span_minutes && attention_span_minutes < 5)) {
    config.prompt_da_usare.push('ADHD_SUPPORT');
    config.lunghezza_risposte = 'brevissime';
    config.uso_scelte_binarie = true;
    config.attenzioni_specifiche.push("Micro-missioni", "Rinforzo immediato");
    motivations.push("Difficoltà di attenzione: scomposizione in micro-task e feedback istantaneo.");
  }

  if (diag.includes('linguaggio') || diag.includes('logopedia') || communication_level === 'non-verbal') {
    config.prompt_da_usare.push('SPEECH_SUPPORT');
    config.livello_linguaggio = 'basale';
    config.attenzioni_specifiche.push("Modelling (espansione)", "Frasi da imitare");
    motivations.push("Difficoltà comunicative: attivazione modelli di linguaggio e supporto AAC.");
  }

  if (diag.includes('ansia') || emotional_triggers) {
    config.prompt_da_usare.push('EMOTIONAL_SUPPORT');
    config.tono = 'estremamente rassicurante';
    config.attenzioni_specifiche.push("Validazione emotiva", "Via d'uscita sicura");
    motivations.push("Profilo ansioso/vulnerabile: focus su sicurezza e regolazione.");
  }

  if (diag.includes('dislessia') || diag.includes('lettura')) {
    config.prompt_da_usare.push('READING_SUPPORT');
    config.attenzioni_specifiche.push("Testi atomizzati", "Priorità audio");
    motivations.push("Difficoltà di lettura: riduzione del carico testuale e sintesi vocale.");
  }

  if (diag.includes('sociale') || turn_taking_goals) {
    config.prompt_da_usare.push('SOCIAL_SUPPORT');
    config.modalita_consigliate.push('role_play');
    config.attenzioni_specifiche.push("Turni conversazionali", "Riconoscimento emozioni");
    motivations.push("Difficoltà sociali: attivazione simulazioni role-play.");
  }

  // 2. Age & Development
  if (age < 5) {
    config.livello_linguaggio = 'basale';
    config.lunghezza_risposte = 'brevissime';
    config.livello_supervisione_adulto = 'alta';
    motivations.push(`Età prescolare (${age} anni): richiede massima semplicità.`);
  }

  // 3. Sensory
  if (noise_hypersensitivity) {
    config.uso_audio = false;
    config.attenzioni_specifiche.push("Audio disattivato (Ipersensibilità)");
  }

  // 4. Context & Objectives
  if (context?.toLowerCase().includes('supermercato') || autonomy_goals?.toLowerCase().includes('spesa')) {
    config.modalita_attive.push('vision');
    config.modalita_consigliate.push('supermarket_mode');
    motivations.push("Contesto/Obiettivo reale: attivazione visione AI.");
  }

  config.motivazione_della_scelta = motivations.join(' ');

  return config;
}
