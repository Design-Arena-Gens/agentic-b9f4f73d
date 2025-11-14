import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Battle() {
  const { data: userData, mutate } = useSWR('/api/auth/me', fetcher);
  const [entryFee, setEntryFee] = useState(50);
  const [battling, setBattling] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startBattle = async () => {
    setBattling(true);
    setResult(null);

    try {
      const res = await fetch('/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryFee }),
      });

      const data = await res.json();

      if (res.ok) {
        // Simulate battle animation
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setResult(data.battle);
        mutate();
      } else {
        alert(data.error || 'Battle failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setBattling(false);
    }
  };

  if (!userData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <p>Please login to battle</p>
          <Link href="/auth/login" className="btn-primary mt-4">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>Battle - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-purple-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-6">⚔️ Battle Arena</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Your Stats</h3>
              <p className="text-gray-400">GOLD: {userData.user.goldBalance}</p>
              <p className="text-gray-400">
                Energy: {userData.user.energy}/{userData.user.maxEnergy}
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Battle Cost</h3>
              <p className="text-gray-400">Energy: 10</p>
              <p className="text-gray-400">Entry Fee: {entryFee} GOLD</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">Entry Fee (GOLD)</label>
            <input
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              min={10}
              step={10}
              className="input"
              disabled={battling}
            />
            <p className="text-sm text-gray-400 mt-1">
              Win: {entryFee * 2} GOLD | Lose: 0 GOLD
            </p>
          </div>

          {battling ? (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">⚔️</div>
              <p className="text-xl font-bold">Battle in Progress...</p>
              <p className="text-gray-400 mt-2">Fighting opponent!</p>
            </div>
          ) : result ? (
            <div
              className={`rounded-lg p-8 text-center mb-6 ${
                result.result === 'WIN'
                  ? 'bg-green-900 border-2 border-green-500'
                  : 'bg-red-900 border-2 border-red-500'
              }`}
            >
              <div className="text-6xl mb-4">{result.result === 'WIN' ? '🏆' : '💀'}</div>
              <h2 className="text-3xl font-bold mb-2">
                {result.result === 'WIN' ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-xl">
                {result.result === 'WIN'
                  ? `You won ${result.reward} GOLD!`
                  : `You lost ${result.entryFee} GOLD`}
              </p>
            </div>
          ) : null}

          <button
            onClick={startBattle}
            disabled={
              battling ||
              userData.user.goldBalance < entryFee ||
              userData.user.energy < 10
            }
            className="btn-primary w-full text-lg py-4"
          >
            {battling
              ? 'Battling...'
              : userData.user.energy < 10
              ? 'Insufficient Energy'
              : userData.user.goldBalance < entryFee
              ? 'Insufficient GOLD'
              : 'Start Battle'}
          </button>

          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="font-bold mb-2">ℹ️ How Battles Work</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Each battle costs 10 energy</li>
              <li>• Set your entry fee (minimum 10 GOLD)</li>
              <li>• Winner takes 2x the entry fee</li>
              <li>• Your NFT battle power affects win chance</li>
              <li>• More powerful NFTs = higher win rate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
