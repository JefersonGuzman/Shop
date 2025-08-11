import { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/format';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.price * it.quantity, 0), [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8 text-text">
        <h1 className="text-2xl font-semibold mb-4">Mi cesta</h1>
        <p className="text-mutedText">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 text-text">
      <h1 className="text-2xl font-semibold mb-6">Mi cesta</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.productId} className="flex items-center gap-4 p-3 border border-border rounded-md bg-white">
              <div className="w-20 h-16 bg-center bg-cover rounded-md border border-border" style={{ backgroundImage: `url(${it.image || ''})` }} />
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-mutedText">{it.brand}</div>
              </div>
              <div className="w-32">
                <div className="text-sm text-mutedText mb-1">Cantidad</div>
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded-md border border-border" onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))}>-</button>
                  <input type="number" className="h-8 w-14 text-center rounded-md border border-border" value={it.quantity} onChange={(e) => updateQuantity(it.productId, Math.max(1, Number(e.target.value) || 1))} />
                  <button className="h-8 w-8 rounded-md border border-border" onClick={() => updateQuantity(it.productId, it.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="w-28 text-right font-semibold">${formatMoney(it.price * it.quantity)}</div>
              <button className="text-red-600 text-sm" onClick={() => removeItem(it.productId)}>Eliminar</button>
            </div>
          ))}
        </div>
        <aside className="bg-white border border-border rounded-md p-4 h-fit">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span className="font-semibold">${formatMoney(subtotal)}</span>
          </div>
          <div className="text-xs text-mutedText mb-4">Los impuestos y gastos de envío se calculan en el checkout.</div>
          <button className="w-full h-10 rounded-md bg-black text-white hover:bg-black/90">Proceder al pago</button>
          <button className="w-full h-10 rounded-md border border-border mt-2" onClick={clear}>Vaciar carrito</button>
        </aside>
      </div>
    </div>
  );
}


