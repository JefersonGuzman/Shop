import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';

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
    <div className="chat-container" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1>Makers Tech ChatBot</h1>
      <div className="messages" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, height: 420, overflow: 'auto' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ margin: '8px 0', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', background: m.role === 'user' ? '#e6f0ff' : '#f5f5f5', padding: '8px 12px', borderRadius: 8 }}>
              <strong>{m.role === 'user' ? 'Tú' : 'TechBot'}: </strong>
              <span>{m.content}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="input" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe tu mensaje..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: '10px 16px' }}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      <p style={{ marginTop: 8, color: '#666' }}>Session: {sessionId}</p>
    </div>
  );
}
