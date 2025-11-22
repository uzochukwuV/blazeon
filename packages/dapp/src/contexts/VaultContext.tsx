'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWeb3ModalConnectorContext } from '@bch-wc2/web3modal-connector';
import { Contract, ElectrumNetworkProvider, NetworkProvider } from 'cashscript';
import { Wallet, UtxoI } from 'mainnet-js';
import { hexToBin, binToHex, cashAddressToLockingBytecode, lockingBytecodeToCashAddress } from '@bitauth/libauth';

// Import contract artifacts
import MasterVaultArtifact from '../../../contracts/artifacts/MasterVault.artifact';
import TimeLockVaultArtifact from '../../../contracts/artifacts/TimeLockVault.artifact';
import MultiSigVaultArtifact from '../../../contracts/artifacts/MultiSigVault.artifact';
import SpendingLimitVaultArtifact from '../../../contracts/artifacts/SpendingLimitVault.artifact';
import RecurringPaymentVaultArtifact from '../../../contracts/artifacts/RecurringPaymentVault.artifact';
import StreamVaultArtifact from '../../../contracts/artifacts/StreamVault.artifact';
import WhitelistVaultArtifact from '../../../contracts/artifacts/WhitelistVault.artifact';
import TokenGatedVaultArtifact from '../../../contracts/artifacts/TokenGatedVault.artifact';

// Types
export type VaultType =
  | 'MasterVault'
  | 'TimeLockVault'
  | 'MultiSigVault'
  | 'SpendingLimitVault'
  | 'RecurringPaymentVault'
  | 'StreamVault'
  | 'WhitelistVault'
  | 'TokenGatedVault';

export type NetworkType = 'chipnet' | 'mainnet';

export interface VaultFeature {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface VaultConfig {
  // Multi-sig
  owners?: string[];
  requiredSignatures?: number;
  // Time lock
  unlockBlock?: number;
  // Spending limit
  dailyLimit?: number;
  // Recurring payment
  payeeAddress?: string;
  paymentAmount?: number;
  paymentInterval?: number;
  // Token gating
  requiredTokenCategory?: string;
  // Stream
  recipientAddress?: string;
  streamAmount?: number;
  startBlock?: number;
  endBlock?: number;
  // Whitelist
  whitelistedAddresses?: string[];
}

export interface Vault {
  id: string;
  name: string;
  type: VaultType;
  address: string;
  balance: bigint;
  features: string[];
  config: VaultConfig;
  createdAt: number;
  contract?: any; // Contract instance - using any to avoid type complexity
}

export interface Proposal {
  id: string;
  vaultId: string;
  title: string;
  description: string;
  type: 'withdraw' | 'config_change' | 'emergency';
  amount?: number;
  destination?: string;
  approvals: string[];
  rejections: string[];
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: number;
  createdBy: string;
  messages: ProposalMessage[];
}

export interface ProposalMessage {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  type: 'comment' | 'approval' | 'rejection';
}

interface VaultContextType {
  // Connection state
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: NetworkType;
  provider: NetworkProvider | null;

  // Vault state
  vaults: Vault[];
  selectedVault: Vault | null;
  proposals: Proposal[];
  loading: boolean;
  error: string | null;

  // Actions
  setNetwork: (network: NetworkType) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;

  // Vault operations
  createVault: (type: VaultType, name: string, config: VaultConfig, initialDeposit: bigint) => Promise<string>;
  selectVault: (vaultId: string | null) => void;
  depositToVault: (vaultId: string, amount: bigint) => Promise<string>;
  withdrawFromVault: (vaultId: string, amount: bigint, destination: string) => Promise<string>;
  refreshVaults: () => Promise<void>;

  // Proposal operations
  createProposal: (vaultId: string, proposal: Omit<Proposal, 'id' | 'approvals' | 'rejections' | 'status' | 'createdAt' | 'messages'>) => Promise<string>;
  approveProposal: (proposalId: string) => Promise<void>;
  rejectProposal: (proposalId: string) => Promise<void>;
  executeProposal: (proposalId: string) => Promise<string>;
  addProposalMessage: (proposalId: string, content: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | null>(null);

// Helper to get PKH from cash address
function getPkhFromAddress(address: string): Uint8Array {
  const result = cashAddressToLockingBytecode(address);
  if (typeof result === 'string') {
    throw new Error(`Invalid address: ${result}`);
  }
  // P2PKH locking bytecode format: OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
  // The PKH is bytes 3-23 (20 bytes)
  return result.bytecode.slice(3, 23);
}

// Helper to create P2PKH locking bytecode
function createP2PKHLockingBytecode(pkh: Uint8Array): Uint8Array {
  // OP_DUP OP_HASH160 <20 bytes PKH> OP_EQUALVERIFY OP_CHECKSIG
  const prefix = new Uint8Array([0x76, 0xa9, 0x14]);
  const suffix = new Uint8Array([0x88, 0xac]);
  const result = new Uint8Array(25);
  result.set(prefix, 0);
  result.set(pkh, 3);
  result.set(suffix, 23);
  return result;
}

// Storage key for vaults
const VAULTS_STORAGE_KEY = 'fluxvault_vaults';
const PROPOSALS_STORAGE_KEY = 'fluxvault_proposals';

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { address, connect, disconnect, isConnected, connector } = useWeb3ModalConnectorContext();

  const [network, setNetworkState] = useState<NetworkType>('chipnet');
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider based on network
  useEffect(() => {
    const electrumServer = network === 'chipnet'
      ? 'wss://chipnet.bch.ninja:50004'
      : 'wss://bch.imaginary.cash:50004';

    const newProvider = new ElectrumNetworkProvider(network);
    setProvider(newProvider);
  }, [network]);

  // Load vaults from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(VAULTS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert balance strings back to bigint
          const vaultsWithBigInt = parsed.map((v: Vault & { balance: string }) => ({
            ...v,
            balance: BigInt(v.balance || '0')
          }));
          setVaults(vaultsWithBigInt);
        } catch (e) {
          console.error('Failed to parse stored vaults:', e);
        }
      }

      const storedProposals = localStorage.getItem(PROPOSALS_STORAGE_KEY);
      if (storedProposals) {
        try {
          setProposals(JSON.parse(storedProposals));
        } catch (e) {
          console.error('Failed to parse stored proposals:', e);
        }
      }
    }
  }, []);

  // Save vaults to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && vaults.length > 0) {
      // Convert bigint to string for JSON serialization
      const vaultsForStorage = vaults.map(v => ({
        ...v,
        balance: v.balance.toString(),
        contract: undefined
      }));
      localStorage.setItem(VAULTS_STORAGE_KEY, JSON.stringify(vaultsForStorage));
    }
  }, [vaults]);

  // Save proposals to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && proposals.length > 0) {
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
    }
  }, [proposals]);

  // Watch balance
  useEffect(() => {
    if (!address) {
      setBalance(0);
      return;
    }

    let cancelWatch: (() => void) | undefined;

    (async () => {
      try {
        const wallet = await Wallet.watchOnly(address);
        const utxos = await wallet.getUtxos();
        const total = utxos.reduce((acc: number, utxo: UtxoI) => acc + (utxo.token ? 0 : utxo.satoshis), 0);
        setBalance(total);

        cancelWatch = await wallet.provider.subscribeToAddress(address, async () => {
          const newUtxos = await wallet.getUtxos();
          const newTotal = newUtxos.reduce((acc: number, utxo: UtxoI) => acc + (utxo.token ? 0 : utxo.satoshis), 0);
          setBalance(newTotal);
        });
      } catch (e) {
        console.error('Failed to watch address:', e);
      }
    })();

    return () => {
      cancelWatch?.();
    };
  }, [address]);

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!connect) return;
    setLoading(true);
    setError(null);
    try {
      await connect();
    } catch (e) {
      setError('Failed to connect wallet');
      console.error(e);
    }
    setLoading(false);
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    if (!disconnect) return;
    setLoading(true);
    try {
      await disconnect();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [disconnect]);

  const refreshVaults = useCallback(async () => {
    if (!provider) return;

    setLoading(true);
    try {
      const updatedVaults = await Promise.all(
        vaults.map(async (vault) => {
          try {
            const contract = reconstructContract(vault, provider);
            const utxos = await contract.getUtxos();
            const balance = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
            return { ...vault, balance, contract };
          } catch (e) {
            console.error(`Failed to refresh vault ${vault.id}:`, e);
            return vault;
          }
        })
      );
      setVaults(updatedVaults);
    } catch (e) {
      console.error('Failed to refresh vaults:', e);
    }
    setLoading(false);
  }, [provider, vaults]);

  // Reconstruct contract from vault config
  function reconstructContract(vault: Vault, provider: NetworkProvider): Contract<any> {
    const config = vault.config;

    switch (vault.type) {
      case 'MasterVault': {
        const owner1Pkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        const owner2Pkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : new Uint8Array(20);
        const owner3Pkh = config.owners?.[2] ? getPkhFromAddress(config.owners[2]) : new Uint8Array(20);
        const recurringPayeePkh = config.payeeAddress ? getPkhFromAddress(config.payeeAddress) : new Uint8Array(20);

        return new Contract(
          MasterVaultArtifact,
          [
            owner1Pkh,
            owner2Pkh,
            owner3Pkh,
            BigInt(config.requiredSignatures || 1),
            BigInt(config.unlockBlock || 0),
            BigInt(config.dailyLimit || 0),
            recurringPayeePkh,
            BigInt(config.paymentAmount || 0),
            BigInt(config.paymentInterval || 0),
            config.requiredTokenCategory ? hexToBin(config.requiredTokenCategory) : new Uint8Array(32)
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'TimeLockVault': {
        const ownerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        const recoveryPkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : new Uint8Array(20);

        return new Contract(
          TimeLockVaultArtifact,
          [
            ownerPkh,
            recoveryPkh,
            BigInt(config.unlockBlock || 0),
            0n // vestingAmount
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'MultiSigVault': {
        const signer1Pkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        const signer2Pkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : new Uint8Array(20);
        const signer3Pkh = config.owners?.[2] ? getPkhFromAddress(config.owners[2]) : new Uint8Array(20);

        return new Contract(
          MultiSigVaultArtifact,
          [
            signer1Pkh,
            signer2Pkh,
            signer3Pkh,
            BigInt(config.requiredSignatures || 2)
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'SpendingLimitVault': {
        const ownerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        const adminPkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : ownerPkh;

        return new Contract(
          SpendingLimitVaultArtifact,
          [
            ownerPkh,
            adminPkh,
            BigInt(config.dailyLimit || 100000),
            0n, // resetBlock
            0n  // spentSinceReset
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'RecurringPaymentVault': {
        const payerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        const payeePkh = config.payeeAddress ? getPkhFromAddress(config.payeeAddress) : new Uint8Array(20);

        return new Contract(
          RecurringPaymentVaultArtifact,
          [
            payerPkh,
            payeePkh,
            BigInt(config.paymentAmount || 0),
            BigInt(config.paymentInterval || 0)
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'StreamVault': {
        const senderPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        const recipientPkh = config.recipientAddress ? getPkhFromAddress(config.recipientAddress) : new Uint8Array(20);

        return new Contract(
          StreamVaultArtifact,
          [
            senderPkh,
            recipientPkh,
            BigInt(config.streamAmount || 0),
            BigInt(config.startBlock || 0),
            BigInt(config.endBlock || 0)
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'WhitelistVault': {
        const ownerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);
        // WhitelistVault stores whitelist differently - simplified for demo
        return new Contract(
          WhitelistVaultArtifact,
          [
            ownerPkh,
            config.whitelistedAddresses?.[0] ? getPkhFromAddress(config.whitelistedAddresses[0]) : new Uint8Array(20),
            config.whitelistedAddresses?.[1] ? getPkhFromAddress(config.whitelistedAddresses[1]) : new Uint8Array(20),
            config.whitelistedAddresses?.[2] ? getPkhFromAddress(config.whitelistedAddresses[2]) : new Uint8Array(20)
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      case 'TokenGatedVault': {
        const adminPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : new Uint8Array(20);

        return new Contract(
          TokenGatedVaultArtifact,
          [
            config.requiredTokenCategory ? hexToBin(config.requiredTokenCategory) : new Uint8Array(32),
            0n, // minFungibleBalance
            adminPkh
          ],
          { provider, addressType: 'p2sh32' }
        );
      }

      default:
        throw new Error(`Unknown vault type: ${vault.type}`);
    }
  }

  const createVault = useCallback(async (
    type: VaultType,
    name: string,
    config: VaultConfig,
    initialDeposit: bigint
  ): Promise<string> => {
    if (!provider || !address || !connector) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Set owner to connected address if not specified
      if (!config.owners || config.owners.length === 0) {
        config.owners = [address];
      }

      // Create the contract
      const vault: Vault = {
        id: `vault_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        type,
        address: '', // Will be set after contract creation
        balance: 0n,
        features: extractFeatures(type, config),
        config,
        createdAt: Date.now()
      };

      const contract = reconstructContract(vault, provider);
      vault.address = contract.address;
      vault.contract = contract;

      // Send initial deposit if specified
      if (initialDeposit > 0n) {
        const wallet = await Wallet.watchOnly(address);
        // Note: In production, use WrapWallet from @bch-wc2/mainnet-js-signer
        // For now, we'll add the vault with 0 balance
        vault.balance = initialDeposit;
      }

      setVaults(prev => [...prev, vault]);
      setLoading(false);
      return vault.id;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create vault';
      setError(errorMessage);
      setLoading(false);
      throw e;
    }
  }, [provider, address, connector]);

  const selectVault = useCallback((vaultId: string | null) => {
    if (vaultId === null) {
      setSelectedVault(null);
    } else {
      const vault = vaults.find(v => v.id === vaultId);
      setSelectedVault(vault || null);
    }
  }, [vaults]);

  const depositToVault = useCallback(async (vaultId: string, amount: bigint): Promise<string> => {
    if (!provider || !address || !connector) {
      throw new Error('Wallet not connected');
    }

    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) {
      throw new Error('Vault not found');
    }

    setLoading(true);
    try {
      // In production, use WrapWallet to send funds to the contract address
      // For demo, we'll simulate the deposit
      const updatedVault = { ...vault, balance: vault.balance + amount };
      setVaults(prev => prev.map(v => v.id === vaultId ? updatedVault : v));
      if (selectedVault?.id === vaultId) {
        setSelectedVault(updatedVault);
      }

      setLoading(false);
      return `deposit_${Date.now()}`;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  }, [provider, address, connector, vaults, selectedVault]);

  const withdrawFromVault = useCallback(async (
    vaultId: string,
    amount: bigint,
    destination: string
  ): Promise<string> => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }

    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) {
      throw new Error('Vault not found');
    }

    if (vault.balance < amount) {
      throw new Error('Insufficient balance');
    }

    setLoading(true);
    try {
      // In production, call the contract's withdraw function
      // For demo, we'll simulate the withdrawal
      const updatedVault = { ...vault, balance: vault.balance - amount };
      setVaults(prev => prev.map(v => v.id === vaultId ? updatedVault : v));
      if (selectedVault?.id === vaultId) {
        setSelectedVault(updatedVault);
      }

      setLoading(false);
      return `withdraw_${Date.now()}`;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  }, [provider, address, vaults, selectedVault]);

  // Proposal operations
  const createProposal = useCallback(async (
    vaultId: string,
    proposalData: Omit<Proposal, 'id' | 'approvals' | 'rejections' | 'status' | 'createdAt' | 'messages'>
  ): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const proposal: Proposal = {
      ...proposalData,
      id: `proposal_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      approvals: [address], // Creator auto-approves
      rejections: [],
      status: 'pending',
      createdAt: Date.now(),
      messages: [{
        id: `msg_${Date.now()}`,
        author: address,
        content: `Created proposal: ${proposalData.title}`,
        timestamp: Date.now(),
        type: 'comment'
      }]
    };

    setProposals(prev => [...prev, proposal]);
    return proposal.id;
  }, [address]);

  const approveProposal = useCallback(async (proposalId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId && !p.approvals.includes(address)) {
        const newApprovals = [...p.approvals, address];
        const vault = vaults.find(v => v.id === p.vaultId);
        const requiredSigs = vault?.config.requiredSignatures || 1;

        return {
          ...p,
          approvals: newApprovals,
          status: newApprovals.length >= requiredSigs ? 'approved' : 'pending',
          messages: [...p.messages, {
            id: `msg_${Date.now()}`,
            author: address,
            content: 'Approved this proposal',
            timestamp: Date.now(),
            type: 'approval' as const
          }]
        };
      }
      return p;
    }));
  }, [address, vaults]);

  const rejectProposal = useCallback(async (proposalId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId && !p.rejections.includes(address)) {
        return {
          ...p,
          rejections: [...p.rejections, address],
          messages: [...p.messages, {
            id: `msg_${Date.now()}`,
            author: address,
            content: 'Rejected this proposal',
            timestamp: Date.now(),
            type: 'rejection' as const
          }]
        };
      }
      return p;
    }));
  }, [address]);

  const executeProposal = useCallback(async (proposalId: string): Promise<string> => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'approved') {
      throw new Error('Proposal not approved');
    }

    // Execute the proposal (withdrawal, etc.)
    if (proposal.type === 'withdraw' && proposal.amount && proposal.destination) {
      await withdrawFromVault(proposal.vaultId, BigInt(proposal.amount), proposal.destination);
    }

    setProposals(prev => prev.map(p =>
      p.id === proposalId ? { ...p, status: 'executed' as const } : p
    ));

    return `executed_${Date.now()}`;
  }, [proposals, withdrawFromVault]);

  const addProposalMessage = useCallback(async (proposalId: string, content: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          messages: [...p.messages, {
            id: `msg_${Date.now()}`,
            author: address,
            content,
            timestamp: Date.now(),
            type: 'comment' as const
          }]
        };
      }
      return p;
    }));
  }, [address]);

  // Helper to extract features from vault type and config
  function extractFeatures(type: VaultType, config: VaultConfig): string[] {
    const features: string[] = [];

    if (type === 'MasterVault') {
      if ((config.requiredSignatures || 0) > 1) features.push('multisig');
      if ((config.unlockBlock || 0) > 0) features.push('timelock');
      if ((config.dailyLimit || 0) > 0) features.push('spending');
      if (config.payeeAddress) features.push('recurring');
      if (config.requiredTokenCategory) features.push('token');
    } else {
      // Map vault types to features
      const typeFeatureMap: Record<VaultType, string[]> = {
        MasterVault: [],
        TimeLockVault: ['timelock'],
        MultiSigVault: ['multisig'],
        SpendingLimitVault: ['spending'],
        RecurringPaymentVault: ['recurring'],
        StreamVault: ['stream'],
        WhitelistVault: ['whitelist'],
        TokenGatedVault: ['token']
      };
      features.push(...(typeFeatureMap[type] || []));
    }

    return features;
  }

  const value: VaultContextType = {
    isConnected: isConnected || false,
    address: address || null,
    balance,
    network,
    provider,
    vaults,
    selectedVault,
    proposals,
    loading,
    error,
    setNetwork,
    connectWallet,
    disconnectWallet,
    createVault,
    selectVault,
    depositToVault,
    withdrawFromVault,
    refreshVaults,
    createProposal,
    approveProposal,
    rejectProposal,
    executeProposal,
    addProposalMessage
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
