import { useEffect, useState } from 'react';
import Portal from './Portal';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Role = 'admin' | 'employee' | 'customer' | null;

type Props = {
  open: boolean;
  onClose: () => void;
  role: Role;
  onLogout: () => void;
};

export default function SideMenu({ open, onClose, role, onLogout }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [offers, setOffers] = useState<Array<{ _id: string; title: string; image?: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    axios
      .get(`${API_BASE}/api/categories`, { params: { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' } })
      .then((res) => {
        const items = (res.data?.data || []) as Array<{ name: string }>;
        const cats = Array.from(new Set(items.map((c) => c.name))).sort();
        setCategories(cats);
      })
      .catch(() => setCategories([]));

    axios
      .get(`${API_BASE}/api/offers/active`)
      .then((res) => setOffers((res.data?.data || []).slice(0, 3)))
      .catch(async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/offers`);
          setOffers((res.data?.data || []).slice(0, 3));
        } catch {
          setOffers([]);
        }
      });
  }, [open]);

  function goToCategory(cat: string) {
    navigate(`/?cat=${encodeURIComponent(cat)}`);
    onClose();
  }

  // Mapeo de categorías con iconos
  const getCategoryIcon = (categoryName: string) => {
    const icons: { [key: string]: string } = {
      'componentes': '🔧',
      'ordenadores': '💻',
      'perifericos': '🖱️',
      'gaming': '🎮',
      'smartphones': '📱',
      'televisores': '📺',
      'electrodomesticos': '🏠',
      'hogar': '🏡',
      'sonido': '🎧',
      'relojes': '⌚',
      'fotografia': '📷',
      'ocio': '🛴'
    };
    
    const normalized = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (normalized.includes(key)) return icon;
    }
    return '📦'; // Icono por defecto
  };

  return (
    <Portal>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-80 bg-surface border-r border-border text-text shadow-xl transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
        aria-hidden={!open}
      >
        <div className="px-4 py-4 border-b border-border flex items-center justify-between bg-surface">
          <span className="font-semibold">Menú</span>
          <button className="text-sm text-mutedText hover:text-text transition-colors" onClick={onClose}>✕</button>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          {/* Ofertas (desde BD) */}
          {offers.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-mutedText mb-3 uppercase tracking-wide">Ofertas</h3>
              <div className="space-y-2">
                {offers.map((o) => (
                  <Link key={o._id} to={`/`} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 transition-colors" onClick={onClose}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full border border-border bg-center bg-cover flex-shrink-0" style={{ backgroundImage: `url(${o.image || ''})` }} />
                      <span className="truncate">{o.title}</span>
                    </div>
                    <svg className="w-4 h-4 text-mutedText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categorías */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-mutedText mb-3 uppercase tracking-wide">Categorías</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => goToCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="capitalize">{category}</span>
                  </div>
                  <svg className="w-4 h-4 text-mutedText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Menú de Administración */}
          {(role === 'admin' || role === 'employee') && (
            <div className="p-4 border-t border-border bg-gray-50">
              <h3 className="text-sm font-semibold text-mutedText mb-3 uppercase tracking-wide">Menú</h3>
              <div className="space-y-2">
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
                    onClick={onClose}
                  >
                    <span>Panel de Control</span>
                  </Link>
                {/* Aquí puedes agregar más opciones del menú si es necesario */}
              </div>
            </div>
          )}
          
          {/* Menú Principal */}
          <div className="p-4 border-t border-border">
            <h3 className="text-sm font-semibold text-mutedText mb-3 uppercase tracking-wide">Menú Principal</h3>
            <div className="space-y-2">
              <Link 
                to="/" 
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
                onClick={onClose}
              >
                <span>Inicio</span>
                <svg className="w-4 h-4 text-mutedText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer con botón de cerrar sesión */}
        <div className="p-4 border-t border-border bg-surface">
          {role ? (
            <button 
              onClick={() => { onLogout(); onClose(); }} 
              className="w-full h-10 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-medium"
            >
              Cerrar sesión
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" className="text-center h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors" onClick={onClose}>
                Login
              </Link>
              <Link to="/register" className="text-center h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors" onClick={onClose}>
                Registro
              </Link>
            </div>
          )}
        </div>
      </aside>
    </Portal>
  );
}


