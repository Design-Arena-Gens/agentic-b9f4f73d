import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = (req as any).user;
  const { provider } = req.query;

  if (!provider) {
    return res.status(400).json({ error: 'Missing provider' });
  }

  // Generate anti-bot token
  const token = crypto
    .createHash('sha256')
    .update(`${userId}-${provider}-${Date.now()}`)
    .digest('hex');

  res.status(200).json({ token });
}

export default requireAuth(handler);
