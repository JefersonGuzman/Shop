import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CategoriesDrawer({ open, onClose }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    axios
      .get(`${API_BASE}/api/categories`)
      .then((res) => {
        const items = (res.data?.data || []) as Array<{ name: string }>;
        const cats = Array.from(new Set(items.map((c) => c.name))).sort();
        setCategories(cats);
      })
      .catch(() => setCategories([]));
  }, [open]);

  function goToCategory(cat: string) {
    navigate(`/?cat=${encodeURIComponent(cat)}`);
    onClose();
  }

  return (
    <Fragment>
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-[320px] bg-surface border-r border-border text-text transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <span className="font-semibold">Todas las categorías</span>
          <button className="text-sm text-mutedText" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-full">
          {categories.map((c) => (
            <button
              key={c}
              className="w-full text-left px-3 py-2 rounded hover:bg-black/5 capitalize"
              onClick={() => goToCategory(c)}
            >
              {c}
            </button>
          ))}
        </nav>
      </aside>
    </Fragment>
  );
}


