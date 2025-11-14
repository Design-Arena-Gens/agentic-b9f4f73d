import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const configs = await prisma.config.findMany();
      res.status(200).json({ configs });
    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const config = await prisma.config.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });

      res.status(200).json({ config });
    } catch (error) {
      console.error('Update config error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
