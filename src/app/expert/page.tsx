'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PedagogicalForm from '@/components/PedagogicalForm';
import { EXERCISE_LIBRARY } from '@/lib/pedagogy/exercises';
import { recommendInternalApplications } from '@/lib/pedagogy/recommendations';
import { extractAssistantText, getJsonWithFallback, getPhpApiCandidates } from '@/lib/http';

export default function ExpertDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'patients' | 'library' | 'assistant' | 'lab'>('patients');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [stats, setStats] = useState({ active_patients: 0, total_sessions: 0, recent_updates: 0 });
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [labInput, setLabInput] = useState('');
  const [labResponse, setLabResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('leo_user_role');
    if (role !== 'expert' && role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchData();
    setIsLoaded(true);
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('leo_mock_children');
      const mockPatients = stored ? JSON.parse(stored) : [];

      const data = await getJsonWithFallback<{
        status?: string;
        patients?: any[];
        stats?: { active_patients: number; total_sessions: number; recent_updates: number };
      }>(getPhpApiCandidates('get_expert_data'));
      
      if (data.status === 'success') {
        const allPatients = [...mockPatients, ...(data.patients ?? [])];
        setPatients(allPatients);
        setStats({
          total_sessions: data.stats?.total_sessions ?? 0,
          recent_updates: data.stats?.recent_updates ?? 0,
          active_patients: allPatients.length
        });
      } else {
        setPatients(mockPatients);
        setStats(s => ({ ...s, active_patients: mockPatients.length }));
      }
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssistantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    setIsProcessing(true);
    setAssistantResponse('');
    try {
      const res = await fetch(getPhpApiCandidates('chat')[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: assistantInput }],
          systemPrompt: `
SEI UN ASSISTENTE CLINICO SPECIALIZZATO IN NEUROPSICHIATRIA INFANTILE E LOGOPEDIA EVOLUTIVA.
IL TUO COMPITO È COSTRUIRE UN PROFILO FUNZIONALE COMPLETO (DSM-5 / ICD-11).

1. ORGANIZZA IN 10 AREE: Anagrafica, Anamnesi Perinatale, Anamnesi Medica, Profilo Comunicativo, Funzioni Cognitive, Profilo Motorio, Profilo Emotivo, Scuola, Risorse Familiari, Obiettivi.
2. SEGNALA DATI MANCANTI.
3. PRODUCI RIEPILOGO FUNZIONALE (max 10 righe).
4. SUGGERISCI 3 PRIORITÀ DI INTERVENTO.
5. GENERA SCHEDE ESERCIZI STRUTTURATE (Nome, Area, Obiettivo, Materiali, Istruzioni, Varianti, Note Genitori).

RIFERIMENTI: Vianello R., Alfieri P. (ANFFAS), Orsolini M., Erickson.
TONO: Clinico ma accessibile.
`
        })
      });
      const data = await res.json();
      setAssistantResponse(extractAssistantText(data) || "Errore nella generazione del profilo.");
    } catch (err) {
      setAssistantResponse("Errore di elaborazione clinica.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labInput.trim()) return;
    setIsProcessing(true);
    setLabResponse('');
    try {
      const res = await fetch(getPhpApiCandidates('chat')[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: labInput }],
          systemPrompt: `
SEI UN DESIGNER DI ESPERIENZE ASSISTIVE PER BAMBINI CON DISABILITÀ INTELLETTIVA E DISTURBI DEL LINGUAGGIO.
IL TUO COMPITO È PROGETTARE STRUMENTI DIGITALI CHE USANO AI, WEBCAM E MICROFONO COME PROTESI COGNITIVA DIRETTA.

MODULI DISPONIBILI: 
1. Identificatore Oggetti (Vision)
2. Chat Semplificata (Simboli CAA)
3. Autocomplete Vocale
4. Lettore di Ambiente
5. Lettore di Emozioni
6. Routine Visiva Guidata
7. Giochi Linguistici Contestuali
8. Diario Comunicativo Automatico

PRINCIPI: Semplicità Radicale, Multimodalità (Voce+Simbolo+Immagine), Rinforzo Positivo, Prevedibilità.
OUTPUT: Identifica il modulo, descrivi il funzionamento operativo, progetta il flusso UX e indica lo stack tecnologico (GPT-4o Vision, Whisper, MediaPipe, etc.).
`
        })
      });
      const data = await res.json();
      setLabResponse(extractAssistantText(data) || "Errore nella progettazione dello strumento.");
    } catch (err) {
      setLabResponse("Errore di elaborazione design.");
    } finally {
      setIsProcessing(false);
    }
  };

  const assignExercise = (exerciseId: string) => {
    if (!selectedPatient) return;
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        const currentExercises = p.assigned_exercises || [];
        if (currentExercises.includes(exerciseId)) return p;
        return { ...p, assigned_exercises: [...currentExercises, exerciseId] };
      }
      return p;
    });
    setPatients(updatedPatients);
    setSelectedPatient(updatedPatients.find(p => p.id === selectedPatient.id));
    localStorage.setItem('leo_mock_children', JSON.stringify(updatedPatients));
    alert('Esercizio assegnato con successo!');
  };

  const handleLogout = () => {
    localStorage.removeItem('leo_user_role');
    router.push('/');
  };

  if (!isLoaded) return <div className="flex justify-center items-center h-screen bg-gray-50">Caricamento portale...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
                <h1 className="text-lg font-bold text-gray-900 hidden sm:block">LEO Portale Clinico</h1>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'patients' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Pazienti
                </button>
                <button 
                  onClick={() => setActiveTab('library')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'library' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Libreria
                </button>
                <button 
                  onClick={() => setActiveTab('assistant')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'assistant' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Assistente Clinico
                </button>
                <button 
                  onClick={() => setActiveTab('lab')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'lab' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Design Lab
                </button>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 text-sm font-medium">Esci</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        
        {/* VIEW: PATIENTS LIST / DETAIL */}
        {activeTab === 'patients' && (
          <>
            {showForm ? (
              <div className="animate-in fade-in zoom-in">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold">Nuova Scheda Paziente</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 font-bold">Annulla</button>
                </div>
                <PedagogicalForm onSuccess={() => { setShowForm(false); fetchData(); }} />
              </div>
            ) : selectedPatient ? (
              <div className="animate-in fade-in slide-in-from-right">
                <button onClick={() => setSelectedPatient(null)} className="mb-6 text-blue-600 font-bold">← Torna alla lista</button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">{selectedPatient.name.charAt(0)}</div>
                      <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                      <p className="text-gray-500">{selectedPatient.age} anni • {selectedPatient.diagnosis}</p>
                      <div className="mt-6 text-left p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Area Terapeutica</p>
                        <p className="text-sm font-medium">{selectedPatient.communication_level || 'Sviluppo'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                           <span className="p-2 bg-emerald-100 rounded-lg text-lg">🧭</span>
                           Proposta Applicazioni LEO
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {recommendInternalApplications(selectedPatient).map((app) => (
                            <div key={app.id} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60">
                              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">
                                {app.priority === 'high' ? 'Priorita alta' : 'Priorita media'}
                              </div>
                              <h4 className="font-bold text-gray-900 mb-1">{app.title}</h4>
                              <p className="text-sm text-gray-600">{app.reason}</p>
                            </div>
                          ))}
                        </div>
                     </div>
                     <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                           <span className="p-2 bg-orange-100 rounded-lg text-lg">🛠️</span>
                           Assegna Strumenti Educativi
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {EXERCISE_LIBRARY.map(ex => {
                             const isAssigned = selectedPatient.assigned_exercises?.includes(ex.id);
                             return (
                               <div key={ex.id} className={`p-4 rounded-2xl border-2 transition-all ${isAssigned ? 'border-green-500 bg-green-50' : 'border-gray-50 hover:border-blue-200'}`}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Area {ex.area}</span>
                                    {isAssigned && <span className="text-[10px] font-bold text-green-600">ATTIVO</span>}
                                  </div>
                                  <h4 className="font-bold text-gray-900 mb-1">{ex.name}</h4>
                                  <p className="text-[10px] text-gray-500 mb-4 line-clamp-1">{ex.objective}</p>
                                  <button 
                                    onClick={() => assignExercise(ex.id)}
                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isAssigned ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
                                  >
                                    {isAssigned ? 'Strumento Attivo' : 'Assegna a Leo'}
                                  </button>
                               </div>
                             )
                           })}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold">I Tuoi Pazienti</h2>
                    <p className="text-gray-500">Gestisci i percorsi riabilitativi e assegnagli Leo.</p>
                  </div>
                  <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">+ Nuovo Paziente</button>
                </div>
                <div className="grid gap-4">
                  {patients.length === 0 ? (
                    <div className="p-20 text-center text-gray-400 italic bg-white rounded-3xl border border-gray-100">Nessun paziente in carico.</div>
                  ) : (
                    patients.map(p => (
                      <div key={p.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">{p.name.charAt(0)}</div>
                          <div><p className="font-bold text-gray-900">{p.name}</p><p className="text-sm text-gray-500">{p.diagnosis || 'Paziente attivo'}</p></div>
                        </div>
                        <button onClick={() => setSelectedPatient(p)} className="px-6 py-2 border border-blue-100 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50">Gestisci</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* VIEW: INSTRUMENT LIBRARY */}
        {activeTab === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">Libreria Strumenti Clinici</h2>
              <p className="text-gray-500 text-lg">Consulta tutti gli esercizi disponibili nel motore LEO.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXERCISE_LIBRARY.map(ex => (
                <div key={ex.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between mb-4">
                    <span className="px-4 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">Area {ex.area}</span>
                    <div className="flex gap-1">
                      {ex.tools.map(t => <span key={t} className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[10px]">{t === 'camera' ? '📷' : t === 'mic' ? '🎤' : '👆'}</span>)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{ex.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">{ex.objective}</p>
                  <div className="pt-6 border-t border-gray-50 space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Protocollo Leo:</div>
                      <ul className="text-xs text-gray-600 space-y-2">
                        {ex.instructions.map((inst, i) => <li key={i} className="flex gap-2"><span>{i+1}.</span> {inst}</li>)}
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                       <div className="text-[9px] font-bold text-blue-400 uppercase mb-1">Variante Lvl 1 (Base)</div>
                       <p className="text-[10px] text-gray-600 leading-tight">{ex.variants.level1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: CLINICAL ASSISTANT AI */}
        {activeTab === 'assistant' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase mb-4 tracking-widest">IA Clinica Avanzata</div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Assistente Clinico Leo</h2>
              <p className="text-gray-500 mt-3 text-lg">Incolla note cliniche per costruire profili funzionali in 10 aree.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
              <div className="p-10 space-y-8">
                <form onSubmit={handleAssistantSubmit}>
                  <div className="relative group">
                    <textarea 
                      className="w-full h-56 p-8 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-100 outline-none transition-all text-gray-700 text-lg shadow-inner resize-none"
                      placeholder="Esempio: Marco, 7 anni, diagnosi di disabilità intellettiva moderata. Non parla. Usa qualche gesto..."
                      value={assistantInput}
                      onChange={e => setAssistantInput(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4">
                       <button 
                        type="submit"
                        disabled={isProcessing}
                        className={`px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl transition-all ${isProcessing ? 'opacity-50' : 'hover:bg-blue-600 hover:scale-105 active:scale-95'}`}
                      >
                        {isProcessing ? 'Analisi Clinica...' : 'Genera Profilo Strutturato'}
                      </button>
                    </div>
                  </div>
                </form>

                {assistantResponse && (
                  <div className="mt-12 p-10 bg-gradient-to-br from-white to-blue-50/30 rounded-[2rem] border border-blue-100 shadow-inner animate-in fade-in slide-in-from-bottom duration-1000">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold rotate-3 shadow-lg">AI</div>
                      <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm">Output Clinico // Profilo Funzionale</h3>
                    </div>
                    <div className="prose prose-slate max-w-none whitespace-pre-wrap text-[15px] text-gray-800 leading-relaxed font-medium">
                      {assistantResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DESIGN LAB */}
        {activeTab === 'lab' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase mb-4 tracking-widest">Experience Design Lab</div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Progettista Protesi Cognitive</h2>
              <p className="text-gray-500 mt-3 text-lg">Disegna strumenti AI che il bambino può usare in autonomia nel mondo reale.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-purple-900/5 overflow-hidden">
              <div className="p-10 space-y-8">
                <form onSubmit={handleLabSubmit}>
                  <div className="relative group">
                    <textarea 
                      className="w-full h-56 p-8 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-purple-500 focus:ring-8 focus:ring-purple-100 outline-none transition-all text-gray-700 text-lg shadow-inner resize-none"
                      placeholder="Descrivi un bisogno: 'Voglio uno strumento che aiuti mia figlia a riconoscere le emozioni dei compagni di classe'..."
                      value={labInput}
                      onChange={e => setLabInput(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4">
                       <button 
                        type="submit"
                        disabled={isProcessing}
                        className={`px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl transition-all ${isProcessing ? 'opacity-50' : 'hover:bg-purple-700 hover:scale-105 active:scale-95'}`}
                      >
                        {isProcessing ? 'Progettazione...' : 'Disegna Strumento'}
                      </button>
                    </div>
                  </div>
                </form>

                {labResponse && (
                  <div className="mt-12 p-10 bg-gradient-to-br from-white to-purple-50/30 rounded-[2rem] border border-purple-100 shadow-inner animate-in fade-in slide-in-from-bottom duration-1000">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-bold rotate-3 shadow-lg">UX</div>
                      <h3 className="font-black text-purple-900 uppercase tracking-widest text-sm">Design Prototipo // Protesi Digitale</h3>
                    </div>
                    <div className="prose prose-slate max-w-none whitespace-pre-wrap text-[15px] text-gray-800 leading-relaxed font-medium">
                      {labResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
