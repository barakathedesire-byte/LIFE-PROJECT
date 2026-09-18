import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { UserAccount } from '../../src/types/index.js';

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password securely using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `lumo_live_${randomBytes}`;
}

/**
 * Generate a cryptographically secure staff invitation token
 */
export function generateStaffInviteToken(): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `stf_inv_${Date.now()}_${randomBytes}`;
}

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateSecureOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Generate a cryptographically secure random ID with a prefix
 */
export function generateSecureId(prefix: string): string {
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `${prefix}-${randomSuffix}`;
}

/**
 * Validate password strength
 * Rules: At least 8 characters, at least one number or special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters in length' };
  }
  const hasDigitOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  if (!hasDigitOrSpecial) {
    return { valid: false, reason: 'Password must contain at least one number or special symbol' };
  }
  return { valid: true };
}

/**
 * Safely compare two security tokens using constant-time comparison
 * to prevent timing side-channel attacks.
 */
export function safeCompareTokens(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;
  const strA = String(a).trim();
  const strB = String(b).trim();
  const bufA = Buffer.from(strA);
  const bufB = Buffer.from(strB);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitize user account object before sending it over the wire to clients
 * Strips passwordHash, password, temporary secrets, and sensitive tokens
 */
export function sanitizeUser(user: any): UserAccount {
  if (!user) return user;
  const clone = { ...user };
  delete clone.passwordHash;
  delete clone.password;
  delete clone.password_hash;
  delete clone.inviteToken;
  delete clone.invite_token;
  delete clone.passwordResetToken;
  delete clone.password_reset_token;
  delete clone.failedAttempts;
  delete clone.lockedUntil;
  return clone as UserAccount;
}
