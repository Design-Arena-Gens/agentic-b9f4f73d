import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { getDailyAdLimit, getAdReward } from '@/lib/currency';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = (req as any).user;
  const { provider, adToken } = req.body;

  const validProviders = ['UNITY_ADS', 'ADMOB', 'APPLOVIN', 'IRONSOURCE'];
  if (!provider || !validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid ad provider' });
  }

  if (!adToken) {
    return res.status(400).json({ error: 'Missing ad token' });
  }

  try {
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAdCount = await prisma.adView.count({
      where: {
        userId,
        completed: true,
        createdAt: { gte: today },
      },
    });

    const dailyLimit = await getDailyAdLimit();
    if (todayAdCount >= dailyLimit) {
      return res.status(429).json({ error: 'Daily ad limit reached' });
    }

    // Validate token (simple hash-based validation)
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${userId}-${provider}-${Date.now().toString().slice(0, -5)}`)
      .digest('hex');

    // In production, implement proper validation with ad network APIs
    // For now, we accept any valid-looking token
    if (adToken.length < 32) {
      return res.status(400).json({ error: 'Invalid ad token' });
    }

    const reward = await getAdReward();

    // Create ad view record
    const adView = await prisma.adView.create({
      data: {
        userId,
        provider,
        adToken,
        goldReward: reward,
        completed: true,
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        goldBalance: { increment: reward },
        usdBalance: { increment: reward / 20 },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'AD_REWARD',
        goldAmount: reward,
        usdAmount: reward / 20,
        description: `Watched ${provider} ad`,
      },
    });

    res.status(200).json({
      success: true,
      reward,
      remaining: dailyLimit - todayAdCount - 1,
    });
  } catch (error) {
    console.error('Ad watch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
