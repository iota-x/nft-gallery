"use client"
import React, { useState, useEffect } from 'react';

type ProfileCardProps = {
  walletAddress: string;
};

type Profile = {
  username: string;
  bio?: string;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ walletAddress }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/profile`, {
          method: 'GET',
          headers: {
            'wallet-address': walletAddress,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data: Profile = await res.json();
        setProfile(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [walletAddress]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex items-center p-4">
        <img
          className="w-16 h-16 object-cover rounded-full border-2 border-indigo-500"
          src="/default-avatar.png"
          alt="User Avatar"
        />
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-gray-800">{profile?.username}</h2>
          {profile?.bio && <p className="text-gray-600">{profile.bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
