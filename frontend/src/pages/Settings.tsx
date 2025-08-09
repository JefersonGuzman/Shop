import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function Settings() {
  const [provider, setProvider] = useState<'groq' | 'openai'>('groq');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [maxTokens, setMaxTokens] = useState(500);
  const [temperature, setTemperature] = useState(0.7);
  const [status, setStatus] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);

  async function load() {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/ai-config`, { params: { provider } });
      const cfg = res.data?.data;
      if (cfg) {
        setModelName(cfg.modelName || '');
        setMaxTokens(cfg.maxTokens ?? 500);
        setTemperature(cfg.temperature ?? 0.7);
        setHasKey(Boolean(cfg.hasKey));
      }
    } catch {}
  }

  // Cargar al montar y al cambiar provider
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [provider]);

  async function save() {
    try {
      await axios.post(`${API_BASE}/api/admin/ai-config`, {
        provider,
        apiKey,
        modelName,
        maxTokens,
        temperature,
      });
      setStatus('Configuración guardada correctamente.');
      setHasKey(Boolean(apiKey) || hasKey);
      setApiKey(''); // por seguridad, no persistimos ni mostramos el valor
    } catch (e: any) {
      setStatus('Error guardando configuración.');
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2>Configuración de IA</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <label>
          Proveedor
          <select value={provider} onChange={(e) => setProvider(e.target.value as any)}>
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
          </select>
        </label>
        <label>
          API Key
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasKey ? 'API Key ya configurada (ingresa para reemplazar)' : 'Ingresa tu API key'}
          />
          {hasKey && <small style={{ color: '#0b2545' }}>Hay una API key guardada en el servidor.</small>}
        </label>
        <label>
          Modelo
          <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="p. ej. mixtral-8x7b-32768" />
        </label>
        <label>
          Max Tokens
          <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
        </label>
        <label>
          Temperature
          <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
        </label>
        <button onClick={save}>Guardar</button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}


