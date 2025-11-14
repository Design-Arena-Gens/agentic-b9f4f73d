import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { calculateFarmPower } from '@/lib/farm';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = (req as any).user;

  try {
    const nftCount = await prisma.nFT.count({ where: { ownerId: userId } });
    const farmPower = await calculateFarmPower(userId);

    const lastClaim = await prisma.farmReward.findFirst({
      where: { userId },
      orderBy: { claimedAt: 'desc' },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const lastClaimTime = lastClaim?.claimedAt || user?.createdAt || new Date();
    const hoursSinceLastClaim = Math.min(
      (Date.now() - lastClaimTime.getTime()) / (1000 * 60 * 60),
      24
    );

    const pendingReward = Math.floor(farmPower * hoursSinceLastClaim);

    res.status(200).json({
      nftCount,
      farmPower,
      pendingReward,
      hoursSinceLastClaim,
    });
  } catch (error) {
    console.error('Farm stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
