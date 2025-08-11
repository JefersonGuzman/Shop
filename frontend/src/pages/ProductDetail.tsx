import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/format';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  images?: { url: string; publicId?: string }[];
  description?: string;
  tags?: string[];
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { addItem, totalQuantity } = useCart();
  const [fly, setFly] = useState<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await axios.get(`${API_BASE}/api/products/${id}`);
        const p = res.data?.data as Product;
        if (mounted) {
          setProduct(p);
          const first = p?.images?.[0]?.url;
          setSelectedImage(first || null);
        }
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('[ProductDetail] load error:', e?.response?.data || e?.message || e);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const availabilityText = useMemo(() => {
    if (!product) return '';
    return product.stock > 0 ? `Disponible (${product.stock} en stock)` : 'Agotado';
  }, [product]);

  if (loading) {
    return <div className="max-w-[1280px] mx-auto px-4 py-8 text-text">Cargando…</div>;
  }

  if (!product) {
    return <div className="max-w-[1280px] mx-auto px-4 py-8 text-text">Producto no encontrado.</div>;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 text-text">
      <div className="bg-white border border-border rounded-2xl shadow-sm p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-mutedText mb-4">
        <Link to="/" className="hover:underline">Inicio</Link>
        <span className="mx-1">›</span>
        <span className="text-text/80">Producto</span>
        {product?.category && (
          <>
            <span className="mx-1">›</span>
            <Link to={`/?cat=${encodeURIComponent(product.category)}`} className="hover:underline capitalize">
              {product.category}
            </Link>
          </>
        )}
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Izquierda: galería */}
        <div>
          <div className="aspect-[4/3] bg-center bg-cover border border-border rounded-xl" style={{ backgroundImage: `url(${selectedImage || product.images?.[0]?.url || ''})` }} />
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-16 rounded-md border ${selectedImage === img.url ? 'border-black' : 'border-border'} bg-center bg-cover shrink-0`}
                  style={{ backgroundImage: `url(${img.url})` }}
                />
              ))}
            </div>
          )}
        </div>
        {/* Derecha: info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">{product.name}</h1>
          <p className="text-sm text-mutedText mt-2">{product.brand} · {product.category}</p>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {product.tags.map((t) => (
                <span key={t} className="inline-flex items-center px-3 h-7 rounded-full border border-border bg-background text-xs capitalize">{t}</span>
              ))}
            </div>
          )}
          {product.description && (
            <p className="mt-4 text-base leading-relaxed text-text/90 whitespace-pre-line">{product.description}</p>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <div className="text-3xl font-bold">${formatMoney(product.price)}</div>
              <div className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{availabilityText}</div>
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm text-mutedText mb-1">Cantidad</label>
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-md border border-border" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <input
                  type="number"
                  className="h-9 w-16 text-center rounded-md border border-border"
                  value={qty}
                  min={1}
                  max={Math.max(1, product.stock)}
                  onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
                />
                <button className="h-9 w-9 rounded-md border border-border" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>
            <div className="sm:col-span-1 flex flex-col items-start sm:items-end gap-2">
              <div className="text-sm text-mutedText">Total</div>
              <div className="text-2xl font-bold">${formatMoney(product.price * qty)}</div>
              <button
                disabled={product.stock <= 0}
                className="h-10 px-5 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50"
                onClick={(e) => {
                  addItem({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0]?.url, brand: product.brand, sku: undefined }, qty);
                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                  setFly({ x: rect.left + rect.width / 2, y: rect.top, id: Date.now() });
                  setTimeout(() => setFly(null), 800);
                }}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Fly-to-cart animation */}
      {fly && (
        <div
          key={fly.id}
          style={{ left: fly.x, top: fly.y }}
          className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-8 w-8 rounded-full bg-black/80 text-white flex items-center justify-center animate-[fly_0.8s_ease-in-out_forwards]">
            +{qty}
          </div>
        </div>
      )}
      <style>
        {`
        @keyframes fly {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          70% { transform: translate(-50%, -140%) scale(0.9); opacity: 0.9; }
          100% { transform: translate(120px, -320px) scale(0.6); opacity: 0; }
        }
        `}
      </style>
    </div>
  );
}


