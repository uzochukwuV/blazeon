/**
 * WhitelistVault Hook
 * Provides React hook for WhitelistVault with REAL smart contract integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider, SignatureTemplate } from 'cashscript';
import { Wallet, TestNetWallet } from 'mainnet-js';
import { cashAddressToLockingBytecode } from '@bitauth/libauth';
import { WhitelistVaultArtifact } from '@dapp-starter/contracts';

export interface WhitelistVaultParams {
  ownerPkh: Uint8Array;
  adminPkh: Uint8Array;
  whitelistHash: Uint8Array;
}

export interface WhitelistVaultData {
  balance: bigint;
  whitelistHash: string;
  utxoCount: number;
}

export interface WhitelistVaultInstance {
  contract: Contract<typeof WhitelistVaultArtifact>;
  address: string;
  params: WhitelistVaultParams;
  getData: () => Promise<WhitelistVaultData>;
  getBalance: () => Promise<bigint>;
  spendToWhitelisted: (ownerWallet: Wallet | TestNetWallet, recipientAddress: string, amount: bigint) => Promise<string>;
  adminWithdraw: (adminWallet: Wallet | TestNetWallet, destination: string) => Promise<string>;
  deposit: (wallet: Wallet | TestNetWallet, amount: bigint) => Promise<string>;
}

export function useWhitelistVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: WhitelistVaultParams
  ): Promise<WhitelistVaultInstance> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      WhitelistVaultArtifact,
      [params.ownerPkh, params.adminPkh, params.whitelistHash],
      { provider, addressType: 'p2sh32' }
    );

    const getBalance = async (): Promise<bigint> => {
      const utxos = await contract.getUtxos();
      return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    };

    const getData = async (): Promise<WhitelistVaultData> => {
      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const whitelistHash = Array.from(params.whitelistHash)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return {
        balance,
        whitelistHash,
        utxoCount: utxos.length
      };
    };

    const getPkhFromAddress = (addr: string): Uint8Array => {
      const result = cashAddressToLockingBytecode(addr);
      if (typeof result === 'string') throw new Error(`Invalid address: ${result}`);
      return result.bytecode.slice(3, 23);
    };

    const spendToWhitelisted = async (
      ownerWallet: Wallet | TestNetWallet,
      recipientAddress: string,
      amount: bigint
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (amount > balance) throw new Error('Insufficient balance');

      const publicKey = ownerWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(ownerWallet);
      const recipientPkh = getPkhFromAddress(recipientAddress);
      const remaining = balance - amount - 1000n;

      const txBuilder = contract.functions
        .spendToWhitelisted(publicKey, sigTemplate, recipientPkh, amount)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder
          .to(contract.address, remaining)
          .to(recipientAddress, amount - 500n)
          .send();
        return tx.txid;
      } else {
        const tx = await txBuilder
          .to(recipientAddress, balance - 1000n)
          .send();
        return tx.txid;
      }
    };

    const adminWithdraw = async (
      adminWallet: Wallet | TestNetWallet,
      destination: string
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');

      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      const publicKey = adminWallet.publicKey;
      if (!publicKey) throw new Error('Public key not available');

      const sigTemplate = new SignatureTemplate(adminWallet);

      const tx = await contract.functions
        .adminWithdraw(publicKey, sigTemplate)
        .withoutChange()
        .to(destination, balance - 1000n)
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
      spendToWhitelisted,
      adminWithdraw,
      deposit
    };
  }, [provider]);

  const loadVault = useCallback(async (params: WhitelistVaultParams): Promise<WhitelistVaultInstance> => {
    return createVault(params);
  }, [createVault]);

  return { provider, loading, error, createVault, loadVault, WhitelistVaultArtifact };
}
