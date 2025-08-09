import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link to="/">Chat</Link>
        <Link to="/settings">Configuración IA</Link>
      </nav>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/register">Registrarse</Link>
      </div>
    </header>
  );
}


