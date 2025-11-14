import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminPassword } = req.body;

  if (adminPassword !== 'InitAdmin123!') {
    return res.status(403).json({ error: 'Invalid admin password' });
  }

  try {
    // Create admin user
    const adminExists = await prisma.user.findFirst({ where: { isAdmin: true } });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: 'admin@nftgame.com',
          username: 'admin',
          password: hashPassword('admin123'),
          isAdmin: true,
          goldBalance: 10000,
          usdBalance: 500,
        },
      });
    }

    // Initialize config
    const configs = [
      { key: 'GOLD_BUY_RATE', value: '10' },
      { key: 'GOLD_SELL_RATE', value: '20' },
      { key: 'DAILY_AD_LIMIT', value: '20' },
      { key: 'AD_REWARD_GOLD', value: '5' },
      { key: 'ENERGY_REGEN_MINUTES', value: '5' },
      { key: 'ENERGY_COST_GOLD', value: '10' },
    ];

    for (const config of configs) {
      await prisma.config.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: config,
      });
    }

    // Create sample NFTs
    const nftTemplates = [
      { name: 'Bronze Warrior', rarity: 'COMMON', farmPower: 5, battlePower: 10, price: 50 },
      { name: 'Silver Knight', rarity: 'UNCOMMON', farmPower: 12, battlePower: 25, price: 150 },
      { name: 'Gold Paladin', rarity: 'RARE', farmPower: 30, battlePower: 60, price: 400 },
      { name: 'Diamond Champion', rarity: 'EPIC', farmPower: 75, battlePower: 150, price: 1000 },
      { name: 'Mythic Legend', rarity: 'LEGENDARY', farmPower: 200, battlePower: 400, price: 3000 },
    ];

    for (const template of nftTemplates) {
      await prisma.nFT.create({
        data: {
          ...template,
          description: `A ${template.rarity.toLowerCase()} NFT warrior`,
          imageUrl: `/nft/${template.name.toLowerCase().replace(/ /g, '-')}.png`,
          priceUsd: template.price / 20,
        },
      });
    }

    // Create boxes
    await prisma.box.create({
      data: {
        name: 'Starter Box',
        description: 'A basic box with common NFTs',
        priceGold: 100,
        priceUsd: 5,
        rarityWeights: JSON.stringify({ COMMON: 70, UNCOMMON: 25, RARE: 5, EPIC: 0, LEGENDARY: 0 }),
      },
    });

    await prisma.box.create({
      data: {
        name: 'Premium Box',
        description: 'A premium box with better odds',
        priceGold: 500,
        priceUsd: 25,
        rarityWeights: JSON.stringify({ COMMON: 40, UNCOMMON: 35, RARE: 20, EPIC: 4, LEGENDARY: 1 }),
      },
    });

    // Create boosts
    await prisma.boost.create({
      data: {
        name: 'Farm Boost 2x',
        description: 'Double your farm rewards for 24 hours',
        effect: 'FARM_MULTIPLIER',
        multiplier: 2.0,
        durationHours: 24,
        priceGold: 200,
        priceUsd: 10,
      },
    });

    await prisma.boost.create({
      data: {
        name: 'Energy Boost',
        description: 'Regenerate energy 2x faster for 12 hours',
        effect: 'ENERGY_REGEN',
        multiplier: 2.0,
        durationHours: 12,
        priceGold: 150,
        priceUsd: 7.5,
      },
    });

    res.status(200).json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
