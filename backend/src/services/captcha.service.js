import axios from 'axios';
import { env } from '../config/env.js';

export async function verifyTurnstileToken(token, remoteIp = '') {
  if (!env.turnstileSecretKey) return { ok: true, skipped: true };

  const trimmedToken = String(token || '').trim();
  if (!trimmedToken) return { ok: false, skipped: false };

  try {
    const body = new URLSearchParams();
    body.set('secret', env.turnstileSecretKey);
    body.set('response', trimmedToken);
    if (remoteIp) body.set('remoteip', remoteIp);

    const { data } = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000
      }
    );

    return { ok: Boolean(data?.success), skipped: false };
  } catch {
    return { ok: false, skipped: false };
  }
}
