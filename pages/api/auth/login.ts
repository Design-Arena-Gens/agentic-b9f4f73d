import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    setAuthCookie(res, token);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        goldBalance: user.goldBalance,
        usdBalance: user.usdBalance,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
