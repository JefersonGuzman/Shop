import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

type ChatMessage = { role: 'user' | 'assistant'; content: string; timestamp?: string };

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function App() {
  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem('sessionId');
    if (existing) return existing;
    const sid = `sess_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('sessionId', sid);
    return sid;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/chat/history`, { params: { sessionId } })
      .then((res) => {
        const data = res.data?.data || [];
        setMessages(data.map((m: any) => ({ role: m.role, content: m.content, timestamp: m.timestamp })));
      })
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/chat/message`, { message: userMsg.content, sessionId });
      const reply = res.data?.data?.response || 'Sin respuesta';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error procesando el mensaje.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-muted max-w-4xl mx-auto w-full border-x">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-text mb-2">Chat de Soporte</h1>
          <p className="text-sm text-mutedText">¿Cómo podemos ayudarte hoy? No dudes en hacer cualquier pregunta sobre nuestros productos, servicios o pedidos.</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-end gap-3 p-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0"
                style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=a042581f4e29026704d)' }}
              />
            )}
            <div className={`flex flex-1 flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p className={`text-mutedText text-[13px] font-normal leading-normal max-w-[360px] ${m.role === 'user' ? 'text-right' : ''}`}>
                {m.role === 'user' ? 'Tú' : 'Bot de Soporte'}
              </p>
              <p className={`text-base font-normal leading-normal flex max-w-[360px] rounded-xl px-4 py-3 ${m.role === 'user' ? 'bg-primary text-white' : 'bg-card text-text border border-border'}`}>
                {m.content}
              </p>
            </div>
            {m.role === 'user' && (
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0"
                style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=a042581f4e29026704e)' }}
              />
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Fixed Input Bar - Always at bottom */}
      <div className="shrink-0 border-t border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <input
            placeholder="Escribe tu mensaje..."
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background h-full placeholder:text-mutedText px-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <div className="flex bg-background border border-border border-l-0 items-center justify-center pr-2 rounded-r-xl">
            <button
                onClick={sendMessage}
                disabled={loading}
                className="min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-primary text-white text-sm font-medium hidden md:block hover:bg-primary/90 active:bg-primary/80 transition-colors shadow-sm"
              >
                <span className="truncate">{loading ? 'Enviando...' : 'Enviar'}</span>
              </button>
              <button
                onClick={sendMessage}
                disabled={loading}
                className="min-w-[40px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-2 bg-primary text-white text-sm font-medium md:hidden hover:bg-primary/90 active:bg-primary/80 transition-colors shadow-sm"
              >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.894a1 1 0 00-1.788 0l-6 11a1 1 0 00.894 1.449h12a1 1 0 00.894-1.449l-6-11zM10 12a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
