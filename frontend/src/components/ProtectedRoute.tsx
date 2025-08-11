import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
  children: React.ReactElement;
  requireAdmin?: boolean;
};

function decodeRoleFromJwt(token: string): 'admin' | 'employee' | 'customer' | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const role = payload?.role as 'admin' | 'employee' | 'customer' | undefined;
    return role ?? null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const ensureAuth = async () => {
      let token = localStorage.getItem('accessToken') || '';
      if (!token) {
        // Intentar refrescar con refreshToken
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
          try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: refresh }),
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem('accessToken', data.accessToken);
              if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
              token = data.accessToken;
            }
          } catch {}
        }
      }

      if (!token) {
        setAuthorized(false);
        return;
      }

      const role = decodeRoleFromJwt(token);
      if (!role) {
        setAuthorized(false);
        return;
      }

      if (requireAdmin) setAuthorized(role === 'admin' || role === 'employee');
      else setAuthorized(true);
    };

    ensureAuth();
  }, [requireAdmin]);

  if (authorized === null) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (!authorized) {
    const next = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/';
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
}


