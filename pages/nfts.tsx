import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function NFTs() {
  const { data } = useSWR('/api/nfts', fetcher);

  const nfts = data?.nfts || [];

  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>My NFTs - NFT Play-to-Earn</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-purple-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold mb-6">🎴 My NFT Collection</h1>

          {nfts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You don't have any NFTs yet</p>
              <Link href="/marketplace" className="btn-primary">
                Go to Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft: any) => (
                <div
                  key={nft.id}
                  className={`rounded-lg p-6 border-2 rarity-${nft.rarity.toLowerCase()}`}
                >
                  <div className="text-6xl text-center mb-4">🎴</div>
                  <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{nft.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rarity:</span>
                      <span className="font-bold">{nft.rarity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Farm Power:</span>
                      <span className="font-bold text-green-400">{nft.farmPower}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Battle Power:</span>
                      <span className="font-bold text-red-400">{nft.battlePower}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
