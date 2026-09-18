/**
 * LUMO Strict Form Validation Engine
 * Enforces strict formatting, allowed characters, length, and pattern constraints.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Tanzanian Phone Regex: +255 followed by 9 digits starting with 6 or 7 (e.g. +255714123456)
export const TAZ_PHONE_REGEX = /^\+255[67]\d{8}$/;

// Email Regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Name Regex: Letters, spaces, hyphens, apostrophes only. No numbers, emojis, or arbitrary symbols.
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,60}$/;

// NIDA / National ID Regex: 20 digits or NIDA alphanumeric format
export const NIDA_REGEX = /^(\d{20}|[A-Z0-9]{10,25})$/;

// Vehicle Plate Number Regex (Tanzania format e.g. T 123 ABC or T123ABC)
export const PLATE_REGEX = /^T\s?\d{3}\s?[A-Z]{3}$/i;

export function validateFullName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Full name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters.' };
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: 'Name cannot exceed 60 characters.' };
  }
  if (/\d/.test(trimmed)) {
    return { isValid: false, error: 'Name cannot contain numbers.' };
  }
  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Name contains invalid characters or symbols.' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const cleaned = phone.replace(/\s+/g, '').trim();
  if (!TAZ_PHONE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Invalid Tanzanian phone format. Use +2557XXXXXXXX or +2556XXXXXXXX.' };
  }
  return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address format.' };
  }
  return { isValid: true };
}

export function validateBusinessName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Business or Store name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 80) {
    return { isValid: false, error: 'Business name must be between 3 and 80 characters.' };
  }
  return { isValid: true };
}

export function validateTinNumber(tin: string): ValidationResult {
  if (!tin || tin.trim() === '') {
    return { isValid: false, error: 'TIN number is required for verified merchants.' };
  }
  const cleaned = tin.replace(/\s+/g, '').trim();
  // Tanzanian TIN is typically 9 digits
  if (!/^\d{9}$/.test(cleaned)) {
    return { isValid: false, error: 'TIN must be exactly 9 numeric digits.' };
  }
  return { isValid: true };
}

export function validateBrelaNumber(brela: string): ValidationResult {
  if (!brela || brela.trim() === '') {
    return { isValid: false, error: 'BRELA registration number is required.' };
  }
  if (brela.trim().length < 5) {
    return { isValid: false, error: 'Invalid BRELA registration format.' };
  }
  return { isValid: true };
}

export function validateNidaNumber(nida: string): ValidationResult {
  if (!nida || nida.trim() === '') {
    return { isValid: false, error: 'National ID (NIDA) number is required.' };
  }
  const cleaned = nida.replace(/\s+/g, '').trim();
  if (cleaned.length < 10) {
    return { isValid: false, error: 'NIDA number must be at least 10 characters / digits.' };
  }
  return { isValid: true };
}

export function validatePlateNumber(plate: string): ValidationResult {
  if (!plate || plate.trim() === '') {
    return { isValid: false, error: 'Vehicle plate number is required.' };
  }
  return { isValid: true };
}
