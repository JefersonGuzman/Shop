import { Link, useNavigate } from 'react-router-dom';
import App from '../App';
import Portal from './Portal';
import { useEffect, useState, useRef } from 'react';
import { http } from '../lib/http';
import SideMenu from './SideMenu';


type Role = 'admin' | 'employee' | 'customer' | null;

export default function Header() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(null);
  // const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  // Eliminado drawer de categorías del header

  const fetchMe = async () => {
    const token = localStorage.getItem('accessToken') || '';
    if (!token) {
      setRole(null);
      return;
    }
    try {
      const res = await http.get('/api/auth/me');
      setRole(res.data?.user?.role ?? 'customer');
    } catch (error) {
      // Si hay un error (incluido 401), el interceptor intentará refrescar.
      // Si falla el refresh, dejamos la sesión como no autenticada.
      setRole(null);
    }
  };

  useEffect(() => {
    // Solo ejecutar fetchMe si hay un token en localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      setRole(null);
    }
    
    const onStorage = () => {
      const newToken = localStorage.getItem('accessToken');
      if (newToken && !role) {
        fetchMe();
      } else if (!newToken && role) {
        setRole(null);
      }
    };
    
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [role]);

  // Cerrar menú de cuenta al hacer click fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setRole(null);
    // Notificar a otros tabs/componentes
    window.dispatchEvent(new StorageEvent('storage'));
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 text-text">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} role={role} onLogout={logout} />

      <div className="mx-auto max-w-[1280px] pr-4  md:pr-6 py-2 grid grid-cols-12 gap-3 items-center">
        {/* Left: logo + botón menú (a la derecha del logo) */}
        <div className="col-span-12 md:col-span-3 flex items-center gap-2">
          <div className="size-7 md:size-8 text-brand">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-base md:text-lg font-semibold leading-tight mr-1">Maker's Tech</h2>
          <button className="p-2 text-text hover:opacity-70 -mr-2 bg-transparent border-0 focus:outline-none" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Center: search */}
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center border border-border rounded-md overflow-hidden max-w-full">
            <input className="h-9 flex-1 px-3 text-sm outline-none text-text placeholder:text-mutedText" placeholder="Buscar" />
            <div className="px-2 text-mutedText">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: IA + cuenta + carrito */}
        <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-3">
          <button onClick={() => setChatOpen(true)} className="h-9 px-3 rounded-md border border-border text-xs flex items-center gap-2 text-text bg-white hover:bg-black/5 transition-colors">
            <span className="text-amber-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.39 4.84L20 7.27l-3.64 3.55L17.77 18 12 15.27 6.23 18l1.41-7.18L4 7.27l5.61-.43L12 2z"/></svg>
            </span>
            Hablar con IA
          </button>
          {!role && (
            <div className="flex items-center gap-2 text-xs">
              <Link to="/login" className="px-3 h-9 inline-flex items-center rounded-md border border-border text-text bg-surface hover:bg-black/5">Iniciar sesión</Link>
              <Link to="/register" className="px-3 h-9 inline-flex items-center rounded-md border border-border text-text bg-surface hover:bg-black/5">Registrarse</Link>
            </div>
          )}
          {!!role && (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 text-xs px-2 h-9 rounded-md border border-border bg-surface text-text"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="inline-block size-6 rounded-full bg-brand text-white flex items-center justify-center">{(role || 'U').toString()[0].toUpperCase()}</span>
                Mi cuenta
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-md shadow-card">
                  <Link to="/settings" className="block px-3 py-2 text-sm hover:bg-black/5" onClick={() => setAccountOpen(false)}>
                    Perfil
                  </Link>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                    onClick={() => {
                      fetch(`${(import.meta as any).env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/logout`, { method: 'POST' })
                        .catch(() => {})
                        .finally(() => {
                          localStorage.removeItem('accessToken');
                          localStorage.removeItem('refreshToken');
                          window.dispatchEvent(new StorageEvent('storage'));
                          setAccountOpen(false);
                        });
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
          <Link to="/cart" className="relative flex items-center gap-1 text-xs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h15l-1.5 9h-12z" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="18" cy="20" r="1.5" fill="currentColor"/></svg>
            Mi cesta
            <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">0</span>
          </Link>
        </div>
      </div>

      {/* Drawer de chat con IA al estilo lateral derecho */}
      {chatOpen && (
        <Portal>
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30 transition-opacity" onClick={() => setChatOpen(false)} />
            <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[560px] md:w-[640px] bg-white border-l border-border shadow-card flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-white">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-amber-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.39 4.84L20 7.27l-3.64 3.55L17.77 18 12 15.27 6.23 18l1.41-7.18L4 7.27l5.61-.43L12 2z"/></svg>
                </span>
                Hablar con IA
              </div>
                <button className="text-sm text-mutedText hover:text-text transition-colors" onClick={() => setChatOpen(false)}>Cerrar</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <App />
            </div>
            </aside>
          </div>
        </Portal>
      )}
    </header>
  );
}


