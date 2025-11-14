import Head from 'next/head';
import Link from 'next/link';

export default function Marketplace() {
  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>Marketplace - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-purple-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-6">🛒 Marketplace</h1>
          <p className="text-center text-gray-400 py-12">
            Marketplace coming soon! You'll be able to buy NFTs, boxes, boosts, and cosmetics here.
          </p>
        </div>
      </div>
    </div>
  );
}
