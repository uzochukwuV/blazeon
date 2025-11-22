"use client";

import { useState } from "react";
import Link from "next/link";

// Vault type definitions
const VAULT_TYPES = [
  {
    id: "master",
    name: "MasterVault",
    description: "Unified vault with all features",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    features: ["Multi-Sig", "Time-Lock", "Spending Limit", "Covenant"],
    color: "from-emerald-500 to-cyan-500",
  },
  {
    id: "timelock",
    name: "TimeLockVault",
    description: "Time-based withdrawal restrictions",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    features: ["Block-based locks", "Emergency withdraw", "Extend lock"],
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "multisig",
    name: "MultiSigVault",
    description: "Multiple signature authorization",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    features: ["Bitwise approval", "Flexible thresholds", "Up to 8 signers"],
    color: "from-orange-500 to-red-500",
  },
  {
    id: "spending",
    name: "SpendingLimitVault",
    description: "Daily spending limits",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    features: ["Daily caps", "Auto-reset", "Owner override"],
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "recurring",
    name: "RecurringPaymentVault",
    description: "Automated scheduled payments",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    features: ["Scheduled payouts", "Anyone can trigger", "Cancellable"],
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "whitelist",
    name: "WhitelistVault",
    description: "Restricted recipient addresses",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    features: ["Approved recipients", "Hash-based validation", "Admin control"],
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "stream",
    name: "StreamVault",
    description: "Linear token streaming",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    features: ["Per-block streaming", "Partial claims", "Stop anytime"],
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "tokengated",
    name: "TokenGatedVault",
    description: "CashToken-based access",
    icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    features: ["Token verification", "NFT support", "Fungible tokens"],
    color: "from-violet-500 to-purple-500",
  },
];

export default function AppPage() {
  const [connected, setConnected] = useState(false);
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");

  // Mock wallet address
  const walletAddress = "bitcoincash:qz...x7k9";

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">FluxVault</span>
          </Link>

          <div className="flex items-center gap-4">
            {connected ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm text-gray-400">Balance:</span>
                  <span className="ml-2 text-white font-medium">12.5 BCH</span>
                </div>
                <button
                  onClick={() => setConnected(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium">{walletAddress}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConnected(true)}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Vault Dashboard</h1>
            <p className="text-gray-400">Create and manage your programmable Bitcoin Cash vaults</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "create"
                  ? "bg-emerald-500 text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Create Vault
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "manage"
                  ? "bg-emerald-500 text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              My Vaults
            </button>
          </div>

          {activeTab === "create" ? (
            /* Create Vault View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {VAULT_TYPES.map((vault) => (
                <button
                  key={vault.id}
                  onClick={() => setSelectedVault(vault.id)}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                    selectedVault === vault.id
                      ? "bg-emerald-500/10 border-emerald-500/50 scale-[1.02]"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vault.color} flex items-center justify-center mb-4`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={vault.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{vault.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{vault.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {vault.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-400">
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Manage Vaults View */
            <div>
              {connected ? (
                <div className="space-y-4">
                  {/* Sample vault cards */}
                  <VaultCard
                    name="Treasury Vault"
                    type="MasterVault"
                    balance="5.234 BCH"
                    status="active"
                    address="bitcoincash:pz...abc"
                  />
                  <VaultCard
                    name="Savings"
                    type="TimeLockVault"
                    balance="2.5 BCH"
                    status="locked"
                    address="bitcoincash:pz...def"
                    unlockBlock={850000}
                  />
                  <VaultCard
                    name="Team Multi-Sig"
                    type="MultiSigVault"
                    balance="10.0 BCH"
                    status="active"
                    address="bitcoincash:pz...ghi"
                    signers={3}
                    threshold={2}
                  />
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-400 mb-6">Connect your wallet to view and manage your vaults</p>
                  <button onClick={() => setConnected(true)} className="btn-primary">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Create Vault Form (shown when vault type is selected) */}
          {selectedVault && activeTab === "create" && (
            <div className="mt-8 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6">
                Create {VAULT_TYPES.find(v => v.id === selectedVault)?.name}
              </h2>
              <VaultForm vaultType={selectedVault} connected={connected} onConnect={() => setConnected(true)} />
            </div>
          )}
        </div>
      </main>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </div>
  );
}

// Vault Card Component
function VaultCard({
  name,
  type,
  balance,
  status,
  address,
  unlockBlock,
  signers,
  threshold,
}: {
  name: string;
  type: string;
  balance: string;
  status: "active" | "locked" | "pending";
  address: string;
  unlockBlock?: number;
  signers?: number;
  threshold?: number;
}) {
  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    locked: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    pending: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-sm text-gray-500">{type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Balance</span>
          <span className="text-white font-medium">{balance}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Address</span>
          <span className="text-gray-300 font-mono text-sm">{address}</span>
        </div>
        {unlockBlock && (
          <div className="flex justify-between">
            <span className="text-gray-400">Unlocks at Block</span>
            <span className="text-amber-400">{unlockBlock.toLocaleString()}</span>
          </div>
        )}
        {signers && threshold && (
          <div className="flex justify-between">
            <span className="text-gray-400">Signatures</span>
            <span className="text-white">{threshold} of {signers} required</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium">
          Deposit
        </button>
        <button className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm font-medium">
          Withdraw
        </button>
        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Vault Form Component
function VaultForm({
  vaultType,
  connected,
  onConnect,
}: {
  vaultType: string;
  connected: boolean;
  onConnect: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    initialDeposit: "",
    // TimeLock
    lockBlocks: "",
    // MultiSig
    signers: ["", "", ""],
    threshold: "2",
    // SpendingLimit
    dailyLimit: "",
    // RecurringPayment
    paymentAmount: "",
    paymentInterval: "",
    recipient: "",
    // Whitelist
    whitelistedAddresses: [""],
    // TokenGated
    tokenCategory: "",
    minAmount: "",
  });

  const renderFields = () => {
    switch (vaultType) {
      case "master":
        return (
          <>
            <FormField label="Vault Name" placeholder="My Treasury" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Lock Duration (blocks)" placeholder="1000" value={formData.lockBlocks} onChange={(v) => setFormData({ ...formData, lockBlocks: v })} />
            <FormField label="Daily Spending Limit (sats)" placeholder="1000000" value={formData.dailyLimit} onChange={(v) => setFormData({ ...formData, dailyLimit: v })} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Co-Signers (optional)</label>
              {formData.signers.map((signer, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Signer ${i + 1} public key`}
                  value={signer}
                  onChange={(e) => {
                    const newSigners = [...formData.signers];
                    newSigners[i] = e.target.value;
                    setFormData({ ...formData, signers: newSigners });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 mb-2"
                />
              ))}
            </div>
          </>
        );
      case "timelock":
        return (
          <>
            <FormField label="Vault Name" placeholder="Savings Vault" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Lock Duration (blocks)" placeholder="4320" hint="~30 days" value={formData.lockBlocks} onChange={(v) => setFormData({ ...formData, lockBlocks: v })} />
          </>
        );
      case "multisig":
        return (
          <>
            <FormField label="Vault Name" placeholder="Team Vault" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Required Signatures" placeholder="2" value={formData.threshold} onChange={(v) => setFormData({ ...formData, threshold: v })} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Signer Public Keys</label>
              {formData.signers.map((signer, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Signer ${i + 1} public key`}
                  value={signer}
                  onChange={(e) => {
                    const newSigners = [...formData.signers];
                    newSigners[i] = e.target.value;
                    setFormData({ ...formData, signers: newSigners });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 mb-2"
                />
              ))}
              <button
                onClick={() => setFormData({ ...formData, signers: [...formData.signers, ""] })}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                + Add signer
              </button>
            </div>
          </>
        );
      case "spending":
        return (
          <>
            <FormField label="Vault Name" placeholder="Daily Allowance" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Daily Limit (sats)" placeholder="500000" value={formData.dailyLimit} onChange={(v) => setFormData({ ...formData, dailyLimit: v })} />
          </>
        );
      case "recurring":
        return (
          <>
            <FormField label="Vault Name" placeholder="Subscription" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Payment Amount (sats)" placeholder="100000" value={formData.paymentAmount} onChange={(v) => setFormData({ ...formData, paymentAmount: v })} />
            <FormField label="Interval (blocks)" placeholder="4320" hint="~30 days" value={formData.paymentInterval} onChange={(v) => setFormData({ ...formData, paymentInterval: v })} />
            <FormField label="Recipient Address" placeholder="bitcoincash:qz..." value={formData.recipient} onChange={(v) => setFormData({ ...formData, recipient: v })} className="col-span-2" />
          </>
        );
      case "whitelist":
        return (
          <>
            <FormField label="Vault Name" placeholder="Approved Recipients" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Whitelisted Addresses</label>
              {formData.whitelistedAddresses.map((addr, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder="bitcoincash:qz..."
                  value={addr}
                  onChange={(e) => {
                    const newAddrs = [...formData.whitelistedAddresses];
                    newAddrs[i] = e.target.value;
                    setFormData({ ...formData, whitelistedAddresses: newAddrs });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 mb-2"
                />
              ))}
              <button
                onClick={() => setFormData({ ...formData, whitelistedAddresses: [...formData.whitelistedAddresses, ""] })}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                + Add address
              </button>
            </div>
          </>
        );
      case "stream":
        return (
          <>
            <FormField label="Vault Name" placeholder="Salary Stream" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Total Amount (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Stream Duration (blocks)" placeholder="8640" hint="~60 days" value={formData.lockBlocks} onChange={(v) => setFormData({ ...formData, lockBlocks: v })} />
            <FormField label="Recipient Address" placeholder="bitcoincash:qz..." value={formData.recipient} onChange={(v) => setFormData({ ...formData, recipient: v })} className="col-span-2" />
          </>
        );
      case "tokengated":
        return (
          <>
            <FormField label="Vault Name" placeholder="NFT Holders Vault" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <FormField label="Initial Deposit (BCH)" placeholder="1.0" value={formData.initialDeposit} onChange={(v) => setFormData({ ...formData, initialDeposit: v })} />
            <FormField label="Token Category (hex)" placeholder="0x..." value={formData.tokenCategory} onChange={(v) => setFormData({ ...formData, tokenCategory: v })} className="col-span-2" />
            <FormField label="Minimum Token Amount" placeholder="1" hint="Set to 1 for NFTs" value={formData.minAmount} onChange={(v) => setFormData({ ...formData, minAmount: v })} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {renderFields()}
      </div>

      {connected ? (
        <button className="btn-primary w-full md:w-auto">
          Deploy Vault Contract
        </button>
      ) : (
        <button onClick={onConnect} className="btn-primary w-full md:w-auto">
          Connect Wallet to Deploy
        </button>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Deploying a vault will create a new smart contract on the Bitcoin Cash blockchain.
        Gas fees apply.
      </p>
    </div>
  );
}

// Form Field Component
function FormField({
  label,
  placeholder,
  value,
  onChange,
  hint,
  className = "",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}
        {hint && <span className="ml-2 text-gray-600">({hint})</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
      />
    </div>
  );
}
