/**
 * TimeLockVault Hook
 * Provides React hook for TimeLockVault contract interactions with REAL smart contract integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider, SignatureTemplate } from 'cashscript';
import { Wallet, TestNetWallet } from 'mainnet-js';
import { TimeLockVaultArtifact } from '@dapp-starter/contracts';

export interface TimeLockVaultParams {
  ownerPkh: Uint8Array;
  recoveryPkh: Uint8Array;
  unlockBlock: bigint;
  vestingAmount?: bigint;
}

export interface TimeLockVaultData {
  balance: bigint;
  isUnlocked: boolean;
  blocksUntilUnlock: number;
  unlockBlock: bigint;
  vestingAmount: bigint;
  currentBlock: number;
  utxoCount: number;
}

export interface TimeLockVaultInstance {
  contract: Contract<typeof TimeLockVaultArtifact>;
  address: string;
  params: TimeLockVaultParams;
  getData: () => Promise<TimeLockVaultData>;
  getBalance: () => Promise<bigint>;
  // Contract functions with real implementations
  withdraw: (wallet: Wallet | TestNetWallet) => Promise<string>;
  partialWithdraw: (wallet: Wallet | TestNetWallet, withdrawAmount: bigint) => Promise<string>;
  vestingWithdraw: (wallet: Wallet | TestNetWallet) => Promise<string>;
  emergencyWithdraw: (recoveryWallet: Wallet | TestNetWallet) => Promise<string>;
  extendLock: (wallet: Wallet | TestNetWallet, newUnlockBlock: bigint) => Promise<string>;
  deposit: (wallet: Wallet | TestNetWallet, amount: bigint) => Promise<string>;
  transferOwnership: (wallet: Wallet | TestNetWallet, newOwnerPkh: Uint8Array) => Promise<string>;
}

export function useTimeLockVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: TimeLockVaultParams
  ): Promise<TimeLockVaultInstance> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      TimeLockVaultArtifact,
      [params.ownerPkh, params.recoveryPkh, params.unlockBlock, params.vestingAmount ?? 0n],
      { provider, addressType: 'p2sh32' }
    );

    const getCurrentBlock = async (): Promise<number> => {
      try {
        const height = await provider.getBlockHeight();
        return height;
      } catch {
        return 0;
      }
    };

    const getBalance = async (): Promise<bigint> => {
      const utxos = await contract.getUtxos();
      return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    };

    const getData = async (): Promise<TimeLockVaultData> => {
      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const currentBlock = await getCurrentBlock();
      const isUnlocked = currentBlock >= Number(params.unlockBlock);
      const blocksUntilUnlock = Math.max(0, Number(params.unlockBlock) - currentBlock);

      return {
        balance,
        isUnlocked,
        blocksUntilUnlock,
        unlockBlock: params.unlockBlock,
        vestingAmount: params.vestingAmount ?? 0n,
        currentBlock,
        utxoCount: utxos.length
      };
    };

    // Full withdrawal - only after unlock time
    const withdraw = async (wallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const currentBlock = await getCurrentBlock();
      if (currentBlock < Number(params.unlockBlock)) {
        throw new Error(`Vault is still locked. ${Number(params.unlockBlock) - currentBlock} blocks remaining.`);
      }

      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);

      const tx = await contract.functions
        .withdraw(publicKey, sigTemplate)
        .withoutChange()
        .to(wallet.getDepositAddress(), utxos[0].satoshis - 1000n)
        .send();

      return tx.txid;
    };

    // Partial withdrawal with covenant
    const partialWithdraw = async (
      wallet: Wallet | TestNetWallet,
      withdrawAmount: bigint
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const currentBlock = await getCurrentBlock();
      if (currentBlock < Number(params.unlockBlock)) {
        throw new Error(`Vault is still locked. ${Number(params.unlockBlock) - currentBlock} blocks remaining.`);
      }

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (withdrawAmount > balance) throw new Error('Insufficient balance');

      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);
      const remaining = balance - withdrawAmount - 1000n;

      const txBuilder = contract.functions
        .partialWithdraw(publicKey, sigTemplate, withdrawAmount)
        .withoutChange();

      // If remaining is significant, send back to contract
      if (remaining > 546n) {
        const tx = await txBuilder
          .to(contract.address, remaining)
          .to(wallet.getDepositAddress(), withdrawAmount - 500n)
          .send();
        return tx.txid;
      } else {
        const tx = await txBuilder
          .to(wallet.getDepositAddress(), balance - 1000n)
          .send();
        return tx.txid;
      }
    };

    // Vesting withdrawal - withdraw only vested amount
    const vestingWithdraw = async (wallet: Wallet | TestNetWallet): Promise<string> => {
      if ((params.vestingAmount ?? 0n) === 0n) {
        throw new Error('Vesting not configured for this vault');
      }

      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const currentBlock = await getCurrentBlock();
      if (currentBlock < Number(params.unlockBlock)) {
        throw new Error('Vesting period not started');
      }

      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const toWithdraw = params.vestingAmount ?? 0n;
      const remaining = balance - toWithdraw - 500n;

      const txBuilder = contract.functions
        .vestingWithdraw(publicKey, sigTemplate)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder
          .to(contract.address, remaining)
          .to(wallet.getDepositAddress(), toWithdraw - 500n)
          .send();
        return tx.txid;
      } else {
        const tx = await txBuilder
          .to(wallet.getDepositAddress(), balance - 500n)
          .send();
        return tx.txid;
      }
    };

    // Emergency withdrawal - requires recovery key
    const emergencyWithdraw = async (recoveryWallet: Wallet | TestNetWallet): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const publicKey = recoveryWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(recoveryWallet);
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      const tx = await contract.functions
        .emergencyWithdraw(publicKey, sigTemplate)
        .withoutChange()
        .to(recoveryWallet.getDepositAddress(), balance - 1000n)
        .send();

      return tx.txid;
    };

    // Extend the lock period
    const extendLock = async (
      wallet: Wallet | TestNetWallet,
      newUnlockBlock: bigint
    ): Promise<string> => {
      if (newUnlockBlock <= params.unlockBlock) {
        throw new Error('New unlock block must be later than current');
      }

      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      const tx = await contract.functions
        .extendLock(publicKey, sigTemplate, newUnlockBlock)
        .withoutChange()
        .to(contract.address, balance - 1000n)
        .send();

      return tx.txid;
    };

    // Deposit more funds into the vault
    const deposit = async (wallet: Wallet | TestNetWallet, amount: bigint): Promise<string> => {
      const utxos = await contract.getUtxos();
      const currentBalance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      // For deposit, we need to send funds FROM wallet TO the contract
      // Using the contract's deposit() function which requires output > input
      if (utxos.length > 0) {
        // If vault already has funds, use deposit function
        const tx = await contract.functions
          .deposit()
          .from(utxos[0])
          .withoutChange()
          .to(contract.address, currentBalance + amount)
          .send();
        return tx.txid;
      } else {
        // If vault is empty, just send directly to the address
        const response = await wallet.send([{
          cashaddr: contract.address,
          value: Number(amount),
          unit: 'sat'
        }]);
        return typeof response === 'string' ? response : (response as { txId: string }).txId;
      }
    };

    // Transfer ownership
    const transferOwnership = async (
      wallet: Wallet | TestNetWallet,
      newOwnerPkh: Uint8Array
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const publicKey = wallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(wallet);
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      // Note: Transfer ownership requires creating a new contract with new owner
      const tx = await contract.functions
        .transferOwnership(publicKey, sigTemplate, newOwnerPkh)
        .withoutChange()
        .to(contract.address, balance - 1000n)
        .send();

      return tx.txid;
    };

    return {
      contract,
      address: contract.address,
      params,
      getData,
      getBalance,
      withdraw,
      partialWithdraw,
      vestingWithdraw,
      emergencyWithdraw,
      extendLock,
      deposit,
      transferOwnership
    };
  }, [provider]);

  const loadVault = useCallback(async (
    params: TimeLockVaultParams
  ): Promise<TimeLockVaultInstance> => {
    return createVault(params);
  }, [createVault]);

  return {
    provider,
    loading,
    error,
    createVault,
    loadVault,
    TimeLockVaultArtifact
  };
}
