import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Ads() {
  const { data: userData, mutate } = useSWR('/api/auth/me', fetcher);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('UNITY_ADS');

  const providers = [
    { id: 'UNITY_ADS', name: 'Unity Ads' },
    { id: 'ADMOB', name: 'AdMob' },
    { id: 'APPLOVIN', name: 'AppLovin' },
    { id: 'IRONSOURCE', name: 'IronSource' },
  ];

  const watchAd = async () => {
    setWatching(true);
    setProgress(0);

    // Get ad token
    const tokenRes = await fetch(`/api/ads/token?provider=${selectedProvider}`);
    const { token } = await tokenRes.json();

    // Simulate watching ad
    const duration = 30; // 30 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 100 / duration;
      });
    }, 1000);

    // Wait for ad to finish
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));

    // Submit ad view
    const res = await fetch('/api/ads/watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider, adToken: token }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Congratulations! You earned ${data.reward} GOLD! Remaining today: ${data.remaining}`);
      mutate();
    } else {
      alert(data.error || 'Failed to submit ad view');
    }

    setWatching(false);
    setProgress(0);
  };

  if (!userData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <p>Please login to watch ads</p>
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
        <title>Watch Ads - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-purple-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-6">📺 Watch Ads to Earn GOLD</h1>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Select Ad Provider</h3>
            <div className="grid grid-cols-2 gap-4">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedProvider === provider.id
                      ? 'border-purple-500 bg-purple-900'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                  disabled={watching}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          {watching ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Watching Ad...</h3>
              <div className="bg-gray-900 rounded-lg p-8 mb-4 text-center">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-gray-400">Please wait while the ad plays</p>
                <p className="text-sm text-gray-500 mt-2">Do not close this page</p>
              </div>
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center mt-2 text-gray-400">{Math.round(progress)}%</p>
            </div>
          ) : (
            <button onClick={watchAd} className="btn-gold w-full text-lg py-4">
              Watch Ad & Earn GOLD
            </button>
          )}

          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="font-bold mb-2">ℹ️ How it works</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Watch a 30-second ad to earn GOLD</li>
              <li>• You can watch up to 20 ads per day</li>
              <li>• Each ad gives you 5 GOLD</li>
              <li>• Must watch the entire ad to receive reward</li>
              <li>• Anti-bot protection is active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
