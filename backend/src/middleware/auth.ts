import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: 'admin' | 'employee' | 'customer' };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    req.user = decoded as any;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

// Permite acceso a personal (admin o employee)
export function requireStaff(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'employee') {
    res.status(403).json({ error: 'Staff access required' });
    return;
  }
  next();
}


