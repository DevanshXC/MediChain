import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { WalletState } from '../types';
import { CHAIN_ID } from '../config/constants';
import { switchToHardhatNetwork } from '../utils/blockchain';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
  provider: BrowserProvider | null;
  isMetaMaskAvailable: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

function getEthereumProvider(): any {
  if (typeof window === 'undefined') return null;
  let eth = window.ethereum;
  if (!eth && (window as any).web3) {
    eth = (window as any).web3.currentProvider;
  }
  if (eth?.providers?.length) {
    eth = eth.providers.find((p: any) => p.isMetaMask) || eth.providers[0];
  }
  return eth || null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState<boolean>(false);

  // Check provider availability
  useEffect(() => {
    const checkAvailability = () => {
      const eth = getEthereumProvider();
      setIsMetaMaskAvailable(Boolean(eth));
    };
    checkAvailability();
    window.addEventListener('ethereum#initialized', checkAvailability);
    return () => {
      window.removeEventListener('ethereum#initialized', checkAvailability);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    const eth = getEthereumProvider();
    if (!eth) {
      setError('MetaMask extension was not detected in your browser. Please install the MetaMask extension from https://metamask.io or use the 1-Click Demo Accounts below.');
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));
    setError(null);

    try {
      // Request accounts from MetaMask
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected in MetaMask. Please unlock your wallet and approve the connection.');
      }

      const chainIdHex: string = await eth.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const browserProvider = new BrowserProvider(eth);
      
      setProvider(browserProvider);
      setState({
        address: accounts[0],
        chainId,
        isConnected: true,
        isConnecting: false,
      });

      // Attempt to prompt network switch if not on Hardhat Localhost (31337)
      if (chainId !== CHAIN_ID) {
        try {
          await switchToHardhatNetwork();
        } catch (switchErr) {
          console.warn('Network switch request was rejected or failed:', switchErr);
        }
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      let errorMsg = err.message || 'Failed to connect MetaMask wallet';
      
      if (err.code === -32002) {
        errorMsg = 'MetaMask connection request is already pending! Please click the MetaMask fox icon in your browser toolbar to approve.';
      } else if (err.code === 4001) {
        errorMsg = 'Connection request was cancelled in MetaMask.';
      }

      setError(errorMsg);
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({ address: null, chainId: null, isConnected: false, isConnecting: false });
    setProvider(null);
    setError(null);
  }, []);

  useEffect(() => {
    const eth = getEthereumProvider();
    if (!eth) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        setState(prev => ({ ...prev, address: accounts[0], isConnected: true }));
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setState(prev => ({ ...prev, chainId: parseInt(chainIdHex, 16) }));
    };

    if (eth.on) {
      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (eth.removeListener) {
        eth.removeListener('accountsChanged', handleAccountsChanged);
        eth.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet]);

  // Auto-reconnect if already approved
  useEffect(() => {
    const eth = getEthereumProvider();
    if (!eth) return;

    eth.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          connectWallet();
        }
      })
      .catch(() => {});
  }, [connectWallet]);

  return (
    <WalletContext.Provider value={{
      ...state,
      connectWallet,
      disconnectWallet,
      error,
      provider,
      isMetaMaskAvailable,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
