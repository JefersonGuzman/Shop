import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { http } from '../../lib/http';

type Provider = 'groq' | 'openai';

type AIConfigView = {
  provider: Provider;
  modelName: string;
  maxTokens: number;
  temperature: number;
  hasKey: boolean;
};

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    provider: Provider;
    apiKey: string;
    modelName: string;
    maxTokens: number;
    temperature: number;
  }>({ provider: 'groq', apiKey: '', modelName: '', maxTokens: 1000, temperature: 0.7 });

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await http.get<{ success: boolean; data: AIConfigView | null }>(`/api/admin/ai-config`);
      const cfg = res.data.data;
      if (cfg) {
        setForm((prev) => ({
          ...prev,
          provider: cfg.provider,
          modelName: cfg.modelName,
          maxTokens: cfg.maxTokens ?? 1000,
          temperature: cfg.temperature ?? 0.7,
          apiKey: '',
        }));
        setMessage(cfg.hasKey ? 'Clave ya configurada para el proveedor seleccionado.' : null);
      }
    } catch (e) {
      const err = e as AxiosError<any>;
      setError(err.response?.data?.error || 'No se pudo cargar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      await http.post(`/api/admin/ai-config`, {
        provider: form.provider,
        apiKey: form.apiKey,
        modelName: form.modelName,
        maxTokens: form.maxTokens,
        temperature: form.temperature,
      });
      setMessage('Configuración guardada correctamente.');
      setForm((f) => ({ ...f, apiKey: '' }));
    } catch (e) {
      const err = e as AxiosError<any>;
      setError(err.response?.data?.error || 'No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ajustes</h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5 shadow-card max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Configuración de IA</h2>
          {loading && <span className="text-sm text-mutedText">Cargando…</span>}
        </div>

        {message && <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{message}</div>}
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="provider" className="block text-sm text-mutedText mb-1">Proveedor</label>
            <select
              id="provider"
              className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary"
              value={form.provider}
              onChange={(e) => handleChange('provider', e.target.value as Provider)}
              required
            >
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div>
            <label htmlFor="modelName" className="block text-sm text-mutedText mb-1">Modelo</label>
            <input
              id="modelName"
              className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary"
              value={form.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
              placeholder={form.provider === 'groq' ? 'llama3-8b-8192' : 'gpt-3.5-turbo'}
              required
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm text-mutedText mb-1">API Key</label>
            <input
              id="apiKey"
              type="password"
              className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary"
              value={form.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="••••••••••••"
            />
            <p className="mt-1 text-xs text-mutedText">Por seguridad no se muestra. Vuelve a ingresarla si deseas actualizarla.</p>
          </div>

          <div>
            <label htmlFor="maxTokens" className="block text-sm text-mutedText mb-1">Máx. tokens</label>
            <input
              id="maxTokens"
              type="number"
              min={1}
              max={32000}
              className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary"
              value={form.maxTokens}
              onChange={(e) => handleChange('maxTokens', Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label htmlFor="temperature" className="block text-sm text-mutedText mb-1">Temperatura</label>
            <input
              id="temperature"
              type="number"
              step={0.1}
              min={0}
              max={2}
              className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary"
              value={form.temperature}
              onChange={(e) => handleChange('temperature', Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-4 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar configuración'}
          </button>
          <button
            type="button"
            onClick={loadConfig}
            className="h-11 px-4 rounded-lg border border-border hover:bg-black/5"
          >
            Recargar
          </button>
        </div>
      </form>
    </div>
  );
}


