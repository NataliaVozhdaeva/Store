/**
 * Web Crypto API client-side cryptographic utility module.
 * Implements SHA-256 hashing and data sanitization for NovaEdge Store frontend.
 */

/**
 * Computes a SHA-256 hash of a string using browser-native Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Masks sensitive Customer PII (e.g. Email / Phone) for audit display.
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : '***';
  return `${maskedUser}@${domain}`;
}

/**
 * Sanitizes input to prevent DOM XSS injection.
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[&<>"']/g, (match) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return map[match] || match;
  });
}
