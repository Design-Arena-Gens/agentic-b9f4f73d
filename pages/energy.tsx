import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Energy() {
  const { data: userData, mutate } = useSWR('/api/auth/me', fetcher);
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const costPerEnergy = 10;

  const buyEnergy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/energy/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Successfully bought ${amount} energy!`);
        mutate();
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!userData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <p>Please login to buy energy</p>
          <Link href="/auth/login" className="btn-primary mt-4">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const totalCost = amount * costPerEnergy;

  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>Buy Energy - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-purple-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-6">⚡ Buy Energy</h1>

          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Current Energy</h3>
            <p className="text-3xl font-bold text-blue-400">
              {userData.user.energy}/{userData.user.maxEnergy}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Energy regenerates 1 per 5 minutes automatically
            </p>
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">Amount to Buy</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              max={100}
              className="input"
              disabled={loading}
            />
          </div>

          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Cost per Energy:</span>
              <span className="font-bold">{costPerEnergy} GOLD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Cost:</span>
              <span className="font-bold text-yellow-400">{totalCost} GOLD</span>
            </div>
          </div>

          <button
            onClick={buyEnergy}
            disabled={loading || userData.user.goldBalance < totalCost}
            className="btn-gold w-full text-lg py-4"
          >
            {loading
              ? 'Processing...'
              : userData.user.goldBalance < totalCost
              ? 'Insufficient GOLD'
              : `Buy ${amount} Energy for ${totalCost} GOLD`}
          </button>
        </div>
      </div>
    </div>
  );
}
