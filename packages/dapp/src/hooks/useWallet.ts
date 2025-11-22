/**
 * Unified Wallet Hook for FluxVault
 * Provides React hook interface for mainnet.cash wallets
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  WalletType,
  WalletState,
  WalletActions,
  Transaction,
  SignedTransaction,
  IWalletConnector,
} from '../types/wallet';
import { MainnetConnector } from '../services/wallets/mainnet-connector';

type UseWalletReturn = WalletState & WalletActions & {
  connector: IWalletConnector | null;
};

export function useWallet(network: 'mainnet' | 'testnet' | 'chipnet' = 'chipnet'): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    walletType: null,
    address: null,
    publicKey: null,
    publicKeyHash: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    network,
    error: null,
  });

  const [connector, setConnector] = useState<IWalletConnector | null>(null);

  // Initialize wallet from localStorage on mount
  useEffect(() => {
    const initWallet = async () => {
      const savedWalletType = localStorage.getItem('wallet_type') as WalletType | null;
      const savedAddress = localStorage.getItem('wallet_address');

      if (savedWalletType && savedAddress) {
        try {
          await connect(savedWalletType);
        } catch (error) {
          console.error('Failed to reconnect wallet:', error);
          localStorage.removeItem('wallet_type');
          localStorage.removeItem('wallet_address');
        }
      }
    };

    initWallet();
  }, []);

  const connect = useCallback(async (walletType: WalletType, seedPhrase?: string): Promise<void> => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      let newConnector: IWalletConnector;

      switch (walletType) {
        case WalletType.MAINNET:
          newConnector = new MainnetConnector(network);
          break;
        case WalletType.BCH_EXTENSION:
          // For now, fallback to mainnet connector
          newConnector = new MainnetConnector(network);
          break;
        default:
          throw new Error('Unsupported wallet type');
      }

      const isAvailable = await newConnector.isAvailable();
      if (!isAvailable) {
        throw new Error('Wallet not available');
      }

      const walletInfo = await newConnector.connect(seedPhrase);
      const publicKeyHash = await newConnector.getPublicKeyHash();

      setState({
        walletType,
        address: walletInfo.address,
        publicKey: walletInfo.publicKey || null,
        publicKeyHash,
        balance: walletInfo.balance || null,
        isConnected: true,
        isConnecting: false,
        network: walletInfo.network,
        error: null,
      });

      setConnector(newConnector);

      localStorage.setItem('wallet_type', walletType);
      localStorage.setItem('wallet_address', walletInfo.address);
      if (walletInfo.publicKey) {
        localStorage.setItem('wallet_publickey', walletInfo.publicKey);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({ ...prev, isConnecting: false, error: errorMessage }));
      throw error;
    }
  }, [network]);

  const disconnect = useCallback(async (): Promise<void> => {
    if (connector) {
      await connector.disconnect();
    }

    setState({
      walletType: null,
      address: null,
      publicKey: null,
      publicKeyHash: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      network,
      error: null,
    });

    setConnector(null);
    localStorage.removeItem('wallet_type');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_publickey');
  }, [connector, network]);

  const signTransaction = useCallback(async (tx: Transaction): Promise<SignedTransaction> => {
    if (!connector) throw new Error('Wallet not connected');
    return connector.signTransaction(tx);
  }, [connector]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!connector) throw new Error('Wallet not connected');
    return connector.signMessage(message);
  }, [connector]);

  const getPublicKey = useCallback(async (): Promise<string | null> => {
    if (!connector) return null;
    try {
      return await connector.getPublicKey();
    } catch {
      return null;
    }
  }, [connector]);

  const getPublicKeyHash = useCallback(async (): Promise<Uint8Array | null> => {
    if (!connector) return null;
    try {
      return await connector.getPublicKeyHash();
    } catch {
      return null;
    }
  }, [connector]);

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!connector) return;
    try {
      const balance = await connector.getBalance();
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [connector]);

  return {
    ...state,
    connect,
    disconnect,
    getPublicKey,
    getPublicKeyHash,
    signTransaction,
    signMessage,
    refreshBalance,
    connector,
  };
}
