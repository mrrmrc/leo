export interface Exercise {
  id: string;
  area: number;
  name: string;
  objective: string;
  materials: string[];
  duration: string;
  instructions: string[];
  variants: {
    level1: string;
    level2: string;
    level3: string;
  };
  tools: ('camera' | 'mic' | 'touch')[];
  symbols?: {
    people: { name: string; color: string; icon: string }[];
    actions: { name: string; color: string; icon: string }[];
    objects: { name: string; color: string; icon: string }[];
  };
}

// Curated therapeutic core:
// We intentionally keep only applications that are easier to justify as
// assistive/rehabilitative MVP tools with a clearer functional target.
export const EXERCISE_LIBRARY: Exercise[] = [
  // AREA 3 — ATTENZIONE E COMPRENSIONE
  {
    id: 'att-1',
    area: 3,
    name: 'Simon Dice',
    objective: 'Seguire un istruzione alla volta, lavorando su attenzione, inibizione e turn taking.',
    materials: ['Nessuno'],
    duration: '10 min',
    instructions: [
      'Ascolta una sola consegna per volta.',
      'Esegui il gesto solo quando Leo dice "Simon dice".',
      'Se hai un dubbio, fermati e chiedi a Leo di ripetere.',
    ],
    variants: {
      level1: 'Un gesto semplice per volta',
      level2: 'Due azioni in sequenza',
      level3: 'Piccole sequenze con cambi di ritmo',
    },
    tools: ['camera', 'mic'],
  },
  {
    id: 'att-2',
    area: 3,
    name: 'Memory delle Immagini',
    objective: 'Allenare matching visivo, memoria semplice e categorizzazione.',
    materials: ['Carte illustrate o immagini digitali'],
    duration: '15 min',
    instructions: [
      'Osserva bene le immagini.',
      'Trova la coppia uguale o la categoria richiesta.',
      'Se non la trovi, chiedi a Leo un indizio.',
    ],
    variants: {
      level1: '2 coppie o 2 categorie',
      level2: '4 coppie o più elementi da abbinare',
      level3: 'Abbinamento con regola semantica o doppio criterio',
    },
    tools: ['touch'],
  },

  // AREA 4 — PRODUZIONE VERBALE E LESSICO
  {
    id: 'verb-1',
    area: 4,
    name: 'Cosa fa il Cane?',
    objective: 'Sostenere output vocale semplice, imitazione e associazione suono-significato.',
    materials: ['Immagini di animali'],
    duration: '10 min',
    instructions: [
      'Guarda l immagine proposta da Leo.',
      'Ascolta il modello vocale o onomatopeico.',
      'Prova a ripeterlo con il tuo ritmo.',
    ],
    variants: {
      level1: 'Solo suono o onomatopea',
      level2: 'Suono + nome',
      level3: 'Piccola frase guidata',
    },
    tools: ['mic', 'touch'],
  },
  {
    id: 'verb-2',
    area: 4,
    name: 'Naming della Stanza',
    objective: 'Promuovere lessico funzionale e generalizzazione nel contesto reale.',
    materials: ['Oggetti presenti nell ambiente'],
    duration: '10 min',
    instructions: [
      'Scegli un oggetto reale vicino a te.',
      'Leo ti aiuta a nominarlo o descriverlo.',
      'Se serve, Leo semplifica e propone solo due opzioni.',
    ],
    variants: {
      level1: 'Naming di oggetti singoli',
      level2: 'Trova l oggetto richiesto',
      level3: 'Nome + funzione o piccola descrizione',
    },
    tools: ['mic', 'camera'],
  },

  // AREA 5 — CAA
  {
    id: 'caa-1',
    area: 5,
    name: "Voglio l'Oggetto",
    objective: 'Allenare richiesta funzionale con simboli e scelta intenzionale.',
    materials: ['Simboli CAA', 'Oggetti o rinforzi motivanti'],
    duration: '10 min',
    instructions: [
      'Guarda poche opzioni alla volta.',
      'Tocca il simbolo che rappresenta quello che vuoi.',
      'Leo modella la parola o la frase corrispondente.',
    ],
    variants: {
      level1: 'Una scelta molto motivante',
      level2: 'Scelta tra due opzioni',
      level3: 'Scelta tra più opzioni o categorie',
    },
    tools: ['touch'],
  },
  {
    id: 'caa-2',
    area: 5,
    name: 'Costruisci la Frase',
    objective: 'Combinare simboli in una struttura semplice e funzionale.',
    materials: ['Tabelle CAA colorate'],
    duration: '15 min',
    instructions: [
      'Scegli prima la persona.',
      'Poi scegli l azione.',
      'Infine scegli l oggetto.',
      'Leo legge e rinforza la frase costruita.',
    ],
    variants: {
      level1: 'Persona + Azione',
      level2: 'Persona + Azione + Oggetto',
      level3: 'Frase con luogo o routine',
    },
    tools: ['touch'],
    symbols: {
      people: [
        { name: 'IO', color: 'bg-blue-500', icon: '👦' },
        { name: 'MAMMA', color: 'bg-blue-500', icon: '👩' },
        { name: 'PAPA', color: 'bg-blue-500', icon: '👨' },
      ],
      actions: [
        { name: 'VOGLIO', color: 'bg-red-500', icon: '✋' },
        { name: 'MANGIO', color: 'bg-red-500', icon: '🍕' },
        { name: 'VEDO', color: 'bg-red-500', icon: '👁️' },
      ],
      objects: [
        { name: 'MELA', color: 'bg-yellow-400', icon: '🍎' },
        { name: 'GIOCO', color: 'bg-yellow-400', icon: '🧸' },
        { name: 'ACQUA', color: 'bg-yellow-400', icon: '💧' },
      ],
    },
  },
  {
    id: 'caa-3',
    area: 5,
    name: 'Agenda Visiva',
    objective: 'Supportare prevedibilita, anticipazione e routine con una sequenza visiva.',
    materials: ['Striscia attività o simboli di routine'],
    duration: 'Sempre',
    instructions: [
      'Leo mostra cosa succede adesso.',
      'Poi mostra cosa viene dopo.',
      'La persona può chiedere conferma, pausa o ripetizione.',
    ],
    variants: {
      level1: 'Adesso / Dopo',
      level2: 'Sequenza breve di routine',
      level3: 'Routine più lunga con transizioni',
    },
    tools: ['touch'],
  },

  // AREA 6 — STIMOLAZIONE COGNITIVA
  {
    id: 'cog-1',
    area: 6,
    name: 'Super Puzzle',
    objective: 'Allenare incastro, pianificazione visiva e problem solving graduato.',
    materials: ['Puzzle digitali o reali'],
    duration: '15 min',
    instructions: [
      'Guarda il pezzo o l elemento target.',
      'Leo ti aiuta a capire dove potrebbe andare.',
      'Se è difficile, si passa a un indizio per volta.',
    ],
    variants: {
      level1: '2 pezzi o scelta binaria',
      level2: '4-6 elementi',
      level3: 'Più pezzi o regola visiva aggiuntiva',
    },
    tools: ['touch'],
  },
  {
    id: 'cog-2',
    area: 6,
    name: 'Ordina per Colore',
    objective: 'Classificare per colore o categoria con regole semplici e visive.',
    materials: ['Oggetti o immagini colorate'],
    duration: '10 min',
    instructions: [
      'Leo propone una regola chiara, per esempio metti qui tutto il rosso.',
      'La persona ordina pochi elementi alla volta.',
      'Se serve, Leo riduce il numero di opzioni.',
    ],
    variants: {
      level1: 'Due colori o due categorie',
      level2: 'Quattro colori',
      level3: 'Colore più funzione o forma',
    },
    tools: ['touch', 'camera'],
  },
];
