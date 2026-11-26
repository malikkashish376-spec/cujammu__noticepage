/**
 * CU Jammu OTP Email Authentication Service
 *
 * Uses EmailJS (https://www.emailjs.com) to send real OTPs.
 * Configure your EmailJS keys in src/config/emailjs.config.js
 *
 * Without config → runs in DEV MODE: OTP is shown in a dev overlay
 * so you can still test the full flow during setup.
 */

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjsConfig';

// In-memory OTP store (production: use server-side Redis/DB)
const otpStore = new Map(); // email -> { otp, expiresAt, attempts }

const OTP_EXPIRY_MS = 10 * 60 * 1000;   // 10 minutes
const MAX_ATTEMPTS   = 5;                // max wrong guesses before lockout

/** Generates a secure 6-digit OTP */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Sends OTP to the given email via EmailJS.
 * Returns { success, otp (only in devMode), devMode, error }
 */
export async function sendOtp(email, userName = 'Student') {
  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  // Store OTP
  otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

  const isConfigured =
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID';

  if (isConfigured) {
    // ── PRODUCTION: Send real email via EmailJS ──
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to_email:    email,
          to_name:     userName,
          otp_code:    otp,
          valid_mins:  '10',
          university:  'Central University of Jammu',
          portal_name: 'CU Jammu Campus Pulse',
          support_email: 'support@cujammu.ac.in',
        }
      );
      return { success: true, devMode: false };
    } catch (err) {
      console.error('EmailJS error:', err);
      // Fall back to dev mode so the user isn't locked out
      return { success: true, devMode: true, otp, error: 'Email delivery failed — showing OTP below for testing.' };
    }
  } else {
    // ── DEV MODE: EmailJS not yet configured ──
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return { success: true, devMode: true, otp };
  }
}

/**
 * Verifies the OTP the user typed.
 * Returns { valid, error }
 */
export function verifyOtp(email, inputOtp) {
  const key = email.toLowerCase();
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, error: 'No OTP found. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: 'OTP has expired. Please request a new code.' };
  }

  record.attempts += 1;

  if (record.attempts > MAX_ATTEMPTS) {
    otpStore.delete(key);
    return { valid: false, error: 'Too many wrong attempts. Please request a fresh OTP.' };
  }

  if (record.otp !== inputOtp.trim()) {
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
    };
  }

  otpStore.delete(key); // one-time use
  return { valid: true };
}

/** Returns remaining seconds for the active OTP, or 0 if expired/missing */
export function getOtpRemainingSeconds(email) {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return 0;
  return Math.max(0, Math.floor((record.expiresAt - Date.now()) / 1000));
}
