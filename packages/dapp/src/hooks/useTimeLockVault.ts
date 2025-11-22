/**
 * TimeLockVault Hook
 * Provides React hook for TimeLockVault contract interactions
 */

'use client';

import { useEffect, useState } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { Wallet } from 'mainnet-js';
import { TimeLockVaultArtifact } from '@dapp-starter/contracts';

export interface TimeLockVaultParams {
  ownerPkh: Uint8Array;
  recoveryPkh: Uint8Array;
  unlockBlock: bigint;
  vestingAmount?: bigint;
}

export interface TimeLockVaultInstance {
  contract: Contract<typeof TimeLockVaultArtifact>;
  address: string;
  getBalance: () => Promise<bigint>;
  // Contract functions
  withdraw: (ownerPk: Uint8Array, ownerSig: Uint8Array) => Promise<string>;
  partialWithdraw: (ownerPk: Uint8Array, ownerSig: Uint8Array, withdrawAmount: bigint) => Promise<string>;
  deposit: () => Promise<string>;
}

export function useTimeLockVault(
  address?: string,
  params?: TimeLockVaultParams,
  network: 'mainnet' | 'chipnet' = 'chipnet'
) {
  const [vault, setVault] = useState<TimeLockVaultInstance | null>(null);
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
          TimeLockVaultArtifact,
          [
            params.ownerPkh,
            params.recoveryPkh,
            params.unlockBlock,
            params.vestingAmount ?? 0n,
          ],
          { provider: networkProvider, addressType: 'p2sh32' }
        );

        const instance: TimeLockVaultInstance = {
          contract,
          address: contract.address,
          getBalance: async () => {
            const utxos = await contract.getUtxos();
            return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
          },
          withdraw: async () => {
            // Implementation requires wallet signing
            throw new Error('Use with connector for signing');
          },
          partialWithdraw: async () => {
            throw new Error('Use with connector for signing');
          },
          deposit: async () => {
            throw new Error('Use with connector for signing');
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
    recoveryPkh: Uint8Array,
    unlockBlock: bigint,
    vestingAmount: bigint = 0n
  ): Promise<{ contract: Contract<typeof TimeLockVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      TimeLockVaultArtifact,
      [ownerPkh, recoveryPkh, unlockBlock, vestingAmount],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  };

  return { vault, provider, loading, error, createVault, TimeLockVaultArtifact };
}
