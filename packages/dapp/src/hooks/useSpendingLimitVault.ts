/**
 * SpendingLimitVault Hook
 * Provides React hook for SpendingLimitVault contract interactions
 */

'use client';

import { useEffect, useState } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { Wallet } from 'mainnet-js';
import { SpendingLimitVaultArtifact } from '@dapp-starter/contracts';

export interface SpendingLimitVaultParams {
  ownerPkh: Uint8Array;
  adminPkh: Uint8Array;
  dailyLimit: bigint;
  resetBlock: bigint;
  spentSinceReset: bigint;
}

export interface SpendingLimitVaultInstance {
  contract: Contract<typeof SpendingLimitVaultArtifact>;
  address: string;
  params: SpendingLimitVaultParams;
  getBalance: () => Promise<bigint>;
}

export function useSpendingLimitVault(
  address?: string,
  params?: SpendingLimitVaultParams,
  network: 'mainnet' | 'chipnet' = 'chipnet'
) {
  const [vault, setVault] = useState<SpendingLimitVaultInstance | null>(null);
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !params) return;

    const initVault = async () => {
      setLoading(true);
      setError(null);

      try {
        const wallet = await Wallet.watchOnly(address);
        const networkProvider = new ElectrumNetworkProvider(network, {
          electrum: wallet.provider.electrum,
          manualConnectionManagement: true,
        });
        setProvider(networkProvider);

        const contract = new Contract(
          SpendingLimitVaultArtifact,
          [
            params.ownerPkh,
            params.adminPkh,
            params.dailyLimit,
            params.resetBlock,
            params.spentSinceReset,
          ],
          { provider: networkProvider, addressType: 'p2sh32' }
        );

        const instance: SpendingLimitVaultInstance = {
          contract,
          address: contract.address,
          params,
          getBalance: async () => {
            const utxos = await contract.getUtxos();
            return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
          },
        };

        setVault(instance);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to initialize vault');
      }
      setLoading(false);
    };

    initVault();
  }, [address, params, network]);

  const createVault = async (
    ownerPkh: Uint8Array,
    adminPkh: Uint8Array,
    dailyLimit: bigint,
    resetBlock: bigint = 0n,
    spentSinceReset: bigint = 0n
  ): Promise<{ contract: Contract<typeof SpendingLimitVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      SpendingLimitVaultArtifact,
      [ownerPkh, adminPkh, dailyLimit, resetBlock, spentSinceReset],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  };

  return { vault, provider, loading, error, createVault, SpendingLimitVaultArtifact };
}
