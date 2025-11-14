import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { buyEnergy } from '@/lib/energy';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = (req as any).user;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const success = await buyEnergy(userId, amount);

    if (!success) {
      return res.status(400).json({ error: 'Insufficient GOLD' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Buy energy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
