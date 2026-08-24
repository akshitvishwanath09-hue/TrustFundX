'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

interface WalletContextType {
  peraWallet: PeraWalletConnect | null;
  accountAddress: string | null;
  connectWallet: () => Promise<string[]>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

  useEffect(() => {
    const wallet = new PeraWalletConnect();
    setPeraWallet(wallet);

    wallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    }).catch(console.error);

    wallet.connector?.on('disconnect', () => {
      setAccountAddress(null);
    });
  }, []);

  const connectWallet = async () => {
    if (!peraWallet) throw new Error('Pera Wallet not initialized');
    
    const accounts = await peraWallet.connect();
    setAccountAddress(accounts[0]);
    return accounts;
  };

  const disconnectWallet = () => {
    if (peraWallet) {
      peraWallet.disconnect();
      setAccountAddress(null);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        peraWallet,
        accountAddress,
        connectWallet,
        disconnectWallet,
        isConnected: !!accountAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
