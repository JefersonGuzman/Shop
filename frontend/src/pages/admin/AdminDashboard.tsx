import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { http } from '../../lib/http';

// Define the structure of the analytics data
interface SalesAnalytics {
  range: { from: string; to: string };
  salesByDay: { date: string; total: number; orders: number }[];
  salesByCategory: { category: string; total: number; quantity: number }[];
  salesByProduct: { productId: string; name: string; total: number; quantity: number }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await http.get('/api/admin/analytics/sales');
        setAnalytics(res.data?.data || null);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Cargando panel...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!analytics) {
    return <div className="text-center p-8">No hay datos de analíticas disponibles.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de control</h1>
      <Kpis data={analytics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart data={analytics.salesByDay} />
        <CategoryChart data={analytics.salesByCategory} />
      </div>
      <ProductSalesTable data={analytics.salesByProduct} />
    </div>
  );
}

function Kpis({ data }: { data: SalesAnalytics }) {
  const { totalSales, totalOrders, totalProducts } = useMemo(() => {
    const totalSales = data.salesByDay.reduce((sum, day) => sum + day.total, 0);
    const totalOrders = data.salesByDay.reduce((sum, day) => sum + day.orders, 0);
    // We can't get total products from the analytics endpoint, so we'll leave it for now or fetch separately if needed.
    // For this version, we'll derive it from the sales by product list.
    const totalProducts = data.salesByProduct.length;
    return { totalSales, totalOrders, totalProducts };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText">Ventas Totales</div>
        <div className="mt-2 text-2xl font-bold text-text">${totalSales.toLocaleString()}</div>
        <div className="mt-1 text-xs text-mutedText">En el período seleccionado</div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText">Órdenes Totales</div>
        <div className="mt-2 text-2xl font-bold text-text">{totalOrders.toLocaleString()}</div>
        <div className="mt-1 text-xs text-mutedText">En el período seleccionado</div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="text-sm text-mutedText">Productos Vendidos</div>
        <div className="mt-2 text-2xl font-bold text-text">{totalProducts}</div>
        <div className="mt-1 text-xs text-mutedText">Tipos de productos distintos</div>
      </div>
    </div>
  );
}

function SalesChart({ data }: { data: SalesAnalytics['salesByDay'] }) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    }));
  }, [data]);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card p-3">
      <div className="text-sm text-mutedText mb-4">Ventas por día</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 60, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(14, 14, 14, 0.7)" fontSize={12} />
          <YAxis width={70} tickMargin={6} stroke="rgba(27, 27, 27, 0.7)" fontSize={12} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="total" name="Ventas" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryChart({ data }: { data: SalesAnalytics['salesByCategory'] }) {
    const chartData = useMemo(() => data.slice(0, 10).sort((a, b) => a.total - b.total), [data]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="text-sm text-mutedText mb-4">Top 10 - Ventas por Categoría</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(5, 5, 5, 0.7)" fontSize={12} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
          <YAxis dataKey="category" type="category" stroke="rgba(10, 10, 10, 0.7)" color="red" fontSize={12} width={80} tick={{ textAnchor: 'end' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar dataKey="total" name="Ventas" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductSalesTable({ data }: { data: SalesAnalytics['salesByProduct'] }) {
  const topProducts = useMemo(() => data.slice(0, 15), [data]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="text-sm text-mutedText mb-3">Top 15 - Productos más vendidos</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-mutedText border-b border-border">
              <th className="py-2 pr-4 font-medium">Producto</th>
              <th className="py-2 pr-4 font-medium text-right">Unidades</th>
              <th className="py-2 pr-4 font-medium text-right">Ventas Totales</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p) => (
              <tr key={p.productId} className="border-b border-border/60 hover:bg-white/5">
                <td className="py-2 pr-4 text-text">{p.name}</td>
                <td className="py-2 pr-4 text-text text-right">{p.quantity.toLocaleString()}</td>
                <td className="py-2 pr-4 text-text text-right">${p.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}