/**
 * SpendingLimitVault Hook
 * Provides React hook for SpendingLimitVault with REAL smart contract integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider, SignatureTemplate } from 'cashscript';
import { Wallet, TestNetWallet } from 'mainnet-js';
import { cashAddressToLockingBytecode } from '@bitauth/libauth';
import { SpendingLimitVaultArtifact } from '@dapp-starter/contracts';

export interface SpendingLimitVaultParams {
  ownerPkh: Uint8Array;
  adminPkh: Uint8Array;
  dailyLimit: bigint;
  resetBlock: bigint;
  spentSinceReset: bigint;
}

export interface SpendingLimitVaultData {
  balance: bigint;
  dailyLimit: bigint;
  spentToday: bigint;
  remainingLimit: bigint;
  resetBlock: number;
  currentBlock: number;
  blocksUntilReset: number;
  utxoCount: number;
}

export interface SpendingLimitVaultInstance {
  contract: Contract<typeof SpendingLimitVaultArtifact>;
  address: string;
  params: SpendingLimitVaultParams;
  getData: () => Promise<SpendingLimitVaultData>;
  getBalance: () => Promise<bigint>;
  spend: (wallet: Wallet | TestNetWallet, amount: bigint, destination: string) => Promise<string>;
  withdrawAll: (wallet: Wallet | TestNetWallet) => Promise<string>;
  updateLimit: (adminWallet: Wallet | TestNetWallet, newLimit: bigint) => Promise<string>;
  deposit: (wallet: Wallet | TestNetWallet, amount: bigint) => Promise<string>;
}

export function useSpendingLimitVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: SpendingLimitVaultParams
  ): Promise<SpendingLimitVaultInstance> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      SpendingLimitVaultArtifact,
      [params.ownerPkh, params.adminPkh, params.dailyLimit, params.resetBlock, params.spentSinceReset],
      { provider, addressType: 'p2sh32' }
    );

    const getCurrentBlock = async (): Promise<number> => {
      try { return await provider.getBlockHeight(); } catch { return 0; }
    };

    const getBalance = async (): Promise<bigint> => {
      const utxos = await contract.getUtxos();
      return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    };

    const getData = async (): Promise<SpendingLimitVaultData> => {
      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const currentBlock = await getCurrentBlock();
      const isNewPeriod = currentBlock >= Number(params.resetBlock);
      const spentToday = isNewPeriod ? 0n : params.spentSinceReset;
      const remainingLimit = params.dailyLimit - spentToday;
      const blocksUntilReset = Math.max(0, Number(params.resetBlock) - currentBlock);

      return {
        balance,
        dailyLimit: params.dailyLimit,
        spentToday,
        remainingLimit,
        resetBlock: Number(params.resetBlock),
        currentBlock,
        blocksUntilReset,
        utxoCount: utxos.length
      };
    };

    const getLockingBytecode = (addr: string): Uint8Array => {
      const result = cashAddressToLockingBytecode(addr);
      if (typeof result === 'string') throw new Error(`Invalid address: ${result}`);
      return result.bytecode;
    };

    const spend = async (
      wallet: Wallet | TestNetWallet,
      amount: bigint,
      destination: string
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (amount > balance) throw new Error('Insufficient balance');

      const currentBlock = await getCurrentBlock();
      const isNewPeriod = currentBlock >= Number(params.resetBlock);
      const currentSpent = isNewPeriod ? 0n : params.spentSinceReset;

      if (currentSpent + amount > params.dailyLimit) {
        throw new Error(`Exceeds daily spending limit. Remaining: ${params.dailyLimit - currentSpent} sats`);
      }

      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);
      const destBytecode = getLockingBytecode(destination);
      const remaining = balance - amount - 1000n;

      const txBuilder = contract.functions
        .spend(publicKey, sigTemplate, amount, destBytecode)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder.to(contract.address, remaining).to(destination, amount - 500n).send();
        return tx.txid;
      } else {
        const tx = await txBuilder.to(destination, balance - 1000n).send();
        return tx.txid;
      }
    };

    const withdrawAll = async (wallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);

      const tx = await contract.functions
        .withdrawAll(publicKey, sigTemplate)
        .withoutChange()
        .to(wallet.getDepositAddress(), balance - 1000n)
        .send();
      return tx.txid;
    };

    const updateLimit = async (
      adminWallet: Wallet | TestNetWallet,
      newLimit: bigint
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const publicKey = adminWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(adminWallet);

      const tx = await contract.functions
        .updateLimit(publicKey, sigTemplate, newLimit)
        .withoutChange()
        .to(contract.address, balance - 1000n)
        .send();
      return tx.txid;
    };

    const deposit = async (wallet: Wallet | TestNetWallet, amount: bigint): Promise<string> => {
      const utxos = await contract.getUtxos();
      const currentBalance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      if (utxos.length > 0) {
        const tx = await contract.functions
          .deposit()
          .from(utxos[0])
          .withoutChange()
          .to(contract.address, currentBalance + amount)
          .send();
        return tx.txid;
      } else {
        const response = await wallet.send([{ cashaddr: contract.address, value: Number(amount), unit: 'sat' }]);
        return typeof response === 'string' ? response : (response as { txId: string }).txId;
      }
    };

    return {
      contract,
      address: contract.address,
      params,
      getData,
      getBalance,
      spend,
      withdrawAll,
      updateLimit,
      deposit
    };
  }, [provider]);

  const loadVault = useCallback(async (params: SpendingLimitVaultParams): Promise<SpendingLimitVaultInstance> => {
    return createVault(params);
  }, [createVault]);

  return { provider, loading, error, createVault, loadVault, SpendingLimitVaultArtifact };
}
