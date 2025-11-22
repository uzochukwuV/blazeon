/**
 * TokenGatedVault Hook
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { TokenGatedVaultArtifact } from '@dapp-starter/contracts';

export interface TokenGatedVaultParams {
  accessTokenCategory: Uint8Array;
  minFungibleBalance: bigint;
  adminPkh: Uint8Array;
}

export function useTokenGatedVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: TokenGatedVaultParams
  ): Promise<{ contract: Contract<typeof TokenGatedVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      TokenGatedVaultArtifact,
      [params.accessTokenCategory, params.minFungibleBalance, params.adminPkh],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  }, [provider]);

  return { provider, createVault, TokenGatedVaultArtifact };
}
