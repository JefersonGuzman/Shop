import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-white flex">
      <aside className="w-64 bg-surface border-r border-border p-4">
        <h2 className="text-xl font-bold mb-4">Admin</h2>
        <nav className="space-y-2">
          <Link to="/admin" className="block hover:text-secondary">Dashboard</Link>
          <Link to="/admin/products" className="block hover:text-secondary">Productos</Link>
          <Link to="/admin/orders" className="block hover:text-secondary">Órdenes</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}


