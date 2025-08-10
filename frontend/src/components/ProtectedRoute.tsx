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
    const token = localStorage.getItem('accessToken') || '';
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
  }, [requireAdmin]);

  if (authorized === null) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}


