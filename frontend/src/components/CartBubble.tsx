import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import Portal from './Portal';
import { useNavigate } from 'react-router-dom';

export default function CartBubble() {
  const { items, totalQuantity, subtotal, updateQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();
  const prevQty = useRef(totalQuantity);

  useEffect(() => {
    if (totalQuantity > prevQty.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
    prevQty.current = totalQuantity;
  }, [totalQuantity]);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  const goToCart = () => {
    setOpen(false);
    navigate('/cart');
  };

  return (
    <>
      <button
        aria-label="Abrir carrito"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-black text-white shadow-lg hover:bg-black/90 flex items-center justify-center"
      >
        <div className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h15l-1.5 9H8L6 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="20" r="1" fill="currentColor"/><circle cx="18" cy="20" r="1" fill="currentColor"/></svg>
          <span className="absolute -top-3 -right-3 min-w-[22px] h-[22px] px-1 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center border border-border">
            {totalQuantity}
          </span>
          {pulse && (
            <span className="absolute -top-3 -right-3 inline-flex h-[22px] w-[22px] rounded-full bg-black opacity-75 animate-ping" />
          )}
        </div>
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="fixed right-5 bottom-24 w-[320px] max-h-[70vh] bg-white border border-border shadow-xl rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Mi carrito</h3>
                <button className="text-xs text-mutedText hover:text-text" onClick={() => setOpen(false)}>Cerrar</button>
              </div>
              <div className="max-h-[46vh] overflow-y-auto divide-y divide-border">
                {hasItems ? (
                  items.map((it) => (
                    <div key={it.productId} className="p-3 flex items-center gap-3">
                      {it.image ? (
                        <img src={it.image} className="w-12 h-12 rounded border border-border object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded border border-border bg-black/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{it.name}</div>
                        <div className="text-xs text-mutedText truncate">x{it.quantity} · ${it.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="h-6 w-6 rounded border border-border" onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))}>-</button>
                        <span className="text-sm w-5 text-center">{it.quantity}</span>
                        <button className="h-6 w-6 rounded border border-border" onClick={() => updateQuantity(it.productId, it.quantity + 1)}>+</button>
                      </div>
                      <button className="ml-2 text-mutedText hover:text-red-600" onClick={() => removeItem(it.productId)} aria-label="Eliminar">×</button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-mutedText text-sm">Tu carrito está vacío</div>
                )}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-mutedText">Total</span>
                  <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <button className="w-full h-10 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50" disabled={!hasItems} onClick={goToCart}>
                  Comprar
                </button>
              </div>
            </aside>
          </div>
        </Portal>
      )}
    </>
  );
}


