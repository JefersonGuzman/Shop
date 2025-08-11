import { useEffect, useMemo, useState } from 'react';
import { http } from '../../lib/http';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de control</h1>
      <Kpis />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Analytics />
        <CategoryChart />
      </div>
      <ProductSalesTable />
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
  const [data, setData] = useState<{ salesByDay: { date: string; total: number }[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get('/api/admin/analytics/sales');
        setData(res.data?.data || null);
      } catch (e: any) {
        // Fallback: calcular por día desde /orders si la ruta aún no está disponible
        try {
          const res = await http.get('/api/admin/orders', { params: { page: 1, limit: 200, sortBy: 'createdAt', sortOrder: 'asc' } });
          const orders = res.data?.data || [];
          const byDay = new Map<string, number>();
          orders.forEach((o: any) => {
            const d = new Date(o.createdAt).toISOString().slice(0, 10);
            byDay.set(d, (byDay.get(d) || 0) + (o.total || 0));
          });
          const salesByDay = Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));
          setData({ salesByDay });
        } catch {}
      }
    })();
  }, []);

  const series = useMemo(() => {
    const rows = (data?.salesByDay || []).sort((a, b) => a.date.localeCompare(b.date));
    return rows.map((r) => ({ d: r.date, v: r.total }));
  }, [data]);

  // Cálculos para barras
  const max = Math.max(1, ...series.map((s) => s.v));
  const barWidthPct = series.length > 0 ? Math.max(6, Math.min(16, Math.floor(80 / series.length))) : 8;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText mb-2">Ventas por día</div>
        <div className="h-48 w-full">
          {series.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-mutedText">Sin datos</div>
          ) : (
            <div className="relative h-full w-full">
              <div className="absolute inset-0">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <div key={t} className="absolute left-0 right-0 border-t border-border" style={{ bottom: `${t * 100}%`, opacity: 0.5 }} />
                ))}
              </div>
              <div className="absolute inset-2 flex items-end gap-2">
                {series.map((p) => (
                  <div key={p.d} className="flex-1 flex flex-col items-center" style={{ minWidth: `${barWidthPct}px` }}>
                    <div
                      className="w-full bg-[#0b1625] rounded-t"
                      style={{ height: `${Math.max(2, (p.v / max) * 90)}%` }}
                      title={`${p.d} - $${p.v.toLocaleString()}`}
                    />
                    <div className="mt-1 text-[10px] text-mutedText truncate w-full text-center" title={p.d}>
                      {p.d.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryChart() {
  const [data, setData] = useState<{ salesByCategory: { category: string; total: number }[] } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get('/api/admin/analytics/sales');
        setData(res.data?.data || null);
      } catch {
        // Fallback robusto: agrupar por categoría desde /orders + mapeo por productId usando /products
        try {
          const res = await http.get('/api/admin/orders', {
            params: { page: 1, limit: 200, sortBy: 'createdAt', sortOrder: 'asc' },
          });
          const orders = res.data?.data || [];

          // Construir mapa productId -> categoría desde /api/products
          let productIdToCategory = new Map<string, string>();
          try {
            const pr = await http.get('/api/products', { params: { page: 1, limit: 1000 } });
            const products: any[] = pr.data?.data || pr.data?.products || [];
            products.forEach((p: any) => {
              const id = String(p._id || '');
              if (id) productIdToCategory.set(id, p.category || 'Uncategorized');
            });
          } catch {}

          const map = new Map<string, number>();
          orders.forEach((o: any) => {
            (o.items || []).forEach((it: any) => {
              const id = String(it?.product?._id || it?.product || '');
              const cat = it?.product?.category || productIdToCategory.get(id) || 'Uncategorized';
              map.set(cat, (map.get(cat) || 0) + (it?.subtotal || 0));
            });
          });
          const rows = Array.from(map.entries())
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);
          setData({ salesByCategory: rows });
        } catch {}
      }
    })();
  }, []);

  const rows = (data?.salesByCategory || []).filter((r) => r && typeof r.total === 'number');
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card mb-8">
      <div className="text-sm text-mutedText mb-3">Ventas por categoría</div>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="text-xs text-mutedText">Sin datos</div>
        ) : rows.map((r) => (
          <div key={r.category} className="flex items-center gap-3">
            <div className="w-36 text-xs text-mutedText truncate">{r.category}</div>
            <div className="flex-1 h-3 bg-background rounded-xl overflow-hidden border border-border">
              <div
                className="h-full bg-[#0b1625]"
                style={{ width: `${(r.total / max) * 100}%` }}
              />
            </div>
            <div className="w-24 text-right text-xs text-text">${r.total.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSalesTable() {
  const [data, setData] = useState<{ salesByProduct: { productId: string; name: string; quantity: number; total: number }[] } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get('/api/admin/analytics/sales');
        setData(res.data?.data || null);
      } catch {
        // Fallback: agrupar por producto desde /orders
        try {
          const res = await http.get('/api/admin/orders', { params: { page: 1, limit: 200, sortBy: 'createdAt', sortOrder: 'asc' } });
          const orders = res.data?.data || [];
          const map = new Map<string, { name: string; total: number; quantity: number }>();
          orders.forEach((o: any) => {
            (o.items || []).forEach((it: any) => {
              const id = it?.product?._id || it?.product;
              const name = it?.product?.name || 'Unnamed';
              const entry = map.get(id) || { name, total: 0, quantity: 0 };
              entry.total += it?.subtotal || 0;
              entry.quantity += it?.quantity || 0;
              map.set(id, entry);
            });
          });
          const rows = Array.from(map.entries()).map(([productId, v]) => ({ productId, name: v.name, total: v.total, quantity: v.quantity }));
          setData({ salesByProduct: rows });
        } catch {}
      }
    })();
  }, []);

  const rows = data?.salesByProduct || [];

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="text-sm text-mutedText mb-3">Ventas por producto</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-mutedText border-b border-border">
              <th className="py-2 pr-4">Producto</th>
              <th className="py-2 pr-4">Unidades</th>
              <th className="py-2 pr-4">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.productId} className="border-b border-border/60">
                <td className="py-2 pr-4 text-text">{r.name}</td>
                <td className="py-2 pr-4 text-text">{r.quantity}</td>
                <td className="py-2 pr-4 text-text">${r.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


