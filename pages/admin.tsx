import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Admin() {
  const { data: userData } = useSWR('/api/auth/me', fetcher);
  const { data: configData, mutate } = useSWR('/api/admin/config', fetcher);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (!userData?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-400 mb-4">You must be an admin to access this page</p>
          <Link href="/" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const updateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        alert('Config updated successfully');
        mutate();
        setKey('');
        setValue('');
      } else {
        alert('Failed to update config');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const configs = configData?.configs || [];

  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>Admin Panel - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-purple-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card mb-6">
          <h1 className="text-3xl font-bold mb-6">⚙️ Admin Panel</h1>

          <h2 className="text-2xl font-bold mb-4">Current Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {configs.map((config: any) => (
              <div key={config.key} className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-bold text-purple-400">{config.key}</h3>
                <p className="text-2xl font-bold">{config.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Update Configuration</h2>
          <form onSubmit={updateConfig} className="space-y-4">
            <div>
              <label className="block font-bold mb-2">Config Key</label>
              <select value={key} onChange={(e) => setKey(e.target.value)} className="input">
                <option value="">Select a key</option>
                <option value="GOLD_BUY_RATE">GOLD_BUY_RATE</option>
                <option value="GOLD_SELL_RATE">GOLD_SELL_RATE</option>
                <option value="DAILY_AD_LIMIT">DAILY_AD_LIMIT</option>
                <option value="AD_REWARD_GOLD">AD_REWARD_GOLD</option>
                <option value="ENERGY_REGEN_MINUTES">ENERGY_REGEN_MINUTES</option>
                <option value="ENERGY_COST_GOLD">ENERGY_COST_GOLD</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Value</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input"
                required
              />
            </div>

            <button type="submit" disabled={loading || !key} className="btn-primary w-full">
              {loading ? 'Updating...' : 'Update Config'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
