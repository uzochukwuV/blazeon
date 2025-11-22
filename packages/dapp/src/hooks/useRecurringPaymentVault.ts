/**
 * RecurringPaymentVault Hook
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { RecurringPaymentVaultArtifact } from '@dapp-starter/contracts';

export interface RecurringPaymentVaultParams {
  payerPkh: Uint8Array;
  payeePkh: Uint8Array;
  paymentAmount: bigint;
  nextPaymentBlock: bigint;
}

export function useRecurringPaymentVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const networkProvider = new ElectrumNetworkProvider(network);
    setProvider(networkProvider);
  }, [network]);

  const createVault = useCallback(async (
    params: RecurringPaymentVaultParams
  ): Promise<{ contract: Contract<typeof RecurringPaymentVaultArtifact>; address: string }> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      RecurringPaymentVaultArtifact,
      [params.payerPkh, params.payeePkh, params.paymentAmount, params.nextPaymentBlock],
      { provider, addressType: 'p2sh32' }
    );

    return { contract, address: contract.address };
  }, [provider]);

  const loadVault = useCallback(async (params: RecurringPaymentVaultParams) => {
    if (!provider) throw new Error('Provider not initialized');
    setLoading(true);
    setError(null);

    try {
      const contract = new Contract(
        RecurringPaymentVaultArtifact,
        [params.payerPkh, params.payeePkh, params.paymentAmount, params.nextPaymentBlock],
        { provider, addressType: 'p2sh32' }
      );

      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      setLoading(false);
      return { contract, address: contract.address, balance };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setLoading(false);
      throw e;
    }
  }, [provider]);

  return { provider, loading, error, createVault, loadVault, RecurringPaymentVaultArtifact };
}
