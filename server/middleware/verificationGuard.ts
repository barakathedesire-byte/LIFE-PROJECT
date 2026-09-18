import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { UserAccount } from '../../src/types/index.js';

export function isUserVerified(user?: UserAccount | null): boolean {
  if (!user) return false;
  if (user.isActive === false || user.status === 'SUSPENDED' || user.status === 'REVOKED') {
    return false;
  }
  const status = user.verificationStatus as string | undefined;
  if (
    status === 'REJECTED' ||
    status === 'SUSPENDED' ||
    status === 'REVOKED' ||
    status === 'PENDING' ||
    status === 'PENDING_VERIFICATION' ||
    status === 'UNDER_REVIEW' ||
    status === 'SUBMITTED' ||
    status === 'DRAFT'
  ) {
    return false;
  }
  return user.isVerified === true || status === 'VERIFIED' || status === 'APPROVED' || status === 'ACTIVE';
}

export function requireVerifiedAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required for operational actions.' });
  }

  // Admins and Super Admins bypass
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return next();
  }

  if (!isUserVerified(user)) {
    return res.status(403).json({
      success: false,
      code: 'VERIFICATION_REQUIRED',
      message: 'Your account must be verified before you can perform this operation.',
      error: 'VERIFICATION_REQUIRED'
    });
  }

  next();
}

