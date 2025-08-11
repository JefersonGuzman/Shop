import React from 'react';
import AccessDenied from '../pages/AccessDenied';

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

type Props = {
  allowed: Role[];
  children: React.ReactElement;
};

export default function RequireRoles({ allowed, children }: Props) {
  const token = localStorage.getItem('accessToken') || '';
  const role = token ? decodeRoleFromJwt(token) : null;

  if (!role) {
    // No autenticado: dejar que ProtectedRoute maneje redirección al login
    return <AccessDenied reason="no-auth" />;
  }

  if (!allowed.includes(role)) {
    return <AccessDenied reason="no-permission" />;
  }

  return children;
}


