'use client';

import { useChat } from '@ai-sdk/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState, Suspense } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const { messages, append, status } = useChat({
    api: '/api/chat',
    body: {
      childId,
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Ciao! Sono Leo. Come stai oggi? Sei pronto per giocare insieme?',
      }
    ]
  });
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    append({ role: 'user', content: input });
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!childId) {
    return (
      <div className="flex h-screen items-center justify-center bg-yellow-50 text-xl font-medium text-gray-700">
        Nessun bambino selezionato. Torna alla <Link href="/dashboard" className="text-blue-600 underline ml-2">Dashboard</Link>.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-yellow-50">
      <header className="bg-yellow-400 py-4 px-6 shadow-md rounded-b-3xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                🦁
            </div>
            <h1 className="text-2xl font-extrabold text-yellow-900 tracking-wide">Leo</h1>
        </div>
        <Link href="/dashboard" className="text-yellow-900 hover:text-white font-medium bg-yellow-300 px-4 py-2 rounded-full transition-colors">
          Chiudi
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 text-lg shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-yellow-100'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-5 py-3 text-lg shadow-sm border border-yellow-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="p-4 bg-white rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <input
            className="flex-1 rounded-full border-2 border-yellow-200 bg-gray-50 px-6 py-4 text-lg focus:outline-none focus:border-yellow-400 focus:bg-white transition-colors"
            value={input}
            placeholder="Scrivi qui..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-yellow-400 px-8 py-4 font-bold text-yellow-900 shadow-md hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            Invia
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Caricamento chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}