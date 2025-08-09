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
    } catch (e: any) {
      setMsg('Error registrando usuario');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '24px auto' }}>
      <h2>Registrarse</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={submit}>Crear cuenta</button>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}


