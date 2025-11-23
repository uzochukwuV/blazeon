/**
 * RecurringPaymentVault Hook
 * Provides React hook for RecurringPaymentVault with REAL smart contract integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider, SignatureTemplate } from 'cashscript';
import { Wallet, TestNetWallet } from 'mainnet-js';
import { RecurringPaymentVaultArtifact } from '@dapp-starter/contracts';

export interface RecurringPaymentVaultParams {
  payerPkh: Uint8Array;
  payeePkh: Uint8Array;
  paymentAmount: bigint;
  nextPaymentBlock: bigint;
}

export interface RecurringPaymentVaultData {
  balance: bigint;
  paymentAmount: bigint;
  nextPaymentBlock: number;
  currentBlock: number;
  canClaim: boolean;
  blocksUntilNextPayment: number;
  paymentsRemaining: number;
  utxoCount: number;
}

export interface RecurringPaymentVaultInstance {
  contract: Contract<typeof RecurringPaymentVaultArtifact>;
  address: string;
  params: RecurringPaymentVaultParams;
  getData: () => Promise<RecurringPaymentVaultData>;
  getBalance: () => Promise<bigint>;
  claimPayment: (payeeWallet: Wallet | TestNetWallet) => Promise<string>;
  executePayment: () => Promise<string>;
  cancel: (payerWallet: Wallet | TestNetWallet) => Promise<string>;
  topUp: (payerWallet: Wallet | TestNetWallet, amount: bigint) => Promise<string>;
}

export function useRecurringPaymentVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: RecurringPaymentVaultParams
  ): Promise<RecurringPaymentVaultInstance> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      RecurringPaymentVaultArtifact,
      [params.payerPkh, params.payeePkh, params.paymentAmount, params.nextPaymentBlock],
      { provider, addressType: 'p2sh32' }
    );

    const getCurrentBlock = async (): Promise<number> => {
      try { return await provider.getBlockHeight(); } catch { return 0; }
    };

    const getBalance = async (): Promise<bigint> => {
      const utxos = await contract.getUtxos();
      return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    };

    const getData = async (): Promise<RecurringPaymentVaultData> => {
      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const currentBlock = await getCurrentBlock();
      const canClaim = currentBlock >= Number(params.nextPaymentBlock);
      const blocksUntilNextPayment = Math.max(0, Number(params.nextPaymentBlock) - currentBlock);
      const paymentsRemaining = params.paymentAmount > 0n
        ? Math.floor(Number(balance) / Number(params.paymentAmount))
        : 0;

      return {
        balance,
        paymentAmount: params.paymentAmount,
        nextPaymentBlock: Number(params.nextPaymentBlock),
        currentBlock,
        canClaim,
        blocksUntilNextPayment,
        paymentsRemaining,
        utxoCount: utxos.length
      };
    };

    const claimPayment = async (payeeWallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (balance < params.paymentAmount) throw new Error('Insufficient funds for payment');

      const currentBlock = await getCurrentBlock();
      if (currentBlock < Number(params.nextPaymentBlock)) {
        throw new Error(`Payment not yet claimable. ${Number(params.nextPaymentBlock) - currentBlock} blocks remaining.`);
      }

      const publicKey = payeeWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(payeeWallet);
      const remaining = balance - params.paymentAmount - 1000n;

      const txBuilder = contract.functions
        .claimPayment(publicKey, sigTemplate)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder
          .to(contract.address, remaining)
          .to(payeeWallet.getDepositAddress(), params.paymentAmount - 500n)
          .send();
        return tx.txid;
      } else {
        const tx = await txBuilder
          .to(payeeWallet.getDepositAddress(), balance - 1000n)
          .send();
        return tx.txid;
      }
    };

    const executePayment = async (): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (balance < params.paymentAmount) throw new Error('Insufficient funds for payment');

      const currentBlock = await getCurrentBlock();
      if (currentBlock < Number(params.nextPaymentBlock)) {
        throw new Error('Payment not yet due');
      }

      const remaining = balance - params.paymentAmount - 1000n;

      // Anyone can trigger executePayment - no signature required
      const txBuilder = contract.functions.executePayment().withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder.to(contract.address, remaining).send();
        return tx.txid;
      } else {
        const tx = await txBuilder.send();
        return tx.txid;
      }
    };

    const cancel = async (payerWallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const publicKey = payerWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(payerWallet);

      const tx = await contract.functions
        .cancel(publicKey, sigTemplate)
        .withoutChange()
        .to(payerWallet.getDepositAddress(), balance - 1000n)
        .send();
      return tx.txid;
    };

    const topUp = async (payerWallet: Wallet | TestNetWallet, amount: bigint): Promise<string> => {
      const utxos = await contract.getUtxos();
      const currentBalance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      const publicKey = payerWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(payerWallet);

      if (utxos.length > 0) {
        const tx = await contract.functions
          .topUp(publicKey, sigTemplate)
          .from(utxos[0])
          .withoutChange()
          .to(contract.address, currentBalance + amount)
          .send();
        return tx.txid;
      } else {
        const response = await payerWallet.send([{ cashaddr: contract.address, value: Number(amount), unit: 'sat' }]);
        return typeof response === 'string' ? response : (response as { txId: string }).txId;
      }
    };

    return {
      contract,
      address: contract.address,
      params,
      getData,
      getBalance,
      claimPayment,
      executePayment,
      cancel,
      topUp
    };
  }, [provider]);

  const loadVault = useCallback(async (params: RecurringPaymentVaultParams): Promise<RecurringPaymentVaultInstance> => {
    return createVault(params);
  }, [createVault]);

  return { provider, loading, error, createVault, loadVault, RecurringPaymentVaultArtifact };
}
