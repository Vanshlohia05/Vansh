import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Secret key configured securely in Vercel Environment Variables (process.env.ADMIN_SECRET_KEY)
// Default fallback secret for local dev if not configured in environment
const SERVER_SECRET = process.env.ADMIN_SECRET_KEY || 'vansh_portfolio_master_secret_2026';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper: Secure Timing-Safe String Comparison
function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Helper: Generate Cryptographically Signed Session Token
function generateSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({
    admin: true,
    created: Date.now(),
    expiresAt,
    salt: crypto.randomBytes(16).toString('hex'),
  });

  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return {
    token: `${payloadB64}.${signature}`,
    expiresAt,
  };
}

// Helper: Verify Cryptographically Signed Session Token
export function verifySessionToken(token: string): boolean {
  try {
    if (!token || typeof token !== 'string') return false;
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (!timingSafeCompare(signature, expectedSignature)) {
      return false;
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (Date.now() > payload.expiresAt) {
      return false; // Expired
    }

    return payload.admin === true;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, passcode, token } = req.body || {};

    // 1. Verify existing session token
    if (action === 'verify') {
      const isValid = verifySessionToken(token);
      if (isValid) {
        return res.status(200).json({ valid: true });
      }
      return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
    }

    // 2. Login with Master Passcode
    if (action === 'login') {
      if (!passcode || typeof passcode !== 'string') {
        return res.status(400).json({ success: false, error: 'Passcode required' });
      }

      // Secure backend verification against environment secret
      const isMatch = timingSafeCompare(passcode.trim(), SERVER_SECRET.trim());

      if (!isMatch) {
        // Subtle artificial delay to prevent brute-force timing attacks
        await new Promise((resolve) => setTimeout(resolve, 300));
        return res.status(401).json({ success: false, error: 'Invalid secret passcode' });
      }

      // Generate signed session token
      const session = generateSessionToken();
      return res.status(200).json({
        success: true,
        token: session.token,
        expiresAt: session.expiresAt,
      });
    }

    return res.status(400).json({ error: 'Unknown auth action' });
  } catch (err: any) {
    console.error('Auth API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
