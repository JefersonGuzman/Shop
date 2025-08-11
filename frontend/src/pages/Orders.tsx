import { useEffect, useState } from 'react';
import { http } from '../lib/http';

type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: Array<{ product: { name: string; images?: { url: string }[] } | string; quantity: number; price: number }>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await http.get('/api/orders/my');
        setOrders(res.data?.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8 text-text">
      <h1 className="text-2xl font-semibold mb-6">Mis pedidos</h1>
      {loading ? (
        <div>Cargando…</div>
      ) : orders.length === 0 ? (
        <div className="text-mutedText">Aún no tienes pedidos.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="border border-border rounded-lg bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">#{o.orderNumber}</div>
                  <div className="text-mutedText">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm"><span className="text-mutedText">Estado:</span> {o.status}</div>
                  <div className="text-sm"><span className="text-mutedText">Pago:</span> {o.paymentStatus}</div>
                  <div className="text-base font-semibold">${o.total?.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-3 max-h-40 overflow-y-auto divide-y divide-border">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded border border-border bg-center bg-cover" style={{ backgroundImage: `url(${(it as any)?.product?.images?.[0]?.url || ''})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{(it as any)?.product?.name || 'Producto'}</div>
                      <div className="text-xs text-mutedText">x{it.quantity} · ${it.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


