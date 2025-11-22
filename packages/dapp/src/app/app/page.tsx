"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVault, VaultType, Vault, Proposal, VaultConfig, NetworkType } from "@/contexts/VaultContext";

// Feature definitions
interface Feature {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  vaultType: VaultType;
}

const FEATURES: Feature[] = [
  { id: "multisig", name: "Multi-Signature", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", description: "Require multiple parties to approve", color: "#8b5cf6", vaultType: "MultiSigVault" },
  { id: "timelock", name: "Time Lock", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", description: "Lock until specific block height", color: "#3b82f6", vaultType: "TimeLockVault" },
  { id: "spending", name: "Spending Limit", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", description: "Daily withdrawal cap", color: "#f59e0b", vaultType: "SpendingLimitVault" },
  { id: "whitelist", name: "Whitelist", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", description: "Approved recipients only", color: "#10b981", vaultType: "WhitelistVault" },
  { id: "stream", name: "Streaming", icon: "M13 10V3L4 14h7v7l9-11h-7z", description: "Linear token distribution", color: "#06b6d4", vaultType: "StreamVault" },
  { id: "token", name: "Token Gated", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", description: "CashToken access control", color: "#ec4899", vaultType: "TokenGatedVault" },
  { id: "recurring", name: "Recurring", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", description: "Scheduled payments", color: "#f43f5e", vaultType: "RecurringPaymentVault" },
  { id: "master", name: "MasterVault", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", description: "All-in-one programmable vault", color: "#a855f7", vaultType: "MasterVault" },
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

// Format satoshis to BCH
function formatBCH(sats: bigint): string {
  const bch = Number(sats) / 100000000;
  return bch.toFixed(8).replace(/\.?0+$/, '') + ' BCH';
}

// Format satoshis to USD (mock rate)
function formatUSD(sats: bigint): string {
  const bch = Number(sats) / 100000000;
  const usd = bch * 350; // Mock BCH/USD rate
  return '$' + usd.toFixed(2);
}

// Truncate address
function truncateAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length <= 20) return addr;
  return addr.slice(0, 16) + '...' + addr.slice(-6);
}

export default function AppPage() {
  const {
    isConnected,
    address,
    balance,
    network,
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
  } = useVault();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<"dashboard" | "create" | "vault" | "settings">("dashboard");
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [proposalModal, setProposalModal] = useState(false);

  // Refresh vaults on mount and when connected
  useEffect(() => {
    if (isConnected) {
      refreshVaults();
    }
  }, [isConnected]);

  const handleVaultClick = (vault: Vault) => {
    selectVault(vault.id);
    setView("vault");
  };

  const handleBack = () => {
    selectVault(null);
    setView("dashboard");
  };

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
            <NavItem icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" active={view === "dashboard"} collapsed={!sidebarOpen} onClick={() => { setView("dashboard"); selectVault(null); }} />
            <NavItem icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="Create Vault" active={view === "create"} collapsed={!sidebarOpen} onClick={() => { setView("create"); selectVault(null); }} />
            <NavItem icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" label="Settings" active={view === "settings"} collapsed={!sidebarOpen} onClick={() => setView("settings")} />
          </nav>

          {/* User */}
          <div className="p-3 border-t border-[#1f1f1f]">
            {isConnected ? (
              <Dropdown
                align="left"
                trigger={
                  <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#1f1f1f] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{address?.charAt(12) || 'U'}</span>
                    </div>
                    {sidebarOpen && (
                      <div className="flex-1 text-left">
                        <div className="text-sm text-white truncate">{truncateAddress(address || '')}</div>
                        <div className="text-xs text-[#606060]">{formatBCH(BigInt(balance))}</div>
                      </div>
                    )}
                  </button>
                }
              >
                <button onClick={() => navigator.clipboard.writeText(address || '')} className="w-full px-3 py-2 text-left text-sm text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white">Copy Address</button>
                <button onClick={disconnectWallet} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#1f1f1f]">Disconnect</button>
              </Dropdown>
            ) : (
              <button onClick={connectWallet} disabled={loading} className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50">
                {loading ? "Connecting..." : sidebarOpen ? "Connect Wallet" : "→"}
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
            {error && <span className="text-xs text-red-400 mr-2">{error}</span>}
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white hover:border-[#3a3a3a] transition-colors">
                  <span className={`w-2 h-2 rounded-full ${network === 'chipnet' ? 'bg-[#22c55e]' : 'bg-[#3b82f6]'}`} />
                  {network === 'chipnet' ? 'Chipnet' : 'Mainnet'}
                  <svg className="w-4 h-4 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              }
            >
              <button onClick={() => setNetwork('chipnet')} className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${network === 'chipnet' ? 'text-white bg-[#1f1f1f]' : 'text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white'}`}>
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Chipnet
              </button>
              <button onClick={() => setNetwork('mainnet')} className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${network === 'mainnet' ? 'text-white bg-[#1f1f1f]' : 'text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white'}`}>
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Mainnet
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {view === "dashboard" && !selectedVault && (
            <DashboardView
              vaults={vaults}
              isConnected={isConnected}
              loading={loading}
              onConnect={connectWallet}
              onVaultClick={handleVaultClick}
              onCreateClick={() => setView("create")}
              onRefresh={refreshVaults}
            />
          )}
          {view === "create" && (
            <CreateVaultView
              isConnected={isConnected}
              address={address}
              loading={loading}
              onConnect={connectWallet}
              onCreate={createVault}
            />
          )}
          {view === "vault" && selectedVault && (
            <VaultDetailView
              vault={selectedVault}
              proposals={proposals.filter(p => p.vaultId === selectedVault.id)}
              address={address}
              onBack={handleBack}
              onDeposit={() => setDepositModal(true)}
              onWithdraw={() => setWithdrawModal(true)}
              onProposal={() => setProposalModal(true)}
              onApprove={approveProposal}
              onReject={rejectProposal}
              onExecute={executeProposal}
            />
          )}
          {view === "settings" && <SettingsView network={network} onSetNetwork={setNetwork} />}
        </div>
      </main>

      {/* Modals */}
      <Modal open={depositModal} onClose={() => setDepositModal(false)} title="Deposit to Vault">
        <DepositForm
          vaultId={selectedVault?.id || ''}
          onDeposit={depositToVault}
          onClose={() => setDepositModal(false)}
          loading={loading}
        />
      </Modal>
      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title="Withdraw from Vault">
        <WithdrawForm
          vaultId={selectedVault?.id || ''}
          maxAmount={selectedVault?.balance || 0n}
          onWithdraw={withdrawFromVault}
          onClose={() => setWithdrawModal(false)}
          loading={loading}
        />
      </Modal>
      <Modal open={proposalModal} onClose={() => setProposalModal(false)} title="Create Proposal">
        <ProposalForm
          vaultId={selectedVault?.id || ''}
          address={address || ''}
          onCreate={createProposal}
          onClose={() => setProposalModal(false)}
          loading={loading}
        />
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

function DashboardView({ vaults, isConnected, loading, onConnect, onVaultClick, onCreateClick, onRefresh }: {
  vaults: Vault[];
  isConnected: boolean;
  loading: boolean;
  onConnect: () => void;
  onVaultClick: (v: Vault) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
}) {
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-[#2a2a2a] flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl font-medium text-white mb-2">Welcome to FluxVault</h2>
        <p className="text-sm text-[#808080] mb-6 text-center max-w-sm">Connect your wallet to create and manage programmable Bitcoin Cash vaults</p>
        <button onClick={onConnect} disabled={loading} className="px-6 py-2.5 rounded-xl bg-white text-black font-medium disabled:opacity-50">
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  const totalValue = vaults.reduce((sum, v) => sum + v.balance, 0n);
  const activeVaults = vaults.filter(v => v.balance > 0n).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-[#808080] mt-1">Manage your programmable vaults</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} disabled={loading} className="p-2 rounded-xl bg-[#1f1f1f] text-[#808080] hover:text-white border border-[#2a2a2a] disabled:opacity-50">
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button onClick={onCreateClick} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Vault
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Value" value={formatBCH(totalValue)} subvalue={formatUSD(totalValue)} />
        <StatCard label="Active Vaults" value={String(activeVaults)} subvalue={`${vaults.length} total vaults`} />
        <StatCard label="Network" value="Chipnet" subvalue="BCH Blaze 2025" />
      </div>

      {/* Vault List */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <span className="text-sm font-medium text-white">Your Vaults ({vaults.length})</span>
        </div>
        {vaults.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#606060] mb-4">No vaults yet. Create your first programmable vault.</p>
            <button onClick={onCreateClick} className="px-4 py-2 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a] hover:border-[#3a3a3a]">Create Vault</button>
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f1f]">
            {vaults.map((v) => (
              <VaultRow key={v.id} vault={v} onClick={() => onVaultClick(v)} />
            ))}
          </div>
        )}
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
  const hasBalance = vault.balance > 0n;

  return (
    <div onClick={onClick} className="flex items-center justify-between px-5 py-4 hover:bg-[#0d0d0d] cursor-pointer transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${features[0]?.color || '#333'}30, ${features[1]?.color || features[0]?.color || '#333'}20)` }}>
          <span className="text-sm font-medium text-white">{vault.name.charAt(0)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{vault.name}</span>
            <span className={`w-2 h-2 rounded-full ${hasBalance ? "bg-[#22c55e]" : "bg-[#606060]"}`} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {features.slice(0, 3).map(f => (
              <span key={f.id} className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: `${f.color}20`, color: f.color }}>{f.name}</span>
            ))}
            {features.length > 3 && <span className="text-[9px] text-[#606060]">+{features.length - 3}</span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-medium">{formatBCH(vault.balance)}</div>
        <div className="text-xs text-[#606060]">{formatUSD(vault.balance)}</div>
      </div>
    </div>
  );
}

function CreateVaultView({ isConnected, address, loading, onConnect, onCreate }: {
  isConnected: boolean;
  address: string | null;
  loading: boolean;
  onConnect: () => void;
  onCreate: (type: VaultType, name: string, config: VaultConfig, initialDeposit: bigint) => Promise<string>;
}) {
  const [vaultName, setVaultName] = useState('');
  const [selectedType, setSelectedType] = useState<VaultType>('MasterVault');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["multisig"]);
  const [lockDuration, setLockDuration] = useState(4320);
  const [dailyLimit, setDailyLimit] = useState(1000000);
  const [requiredSigs, setRequiredSigs] = useState(2);
  const [signerKeys, setSignerKeys] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [creating, setCreating] = useState(false);

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!vaultName.trim()) {
      alert('Please enter a vault name');
      return;
    }

    setCreating(true);
    try {
      const config: VaultConfig = {
        owners: address ? [address] : [],
        requiredSignatures: selectedFeatures.includes('multisig') ? requiredSigs : 1,
        unlockBlock: selectedFeatures.includes('timelock') ? lockDuration : 0,
        dailyLimit: selectedFeatures.includes('spending') ? dailyLimit : 0,
      };

      // Parse signer keys if provided
      if (signerKeys.trim()) {
        const keys = signerKeys.split('\n').map(k => k.trim()).filter(k => k);
        if (keys.length > 0) {
          config.owners = [address!, ...keys.slice(0, 2)];
        }
      }

      const deposit = initialDeposit ? BigInt(Math.floor(parseFloat(initialDeposit) * 100000000)) : 0n;

      await onCreate(selectedType, vaultName, config, deposit);

      // Reset form
      setVaultName('');
      setSelectedFeatures(['multisig']);
      setInitialDeposit('');
      setSignerKeys('');
      alert('Vault created successfully!');
    } catch (e) {
      alert('Failed to create vault: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
    setCreating(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-1">Create Vault</h1>
      <p className="text-sm text-[#808080] mb-6">Configure your programmable vault</p>

      {/* Vault Type Selection */}
      <div className="mb-6">
        <label className="text-sm text-white mb-3 block">Vault Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['MasterVault', 'TimeLockVault', 'MultiSigVault', 'SpendingLimitVault'].map(type => {
            const feature = FEATURES.find(f => f.vaultType === type);
            const selected = selectedType === type;
            return (
              <button key={type} onClick={() => setSelectedType(type as VaultType)} className={`p-3 rounded-xl border text-left transition-all ${selected ? "border-white/20 bg-white/5" : "border-[#1f1f1f] bg-[#111111] hover:border-[#2a2a2a]"}`}>
                <div className="text-xs font-medium" style={{ color: selected ? feature?.color : "#a0a0a0" }}>{type.replace('Vault', '')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Selection */}
      <div className="mb-6">
        <label className="text-sm text-white mb-3 block">Features</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FEATURES.filter(f => f.id !== 'master').map(f => {
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
            <input type="text" placeholder="My Vault" value={vaultName} onChange={e => setVaultName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[#606060] mb-1.5 block">Initial Deposit (BCH)</label>
            <input type="text" placeholder="0.0" value={initialDeposit} onChange={e => setInitialDeposit(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
          </div>
        </div>
      </div>

      {/* Feature Configs with Sliders */}
      {selectedFeatures.includes("multisig") && (
        <FeatureConfigBox feature={FEATURES.find(f => f.id === "multisig")!}>
          <div className="space-y-4">
            <Slider value={requiredSigs} onChange={setRequiredSigs} min={1} max={3} label="Required Signatures" />
            <div>
              <label className="text-xs text-[#606060] mb-1.5 block">Additional Signer Addresses (one per line)</label>
              <textarea placeholder="bitcoincash:qz..." rows={3} value={signerKeys} onChange={e => setSignerKeys(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none resize-none" />
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
        {isConnected ? (
          <button onClick={handleCreate} disabled={creating || loading || !vaultName.trim()} className="w-full py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50">
            {creating ? "Creating..." : "Deploy Vault"}
          </button>
        ) : (
          <button onClick={onConnect} disabled={loading} className="w-full py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50">
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
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

function VaultDetailView({ vault, proposals, address, onBack, onDeposit, onWithdraw, onProposal, onApprove, onReject, onExecute }: {
  vault: Vault;
  proposals: Proposal[];
  address: string | null;
  onBack: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onProposal: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onExecute: (id: string) => Promise<string>;
}) {
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
          <div className="text-2xl font-semibold text-white">{formatBCH(vault.balance)}</div>
          <div className="text-sm text-[#808080]">{formatUSD(vault.balance)}</div>
        </div>
      </div>

      {/* Contract Address */}
      <div className="mb-6 p-3 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl">
        <div className="text-xs text-[#606060] mb-1">Contract Address</div>
        <div className="flex items-center gap-2">
          <code className="text-sm text-white font-mono flex-1 truncate">{vault.address}</code>
          <button onClick={() => navigator.clipboard.writeText(vault.address)} className="p-1 rounded hover:bg-[#1f1f1f] text-[#808080] hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[#111111] border border-[#1f1f1f] rounded-xl w-fit">
        <button onClick={() => setTab("overview")} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === "overview" ? "bg-white text-black" : "text-[#808080] hover:text-white"}`}>Overview</button>
        {hasProposals && <button onClick={() => setTab("proposals")} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === "proposals" ? "bg-white text-black" : "text-[#808080] hover:text-white"}`}>Proposals ({proposals.length})</button>}
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
            {/* Vault Config Info */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
              <h4 className="text-sm text-white mb-3">Vault Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#808080]">Type</span>
                  <span className="text-white">{vault.type}</span>
                </div>
                {vault.config.requiredSignatures && vault.config.requiredSignatures > 1 && (
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Required Signatures</span>
                    <span className="text-white">{vault.config.requiredSignatures} of {vault.config.owners?.length || 1}</span>
                  </div>
                )}
                {vault.config.unlockBlock && vault.config.unlockBlock > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Unlock Block</span>
                    <span className="text-white">{vault.config.unlockBlock.toLocaleString()}</span>
                  </div>
                )}
                {vault.config.dailyLimit && vault.config.dailyLimit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Daily Limit</span>
                    <span className="text-white">{vault.config.dailyLimit.toLocaleString()} sats</span>
                  </div>
                )}
              </div>
            </div>

            {/* Feature Cards */}
            {features.map(f => (
              <div key={f.id} className="p-4 rounded-xl border" style={{ background: `${f.color}05`, borderColor: `${f.color}20` }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${f.color}20` }}>
                    <svg className="w-3 h-3" style={{ color: f.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: f.color }}>{f.name}</span>
                </div>
                <p className="text-xs text-[#808080] mt-1">{f.description}</p>
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
          {proposals.length === 0 ? (
            <div className="p-8 bg-[#111111] border border-[#1f1f1f] rounded-xl text-center text-sm text-[#606060]">No proposals yet</div>
          ) : (
            proposals.map(p => (
              <div key={p.id} className="p-4 bg-[#111111] border border-[#1f1f1f] rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">{p.title}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${p.status === "pending" ? "bg-[#f59e0b20] text-[#f59e0b]" : p.status === "approved" ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#60606020] text-[#606060]"}`}>{p.status}</span>
                </div>
                <p className="text-sm text-[#808080] mb-2">{p.description}</p>
                <div className="text-xs text-[#606060] mb-3">{p.amount ? formatBCH(BigInt(p.amount)) : ''} · {p.approvals.length}/{vault.config.requiredSignatures || 1} approved</div>

                {p.status === 'pending' && !p.approvals.includes(address || '') && (
                  <div className="flex gap-2">
                    <button onClick={() => onApprove(p.id)} className="flex-1 py-1.5 rounded-lg bg-[#22c55e20] text-[#22c55e] text-xs font-medium hover:bg-[#22c55e30]">Approve</button>
                    <button onClick={() => onReject(p.id)} className="flex-1 py-1.5 rounded-lg bg-[#ef444420] text-[#ef4444] text-xs font-medium hover:bg-[#ef444430]">Reject</button>
                  </div>
                )}
                {p.status === 'approved' && (
                  <button onClick={() => onExecute(p.id)} className="w-full py-1.5 rounded-lg bg-white text-black text-xs font-medium">Execute</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "activity" && (
        <div className="p-8 bg-[#111111] border border-[#1f1f1f] rounded-xl text-center text-sm text-[#606060]">No recent activity</div>
      )}
    </div>
  );
}

function SettingsView({ network, onSetNetwork }: { network: NetworkType; onSetNetwork: (n: NetworkType) => void }) {
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
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${network === 'chipnet' ? 'bg-[#22c55e]' : 'bg-[#3b82f6]'}`} />
                  {network === 'chipnet' ? 'Chipnet' : 'Mainnet'}
                </span>
                <svg className="w-4 h-4 text-[#606060]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            }
          >
            <button onClick={() => onSetNetwork('chipnet')} className={`w-full px-3 py-2 text-left text-sm ${network === 'chipnet' ? 'text-white bg-[#1f1f1f]' : 'text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white'}`}>Chipnet</button>
            <button onClick={() => onSetNetwork('mainnet')} className={`w-full px-3 py-2 text-left text-sm ${network === 'mainnet' ? 'text-white bg-[#1f1f1f]' : 'text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white'}`}>Mainnet</button>
          </Dropdown>
        </div>
        <div className="p-5 bg-[#111111] border border-[#1f1f1f] rounded-xl">
          <h3 className="text-sm text-white mb-2">About</h3>
          <p className="text-sm text-[#808080]">FluxVault - Programmable Bitcoin Cash Vaults</p>
          <p className="text-xs text-[#606060] mt-1">Built for BCH Blaze 2025 Hackathon</p>
        </div>
      </div>
    </div>
  );
}

function DepositForm({ vaultId, onDeposit, onClose, loading }: {
  vaultId: string;
  onDeposit: (vaultId: string, amount: bigint) => Promise<string>;
  onClose: () => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setDepositing(true);
    try {
      const sats = BigInt(Math.floor(parseFloat(amount) * 100000000));
      await onDeposit(vaultId, sats);
      onClose();
    } catch (e) {
      alert('Deposit failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
    setDepositing(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Amount (BCH)</label>
        <input type="text" placeholder="0.0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" autoFocus />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a]">Cancel</button>
        <button onClick={handleDeposit} disabled={depositing || loading} className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50">
          {depositing ? "Depositing..." : "Deposit"}
        </button>
      </div>
    </div>
  );
}

function WithdrawForm({ vaultId, maxAmount, onWithdraw, onClose, loading }: {
  vaultId: string;
  maxAmount: bigint;
  onWithdraw: (vaultId: string, amount: bigint, destination: string) => Promise<string>;
  onClose: () => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!recipient.trim()) {
      alert('Please enter a recipient address');
      return;
    }
    setWithdrawing(true);
    try {
      const sats = BigInt(Math.floor(parseFloat(amount) * 100000000));
      await onWithdraw(vaultId, sats, recipient);
      onClose();
    } catch (e) {
      alert('Withdrawal failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
    setWithdrawing(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Amount (BCH)</label>
        <input type="text" placeholder="0.0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" autoFocus />
        <p className="text-xs text-[#606060] mt-1">Available: {formatBCH(maxAmount)}</p>
      </div>
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Recipient Address</label>
        <input type="text" placeholder="bitcoincash:..." value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a]">Cancel</button>
        <button onClick={handleWithdraw} disabled={withdrawing || loading} className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50">
          {withdrawing ? "Withdrawing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}

function ProposalForm({ vaultId, address, onCreate, onClose, loading }: {
  vaultId: string;
  address: string;
  onCreate: (vaultId: string, proposal: any) => Promise<string>;
  onClose: () => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    setCreating(true);
    try {
      const amountSats = amount ? Math.floor(parseFloat(amount) * 100000000) : 0;
      await onCreate(vaultId, {
        vaultId,
        title,
        description,
        type: 'withdraw' as const,
        amount: amountSats,
        destination: recipient,
        createdBy: address
      });
      onClose();
    } catch (e) {
      alert('Failed to create proposal: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Title</label>
        <input type="text" placeholder="Proposal title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" autoFocus />
      </div>
      <div>
        <label className="text-xs text-[#606060] mb-1.5 block">Description</label>
        <textarea placeholder="Describe your proposal..." rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#606060] mb-1.5 block">Amount (BCH)</label>
          <input type="text" placeholder="0.0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
        </div>
        <div>
          <label className="text-xs text-[#606060] mb-1.5 block">Recipient</label>
          <input type="text" placeholder="bitcoincash:..." value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm focus:border-[#2a2a2a] outline-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1f1f1f] text-white text-sm border border-[#2a2a2a]">Cancel</button>
        <button onClick={handleCreate} disabled={creating || loading || !title.trim()} className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50">
          {creating ? "Creating..." : "Create Proposal"}
        </button>
      </div>
    </div>
  );
}
