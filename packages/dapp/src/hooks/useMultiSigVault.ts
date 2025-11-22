/**
 * MultiSigVault Hook
 * Provides React hook for MultiSigVault contract interactions
 */

'use client';

import { useEffect, useState } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { Wallet } from 'mainnet-js';
import { MultiSigVaultArtifact } from '@dapp-starter/contracts';

export interface MultiSigVaultParams {
  signer1Pkh: Uint8Array;
  signer2Pkh: Uint8Array;
  signer3Pkh: Uint8Array;
  minSignatures: bigint;
}

export interface MultiSigVaultInstance {
  contract: Contract<typeof MultiSigVaultArtifact>;
  address: string;
  params: MultiSigVaultParams;
  getBalance: () => Promise<bigint>;
}

export function useMultiSigVault(
  address?: string,
  params?: MultiSigVaultParams,
  network: 'mainnet' | 'chipnet' = 'chipnet'
) {
  const [vault, setVault] = useState<MultiSigVaultInstance | null>(null);
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
          MultiSigVaultArtifact,
          [
            params.signer1Pkh,
            params.signer2Pkh,
            params.signer3Pkh,
            params.minSignatures,
          ],
          { provider: networkProvider, addressType: 'p2sh32' }
        );

        const instance: MultiSigVaultInstance = {
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
    signer1Pkh: Uint8Array,
    signer2Pkh: Uint8Array,
    signer3Pkh: Uint8Array,
    minSignatures: bigint = 2n
  ): Promise<{ contract: Contract<typeof MultiSigVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      MultiSigVaultArtifact,
      [signer1Pkh, signer2Pkh, signer3Pkh, minSignatures],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  };

  return { vault, provider, loading, error, createVault, MultiSigVaultArtifact };
}
