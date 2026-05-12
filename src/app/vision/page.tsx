'use client';

import { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import Webcam from 'react-webcam';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VisionContent() {
  const webcamRef = useRef<Webcam>(null);
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const [messages, setMessages] = useState<{role: 'assistant' | 'user', content: string}[]>([
      { role: 'assistant', content: 'Inquadra qualcosa con la telecamera e tocca il pulsante!' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: '[Immagine inviata]' }]);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc,
          childId,
          history: messages.filter(m => m.content !== '[Immagine inviata]')
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Ops, non sono riuscito a vedere bene. Riprova!' }]);
      }
    } catch (error) {
       console.error("Vision API error:", error);
       setMessages(prev => [...prev, { role: 'assistant', content: 'Ops, c\'è stato un errore di connessione.' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef, childId, messages]);

  if (!childId) {
    return (
      <div className="flex h-screen items-center justify-center bg-purple-50 text-xl font-medium text-gray-700">
        Nessun bambino selezionato. Torna alla <Link href="/dashboard" className="text-purple-600 underline ml-2">Dashboard</Link>.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-purple-50">
      <header className="bg-purple-600 py-4 px-6 shadow-md rounded-b-3xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                📷
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-wide">Esplora con Leo</h1>
        </div>
        <Link href="/dashboard" className="text-purple-100 hover:text-white font-medium text-sm transition-colors">
          Chiudi
        </Link>
      </header>

      <div className="relative flex-none aspect-video bg-black">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
                onClick={captureAndAnalyze}
                disabled={isProcessing}
                className="w-16 h-16 bg-white rounded-full border-4 border-purple-400 shadow-lg flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            >
               {isProcessing ? <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /> : <div className="w-12 h-12 bg-purple-600 rounded-full" />}
            </button>
        </div>
      </div>

       <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-lg shadow-sm ${
                m.role === 'user'
                  ? 'bg-purple-300 text-purple-900 rounded-br-sm text-sm italic opacity-70'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-purple-100 font-medium'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
         {isProcessing && (
            <div className="flex justify-start">
               <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-5 py-3 text-lg shadow-sm border border-purple-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>
    </div>
  );
}

export default function VisionMode() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <VisionContent />
    </Suspense>
  );
}