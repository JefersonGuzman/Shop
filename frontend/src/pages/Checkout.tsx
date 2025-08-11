import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { http } from '../lib/http';
import { formatMoney } from '../lib/format';

export default function Checkout() {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.quantity, 0), [items]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setStatus('No tienes productos en el carrito.');
      return;
    }
    if (!fullName || !street || !city || !state || !zipCode || !country) {
      setStatus('Completa todos los campos.');
      return;
    }
    try {
      setLoading(true);
      setStatus('');
      const payload = {
        items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
        shippingAddress: { street, city, state, zipCode, country },
        paymentMethod,
      };
      const res = await http.post('/api/orders', payload);
      clear();
      navigate(`/`);
      setStatus(`Orden creada: #${res.data?.data?.orderNumber || ''}`);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo procesar el pago';
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8 text-text">
      <h1 className="text-2xl font-semibold mb-6">Proceder al pago</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-mutedText mb-1">Nombre completo</label>
            <input className="h-10 w-full rounded-md border border-border px-3" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-mutedText mb-1">Dirección</label>
            <input className="h-10 w-full rounded-md border border-border px-3" value={street} onChange={(e) => setStreet(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-mutedText mb-1">Ciudad</label>
              <input className="h-10 w-full rounded-md border border-border px-3" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-mutedText mb-1">Estado/Provincia</label>
              <input className="h-10 w-full rounded-md border border-border px-3" value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-mutedText mb-1">ZIP Code</label>
              <input className="h-10 w-full rounded-md border border-border px-3" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-mutedText mb-1">País</label>
              <input className="h-10 w-full rounded-md border border-border px-3" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-mutedText mb-1">Método de pago</label>
            <select className="h-10 w-full rounded-md border border-border px-3" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="card">Tarjeta</option>
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="h-10 px-5 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50">
            {loading ? 'Procesando…' : 'Pagar y crear orden'}
          </button>
          {status && (
            <p className={`text-sm ${/no se pudo|error|insuficiente/i.test(status) ? 'text-red-600' : 'text-green-600'}`}>{status}</p>
          )}
        </form>

        <aside className="bg-white border border-border rounded-md p-4 h-fit">
          <h2 className="text-lg font-semibold mb-3">Resumen</h2>
          <div className="space-y-2 text-sm max-h-56 overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={it.productId} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded border border-border bg-center bg-cover flex-shrink-0" style={{ backgroundImage: `url(${it.image || ''})` }} />
                  <span className="truncate">{it.name} × {it.quantity}</span>
                </div>
                <span className="font-medium whitespace-nowrap">${formatMoney(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">${formatMoney(subtotal)}</span>
          </div>
          <div className="text-xs text-mutedText">Impuestos y envío incluidos en el total al confirmar</div>
        </aside>
      </div>
    </div>
  );
}


