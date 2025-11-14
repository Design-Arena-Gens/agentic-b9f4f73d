import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { claimFarmReward } from '@/lib/farm';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = (req as any).user;

  try {
    const result = await claimFarmReward(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Farm claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
