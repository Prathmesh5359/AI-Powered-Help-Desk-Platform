import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fromNodeHeaders } from 'better-auth/node';
import { config } from '../config.js';
import { auth } from '../auth.js';

export interface AuthSessionRequest extends Request {
  session?: typeof auth.$Infer.Session.session;
  user?: (typeof auth.$Infer.Session.user & { role?: string }) | {
    id: string;
    email: string;
    role?: string;
    name: string;
  };
}

export type AuthRequest = AuthSessionRequest;

/**
 * Strict database session middleware using Better Auth.
 * Rejects requests that do not have a valid Better Auth database session.
 */
export const requireSession = async (req: AuthSessionRequest, res: Response, next: NextFunction) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData) {
      return res.status(401).json({ error: 'Unauthorized: Valid database session required' });
    }

    req.session = sessionData.session;
    req.user = sessionData.user;
    next();
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid session' });
  }
};

/**
 * Dual authentication middleware: checks Better Auth database session first,
 * with fallback to JWT Bearer header for legacy support.
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (sessionData) {
      req.session = sessionData.session;
      req.user = sessionData.user;
      return next();
    }
  } catch {
    // Continue to JWT fallback
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = (req.user as any)?.role;
  if (!req.user || role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
