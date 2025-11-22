/**
 * MasterVault Hook
 * Provides React hook for MasterVault contract interactions
 * MasterVault combines: TimeLock + Recurring + SpendingLimit + MultiSig + TokenGating
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { Wallet, BaseWallet } from 'mainnet-js';
import { MasterVaultArtifact } from '@dapp-starter/contracts';

export interface MasterVaultParams {
  // Multi-Sig Configuration
  owner1Pkh: Uint8Array;
  owner2Pkh: Uint8Array;
  owner3Pkh: Uint8Array;
  requiredSignatures: bigint;
  // Time Lock Configuration
  unlockBlock: bigint;
  // Spending Limits
  spendingLimit: bigint;
  // Recurring Payment
  recurringPayeePkh: Uint8Array;
  recurringAmount: bigint;
  nextPaymentBlock: bigint;
  // Token Gating
  requiredTokenCategory: Uint8Array;
}

export interface MasterVaultInstance {
  contract: Contract<typeof MasterVaultArtifact>;
  address: string;
  params: MasterVaultParams;
  getBalance: () => Promise<bigint>;
  getUtxos: () => Promise<any[]>;
}

export function useMasterVault(
  watchAddress?: string,
  params?: MasterVaultParams,
  network: 'mainnet' | 'chipnet' = 'chipnet'
) {
  const [vault, setVault] = useState<MasterVaultInstance | null>(null);
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        const networkProvider = new ElectrumNetworkProvider(network);
        setProvider(networkProvider);
      } catch (e) {
        console.error('Failed to init provider:', e);
      }
    };
    initProvider();
  }, [network]);

  // Initialize vault when params are provided
  useEffect(() => {
    if (!provider || !params) return;

    const initVault = async () => {
      setLoading(true);
      setError(null);

      try {
        const contract = new Contract(
          MasterVaultArtifact,
          [
            params.owner1Pkh,
            params.owner2Pkh,
            params.owner3Pkh,
            params.requiredSignatures,
            params.unlockBlock,
            params.spendingLimit,
            params.recurringPayeePkh,
            params.recurringAmount,
            params.nextPaymentBlock,
            params.requiredTokenCategory,
          ],
          { provider, addressType: 'p2sh32' }
        );

        const instance: MasterVaultInstance = {
          contract,
          address: contract.address,
          params,
          getBalance: async () => {
            const utxos = await contract.getUtxos();
            return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
          },
          getUtxos: async () => contract.getUtxos(),
        };

        setVault(instance);

        // Get initial balance
        const bal = await instance.getBalance();
        setBalance(bal);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to initialize vault');
      }
      setLoading(false);
    };

    initVault();
  }, [provider, params]);

  // Create a new MasterVault
  const createVault = useCallback(async (
    vaultParams: MasterVaultParams
  ): Promise<{ contract: Contract<typeof MasterVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      MasterVaultArtifact,
      [
        vaultParams.owner1Pkh,
        vaultParams.owner2Pkh,
        vaultParams.owner3Pkh,
        vaultParams.requiredSignatures,
        vaultParams.unlockBlock,
        vaultParams.spendingLimit,
        vaultParams.recurringPayeePkh,
        vaultParams.recurringAmount,
        vaultParams.nextPaymentBlock,
        vaultParams.requiredTokenCategory,
      ],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  }, [provider]);

  // Create default params with zeros
  const createDefaultParams = useCallback((ownerPkh: Uint8Array): MasterVaultParams => {
    const zeroPkh = new Uint8Array(20);
    const zeroCategory = new Uint8Array(32);

    return {
      owner1Pkh: ownerPkh,
      owner2Pkh: zeroPkh,
      owner3Pkh: zeroPkh,
      requiredSignatures: 1n,
      unlockBlock: 0n,
      spendingLimit: 0n,
      recurringPayeePkh: zeroPkh,
      recurringAmount: 0n,
      nextPaymentBlock: 0n,
      requiredTokenCategory: zeroCategory,
    };
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!vault) return;
    const bal = await vault.getBalance();
    setBalance(bal);
  }, [vault]);

  return {
    vault,
    provider,
    loading,
    error,
    balance,
    createVault,
    createDefaultParams,
    refreshBalance,
    MasterVaultArtifact,
  };
}
