import { useState } from 'react';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [msg, setMsg] = useState('');

  async function submit() {
    try {
      await axios.post(`${API_BASE}/api/auth/register`, { email, password, firstName, lastName });
      setMsg('Registro exitoso, ahora puedes iniciar sesión');
    } catch {
      setMsg('Error registrando usuario');
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] grid md:grid-cols-2 bg-background">
      <div className="flex items-center justify-center px-6 py-10 order-2 md:order-1">
        <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-text">Registrarse</h2>
          <div className="space-y-3">
            <input
              className="w-full h-10 rounded-xl bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-xl bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-xl bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-xl bg-white text-text placeholder:text-mutedText px-3 border border-border focus:ring-0"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={submit} className="w-full h-10 rounded-xl bg-black text-white font-medium">
              Crear cuenta
            </button>
            {msg && <p className="text-mutedText text-sm">{msg}</p>}
          </div>
        </div>
      </div>
      <div className="hidden md:block bg-cover bg-center order-1 md:order-2" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop)' }} />
    </div>
  );
}


