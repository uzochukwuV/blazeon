'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ElectrumNetworkProvider, NetworkProvider, Contract } from 'cashscript';
import { Wallet } from 'mainnet-js';
import { hexToBin, cashAddressToLockingBytecode } from '@bitauth/libauth';
import { WalletType, WalletBalance } from '../types/wallet';
import { MainnetConnector } from '../services/wallets/mainnet-connector';

// Import all artifacts from contracts package
import {
  MasterVaultArtifact,
  TimeLockVaultArtifact,
  MultiSigVaultArtifact,
  SpendingLimitVaultArtifact,
  RecurringPaymentVaultArtifact,
  StreamVaultArtifact,
  WhitelistVaultArtifact,
  TokenGatedVaultArtifact,
} from '@dapp-starter/contracts';

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

export interface VaultConfig {
  owners?: string[];
  requiredSignatures?: number;
  unlockBlock?: number;
  dailyLimit?: number;
  payeeAddress?: string;
  paymentAmount?: number;
  paymentInterval?: number;
  requiredTokenCategory?: string;
  recipientAddress?: string;
  streamAmount?: number;
  startBlock?: number;
  endBlock?: number;
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
  contract?: any;
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
  // Wallet state
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
  publicKeyHash: Uint8Array | null;
  balance: number;
  walletBalance: WalletBalance | null;
  network: NetworkType;
  provider: NetworkProvider | null;
  connector: MainnetConnector | null;

  // Vault state
  vaults: Vault[];
  selectedVault: Vault | null;
  proposals: Proposal[];
  loading: boolean;
  error: string | null;

  // Wallet actions
  setNetwork: (network: NetworkType) => void;
  connectWallet: (walletType?: WalletType, seedPhrase?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>;

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
  return result.bytecode.slice(3, 23);
}

const VAULTS_STORAGE_KEY = 'fluxvault_vaults';
const PROPOSALS_STORAGE_KEY = 'fluxvault_proposals';

export function VaultProvider({ children }: { children: React.ReactNode }) {
  // Wallet state
  const [network, setNetworkState] = useState<NetworkType>('chipnet');
  const [provider, setProvider] = useState<NetworkProvider | null>(null);
  const [connector, setConnector] = useState<MainnetConnector | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [publicKeyHash, setPublicKeyHash] = useState<Uint8Array | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);

  // Vault state
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider
  useEffect(() => {
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

  // Auto-reconnect wallet
  useEffect(() => {
    const savedWalletType = localStorage.getItem('wallet_type');
    if (savedWalletType) {
      connectWallet(savedWalletType as WalletType);
    }
  }, []);

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    // Update connector network if connected
    if (connector) {
      const newConnector = new MainnetConnector(newNetwork);
      setConnector(newConnector);
    }
  }, [connector]);

  const connectWallet = useCallback(async (walletType: WalletType = WalletType.MAINNET, seedPhrase?: string) => {
    setLoading(true);
    setError(null);

    try {
      const newConnector = new MainnetConnector(network);
      const walletInfo = await newConnector.connect(seedPhrase);

      setConnector(newConnector);
      setAddress(walletInfo.address);
      setPublicKey(walletInfo.publicKey || null);
      setWalletBalance(walletInfo.balance || null);
      setBalance(walletInfo.balance?.sat || 0);
      setIsConnected(true);

      // Get public key hash
      try {
        const pkh = await newConnector.getPublicKeyHash();
        setPublicKeyHash(pkh);
      } catch (e) {
        console.warn('Could not get public key hash:', e);
      }

      localStorage.setItem('wallet_type', walletType);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect wallet');
      console.error(e);
    }
    setLoading(false);
  }, [network]);

  const disconnectWallet = useCallback(async () => {
    if (connector) {
      await connector.disconnect();
    }
    setConnector(null);
    setAddress(null);
    setPublicKey(null);
    setPublicKeyHash(null);
    setBalance(0);
    setWalletBalance(null);
    setIsConnected(false);
    localStorage.removeItem('wallet_type');
  }, [connector]);

  const refreshWalletBalance = useCallback(async () => {
    if (!connector) return;
    try {
      const newBalance = await connector.getBalance();
      setWalletBalance(newBalance);
      setBalance(newBalance.sat);
    } catch (e) {
      console.error('Failed to refresh balance:', e);
    }
  }, [connector]);

  // Reconstruct contract from vault config
  function reconstructContract(vault: Vault, prov: NetworkProvider): any {
    const config = vault.config;
    const zeroPkh = new Uint8Array(20);
    const zeroCategory = new Uint8Array(32);

    switch (vault.type) {
      case 'MasterVault': {
        const owner1Pkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const owner2Pkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : zeroPkh;
        const owner3Pkh = config.owners?.[2] ? getPkhFromAddress(config.owners[2]) : zeroPkh;
        const recurringPayeePkh = config.payeeAddress ? getPkhFromAddress(config.payeeAddress) : zeroPkh;

        return new Contract(
          MasterVaultArtifact,
          [owner1Pkh, owner2Pkh, owner3Pkh, BigInt(config.requiredSignatures || 1),
           BigInt(config.unlockBlock || 0), BigInt(config.dailyLimit || 0),
           recurringPayeePkh, BigInt(config.paymentAmount || 0),
           BigInt(config.paymentInterval || 0),
           config.requiredTokenCategory ? hexToBin(config.requiredTokenCategory) : zeroCategory],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'TimeLockVault': {
        const ownerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const recoveryPkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : zeroPkh;
        return new Contract(
          TimeLockVaultArtifact,
          [ownerPkh, recoveryPkh, BigInt(config.unlockBlock || 0), 0n],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'MultiSigVault': {
        const signer1Pkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const signer2Pkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : zeroPkh;
        const signer3Pkh = config.owners?.[2] ? getPkhFromAddress(config.owners[2]) : zeroPkh;
        return new Contract(
          MultiSigVaultArtifact,
          [signer1Pkh, signer2Pkh, signer3Pkh, BigInt(config.requiredSignatures || 2)],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'SpendingLimitVault': {
        const ownerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const adminPkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : ownerPkh;
        return new Contract(
          SpendingLimitVaultArtifact,
          [ownerPkh, adminPkh, BigInt(config.dailyLimit || 100000), 0n, 0n],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'RecurringPaymentVault': {
        const payerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const payeePkh = config.payeeAddress ? getPkhFromAddress(config.payeeAddress) : zeroPkh;
        return new Contract(
          RecurringPaymentVaultArtifact,
          [payerPkh, payeePkh, BigInt(config.paymentAmount || 0), BigInt(config.paymentInterval || 0)],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'StreamVault': {
        const senderPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const recipientPkh = config.recipientAddress ? getPkhFromAddress(config.recipientAddress) : zeroPkh;
        return new Contract(
          StreamVaultArtifact,
          [senderPkh, recipientPkh, BigInt(config.streamAmount || 0),
           BigInt(config.startBlock || 0), BigInt(config.endBlock || 0)],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'WhitelistVault': {
        const ownerPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        const adminPkh = config.owners?.[1] ? getPkhFromAddress(config.owners[1]) : ownerPkh;
        // whitelistHash is a hash of all whitelisted addresses combined
        const whitelistPkh = config.whitelistedAddresses?.[0] ? getPkhFromAddress(config.whitelistedAddresses[0]) : zeroPkh;
        return new Contract(
          WhitelistVaultArtifact,
          [ownerPkh, adminPkh, whitelistPkh],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      case 'TokenGatedVault': {
        const adminPkh = config.owners?.[0] ? getPkhFromAddress(config.owners[0]) : zeroPkh;
        return new Contract(
          TokenGatedVaultArtifact,
          [config.requiredTokenCategory ? hexToBin(config.requiredTokenCategory) : zeroCategory,
           0n, adminPkh],
          { provider: prov, addressType: 'p2sh32' }
        );
      }

      default:
        throw new Error(`Unknown vault type: ${vault.type}`);
    }
  }

  const refreshVaults = useCallback(async () => {
    if (!provider) return;

    setLoading(true);
    try {
      const updatedVaults = await Promise.all(
        vaults.map(async (vault) => {
          try {
            const contract = reconstructContract(vault, provider);
            const utxos = await contract.getUtxos();
            const vaultBalance = utxos.reduce((sum: bigint, utxo: { satoshis: bigint }) => sum + utxo.satoshis, 0n);
            return { ...vault, balance: vaultBalance, contract };
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

  const createVault = useCallback(async (
    type: VaultType,
    name: string,
    config: VaultConfig,
    initialDeposit: bigint
  ): Promise<string> => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      if (!config.owners || config.owners.length === 0) {
        config.owners = [address];
      }

      const vault: Vault = {
        id: `vault_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        type,
        address: '',
        balance: initialDeposit,
        features: extractFeatures(type, config),
        config,
        createdAt: Date.now()
      };

      const contract = reconstructContract(vault, provider);
      vault.address = contract.address;
      vault.contract = contract;

      setVaults(prev => [...prev, vault]);
      setLoading(false);
      return vault.id;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create vault';
      setError(errorMessage);
      setLoading(false);
      throw e;
    }
  }, [provider, address]);

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
    if (!vault) throw new Error('Vault not found');

    setLoading(true);
    try {
      // Send funds to vault address
      const result = await connector.signTransaction({
        to: vault.address,
        amount: Number(amount)
      });

      const updatedVault = { ...vault, balance: vault.balance + amount };
      setVaults(prev => prev.map(v => v.id === vaultId ? updatedVault : v));
      if (selectedVault?.id === vaultId) {
        setSelectedVault(updatedVault);
      }

      await refreshWalletBalance();
      setLoading(false);
      return result.txId;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  }, [provider, address, connector, vaults, selectedVault, refreshWalletBalance]);

  const withdrawFromVault = useCallback(async (
    vaultId: string,
    amount: bigint,
    destination: string
  ): Promise<string> => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }

    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) throw new Error('Vault not found');
    if (vault.balance < amount) throw new Error('Insufficient balance');

    setLoading(true);
    try {
      // Note: Real withdrawal requires contract interaction with signatures
      // This is a simulated update - real implementation needs contract.functions.withdraw()
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
    if (!address) throw new Error('Wallet not connected');

    const proposal: Proposal = {
      ...proposalData,
      id: `proposal_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      approvals: [address],
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
    if (!address) throw new Error('Wallet not connected');

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId && !p.approvals.includes(address)) {
        const newApprovals = [...p.approvals, address];
        const vault = vaults.find(v => v.id === p.vaultId);
        const requiredSigs = vault?.config.requiredSignatures || 1;

        return {
          ...p,
          approvals: newApprovals,
          status: newApprovals.length >= requiredSigs ? 'approved' as const : 'pending' as const,
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
    if (!address) throw new Error('Wallet not connected');

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
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.status !== 'approved') throw new Error('Proposal not approved');

    if (proposal.type === 'withdraw' && proposal.amount && proposal.destination) {
      await withdrawFromVault(proposal.vaultId, BigInt(proposal.amount), proposal.destination);
    }

    setProposals(prev => prev.map(p =>
      p.id === proposalId ? { ...p, status: 'executed' as const } : p
    ));

    return `executed_${Date.now()}`;
  }, [proposals, withdrawFromVault]);

  const addProposalMessage = useCallback(async (proposalId: string, content: string) => {
    if (!address) throw new Error('Wallet not connected');

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

  function extractFeatures(type: VaultType, config: VaultConfig): string[] {
    const features: string[] = [];

    if (type === 'MasterVault') {
      if ((config.requiredSignatures || 0) > 1) features.push('multisig');
      if ((config.unlockBlock || 0) > 0) features.push('timelock');
      if ((config.dailyLimit || 0) > 0) features.push('spending');
      if (config.payeeAddress) features.push('recurring');
      if (config.requiredTokenCategory) features.push('token');
    } else {
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
    isConnected,
    address,
    publicKey,
    publicKeyHash,
    balance,
    walletBalance,
    network,
    provider,
    connector,
    vaults,
    selectedVault,
    proposals,
    loading,
    error,
    setNetwork,
    connectWallet,
    disconnectWallet,
    refreshWalletBalance,
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
