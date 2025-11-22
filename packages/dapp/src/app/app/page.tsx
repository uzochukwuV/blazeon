"use client";

import { useState, useEffect, useRef } from "react";
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
  { id: "p1", title: "Marketing Budget Q1", description: "Allocate funds for Q1 marketing.", amount: "2.0 BCH", recipient: "bitcoincash:qz...mkt", proposer: "alice.bch", approvals: ["alice.bch"], status: "pending", messages: [{ id: "m1", sender: "alice.bch", content: "Prioritize community events.", timestamp: Date.now() - 80000000, type: "comment" }, { id: "m2", sender: "bob.bch", content: "Agreed.", timestamp: Date.now() - 70000000, type: "comment" }] },
  { id: "p2", title: "Developer Grant", description: "Grant for protocol development.", amount: "5.0 BCH", recipient: "bitcoincash:qz...dev", proposer: "bob.bch", approvals: ["bob.bch", "charlie.bch"], status: "approved", messages: [] },
];

// Modal Component
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f]">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1f1f1f] text-[#808080] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Dropdown Component
function Dropdown({ trigger, children, align = "left" }: { trigger: React.ReactNode; children: React.ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={`absolute mt-1 z-50 min-w-[180px] py-1 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 ${align === "right" ? "right-0" : "left-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// Slider Component
function Slider({ value, onChange, min = 0, max = 100, label, suffix = "" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; suffix?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs text-[#808080]">{label}</label>
        <span className="text-xs text-white">{value.toLocaleString()}{suffix}</span>
      </div>
      <div className="relative h-2 bg-[#1f1f1f] rounded-full">
        <div className="absolute h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
}

export default function AppPage() {
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<"dashboard" | "create" | "vault" | "settings">("dashboard");
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [proposalModal, setProposalModal] = useState(false);

  const walletAddress = "bitcoincash:qz...7k9";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-[#0d0d0d] border-r border-[#1f1f1f] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-[#1f1f1f]">
            <Link href="/" className={`text-lg font-semibold text-white ${!sidebarOpen && "lg:hidden"}`}>FluxVault</Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-[#1f1f1f] text-[#808080] hidden lg:block">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} /></svg>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-3 space-y-1">
            <NavItem icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" active={view === "dashboard"} collapsed={!sidebarOpen} onClick={() => { setView("dashboard"); setSelectedVault(null); }} />
            <NavItem icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="Create Vault" active={view === "create"} collapsed={!sidebarOpen} onClick={() => { setView("create"); setSelectedVault(null); }} />
            <NavItem icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" label="Settings" active={view === "settings"} collapsed={!sidebarOpen} onClick={() => setView("settings")} />
          </nav>

          {/* User */}
          <div className="p-3 border-t border-[#1f1f1f]">
            {connected ? (
              <Dropdown
                align="left"
                trigger={
                  <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#1f1f1f] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">U</span>
                    </div>
                    {sidebarOpen && (
                      <div className="flex-1 text-left">
                        <div className="text-sm text-white truncate">{walletAddress}</div>
                        <div className="text-xs text-[#606060]">12.50 BCH</div>
                      </div>
                    )}
                  </button>
                }
              >
                <button className="w-full px-3 py-2 text-left text-sm text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white">Copy Address</button>
                <button onClick={() => setConnected(false)} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#1f1f1f]">Disconnect</button>
              </Dropdown>
            ) : (
              <button onClick={() => setConnected(true)} className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium">
                {sidebarOpen ? "Connect Wallet" : "→"}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-[#1f1f1f] text-[#808080] lg:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white hover:border-[#3a3a3a] transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  Chipnet
                  <svg className="w-4 h-4 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              }
            >
              <button className="w-full px-3 py-2 text-left text-sm text-white flex items-center gap-2 bg-[#1f1f1f]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Chipnet
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-[#606060] flex items-center gap-2 hover:bg-[#1f1f1f] hover:text-white" disabled>
                <span className="w-2 h-2 rounded-full bg-[#606060]" /> Mainnet (soon)
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
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
            <CreateVaultView connected={connected} onConnect={() => setConnected(true)} />
          )}
          {view === "vault" && selectedVault && (
            <VaultDetailView
              vault={selectedVault}
              proposals={MOCK_PROPOSALS}
              onBack={() => { setSelectedVault(null); setView("dashboard"); }}
              onDeposit={() => setDepositModal(true)}
              onWithdraw={() => setWithdrawModal(true)}
              onProposal={() => setProposalModal(true)}
            />
          )}
          {view === "settings" && <SettingsView />}
        </div>
      </main>

      {/* Modals */}
      <Modal open={depositModal} onClose={() => setDepositModal(false)} title="Deposit to Vault">
        <DepositForm onClose={() => setDepositModal(false)} />
      </Modal>
      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title="Withdraw from Vault">
        <WithdrawForm onClose={() => setWithdrawModal(false)} />
      </Modal>
      <Modal open={proposalModal} onClose={() => setProposalModal(false)} title="Create Proposal">
        <ProposalForm onClose={() => setProposalModal(false)} />
      </Modal>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: { icon: string; label: string; active: boolean; collapsed: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? "bg-white/10 text-white" : "text-[#808080] hover:bg-[#1f1f1f] hover:text-white"}`} title={collapsed ? label : undefined}>
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
      {!collapsed && <span className="text-sm">{label}</span>}
    </button>
  );
}

function DashboardView({ vaults, connected, onConnect, onVaultClick, onCreateClick }: { vaults: Vault[]; connected: boolean; onConnect: () => void; onVaultClick: (v: Vault) => void; onCreateClick: () => void }) {
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-[#2a2a2a] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl font-medium text-white mb-2">Welcome to FluxVault</h2>
        <p className="text-sm text-[#808080] mb-6 text-center max-w-sm">Connect your wallet to create and manage programmable Bitcoin Cash vaults</p>
        <button onClick={onConnect} className="px-6 py-2.5 rounded-xl bg-white text-black font-medium">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-[#808080] mt-1">Manage your programmable vaults</p>
        </div>
        <button onClick={onCreateClick} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          New Vault
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Value" value="17.734 BCH" subvalue="$6,207.90" />
        <StatCard label="Active Vaults" value="4" subvalue="3 active, 1 locked" />
        <StatCard label="Pending Proposals" value="1" subvalue="Awaiting approval" />
      </div>

      {/* Vault List */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <span className="text-sm font-medium text-white">Your Vaults</span>
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-1 text-xs text-[#808080] hover:text-white">
                Sort: Recent
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            }
          >
            <button className="w-full px-3 py-2 text-left text-sm text-white bg-[#1f1f1f]">Recent</button>
            <button className="w-full px-3 py-2 text-left text-sm text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white">Balance: High to Low</button>
            <button className="w-full px-3 py-2 text-left text-sm text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white">Balance: Low to High</button>
            <button className="w-full px-3 py-2 text-left text-sm text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white">Name</button>
          </Dropdown>
        </div>
        <div className="divide-y divide-[#1f1f1f]">
          {vaults.map((v) => (
            <VaultRow key={v.id} vault={v} onClick={() => onVaultClick(v)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subvalue }: { label: string; value: string; subvalue: string }) {
  return (
    <div className="p-5 bg-[#111111] border border-[#1f1f1f] rounded-xl">
      <div className="text-xs text-[#606060] mb-1">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-sm text-[#808080]">{subvalue}</div>
    </div>
  );
}

function VaultRow({ vault, onClick }: { vault: Vault; onClick: () => void }) {
  const features = FEATURES.filter(f => vault.features.includes(f.id));
  return (
    <div onClick={onClick} className="flex items-center justify-between px-5 py-4 hover:bg-[#0d0d0d] cursor-pointer transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${features[0]?.color || '#333'}30, ${features[1]?.color || features[0]?.color || '#333'}20)` }}>
          <span className="text-sm font-medium text-white">{vault.name.charAt(0)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{vault.name}</span>
            <span className={`w-2 h-2 rounded-full ${vault.status === "active" ? "bg-[#22c55e]" : vault.status === "locked" ? "bg-[#f59e0b]" : "bg-[#606060]"}`} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {features.slice(0, 3).map(f => (
              <span key={f.id} className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: `${f.color}20`, color: f.color }}>{f.name}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-medium">{vault.balance}</div>
        <div className="text-xs text-[#606060]">{vault.balanceUSD}</div>
      </div>
    </div>
  );
}

function CreateVaultView({ connected, onConnect }: { connected: boolean; onConnect: () => void }) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["multisig"]);
  const [lockDuration, setLockDuration] = useState(4320);
  const [dailyLimit, setDailyLimit] = useState(1000000);
  const [requiredSigs, setRequiredSigs] = useState(2);

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const activeFeatures = FEATURES.filter(f => selectedFeatures.includes(f.id));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-1">Create Vault</h1>
      <p className="text-sm text-[#808080] mb-6">Configure your programmable vault</p>

      {/* Feature Selection */}
      <div className="mb-6">
        <label className="text-sm text-white mb-3 block">Select Features</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FEATURES.map(f => {
            const selected = selectedFeatures.includes(f.id);
            return (
              <button key={f.id} onClick={() => toggleFeature(f.id)} className={`p-3 rounded-xl border text-left transition-all ${selected ? "border-white/20 bg-white/5" : "border-[#1f1f1f] bg-[#111111] hover:border-[#2a2a2a]"}`}>
                <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ background: selected ? `${f.color}20` : "#1f1f1f" }}>
                  <svg className="w-4 h-4" style={{ color: selected ? f.color : "#606060" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
                </div>
                <div className="text-xs font-medium" style={{ color: selected ? f.color : "#a0a0a0" }}>{f.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Config */}
      <div className="p-5 bg-[#111111] border border-[#1f1f1f] rounded-xl mb-4">
        <h3 className="text-sm text-white mb-4">Basic Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#606060] mb-1.5 block">Vault Name</label>
            <input type="text" placeholder="My Vault" className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#606060] mb-1.5 block">Initial Deposit (BCH)</label>
            <input type="text" placeholder="0.0" className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
          </div>
        </div>
      </div>

      {/* Feature Configs with Sliders */}
      {selectedFeatures.includes("multisig") && (
        <FeatureConfigBox feature={FEATURES.find(f => f.id === "multisig")!}>
          <div className="space-y-4">
            <Slider value={requiredSigs} onChange={setRequiredSigs} min={1} max={8} label="Required Signatures" />
            <div>
              <label className="text-xs text-[#606060] mb-1.5 block">Signer Public Keys</label>
              <textarea placeholder="One per line" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none resize-none" />
            </div>
          </div>
        </FeatureConfigBox>
      )}

      {selectedFeatures.includes("timelock") && (
        <FeatureConfigBox feature={FEATURES.find(f => f.id === "timelock")!}>
          <Slider value={lockDuration} onChange={setLockDuration} min={144} max={52560} label="Lock Duration (blocks)" suffix=" blocks" />
          <p className="text-xs text-[#606060] mt-2">≈ {Math.round(lockDuration / 144)} days at 144 blocks/day</p>
        </FeatureConfigBox>
      )}

      {selectedFeatures.includes("spending") && (
        <FeatureConfigBox feature={FEATURES.find(f => f.id === "spending")!}>
          <Slider value={dailyLimit} onChange={setDailyLimit} min={100000} max={10000000} label="Daily Limit (sats)" suffix=" sats" />
          <p className="text-xs text-[#606060] mt-2">≈ {(dailyLimit / 100000000).toFixed(4)} BCH per day</p>
        </FeatureConfigBox>
      )}

      {/* Deploy */}
      <div className="mt-6">
        {connected ? (
          <button disabled={selectedFeatures.length === 0} className="w-full py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50">Deploy Vault</button>
        ) : (
          <button onClick={onConnect} className="w-full py-3 rounded-xl bg-white text-black font-medium">Connect Wallet</button>
        )}
      </div>
    </div>
  );
}

function FeatureConfigBox({ feature, children }: { feature: Feature; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl border mb-4" style={{ background: `${feature.color}05`, borderColor: `${feature.color}20` }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${feature.color}20` }}>
          <svg className="w-3.5 h-3.5" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} /></svg>
        </div>
        <span className="text-sm font-medium" style={{ color: feature.color }}>{feature.name}</span>
      </div>
      {children}
    </div>
  );
}

function VaultDetailView({ vault, proposals, onBack, onDeposit, onWithdraw, onProposal }: { vault: Vault; proposals: Proposal[]; onBack: () => void; onDeposit: () => void; onWithdraw: () => void; onProposal: () => void }) {
  const [tab, setTab] = useState<"overview" | "proposals" | "activity">("overview");
  const features = FEATURES.filter(f => vault.features.includes(f.id));
  const hasProposals = vault.features.includes("multisig");

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#808080] hover:text-white mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${features[0]?.color || '#333'}30, ${features[1]?.color || features[0]?.color || '#333'}20)` }}>
            <span className="text-xl font-semibold text-white">{vault.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{vault.name}</h1>
            <div className="flex gap-1.5 mt-1">
              {features.map(f => (
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[#111111] border border-[#1f1f1f] rounded-xl w-fit">
        <button onClick={() => setTab("overview")} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === "overview" ? "bg-white text-black" : "text-[#808080] hover:text-white"}`}>Overview</button>
        {hasProposals && <button onClick={() => setTab("proposals")} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === "proposals" ? "bg-white text-black" : "text-[#808080] hover:text-white"}`}>Proposals</button>}
        <button onClick={() => setTab("activity")} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === "activity" ? "bg-white text-black" : "text-[#808080] hover:text-white"}`}>Activity</button>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-[#111111] border border-[#1f1f1f] rounded-xl">
            <h3 className="text-sm text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={onDeposit} className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium">Deposit</button>
              <button onClick={onWithdraw} className="w-full py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a] hover:border-[#3a3a3a]">Withdraw</button>
              {hasProposals && <button onClick={onProposal} className="w-full py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a] hover:border-[#3a3a3a]">Create Proposal</button>}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {features.map(f => (
              <div key={f.id} className="p-4 rounded-xl border" style={{ background: `${f.color}05`, borderColor: `${f.color}20` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${f.color}20` }}>
                    <svg className="w-3 h-3" style={{ color: f.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: f.color }}>{f.name}</span>
                </div>
                {f.id === "multisig" && vault.signers && <div className="text-sm text-[#a0a0a0]">{vault.requiredSigs} of {vault.signers.length} signatures required</div>}
                {f.id === "timelock" && vault.unlockBlock && <div className="text-sm text-[#a0a0a0]">Unlocks at block {vault.unlockBlock.toLocaleString()}</div>}
                {f.id === "spending" && vault.dailyLimit && <div className="text-sm text-[#a0a0a0]">Daily limit: {vault.dailyLimit}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "proposals" && hasProposals && (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-white">Active Proposals</span>
            <button onClick={onProposal} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium">+ New</button>
          </div>
          {proposals.map(p => (
            <div key={p.id} className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-xl hover:border-[#2a2a2a] cursor-pointer transition-colors">
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium">{p.title}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${p.status === "pending" ? "bg-[#f59e0b20] text-[#f59e0b]" : "bg-[#22c55e20] text-[#22c55e]"}`}>{p.status}</span>
              </div>
              <div className="text-sm text-[#606060]">{p.amount} · {p.approvals.length}/{vault.requiredSigs} approved</div>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="p-8 bg-[#111111] border border-[#1f1f1f] rounded-xl text-center text-sm text-[#606060]">No recent activity</div>
      )}
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
      <p className="text-sm text-[#808080] mb-6">Configure your FluxVault preferences</p>
      <div className="space-y-4">
        <div className="p-5 bg-[#111111] border border-[#1f1f1f] rounded-xl">
          <h3 className="text-sm text-white mb-4">Network</h3>
          <Dropdown
            trigger={
              <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm hover:border-[#2a2a2a]">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#22c55e]" />Chipnet</span>
                <svg className="w-4 h-4 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            }
          >
            <button className="w-full px-3 py-2 text-left text-sm text-white bg-[#1f1f1f]">Chipnet</button>
            <button className="w-full px-3 py-2 text-left text-sm text-[#606060]" disabled>Mainnet (coming soon)</button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

function DepositForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Amount (BCH)</label>
        <input type="text" placeholder="0.0" className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" autoFocus />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a]">Cancel</button>
        <button className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium">Deposit</button>
      </div>
    </div>
  );
}

function WithdrawForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Amount (BCH)</label>
        <input type="text" placeholder="0.0" className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" autoFocus />
      </div>
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Recipient Address</label>
        <input type="text" placeholder="bitcoincash:..." className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a]">Cancel</button>
        <button className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium">Withdraw</button>
      </div>
    </div>
  );
}

function ProposalForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Title</label>
        <input type="text" placeholder="Proposal title" className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" autoFocus />
      </div>
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Description</label>
        <textarea placeholder="Describe your proposal..." rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#606060] mb-1.5 block">Amount (BCH)</label>
          <input type="text" placeholder="0.0" className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
        </div>
        <div>
          <label className="text-xs text-[#606060] mb-1.5 block">Recipient</label>
          <input type="text" placeholder="bitcoincash:..." className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a]">Cancel</button>
        <button className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium">Create Proposal</button>
      </div>
    </div>
  );
}
