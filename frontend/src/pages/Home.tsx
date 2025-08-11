import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatMoney } from '../lib/format';
// import Slider from '../components/Slider';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  images?: (string | { url: string; publicId?: string })[];
};

type Offer = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaTo?: string;
  layout?: 'image-right' | 'image-left';
  bgColor?: string;
  textColor?: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  // searchTag eliminado con "Lo más buscado"
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/products`, { params: { page: 1, limit: 100 } })
      .then((res) => setProducts(res.data?.data || []))
      .catch(() => {});
    axios
      .get(`${API_BASE}/api/offers/active`)
      .then((res) => setOffers((res.data?.data || []).filter((o: Offer) => o.image)))
      .catch(async () => {
        // Fallback: si /active no existe aún en el backend compilado, usar listado normal
        try {
          const res = await axios.get(`${API_BASE}/api/offers`);
          setOffers((res.data?.data || []).filter((o: Offer) => (o as any).image));
        } catch {}
      });
  }, []);

  // Carrusel automático para ofertas
  useEffect(() => {
    if (!offers || offers.length <= 1) return;
    const id = window.setInterval(() => {
      setBannerIndex((i) => (i + 1) % offers.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [offers]);

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

  function resolveImageUrl(images?: (string | { url: string })[]): string | undefined {
    if (!images || images.length === 0) return undefined;
    const first = images[0] as string | { url: string } | undefined;
    if (!first) return undefined;
    return typeof first === 'string' ? first : first.url;
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 xl:px-0 max-w-[1280px] mx-auto py-6 text-text">
      {offers.length > 0 ? (
        (() => {
          const current = offers[bannerIndex] || offers[0];
          const layoutLeft = current.layout === 'image-left';
          return (
            <div
              className={`mb-8 border border-border shadow-sm bg-white rounded-[10px] p-[10px] text-center`}
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10 ${layoutLeft ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <div className="flex flex-col items-center justify-center text-[#0b1625]">
                  {current.eyebrow && (
                    <div className="uppercase tracking-[.2em] text-sm font-semibold opacity-70 mb-3">
                      {current.eyebrow}
                    </div>
                  )}
                  <h2 className="text-5xl md:text-6xl font-extrabold leading-[0.95] text-[#0b1625]">
                    {current.headline || current.title}
                  </h2>
                  {(current.description || current.subheadline) && (
                    <p className="mt-4 text-lg text-[#0b1625]/80 max-w-xl">{current.description || current.subheadline}</p>
                  )}
                  <div className="mt-8">
                    <button
                      onClick={() => navigate(current.ctaTo || '/')}
                      className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-[#0b1625] text-white hover:bg-black/90 shadow-md"
                    >
                      {current.ctaLabel || 'COMPRAR AHORA'}
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute -top-6 -left-6 right-0 bottom-0 rounded-2xl bg-white/60" />
                  <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full border border-border bg-[#e9ebf0] overflow-hidden grid place-items-center">
                    {current.image ? (
                      <div className="absolute inset-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url(${current.image})` }} />
                    ) : (
                      <span className="text-[#3b4656] text-2xl font-semibold">Imagen</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Dots */}
              {offers.length > 1 && (
                <div className="flex items-center justify-center gap-1 pb-2">
                  {offers.map((_, i) => (
                    <button key={i} onClick={() => setBannerIndex(i)} className={`w-2 h-2 rounded-full ${i === bannerIndex ? 'bg-[#0b1625]' : 'bg-black/20'}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="mb-8 rounded-2xl border border-border shadow-sm" style={{ background: '#f6f7fb' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10">
            <div className="flex flex-col justify-center text-[#0b1625]">
              <div className="uppercase tracking-[.2em] text-sm font-semibold opacity-70 mb-3">...</div>
              <h2 className="text-5xl md:text-6xl font-extrabold leading-[0.95]">...</h2>
              <p className="mt-4 text-lg text-[#0b1625]/80 max-w-xl">...</p>
              <div className="mt-8">
                <button className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-[#0b1625] text-white hover:bg-black/90 shadow-md">...</button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute -top-6 -left-6 right-0 bottom-0 rounded-2xl bg-white/60" />
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full border border-border bg-[#e9ebf0] overflow-hidden grid place-items-center text-[#3b4656] text-2xl font-semibold">...</div>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Marcas</h1>
      {brands.length > 0 && (
        <div className="mb-10">
          <h3 className="text-base font-medium mb-4 text-center">Encuentra lo que te encantará</h3>
          <div className="flex flex-wrap items-center justify-center gap-5 py-2">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`w-20 h-20 rounded-full border ${selectedBrand === null ? 'border-black' : 'border-border'} bg-white grid place-items-center shadow-sm hover:shadow-md transition`}
            >
              <span className="text-sm text-text capitalize">Todas</span>
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`w-20 h-20 rounded-full border ${selectedBrand === b ? 'border-black' : 'border-border'} bg-white grid place-items-center shadow-sm hover:shadow-md transition`}
              >
                <span className="text-sm text-text capitalize">{b}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categorías como secciones con tarjetas más suaves */}
      {categories.map((cat) => (
        <div key={cat} id={`cat-${cat}`} className="mb-8">
          <h2 className="text-lg font-medium mb-3 capitalize">{cat}</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {products
              .filter((p) => p.category === cat)
              .filter((p) => (selectedBrand ? p.brand === selectedBrand : true))
              // filtro por tag removido
              .map((p) => (
              <div key={p._id} className="w-[260px] bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col" onClick={() => navigate(`/product/${p._id}`)}>
            <div
              className="h-44 bg-cover bg-center"
              style={{ backgroundImage: `url(${resolveImageUrl(p.images) || 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'})` }}
            />
            <div className="p-3 flex flex-col gap-2 flex-1">
              <p className="text-sm text-mutedText capitalize">{p.category}</p>
              <h3 className="text-base font-medium leading-tight h-[40px] overflow-hidden">{p.name}</h3>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-text font-semibold">${formatMoney(p.price)}</span>
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


