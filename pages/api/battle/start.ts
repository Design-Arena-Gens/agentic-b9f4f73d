import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { spendEnergy } from '@/lib/energy';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = (req as any).user;
  const { entryFee } = req.body;

  if (!entryFee || entryFee < 10) {
    return res.status(400).json({ error: 'Invalid entry fee' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.goldBalance < entryFee) {
      return res.status(400).json({ error: 'Insufficient GOLD' });
    }

    // Spend energy for battle
    const energySpent = await spendEnergy(userId, 10);
    if (!energySpent) {
      return res.status(400).json({ error: 'Insufficient energy' });
    }

    // Deduct entry fee
    await prisma.user.update({
      where: { id: userId },
      data: {
        goldBalance: { decrement: entryFee },
        usdBalance: { decrement: entryFee / 20 },
      },
    });

    // Simulate battle
    const nfts = await prisma.nFT.findMany({ where: { ownerId: userId } });
    const totalPower = nfts.reduce((sum, nft) => sum + nft.battlePower, 0);
    const winChance = Math.min(0.5 + totalPower / 1000, 0.9);
    const won = Math.random() < winChance;

    const result = won ? 'WIN' : 'LOSS';
    const reward = won ? entryFee * 2 : 0;

    if (won) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          goldBalance: { increment: reward },
          usdBalance: { increment: reward / 20 },
        },
      });
    }

    const battle = await prisma.battle.create({
      data: {
        userId,
        entryFee,
        reward,
        result,
        opponentName: 'Bot Player',
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: won ? 'BATTLE_WIN' : 'BATTLE_LOSS',
        goldAmount: won ? reward - entryFee : -entryFee,
        usdAmount: won ? (reward - entryFee) / 20 : -entryFee / 20,
        description: `Battle ${result}: ${won ? `Won ${reward} GOLD` : `Lost ${entryFee} GOLD`}`,
      },
    });

    res.status(200).json({
      battle: {
        id: battle.id,
        result,
        reward,
        entryFee,
      },
    });
  } catch (error) {
    console.error('Battle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
