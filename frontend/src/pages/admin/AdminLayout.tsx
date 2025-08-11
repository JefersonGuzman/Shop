import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type Role = 'admin' | 'employee' | 'customer' | null;

function decodeRoleFromJwt(token: string): Role {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const role = payload?.role as Role;
    return role ?? null;
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const [role, setRole] = useState<Role>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    setRole(token ? decodeRoleFromJwt(token) : null);
  }, []);

  // Si es empleado y entra a /admin (dashboard), redirigir a una sección permitida
  useEffect(() => {
    if (role === 'employee' && location.pathname === '/admin') {
      navigate('/admin/products', { replace: true });
    }
  }, [role, location.pathname, navigate]);

  const menuItems = [
    { to: '/admin', label: 'Dashboard', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>) },
    { to: '/admin/products', label: 'Productos', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 10h16" stroke="currentColor" strokeWidth="1.5"/></svg>) },
    { to: '/admin/offers', label: 'Ofertas', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 4h6l-3 4 3 4h-6l-3 4-3-4H3l3-4-3-4h6l3-4z" stroke="currentColor" strokeWidth="1.5"/></svg>) },
    { to: '/admin/orders', label: 'Órdenes', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h12v4H6zM4 6h16v14H4z" stroke="currentColor" strokeWidth="1.5"/></svg>) },
    { to: '/admin/categories', label: 'Categorías', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="currentColor"/></svg>) },
    { to: '/admin/brands', label: 'Marcas', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="17" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>) },
  ];

  const adminOnlyItems = [
    { to: '/admin/users', label: 'Empleados', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.5"/></svg>) },
  ];

  const itemsToRender = role === 'admin'
    ? [...menuItems, ...adminOnlyItems]
    : menuItems.filter((i) => i.to !== '/admin');

  return (
    <div className="min-h-screen bg-background text-white flex">
      <aside className="w-64 bg-surface border-r border-border p-4 text-text">
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-mutedText">Admin</h2>
        <nav className="flex flex-col gap-1 text-sm">
          {itemsToRender.map((i) => (
            <Link key={i.to} to={i.to} className="px-2 py-2 rounded hover:bg-black/5 inline-flex items-center gap-2">
              <span className="text-mutedText">{i.icon}</span>
              <span>{i.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 text-text">
        <Outlet />
      </main>
    </div>
  );
}


