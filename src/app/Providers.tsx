"use client";

import React from 'react';
import { RecoilRoot } from 'recoil';
import { WalletProvider } from '@/context/WalletContext';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RecoilRoot>
      <WalletProvider>
        {children}
      </WalletProvider>
    </RecoilRoot>
  );
};

export default Providers;
