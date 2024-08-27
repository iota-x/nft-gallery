import React from 'react';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Welcome to Your NFT Dashboard</h1>
          <WalletButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/nfts" passHref>
            <div className="flex flex-col justify-between p-6 border border-transparent rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition duration-300">
              <h2 className="text-2xl font-semibold mb-2">View NFTs</h2>
              <p className="text-lg">Browse all your NFTs in one place.</p>
            </div>
          </Link>
          <Link href="/profile" passHref>
            <div className="flex flex-col justify-between p-6 border border-transparent rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition duration-300">
              <h2 className="text-2xl font-semibold mb-2">My Profile</h2>
              <p className="text-lg">View and edit your profile details.</p>
            </div>
          </Link>
          {/* Additional sections like Featured NFTs, Recent Activity, etc. */}
        </div>
      </div>
    </div>
  );
}
