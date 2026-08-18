/**
 * Shared Zod validation schemas used across all forms:
 * Login, Signup, Checkout, Address, etc.
 *
 * Phone Rule: Indian mobile numbers only
 *   - Must be 10 digits
 *   - First digit must be 6, 7, 8, or 9 (Indian mobile range)
 *   - May be entered as 10 digits or with +91 prefix (stripped before validation)
 *
 * Name Rule: Letters and spaces only, 2–50 characters
 * Email Rule: Standard RFC email format
 */

import { z } from 'zod';

// ── Phone: strips +91 or 0 prefix, validates 10-digit Indian mobile ─────────
export const phoneSchema = z
  .string()
  .transform(val => val.replace(/^\+91/, '').replace(/^0/, '').replace(/\s/g, ''))
  .refine(
    val => /^[6-9]\d{9}$/.test(val),
    { message: 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)' }
  );

// ── Name: letters + spaces only ─────────────────────────────────────────────
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name too long')
  .refine(
    val => /^[a-zA-Z\s'.]{2,50}$/.test(val.trim()),
    { message: 'Name can only contain letters and spaces' }
  );

// ── Email: RFC-compliant ─────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address (e.g. user@gmail.com)')
  .refine(
    val => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val),
    { message: 'Enter a valid email address (e.g. user@gmail.com)' }
  );

// ── Password: min 6 chars ────────────────────────────────────────────────────
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

// ── Pincode: exactly 6 digits ────────────────────────────────────────────────
export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Enter a valid 6-digit Indian Pincode');

// ── Street address ───────────────────────────────────────────────────────────
export const streetSchema = z
  .string()
  .min(5, 'Please enter a complete street address');
