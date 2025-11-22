/**
 * WhitelistVault Hook
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { WhitelistVaultArtifact } from '@dapp-starter/contracts';

export interface WhitelistVaultParams {
  ownerPkh: Uint8Array;
  adminPkh: Uint8Array;
  whitelistHash: Uint8Array;
}

export function useWhitelistVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: WhitelistVaultParams
  ): Promise<{ contract: Contract<typeof WhitelistVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      WhitelistVaultArtifact,
      [params.ownerPkh, params.adminPkh, params.whitelistHash],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  }, [provider]);

  return { provider, createVault, WhitelistVaultArtifact };
}
