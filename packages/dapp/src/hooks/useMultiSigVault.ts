/**
 * MultiSigVault Hook
 * Provides React hook for MultiSigVault contract interactions with REAL smart contract integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Contract, ElectrumNetworkProvider, NetworkProvider, SignatureTemplate } from 'cashscript';
import { Wallet, TestNetWallet } from 'mainnet-js';
import { MultiSigVaultArtifact } from '@dapp-starter/contracts';

export interface MultiSigVaultParams {
  signer1Pkh: Uint8Array;
  signer2Pkh: Uint8Array;
  signer3Pkh: Uint8Array;
  minSignatures: bigint;
}

export interface MultiSigVaultData {
  balance: bigint;
  requiredSignatures: number;
  totalSigners: number;
  utxoCount: number;
}

export interface SignerInfo {
  wallet: Wallet | TestNetWallet;
  index: 1 | 2 | 3;
}

export interface MultiSigVaultInstance {
  contract: Contract<typeof MultiSigVaultArtifact>;
  address: string;
  params: MultiSigVaultParams;
  getData: () => Promise<MultiSigVaultData>;
  getBalance: () => Promise<bigint>;
  spendTwoOfThree: (signerA: SignerInfo, signerB: SignerInfo, destination: string, amount: bigint) => Promise<string>;
  spendAllThree: (signer1: Wallet | TestNetWallet, signer2: Wallet | TestNetWallet, signer3: Wallet | TestNetWallet, destination: string, amount: bigint) => Promise<string>;
  emergencyRecovery: (signer1: Wallet | TestNetWallet, signer2: Wallet | TestNetWallet, signer3: Wallet | TestNetWallet, recoveryAddress: string) => Promise<string>;
  deposit: (wallet: Wallet | TestNetWallet, amount: bigint) => Promise<string>;
}

export function useMultiSigVault(network: 'mainnet' | 'chipnet' = 'chipnet') {
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [network]);

  const createVault = useCallback(async (
    params: MultiSigVaultParams
  ): Promise<MultiSigVaultInstance> => {
    if (!provider) throw new Error('Provider not initialized');

    const contract = new Contract(
      MultiSigVaultArtifact,
      [params.signer1Pkh, params.signer2Pkh, params.signer3Pkh, params.minSignatures],
      { provider, addressType: 'p2sh32' }
    );

    const getBalance = async (): Promise<bigint> => {
      const utxos = await contract.getUtxos();
      return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    };

    const getData = async (): Promise<MultiSigVaultData> => {
      const utxos = await contract.getUtxos();
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      return {
        balance,
        requiredSignatures: Number(params.minSignatures),
        totalSigners: 3,
        utxoCount: utxos.length
      };
    };

    const createSignerMask = (signerIndices: number[]): Uint8Array => {
      let mask = 0;
      signerIndices.forEach(idx => { mask |= (1 << (idx - 1)); });
      return new Uint8Array([mask]);
    };

    const spendTwoOfThree = async (
      signerA: SignerInfo,
      signerB: SignerInfo,
      destination: string,
      amount: bigint
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (amount > balance) throw new Error('Insufficient balance');

      const pkA = signerA.wallet.publicKey;
      const pkB = signerB.wallet.publicKey;
      if (!pkA || !pkB) throw new Error('Public keys not available');

      const sigTemplateA = new SignatureTemplate(signerA.wallet);
      const sigTemplateB = new SignatureTemplate(signerB.wallet);
      const signerMask = createSignerMask([signerA.index, signerB.index]);
      const remaining = balance - amount - 1000n;

      const txBuilder = contract.functions
        .spendTwoOfThree(pkA, sigTemplateA, pkB, sigTemplateB, signerMask)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder.to(contract.address, remaining).to(destination, amount - 500n).send();
        return tx.txid;
      } else {
        const tx = await txBuilder.to(destination, balance - 1000n).send();
        return tx.txid;
      }
    };

    const spendAllThree = async (
      signer1: Wallet | TestNetWallet,
      signer2: Wallet | TestNetWallet,
      signer3: Wallet | TestNetWallet,
      destination: string,
      amount: bigint
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
      if (amount > balance) throw new Error('Insufficient balance');

      const pk1 = signer1.publicKey;
      const pk2 = signer2.publicKey;
      const pk3 = signer3.publicKey;
      if (!pk1 || !pk2 || !pk3) throw new Error('Public keys not available');

      const sig1 = new SignatureTemplate(signer1);
      const sig2 = new SignatureTemplate(signer2);
      const sig3 = new SignatureTemplate(signer3);
      const approvalMask = createSignerMask([1, 2, 3]);
      const remaining = balance - amount - 1000n;

      const txBuilder = contract.functions
        .spend(pk1, sig1, pk2, sig2, pk3, sig3, approvalMask)
        .withoutChange();

      if (remaining > 546n) {
        const tx = await txBuilder.to(contract.address, remaining).to(destination, amount - 500n).send();
        return tx.txid;
      } else {
        const tx = await txBuilder.to(destination, balance - 1000n).send();
        return tx.txid;
      }
    };

    const emergencyRecovery = async (
      signer1: Wallet | TestNetWallet,
      signer2: Wallet | TestNetWallet,
      signer3: Wallet | TestNetWallet,
      recoveryAddress: string
    ): Promise<string> => {
      const utxos = await contract.getUtxos();
      if (utxos.length === 0) throw new Error('No funds in vault');
      const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

      const pk1 = signer1.publicKey;
      const pk2 = signer2.publicKey;
      const pk3 = signer3.publicKey;
      if (!pk1 || !pk2 || !pk3) throw new Error('Public keys not available');

      const sig1 = new SignatureTemplate(signer1);
      const sig2 = new SignatureTemplate(signer2);
      const sig3 = new SignatureTemplate(signer3);

      const tx = await contract.functions
        .emergencyRecovery(pk1, sig1, pk2, sig2, pk3, sig3)
        .withoutChange()
        .to(recoveryAddress, balance - 1000n)
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
      spendTwoOfThree,
      spendAllThree,
      emergencyRecovery,
      deposit
    };
  }, [provider]);

  const loadVault = useCallback(async (params: MultiSigVaultParams): Promise<MultiSigVaultInstance> => {
    return createVault(params);
  }, [createVault]);

  return { provider, loading, error, createVault, loadVault, MultiSigVaultArtifact };
}
