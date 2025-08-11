import { useState } from 'react';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | null>(null);

  async function submit() {
    try {
      // Validaciones mínimas en cliente
      if (!firstName || !lastName || !email || !password) {
        setMsg('Todos los campos son requeridos');
        setMsgType('error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMsg('Email inválido');
        setMsgType('error');
        return;
      }
      if (password.length < 6) {
        setMsg('La contraseña debe tener al menos 6 caracteres');
        setMsgType('error');
        return;
      }
      await axios.post(`${API_BASE}/api/auth/register`, { email, password, firstName, lastName });
      setMsg('Registro exitoso, ahora puedes iniciar sesión');
      setMsgType('success');
    } catch {
      setMsg('Error registrando usuario');
      setMsgType('error');
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] grid md:grid-cols-2 bg-background">
      <div className="bg-white flex flex-col items-center justify-center px-6 py-10 order-2 md:order-1">
        <div className="w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-text">Registrarse</h2>
          <div className="space-y-3">
            <input
              className="w-full h-10 rounded-md bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Nombre"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-md bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Apellido"
              value={lastName}
              required
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-md bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Email"
              value={email}
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-md bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Password"
              type="password"
              value={password}
              required
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={submit} className="w-full h-10 rounded-md bg-black text-white font-medium">
              Crear cuenta
            </button>
            {msg && (
              <p className={`text-sm ${msgType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {msg}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="hidden md:block bg-cover bg-center order-1 md:order-2" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop)' }} />
    </div>
  );
}


