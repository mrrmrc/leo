// src/components/PedagogicalForm.tsx
'use client';

import { useState } from 'react';

export default function PedagogicalForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Area 1
    name: '', age: '', gender: '', family_context: '', parent_email: '',
    // Area 2
    pregnancy: '', birth: '', development_milestones: '',
    // Area 3
    diagnosis: '', qi: '', medications: '',
    // Area 4
    comm_modality: 'verbale', comm_evaluation: '3', vocab_size: '',
    // Area 5
    cognitive_attention: '3', cognitive_autonomy: '3',
    // Area 6
    motor_tone: '', motor_sensory: '',
    // Area 7
    emotions_behaviors: '', special_interests: '', triggers: '',
    // Area 8
    school_support: '', current_therapies: '',
    // Area 9
    family_cooperation: '3', family_stress: '',
    // Area 10
    goals_short: '', goals_medium: '', caa_tools: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    const stored = localStorage.getItem('leo_mock_children');
    const mockChildren = stored ? JSON.parse(stored) : [];
    
    const newChild = { 
      ...formData, 
      id: `patient-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('leo_mock_children', JSON.stringify([...mockChildren, newChild]));
    
    await new Promise(r => setTimeout(r, 1000));
    onSuccess();
    setLoading(false);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStepIndicator = () => (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
        <button 
          key={s} 
          onClick={() => setStep(s)}
          className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl max-w-3xl mx-auto">
      {renderStepIndicator()}

      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 1 — Dati Anagrafici e Familiari</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Nome Completo</label>
              <input className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Età</label>
              <input className="w-full p-4 rounded-xl bg-gray-50 border-none" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div>
            </div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Email Genitore (per collegamento)</label>
            <input className="w-full p-4 rounded-xl bg-gray-50 border-none" type="email" placeholder="email@genitore.it" value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Contesto Familiare</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={2} value={formData.family_context} onChange={e => setFormData({...formData, family_context: e.target.value})} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 2 — Anamnesi Perinatale</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Gravidanza e Parto</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.pregnancy} onChange={e => setFormData({...formData, pregnancy: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Tappe di Sviluppo Precoce</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.development_milestones} onChange={e => setFormData({...formData, development_milestones: e.target.value})} /></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 3 — Anamnesi Medica e Diagnosi</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Diagnosi Attuale (DSM-5/ICD-11)</label>
            <input className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Terapia Farmacologica</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={2} value={formData.medications} onChange={e => setFormData({...formData, medications: e.target.value})} /></div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 4 — Profilo Comunicativo e Linguistico</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Modalità Prevalente</label>
            <select className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.comm_modality} onChange={e => setFormData({...formData, comm_modality: e.target.value})}>
              <option value="verbale">Verbale Funzionale</option>
              <option value="limitato">Verbale Limitato</option>
              <option value="caa">CAA / Gestuale</option>
              <option value="assente">Assente</option>
            </select></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Valutazione Comprensione (1-5)</label>
            <input type="range" min="1" max="5" className="w-full" value={formData.comm_evaluation} onChange={e => setFormData({...formData, comm_evaluation: e.target.value})} /></div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 5 — Funzioni Cognitive e Adattive</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Attenzione e Memoria (1-5)</label>
            <input type="range" min="1" max="5" className="w-full" value={formData.cognitive_attention} onChange={e => setFormData({...formData, cognitive_attention: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Autonomie Personali</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.cognitive_autonomy} onChange={e => setFormData({...formData, cognitive_autonomy: e.target.value})} /></div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 6 — Profilo Motorio e Sensoriale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Tono Muscolare</label>
              <input className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.motor_tone} onChange={e => setFormData({...formData, motor_tone: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Sensorialità</label>
              <input className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.motor_sensory} onChange={e => setFormData({...formData, motor_sensory: e.target.value})} /></div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 7 — Profilo Emotivo e Relazionale</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Comportamenti e Regolazione</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.emotions_behaviors} onChange={e => setFormData({...formData, emotions_behaviors: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Interessi Prevalenti / Trigger</label>
            <input className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.special_interests} onChange={e => setFormData({...formData, special_interests: e.target.value})} /></div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 8 — Contesto Scolastico e Terapeutico</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Ore di Sostegno / PEI</label>
            <input className="w-full p-4 rounded-xl bg-gray-50 border-none" value={formData.school_support} onChange={e => setFormData({...formData, school_support: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Terapie in Corso</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.current_therapies} onChange={e => setFormData({...formData, current_therapies: e.target.value})} /></div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 9 — Risorse Familiari</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Collaborazione (1-5)</label>
            <input type="range" min="1" max="5" className="w-full" value={formData.family_cooperation} onChange={e => setFormData({...formData, family_cooperation: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Routine e Supporto</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.family_stress} onChange={e => setFormData({...formData, family_stress: e.target.value})} /></div>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">AREA 10 — Obiettivi e Note Cliniche</h3>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Obiettivi 3-6 Mesi</label>
            <textarea className="w-full p-4 rounded-xl bg-gray-50 border-none" rows={3} value={formData.goals_short} onChange={e => setFormData({...formData, goals_short: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-400 uppercase">Strumenti CAA Valutati</label>
            <input className="w-full p-4 rounded-xl bg-gray-50 border-none" placeholder="PECS, VOCA, tabelle..." value={formData.caa_tools} onChange={e => setFormData({...formData, caa_tools: e.target.value})} /></div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-12">
        {step > 1 && <button onClick={prevStep} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Indietro</button>}
        {step < 10 ? (
          <button onClick={nextStep} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">Prossima Area</button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all">
            {loading ? 'Salvataggio...' : 'Finalizza Scheda Paziente'}
          </button>
        )}
      </div>
    </div>
  );
}