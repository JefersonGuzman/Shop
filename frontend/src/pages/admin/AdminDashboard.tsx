import { useEffect, useMemo, useState } from 'react';
import { http } from '../../lib/http';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de control</h1>
      <Kpis />
      <Analytics />
    </div>
  );
}

function Kpis() {
  const [kpis, setKpis] = useState<{ sales: number; orders: number; products: number } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          http.get('/api/admin/orders', { params: { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' } }),
          http.get('/api/products', { params: { page: 1, limit: 1 } }),
        ]);
        const orders = ordersRes.data?.data || [];
        const totalSales = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
        setKpis({ sales: totalSales, orders: orders.length, products: productsRes.data?.pagination?.total || 0 });
      } catch {}
    })();
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText">Ventas</div>
        <div className="mt-2 text-2xl font-bold text-text">${(kpis?.sales || 0).toLocaleString()}</div>
        <div className="mt-1 text-xs text-mutedText">Acumulado</div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText">Órdenes</div>
        <div className="mt-2 text-2xl font-bold text-text">{kpis?.orders || 0}</div>
        <div className="mt-1 text-xs text-mutedText">Totales</div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText">Productos</div>
        <div className="mt-2 text-2xl font-bold text-text">{kpis?.products || 0}</div>
        <div className="mt-1 text-xs text-mutedText">Activos</div>
      </div>
    </div>
  );
}

function Analytics() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get('/api/admin/orders', { params: { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'asc' } });
        setOrders(res.data?.data || []);
      } catch {}
    })();
  }, []);

  const series = useMemo(() => {
    const byDay = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      byDay.set(d, (byDay.get(d) || 0) + (o.total || 0));
    });
    return Array.from(byDay.entries()).map(([d, v]) => ({ d, v }));
  }, [orders]);

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText mb-2">Ventas por día</div>
        <div className="h-40 w-full relative">
          {/* Gráfico simple SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#0b1625"
              strokeWidth="1.5"
              points={series
                .map((p, i) => {
                  const x = (i / Math.max(1, series.length - 1)) * 100;
                  const max = Math.max(1, ...series.map((s) => s.v));
                  const y = 40 - (p.v / max) * 36 - 2;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
          <div className="absolute bottom-2 left-2 text-xs text-mutedText">{series[0]?.d || ''}</div>
          <div className="absolute bottom-2 right-2 text-xs text-mutedText">{series[series.length - 1]?.d || ''}</div>
        </div>
      </div>
    </div>
  );
}


