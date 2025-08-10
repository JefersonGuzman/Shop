import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  images?: string[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTag, setSearchTag] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    axios.get(`${API_BASE}/api/products`).then((res) => setProducts(res.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    setCategories(cats);
    const brs = Array.from(new Set(products.map((p) => p.brand))).sort();
    setBrands(brs);
  }, [products]);

  // Aplicar filtro por categoría desde ?cat=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) {
      // Si llega una categoría, desplazamos a su sección
      const el = document.getElementById(`cat-${cat}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.search]);

  return (
    <div className="px-4 md:px-6 lg:px-8 xl:px-0 max-w-[1280px] mx-auto py-6 text-text">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Recommended for you</h1>

      {/* Filtro por marca */}
      {brands.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">Marcas</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              className={`inline-flex items-center justify-center px-4 h-9 rounded-full border transition-colors leading-none ${selectedBrand === null ? 'bg-black text-white border-black' : 'bg-white text-text border-border hover:bg-black/5'}`}
              onClick={() => setSelectedBrand(null)}
            >
              Todas
            </button>
            {brands.map((b) => (
              <button
                key={b}
                className={`inline-flex items-center justify-center px-4 h-9 rounded-full border transition-colors capitalize leading-none ${selectedBrand === b ? 'bg-black text-white border-black' : 'bg-white text-text border-border hover:bg-black/5'}`}
                onClick={() => setSelectedBrand(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lo más buscado (chips) */}
      <div className="mb-8">
        <h3 className="text-base font-medium mb-3">Lo más buscado</h3>
        <div className="flex flex-wrap gap-2">
          {['Laptop', 'Monitor', 'GPU', 'SSD', 'Apple', 'HP', 'Dell'].map((tag) => (
            <button
              key={tag}
              className={`inline-flex items-center justify-center px-4 h-9 rounded-full border border-border bg-white text-text hover:bg-black/5 transition leading-none ${searchTag === tag ? '!bg-black !text-white !border-black' : ''}`}
              onClick={() => setSearchTag((prev) => (prev === tag ? null : tag))}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Categorías como secciones */}
      {categories.map((cat) => (
        <div key={cat} id={`cat-${cat}`} className="mb-8">
          <h2 className="text-lg font-medium mb-3 capitalize">{cat}</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products
              .filter((p) => p.category === cat)
              .filter((p) => (selectedBrand ? p.brand === selectedBrand : true))
              .filter((p) => (searchTag ? (p.name + ' ' + p.brand + ' ' + p.category).toLowerCase().includes(searchTag.toLowerCase()) : true))
              .map((p) => (
              <div key={p._id} className="bg-surface border border-border rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-shadow">
            <div
              className="aspect-[4/3] bg-cover bg-center"
              style={{ backgroundImage: `url(${p.images?.[0] || 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'})` }}
            />
            <div className="p-3">
              <p className="text-sm text-mutedText capitalize">{p.category}</p>
              <h3 className="text-base font-medium leading-tight mt-1">{p.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-text font-semibold">${p.price.toFixed(2)}</span>
                <span className="text-xs text-mutedText">{p.brand}</span>
              </div>
            </div>
          </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


