import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | null>(null);
  const navigate = useNavigate();

  async function submit() {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem('accessToken', res.data?.accessToken || '');
      localStorage.setItem('refreshToken', res.data?.refreshToken || '');
      // Disparar evento para que Header refresque rol
      window.dispatchEvent(new StorageEvent('storage'));
      setMsg('Inicio de sesión exitoso');
      setMsgType('success');
      // Redirigir según rol
      const me = await axios.get(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${res.data?.accessToken}` } });
      const role = me.data?.user?.role || 'customer';
      // Enviar a panel si es admin o employee
      navigate(role === 'admin' || role === 'employee' ? '/admin' : '/');
    } catch (e: any) {
      setMsg('Credenciales inválidas');
      setMsgType('error');
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] grid md:grid-cols-2 bg-background">
      {/* Izquierda: imagen */}
      <div className="hidden md:block bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop)' }} />
      {/* Derecha: fondo blanco completo sin tarjeta */}
      <div className="bg-white flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-text">Iniciar sesión</h2>
          <div className="space-y-3">
            <input
              className="w-full h-10 rounded-md bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-md bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-mutedText">&nbsp;</span>
              <Link to="#" className="text-text hover:underline">He olvidado mi contraseña</Link>
            </div>
            <button onClick={submit} className="w-full h-10 rounded-md bg-black text-white font-medium">
              Entrar
            </button>
            {msg && (
              <p className={`text-sm ${msgType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {msg}
              </p>
            )}
          </div>

          {/* Bloque inferior similar a referencia */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-sm text-mutedText mb-3">¿Eres nuevo cliente?</p>
            <Link to="/register" className="w-full h-10 rounded-md border border-border bg-surface text-text flex items-center justify-center hover:bg-black/5">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


