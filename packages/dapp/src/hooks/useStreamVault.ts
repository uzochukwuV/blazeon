/**
 * StreamVault Hook
 * Provides React hook for StreamVault with REAL smart contract integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider, SignatureTemplate } from 'cashscript';
import { Wallet, TestNetWallet } from 'mainnet-js';
import { StreamVaultArtifact } from '@dapp-starter/contracts';

export interface StreamVaultParams {
  senderPkh: Uint8Array;
  recipientPkh: Uint8Array;
  totalAmount: bigint;
  startBlock: bigint;
  endBlock: bigint;
}

export interface StreamVaultData {
  balance: bigint;
  totalAmount: bigint;
  startBlock: number;
  endBlock: number;
  currentBlock: number;
  streamProgress: number; // 0-100 percentage
  accruedAmount: bigint;
  claimableAmount: bigint;
  remainingAmount: bigint;
  isStarted: boolean;
  isCompleted: boolean;
  utxoCount: number;
}

export interface StreamVaultInstance {
  contract: Contract<typeof StreamVaultArtifact>;
  address: string;
  params: StreamVaultParams;
  getData: () => Promise<StreamVaultData>;
  getBalance: () => Promise<bigint>;
  claimAll: (recipientWallet: Wallet | TestNetWallet) => Promise<string>;
  claimPartial: (recipientWallet: Wallet | TestNetWallet, amount: bigint) => Promise<string>;
  senderCancel: (senderWallet: Wallet | TestNetWallet) => Promise<string>;
  mutualCancel: (senderWallet: Wallet | TestNetWallet, recipientWallet: Wallet | TestNetWallet) => Promise<string>;
  refund: () => Promise<string>;
}

export function useStreamVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: StreamVaultParams
  ): Promise<StreamVaultInstance> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      StreamVaultArtifact,
      [params.senderPkh, params.recipientPkh, params.totalAmount, params.startBlock, params.endBlock],
      { provider, addressType: 'p2sh32' }
    );

    const getCurrentBlock = async (): Promise<number> => {
      try { return await provider.getBlockHeight(); } catch { return 0; }
    };

    const getBalance = async (): Promise<bigint> => {
      const utxos = await contract.getUtxos();
      return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    };

    const getData = async (): Promise<StreamVaultData> => {
      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const currentBlock = await getCurrentBlock();

      const startBlock = Number(params.startBlock);
      const endBlock = Number(params.endBlock);
      const totalBlocks = endBlock - startBlock;
      const elapsedBlocks = Math.max(0, Math.min(currentBlock - startBlock, totalBlocks));

      const isStarted = currentBlock >= startBlock;
      const isCompleted = currentBlock >= endBlock;
      const streamProgress = totalBlocks > 0 ? Math.round((elapsedBlocks / totalBlocks) * 100) : 0;

      // Calculate accrued amount based on linear vesting
      const accruedAmount = totalBlocks > 0
        ? (params.totalAmount * BigInt(elapsedBlocks)) / BigInt(totalBlocks)
        : 0n;

      const claimableAmount = accruedAmount > balance ? balance : accruedAmount;
      const remainingAmount = balance - claimableAmount;

      return {
        balance,
        totalAmount: params.totalAmount,
        startBlock,
        endBlock,
        currentBlock,
        streamProgress,
        accruedAmount,
        claimableAmount,
        remainingAmount,
        isStarted,
        isCompleted,
        utxoCount: utxos.length
      };
    };

    const claimAll = async (recipientWallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const data = await getData();
      if (!data.isStarted) throw new Error('Stream has not started yet');

      const publicKey = recipientWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(recipientWallet);
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      const tx = await contract.functions
        .claimAll(publicKey, sigTemplate)
        .withoutChange()
        .to(recipientWallet.getDepositAddress(), balance - 1000n)
        .send();
      return tx.txid;
    };

    const claimPartial = async (
      recipientWallet: Wallet | TestNetWallet,
      amount: bigint
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const data = await getData();
      if (!data.isStarted) throw new Error('Stream has not started yet');
      if (amount > data.claimableAmount) throw new Error('Amount exceeds claimable amount');

      const publicKey = recipientWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(recipientWallet);
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const remaining = balance - amount - 1000n;

      const txBuilder = contract.functions
        .claimPartial(publicKey, sigTemplate, amount)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder
          .to(contract.address, remaining)
          .to(recipientWallet.getDepositAddress(), amount - 500n)
          .send();
        return tx.txid;
      } else {
        const tx = await txBuilder
          .to(recipientWallet.getDepositAddress(), balance - 1000n)
          .send();
        return tx.txid;
      }
    };

    const senderCancel = async (senderWallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const publicKey = senderWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(senderWallet);

      const tx = await contract.functions
        .senderCancel(publicKey, sigTemplate)
        .withoutChange()
        .to(senderWallet.getDepositAddress(), balance - 1000n)
        .send();
      return tx.txid;
    };

    const mutualCancel = async (
      senderWallet: Wallet | TestNetWallet,
      recipientWallet: Wallet | TestNetWallet
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const senderPk = senderWallet.publicKey;
      const recipientPk = recipientWallet.publicKey;
      if (!senderPk || !recipientPk) throw new Error('Public keys not available');

      const senderSig = new SignatureTemplate(senderWallet);
      const recipientSig = new SignatureTemplate(recipientWallet);

      // Split remaining balance between sender and recipient
      const halfBalance = (balance - 1000n) / 2n;

      const tx = await contract.functions
        .mutualCancel(senderPk, senderSig, recipientPk, recipientSig)
        .withoutChange()
        .to(senderWallet.getDepositAddress(), halfBalance)
        .to(recipientWallet.getDepositAddress(), halfBalance)
        .send();
      return tx.txid;
    };

    const refund = async (): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const data = await getData();
      if (data.isStarted) throw new Error('Stream has already started, cannot refund');

      const tx = await contract.functions.refund().withoutChange().send();
      return tx.txid;
    };

    return {
      contract,
      address: contract.address,
      params,
      getData,
      getBalance,
      claimAll,
      claimPartial,
      senderCancel,
      mutualCancel,
      refund
    };
  }, [provider]);

  const loadVault = useCallback(async (params: StreamVaultParams): Promise<StreamVaultInstance> => {
    return createVault(params);
  }, [createVault]);

  return { provider, loading, error, createVault, loadVault, StreamVaultArtifact };
}
