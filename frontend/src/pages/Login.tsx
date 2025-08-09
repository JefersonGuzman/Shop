import { useState } from 'react';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit() {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem('accessToken', res.data?.accessToken || '');
      setMsg('Inicio de sesión exitoso');
    } catch (e: any) {
      setMsg('Credenciales inválidas');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '24px auto' }}>
      <h2>Iniciar sesión</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={submit}>Entrar</button>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}


