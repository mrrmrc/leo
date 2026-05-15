'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_TRAINING = `CONTESTO E RUOLO:
Sei un logopedista esperto in età evolutiva, specializzato nel trattamento di bambini con disabilità intellettiva (DSM-5: "disturbo dello sviluppo intellettivo"), con competenze specifiche in Comunicazione Aumentativa e Alternativa (CAA). Opera sempre in un'ottica multidisciplinare (neuropsichiatra infantile, psicologo, TNPEE, terapista occupazionale, famiglia).

RIFERIMENTI CLINICI E NORMATIVI:
- DSM-5: Disabilità intellettiva (deficit funzioni intellettive + adattive)
- ICD-11: Disorder of intellectual development
- Vianello R., "Disabilità Intellettive — Come e cosa fare"
- Alfieri P., ANFFAS — "La disabilità intellettiva in età evolutiva"
- Prof.ssa Orsolini M., Corso Alta Formazione Università Roma

LOGOPEDIA E CAA:
- CAA e logopedia (istitutosantachiara.it)
- CAA e disabilità intellettiva (progettoautismopertutti.it)
- Strumenti e colori grammaticali (centromedicoriabilitativo.it)

STRUTTURA PERCORSO TERAPEUTICO:
FASE 1 — VALUTAZIONE E PREREQUISITI (Comprensione, manualità, attenzione)
FASE 2 — PRASSIE ORO-FACCIALI E RESPIRAZIONE (Rinforzo muscolare, tono)
FASE 3 — STIMOLAZIONE DEL LINGUAGGIO (Ordini semplici -> parole -> frasi)
FASE 4 — GENERALIZZAZIONE E AUTONOMIA (Uso spontaneo, transfer casa/scuola)`;

export default function AdminDashboard() {
  const [trainingData, setTrainingData] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_TRAINING;
    }

    return localStorage.getItem('leo_ai_training') || DEFAULT_TRAINING;
  });
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('leo_user_role');
    if (role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  const handleSave = () => {
    localStorage.setItem('leo_ai_training', trainingData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('leo_user_role');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-blue-400">LEO_CORE_ENGINE // ADMIN_AREA</h1>
          <p className="text-xs text-gray-500 uppercase mt-1">Addestramento Pedagogico dell'Intelligenza Artificiale</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition-all text-sm">
            {isSaved ? 'DATI SALVATI ✓' : 'SALVA ADDESTRAMENTO'}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all text-sm">
            LOGOUT
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-blue-300 border-l-4 border-blue-600 pl-4">PEDAGOGICAL_DATA_SET</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Inserisci qui le linee guida cliniche, i riferimenti normativi e le strategie logopediche. 
            Queste informazioni verranno iniettate nel &quot;cervello&quot; di Leo per ogni interazione con i pazienti.
          </p>
          <textarea 
            className="w-full h-[600px] bg-black border border-gray-800 rounded-xl p-6 text-green-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all leading-relaxed text-sm shadow-2xl"
            value={trainingData}
            onChange={e => setTrainingData(e.target.value)}
            spellCheck="false"
          />
        </section>

        <section className="space-y-8">
          <h2 className="text-lg font-bold text-purple-300 border-l-4 border-purple-600 pl-4">ENGINE_STATUS</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <div className="text-xs text-gray-500 mb-1">MODELLO_AI</div>
              <div className="font-bold text-blue-400">GPT-4-Omni</div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <div className="text-xs text-gray-500 mb-1">CONTESTO_ATTIVO</div>
              <div className="font-bold text-green-400">CAA_LOGOPEDIA</div>
            </div>
          </div>

          <div className="bg-blue-900/20 p-8 rounded-3xl border border-blue-500/20 space-y-4">
            <h3 className="font-bold text-blue-200">ISTRUZIONI DI SISTEMA</h3>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-500">▶</span>
                Leo utilizzerà i riferimenti clinici per validare ogni risposta pedagogica.
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500">▶</span>
                La FASE del percorso terapeutico viene adattata automaticamente al bambino.
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500">▶</span>
                Il tono di voce segue i manuali di logopedia evolutiva (Orsolini, Vianello).
              </li>
            </ul>
          </div>

          <div className="p-8 border border-gray-800 rounded-3xl">
             <div className="text-xs text-gray-600 mb-4 font-bold uppercase tracking-widest">Integrazione Riferimenti CAA</div>
             <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400">DSM-5</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400">ICD-11</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400">CAA</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400">LOGOPEDIA</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400">MULTIDISCIPLINARE</span>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
