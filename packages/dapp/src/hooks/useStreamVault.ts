/**
 * StreamVault Hook
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { StreamVaultArtifact } from '@dapp-starter/contracts';

export interface StreamVaultParams {
  senderPkh: Uint8Array;
  recipientPkh: Uint8Array;
  totalAmount: bigint;
  startBlock: bigint;
  endBlock: bigint;
}

export function useStreamVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: StreamVaultParams
  ): Promise<{ contract: Contract<typeof StreamVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      StreamVaultArtifact,
      [params.senderPkh, params.recipientPkh, params.totalAmount, params.startBlock, params.endBlock],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  }, [provider]);

  return { provider, createVault, StreamVaultArtifact };
}
