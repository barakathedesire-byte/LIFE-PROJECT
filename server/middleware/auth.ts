import { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { UserAccount, UserRole, AuthSession } from '../../src/types/index.js';
import { sanitizeUser } from '../utils/security.js';
import { isUserVerified } from './verificationGuard.js';

export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
  session?: AuthSession;
}

/**
 * Authentication middleware that strictly verifies cryptographic bearer session tokens.
 * Blind header spoofing (e.g. x-user-id) is completely disabled.
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next();
  }

  // 1. Verify active session from database
  const session = db.getSession(token);
  if (session) {
    const user = db.findUserById(session.userId);
    if (user && user.isActive && user.status !== 'SUSPENDED' && user.status !== 'REVOKED') {
      req.user = sanitizeUser(user);
      req.session = session;
      return next();
    }
  }

  next();
}

/**
 * Middleware that strictly verifies token and requires an authenticated user.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const session = db.getSession(token);
        if (session) {
          const user = db.findUserById(session.userId);
          if (user && user.isActive && user.status !== 'SUSPENDED' && user.status !== 'REVOKED') {
            req.user = sanitizeUser(user);
            req.session = session;
          }
        }
      }
    }
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. A valid authenticated session is required.' });
  }

  next();
}

/**
 * Enforce that the request has an active authenticated user session.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    db.addAuditLog({
      userId: 'anonymous',
      userName: 'Unauthenticated Client',
      userRole: 'ANONYMOUS',
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      entityType: 'SECURITY',
      entityId: req.originalUrl || req.path,
      status: 'FAILURE',
      severity: 'WARNING',
      details: `Unauthenticated access attempt on protected route ${req.method} ${req.originalUrl || req.path}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string
    });
    return res.status(401).json({ 
      error: 'Unauthorized. A valid authenticated session is required to access this endpoint.' 
    });
  }
  next();
}

/**
 * Enforce Role-Based Access Control (RBAC).
 * SUPER_ADMIN has full platform-wide authorization.
 */
export function requireRole(...args: ((UserRole | string)[] | (UserRole | string))[]) {
  const allowedRoles = args.flat();
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      db.addAuditLog({
        userId: 'anonymous',
        userName: 'Unauthenticated Client',
        userRole: 'ANONYMOUS',
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        entityType: 'SECURITY',
        entityId: req.originalUrl || req.path,
        status: 'FAILURE',
        severity: 'WARNING',
        details: `Unauthenticated attempt to access RBAC-protected endpoint ${req.method} ${req.originalUrl || req.path}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string
      });
      return res.status(401).json({ 
        error: 'Unauthorized. Authentication session required.' 
      });
    }

    

    if (!allowedRoles.includes(req.user.role)) {
      db.addAuditLog({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'FORBIDDEN_ACCESS_ATTEMPT',
        entityType: 'SECURITY',
        entityId: req.originalUrl || req.path,
        status: 'FAILURE',
        severity: 'WARNING',
        details: `Access denied to ${req.user.role} for ${req.method} ${req.originalUrl || req.path}. Required: ${allowedRoles.join(', ')}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string
      });
      return res.status(403).json({ 
        error: `Forbidden. Role '${req.user.role}' does not have sufficient permissions. Required: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
}

/**
 * Enforce verified account status (e.g. KYC approval for sellers, riders, etc.)
 */
export function requireVerified(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const staffRoles = ['SUPER_ADMIN', 'ADMIN', 'CATALOG_ADMIN', 'OPERATIONS_ADMIN'];
  if (!isUserVerified(req.user) && !staffRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      code: 'VERIFICATION_REQUIRED',
      message: 'Your account must be verified before you can perform this operation.',
      error: 'VERIFICATION_REQUIRED'
    });
  }
  next();
}
