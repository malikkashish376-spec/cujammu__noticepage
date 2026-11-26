/**
 * EmailJS Configuration for CU Jammu OTP Portal
 *
 * HOW TO SET UP (5 minutes, free):
 * ─────────────────────────────────
 * 1. Go to https://www.emailjs.com and sign up for free.
 * 2. Add an Email Service (Gmail / Outlook / SMTP) → note the SERVICE_ID.
 * 3. Create an Email Template with these variables:
 *      {{to_name}}  {{to_email}}  {{otp_code}}  {{valid_mins}}  {{university}}
 *    Example template body:
 *      "Dear {{to_name}}, your CU Jammu Campus Pulse login OTP is: {{otp_code}}
 *       Valid for {{valid_mins}} minutes. — {{university}}"
 *    Note the TEMPLATE_ID.
 * 4. Go to Account → Public Key → copy it → paste as PUBLIC_KEY below.
 * 5. Replace the placeholder strings below and restart `npm run dev`.
 *
 * Until configured, the portal runs in DEV MODE and shows the OTP on-screen.
 */

export const EMAILJS_CONFIG = {
  serviceId:  'YOUR_SERVICE_ID',    // e.g. 'service_abc123'
  templateId: 'YOUR_TEMPLATE_ID',  // e.g. 'template_xyz789'
  publicKey:  'YOUR_PUBLIC_KEY',   // e.g. 'user_A1b2C3d4E5'
};
