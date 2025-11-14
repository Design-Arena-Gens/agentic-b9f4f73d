import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const { data: userData, error, mutate } = useSWR('/api/auth/me', fetcher);
  const { data: farmData, mutate: mutateFarm } = useSWR('/api/farm/stats', fetcher);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!userData?.user);
  }, [userData]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(null);
    setIsAuthenticated(false);
  };

  const handleClaimFarm = async () => {
    const res = await fetch('/api/farm/claim', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      alert(`Claimed ${data.gold} GOLD from ${data.hours.toFixed(2)} hours of farming!`);
      mutate();
      mutateFarm();
    } else {
      alert(data.error || 'Failed to claim farm reward');
    }
  };

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Head>
          <title>NFT Play-to-Earn Game</title>
        </Head>
        <div className="card max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NFT Play-to-Earn
          </h1>
          <p className="text-gray-400 mb-8">
            Collect NFTs, Farm GOLD, Battle Players & Earn Real Money!
          </p>
          <div className="space-y-4">
            <Link href="/auth/login" className="btn-primary block">
              Login
            </Link>
            <Link href="/auth/register" className="btn-secondary block">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const farm = farmData || { nftCount: 0, farmPower: 0, pendingReward: 0, hoursSinceLastClaim: 0 };

  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>Dashboard - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NFT Play-to-Earn
          </h1>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-gray-400 text-sm mb-2">GOLD Balance</h3>
            <p className="text-3xl font-bold text-yellow-400">{user?.goldBalance || 0}</p>
            <p className="text-gray-400 text-sm mt-1">≈ ${user?.usdBalance?.toFixed(2) || '0.00'} USD</p>
          </div>

          <div className="card">
            <h3 className="text-gray-400 text-sm mb-2">Energy</h3>
            <p className="text-3xl font-bold text-blue-400">
              {user?.energy || 0}/{user?.maxEnergy || 100}
            </p>
            <Link href="/energy" className="text-blue-400 text-sm mt-1 hover:underline">
              Buy Energy
            </Link>
          </div>

          <div className="card">
            <h3 className="text-gray-400 text-sm mb-2">Your NFTs</h3>
            <p className="text-3xl font-bold text-purple-400">{farm.nftCount}</p>
            <Link href="/nfts" className="text-purple-400 text-sm mt-1 hover:underline">
              View Collection
            </Link>
          </div>
        </div>

        {/* Farm Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">⚒️ Farm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400">Farm Power</p>
              <p className="text-xl font-bold text-green-400">{farm.farmPower} GOLD/hour</p>
            </div>
            <div>
              <p className="text-gray-400">Pending Reward</p>
              <p className="text-xl font-bold text-yellow-400">{farm.pendingReward} GOLD</p>
              <p className="text-sm text-gray-400">
                ({farm.hoursSinceLastClaim?.toFixed(2) || 0} hours)
              </p>
            </div>
          </div>
          <button
            onClick={handleClaimFarm}
            disabled={farm.pendingReward === 0}
            className="btn-gold w-full"
          >
            Claim Farm Reward
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/ads" className="card hover:scale-105 transition-transform cursor-pointer text-center">
            <div className="text-4xl mb-2">📺</div>
            <h3 className="font-bold">Watch Ads</h3>
            <p className="text-sm text-gray-400">Earn GOLD</p>
          </Link>

          <Link href="/battle" className="card hover:scale-105 transition-transform cursor-pointer text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <h3 className="font-bold">Battle</h3>
            <p className="text-sm text-gray-400">Win GOLD</p>
          </Link>

          <Link href="/marketplace" className="card hover:scale-105 transition-transform cursor-pointer text-center">
            <div className="text-4xl mb-2">🛒</div>
            <h3 className="font-bold">Marketplace</h3>
            <p className="text-sm text-gray-400">Buy NFTs</p>
          </Link>

          {user?.isAdmin && (
            <Link href="/admin" className="card hover:scale-105 transition-transform cursor-pointer text-center">
              <div className="text-4xl mb-2">⚙️</div>
              <h3 className="font-bold">Admin</h3>
              <p className="text-sm text-gray-400">Configure</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
