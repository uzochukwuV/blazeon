"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Feature definitions
interface Feature {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  { id: "multisig", name: "Multi-Signature", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", description: "Require multiple parties to approve", color: "#8b5cf6" },
  { id: "timelock", name: "Time Lock", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", description: "Lock until specific block height", color: "#3b82f6" },
  { id: "spending", name: "Spending Limit", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", description: "Daily withdrawal cap", color: "#f59e0b" },
  { id: "whitelist", name: "Whitelist", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", description: "Approved recipients only", color: "#10b981" },
  { id: "stream", name: "Streaming", icon: "M13 10V3L4 14h7v7l9-11h-7z", description: "Linear token distribution", color: "#06b6d4" },
  { id: "tokengated", name: "Token Gated", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", description: "CashToken access control", color: "#ec4899" },
  { id: "recurring", name: "Recurring", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", description: "Scheduled payments", color: "#f43f5e" },
  { id: "covenant", name: "P2S Covenant", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", description: "Transaction constraints", color: "#a855f7" },
];

interface Vault {
  id: string;
  name: string;
  features: string[];
  balance: string;
  balanceUSD: string;
  status: "active" | "locked" | "pending";
  address: string;
  signers?: string[];
  requiredSigs?: number;
  unlockBlock?: number;
  dailyLimit?: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  amount: string;
  recipient: string;
  proposer: string;
  approvals: string[];
  status: "pending" | "approved" | "executed" | "rejected";
  createdAt: number;
  messages: Message[];
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: "comment" | "approval" | "rejection";
}

const MOCK_VAULTS: Vault[] = [
  { id: "1", name: "Treasury", features: ["multisig", "timelock", "spending"], balance: "5.234 BCH", balanceUSD: "$1,832.90", status: "active", address: "bitcoincash:pz...abc", signers: ["alice.bch", "bob.bch", "charlie.bch"], requiredSigs: 2, unlockBlock: 850000, dailyLimit: "1,000,000 sats" },
  { id: "2", name: "Savings", features: ["timelock"], balance: "2.500 BCH", balanceUSD: "$875.00", status: "locked", address: "bitcoincash:pz...def", unlockBlock: 860000 },
  { id: "3", name: "Team Fund", features: ["multisig", "whitelist"], balance: "10.000 BCH", balanceUSD: "$3,500.00", status: "active", address: "bitcoincash:pz...ghi", signers: ["alice.bch", "bob.bch", "charlie.bch"], requiredSigs: 2 },
  { id: "4", name: "Salary Stream", features: ["stream"], balance: "3.000 BCH", balanceUSD: "$1,050.00", status: "active", address: "bitcoincash:pz...jkl" },
];

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "p1", title: "Marketing Budget Q1", description: "Allocate funds for Q1 marketing campaign.", amount: "2.0 BCH",
    recipient: "bitcoincash:qz...mkt", proposer: "alice.bch", approvals: ["alice.bch"], status: "pending", createdAt: Date.now() - 86400000,
    messages: [
      { id: "m1", sender: "alice.bch", content: "I think we should prioritize community events.", timestamp: Date.now() - 80000000, type: "comment" },
      { id: "m2", sender: "bob.bch", content: "Agreed. 60% to events.", timestamp: Date.now() - 70000000, type: "comment" },
      { id: "m3", sender: "alice.bch", content: "", timestamp: Date.now() - 60000000, type: "approval" },
    ],
  },
  {
    id: "p2", title: "Developer Grant", description: "Grant for protocol development.", amount: "5.0 BCH",
    recipient: "bitcoincash:qz...dev", proposer: "bob.bch", approvals: ["bob.bch", "charlie.bch"], status: "approved", createdAt: Date.now() - 172800000,
    messages: [
      { id: "m4", sender: "bob.bch", content: "Funds 3 months of dev work.", timestamp: Date.now() - 170000000, type: "comment" },
      { id: "m5", sender: "charlie.bch", content: "", timestamp: Date.now() - 160000000, type: "approval" },
      { id: "m6", sender: "bob.bch", content: "", timestamp: Date.now() - 150000000, type: "approval" },
    ],
  },
];

export default function AppPage() {
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<"dashboard" | "create" | "vault">("dashboard");
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["multisig", "timelock"]);

  const walletAddress = "bitcoincash:qz...7k9";
  const walletBalance = "12.50 BCH";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-white">FluxVault</Link>
            <nav className="hidden md:flex items-center">
              <button onClick={() => { setView("dashboard"); setSelectedVault(null); }} className={`px-3 py-1.5 text-sm ${view === "dashboard" ? "text-white" : "text-[#808080] hover:text-white"}`}>Dashboard</button>
              <button onClick={() => { setView("create"); setSelectedVault(null); }} className={`px-3 py-1.5 text-sm ${view === "create" ? "text-white" : "text-[#808080] hover:text-white"}`}>Create</button>
            </nav>
          </div>
          {connected ? (
            <button onClick={() => setConnected(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-white">{walletAddress}</span>
            </button>
          ) : (
            <button onClick={() => setConnected(true)} className="px-4 py-1.5 rounded-lg bg-white text-black text-sm font-medium">Connect</button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {view === "dashboard" && !selectedVault && (
          <DashboardView
            vaults={MOCK_VAULTS}
            connected={connected}
            onConnect={() => setConnected(true)}
            onVaultClick={(v) => { setSelectedVault(v); setView("vault"); }}
            onCreateClick={() => setView("create")}
          />
        )}
        {view === "create" && (
          <CreateVaultView
            selectedFeatures={selectedFeatures}
            onFeaturesChange={setSelectedFeatures}
            connected={connected}
            onConnect={() => setConnected(true)}
          />
        )}
        {view === "vault" && selectedVault && (
          <VaultDetailView
            vault={selectedVault}
            proposals={MOCK_PROPOSALS}
            onBack={() => { setSelectedVault(null); setView("dashboard"); }}
          />
        )}
      </main>
    </div>
  );
}

function DashboardView({ vaults, connected, onConnect, onVaultClick, onCreateClick }: {
  vaults: Vault[];
  connected: boolean;
  onConnect: () => void;
  onVaultClick: (v: Vault) => void;
  onCreateClick: () => void;
}) {
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[#505050]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-white mb-1">Connect Wallet</h2>
        <p className="text-sm text-[#808080] mb-5">View and manage your vaults</p>
        <button onClick={onConnect} className="px-5 py-2 rounded-lg bg-white text-black text-sm font-medium">Connect Wallet</button>
      </div>
    );
  }

  const totalValue = "17.734 BCH";
  const totalUSD = "$6,207.90";

  return (
    <div>
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-semibold text-white">{totalValue}</div>
          <div className="text-sm text-[#808080]">{totalUSD} total value</div>
        </div>
        <button onClick={onCreateClick} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">+ New Vault</button>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {vaults.map((vault) => (
          <VaultCard key={vault.id} vault={vault} onClick={() => onVaultClick(vault)} />
        ))}
      </div>
    </div>
  );
}

function VaultCard({ vault, onClick }: { vault: Vault; onClick: () => void }) {
  const activeFeatures = FEATURES.filter(f => vault.features.includes(f.id));

  return (
    <div onClick={onClick} className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${activeFeatures[0]?.color || '#333'}22, ${activeFeatures[1]?.color || activeFeatures[0]?.color || '#333'}22)` }}>
            <span className="text-lg font-medium text-white">{vault.name.charAt(0)}</span>
          </div>
          <div>
            <div className="text-white font-medium">{vault.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {activeFeatures.slice(0, 3).map(f => (
                <div key={f.id} className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} title={f.name} />
              ))}
              {activeFeatures.length > 3 && <span className="text-[10px] text-[#606060]">+{activeFeatures.length - 3}</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-medium">{vault.balance}</div>
          <div className="text-xs text-[#606060]">{vault.balanceUSD}</div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap gap-1.5">
        {activeFeatures.map(f => (
          <span key={f.id} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${f.color}15`, color: f.color }}>
            {f.name}
          </span>
        ))}
      </div>

      {/* Dynamic Info based on features */}
      {vault.features.includes("multisig") && vault.signers && (
        <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center gap-2">
          <div className="flex -space-x-2">
            {vault.signers.slice(0, 3).map((s, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-[#111111] flex items-center justify-center">
                <span className="text-[10px] text-[#808080]">{s.charAt(0).toUpperCase()}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-[#606060]">{vault.requiredSigs}-of-{vault.signers.length} signatures</span>
        </div>
      )}
      {vault.features.includes("timelock") && vault.unlockBlock && !vault.features.includes("multisig") && (
        <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-[#606060]">Unlocks at block {vault.unlockBlock.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

function CreateVaultView({ selectedFeatures, onFeaturesChange, connected, onConnect }: {
  selectedFeatures: string[];
  onFeaturesChange: (f: string[]) => void;
  connected: boolean;
  onConnect: () => void;
}) {
  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== id));
    } else {
      onFeaturesChange([...selectedFeatures, id]);
    }
  };

  const activeFeatures = FEATURES.filter(f => selectedFeatures.includes(f.id));
  const gradientColors = activeFeatures.length > 0
    ? activeFeatures.map(f => f.color).slice(0, 3)
    : ['#333'];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Dynamic Preview Header */}
      <div className="mb-8 p-6 rounded-2xl relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${gradientColors.map((c, i) => `${c}${i === 0 ? '20' : '10'}`).join(', ')})`
      }}>
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-white mb-1">Create Vault</h1>
          <p className="text-sm text-[#a0a0a0]">
            {selectedFeatures.length === 0
              ? "Select features to customize your vault"
              : `${selectedFeatures.length} feature${selectedFeatures.length > 1 ? 's' : ''} selected`}
          </p>
          {activeFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFeatures.map(f => (
                <span key={f.id} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: `${f.color}40`, color: f.color, background: `${f.color}10` }}>
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Selection Grid */}
      <div className="mb-6">
        <label className="text-sm text-[#808080] mb-3 block">Select Features</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FEATURES.map(feature => {
            const isSelected = selectedFeatures.includes(feature.id);
            return (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#404040] bg-[#1a1a1a]'
                    : 'border-[#1f1f1f] bg-[#111111] hover:border-[#2a2a2a]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: isSelected ? `${feature.color}20` : '#1f1f1f' }}>
                    <svg className="w-3.5 h-3.5" style={{ color: isSelected ? feature.color : '#606060' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                    </svg>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 ml-auto" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="text-xs font-medium" style={{ color: isSelected ? feature.color : '#a0a0a0' }}>{feature.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Configuration */}
      <div className="space-y-4 mb-6">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
          <label className="text-sm text-[#808080] mb-3 block">Basic Configuration</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#606060] mb-1 block">Vault Name</label>
              <input type="text" placeholder="My Vault" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#606060] mb-1 block">Initial Deposit (BCH)</label>
              <input type="text" placeholder="0.0" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
            </div>
          </div>
        </div>

        {/* Feature-specific configs */}
        {selectedFeatures.includes("multisig") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "multisig")!}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Required Signatures</label>
                <input type="number" placeholder="2" min="1" max="8" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Signer Public Keys</label>
                <textarea placeholder="One per line" rows={3} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none resize-none" />
              </div>
            </div>
          </FeatureConfig>
        )}

        {selectedFeatures.includes("timelock") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "timelock")!}>
            <div>
              <label className="text-xs text-[#606060] mb-1 block">Lock Until Block</label>
              <input type="number" placeholder="850000" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              <div className="text-xs text-[#606060] mt-1">Current block: ~848,000</div>
            </div>
          </FeatureConfig>
        )}

        {selectedFeatures.includes("spending") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "spending")!}>
            <div>
              <label className="text-xs text-[#606060] mb-1 block">Daily Limit (sats)</label>
              <input type="number" placeholder="1000000" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
            </div>
          </FeatureConfig>
        )}

        {selectedFeatures.includes("whitelist") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "whitelist")!}>
            <div>
              <label className="text-xs text-[#606060] mb-1 block">Allowed Recipients</label>
              <textarea placeholder="One address per line" rows={3} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none resize-none" />
            </div>
          </FeatureConfig>
        )}

        {selectedFeatures.includes("stream") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "stream")!}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Start Block</label>
                <input type="number" placeholder="848000" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#606060] mb-1 block">End Block</label>
                <input type="number" placeholder="860000" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[#606060] mb-1 block">Recipient</label>
              <input type="text" placeholder="bitcoincash:..." className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
            </div>
          </FeatureConfig>
        )}

        {selectedFeatures.includes("tokengated") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "tokengated")!}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Token Category (hex)</label>
                <input type="text" placeholder="0x..." className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Min Token Amount</label>
                <input type="number" placeholder="1" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
            </div>
          </FeatureConfig>
        )}

        {selectedFeatures.includes("recurring") && (
          <FeatureConfig feature={FEATURES.find(f => f.id === "recurring")!}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Payment Amount (sats)</label>
                <input type="number" placeholder="100000" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#606060] mb-1 block">Interval (blocks)</label>
                <input type="number" placeholder="4320" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[#606060] mb-1 block">Recipient</label>
              <input type="text" placeholder="bitcoincash:..." className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
            </div>
          </FeatureConfig>
        )}
      </div>

      {/* Deploy Button */}
      <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
        {connected ? (
          <button disabled={selectedFeatures.length === 0} className="w-full py-3 rounded-lg bg-white text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            Deploy Vault
          </button>
        ) : (
          <button onClick={onConnect} className="w-full py-3 rounded-lg bg-white text-black font-medium">
            Connect Wallet to Deploy
          </button>
        )}
        <p className="text-xs text-[#606060] mt-2 text-center">Network fees apply</p>
      </div>
    </div>
  );
}

function FeatureConfig({ feature, children }: { feature: Feature; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: `${feature.color}05`, borderColor: `${feature.color}20` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${feature.color}20` }}>
          <svg className="w-3 h-3" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
          </svg>
        </div>
        <span className="text-sm font-medium" style={{ color: feature.color }}>{feature.name}</span>
      </div>
      {children}
    </div>
  );
}

function VaultDetailView({ vault, proposals, onBack }: { vault: Vault; proposals: Proposal[]; onBack: () => void }) {
  const [tab, setTab] = useState<"overview" | "proposals" | "activity">("overview");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const activeFeatures = FEATURES.filter(f => vault.features.includes(f.id));
  const hasProposals = vault.features.includes("multisig");

  if (selectedProposal) {
    return <ProposalView proposal={selectedProposal} vault={vault} onBack={() => setSelectedProposal(null)} />;
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#808080] hover:text-white mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      {/* Vault Header with gradient based on features */}
      <div className="p-5 rounded-2xl mb-4 relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${activeFeatures.map((f, i) => `${f.color}${i === 0 ? '15' : '08'}`).join(', ')})`
      }}>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${activeFeatures[0]?.color || '#333'}20` }}>
              <span className="text-2xl font-semibold text-white">{vault.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">{vault.name}</h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeFeatures.map(f => (
                  <span key={f.id} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${f.color}20`, color: f.color }}>{f.name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-white">{vault.balance}</div>
            <div className="text-sm text-[#808080]">{vault.balanceUSD}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-[#111111] border border-[#1f1f1f] w-fit">
        <button onClick={() => setTab("overview")} className={`px-4 py-1.5 rounded-md text-sm ${tab === "overview" ? "bg-[#1a1a1a] text-white" : "text-[#808080]"}`}>Overview</button>
        {hasProposals && <button onClick={() => setTab("proposals")} className={`px-4 py-1.5 rounded-md text-sm ${tab === "proposals" ? "bg-[#1a1a1a] text-white" : "text-[#808080]"}`}>Proposals</button>}
        <button onClick={() => setTab("activity")} className={`px-4 py-1.5 rounded-md text-sm ${tab === "activity" ? "bg-[#1a1a1a] text-white" : "text-[#808080]"}`}>Activity</button>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Actions */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
            <h3 className="text-sm text-white mb-3">Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium">Deposit</button>
              <button className="w-full py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm">Withdraw</button>
              {hasProposals && <button onClick={() => setTab("proposals")} className="w-full py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm">Create Proposal</button>}
            </div>
          </div>

          {/* Feature-specific details */}
          <div className="lg:col-span-2 space-y-3">
            {vault.features.includes("multisig") && vault.signers && (
              <div className="p-4 rounded-xl border" style={{ background: '#8b5cf608', borderColor: '#8b5cf620' }}>
                <h3 className="text-sm font-medium text-[#8b5cf6] mb-3">Multi-Signature</h3>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {vault.signers.map((s, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#111111] flex items-center justify-center">
                        <span className="text-xs text-[#808080]">{s.charAt(0).toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-[#a0a0a0]">{vault.requiredSigs} of {vault.signers.length} required</div>
                </div>
              </div>
            )}
            {vault.features.includes("timelock") && vault.unlockBlock && (
              <div className="p-4 rounded-xl border" style={{ background: '#3b82f608', borderColor: '#3b82f620' }}>
                <h3 className="text-sm font-medium text-[#3b82f6] mb-2">Time Lock</h3>
                <div className="text-sm text-[#a0a0a0]">Unlocks at block {vault.unlockBlock.toLocaleString()}</div>
              </div>
            )}
            {vault.features.includes("spending") && vault.dailyLimit && (
              <div className="p-4 rounded-xl border" style={{ background: '#f59e0b08', borderColor: '#f59e0b20' }}>
                <h3 className="text-sm font-medium text-[#f59e0b] mb-2">Spending Limit</h3>
                <div className="text-sm text-[#a0a0a0]">Daily limit: {vault.dailyLimit}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "proposals" && hasProposals && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-white">Proposals</h3>
            <button className="px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium">+ New</button>
          </div>
          {proposals.map(p => (
            <div key={p.id} onClick={() => setSelectedProposal(p)} className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] cursor-pointer">
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium">{p.title}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${p.status === "pending" ? "bg-[#f59e0b20] text-[#f59e0b]" : p.status === "approved" ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#60606020] text-[#606060]"}`}>{p.status}</span>
              </div>
              <div className="text-sm text-[#606060]">{p.amount} · {p.approvals.length}/{vault.requiredSigs} approved · {p.messages.length} comments</div>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="p-6 rounded-xl bg-[#111111] border border-[#1f1f1f] text-center text-sm text-[#606060]">
          No recent activity
        </div>
      )}
    </div>
  );
}

function ProposalView({ proposal, vault, onBack }: { proposal: Proposal; vault: Vault; onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const format = (ts: number) => new Date(ts).toLocaleDateString() + " " + new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#808080] hover:text-white mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Proposals
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
            <div className="flex justify-between mb-3">
              <h3 className="text-white font-medium">{proposal.title}</h3>
              <span className={`px-2 py-0.5 text-xs rounded ${proposal.status === "pending" ? "bg-[#f59e0b20] text-[#f59e0b]" : "bg-[#22c55e20] text-[#22c55e]"}`}>{proposal.status}</span>
            </div>
            <p className="text-sm text-[#808080] mb-4">{proposal.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#606060]">Amount</span><span className="text-white">{proposal.amount}</span></div>
              <div className="flex justify-between"><span className="text-[#606060]">Recipient</span><span className="text-white font-mono text-xs">{proposal.recipient}</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
            <h4 className="text-sm text-white mb-3">Approvals ({proposal.approvals.length}/{vault.requiredSigs})</h4>
            {vault.signers?.map(s => (
              <div key={s} className="flex justify-between py-1.5 text-sm">
                <span className="text-[#a0a0a0]">{s}</span>
                <span className={proposal.approvals.includes(s) ? "text-[#22c55e]" : "text-[#606060]"}>{proposal.approvals.includes(s) ? "Approved" : "Pending"}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-[#1f1f1f] space-y-2">
              <button className="w-full py-2 rounded-lg bg-[#22c55e] text-black text-sm font-medium">Approve</button>
              <button className="w-full py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm">Reject</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-[#111111] border border-[#1f1f1f] flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-[#1f1f1f]"><span className="text-sm text-white">Discussion</span></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {proposal.messages.map(m => (
              <div key={m.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-[#808080]">{m.sender.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm text-white">{m.sender}</span>
                    <span className="text-[10px] text-[#606060]">{format(m.timestamp)}</span>
                  </div>
                  {m.type === "approval" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#22c55e20] text-[#22c55e] text-xs">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Approved
                    </span>
                  ) : m.type === "rejection" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ef444420] text-[#ef4444] text-xs">Rejected</span>
                  ) : (
                    <p className="text-sm text-[#a0a0a0]">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#1f1f1f] flex gap-2">
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Add comment..." className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
            <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
