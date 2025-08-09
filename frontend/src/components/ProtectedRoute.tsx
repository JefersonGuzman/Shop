import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Props = {
  children: JSX.Element;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    if (!token) {
      setAuthorized(false);
      return;
    }
    axios
      .get(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const role = res.data?.user?.role || 'customer';
        if (requireAdmin) setAuthorized(role === 'admin');
        else setAuthorized(true);
      })
      .catch(() => setAuthorized(false));
  }, [requireAdmin]);

  if (authorized === null) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}


