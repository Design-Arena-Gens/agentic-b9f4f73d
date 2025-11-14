import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = (req as any).user;

  if (req.method === 'GET') {
    try {
      const nfts = await prisma.nFT.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ nfts });
    } catch (error) {
      console.error('Get NFTs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
