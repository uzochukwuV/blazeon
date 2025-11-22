import Link from "next/link";

const VAULT_TYPES = [
  {
    name: "MasterVault",
    description: "All-in-one programmable vault with multi-sig, time-locks, spending limits, and covenants.",
    tag: "Featured",
  },
  {
    name: "TimeLockVault",
    description: "Block-height based withdrawal restrictions with emergency override capabilities.",
  },
  {
    name: "MultiSigVault",
    description: "Bitwise mask-based multi-signature authorization for up to 8 signers.",
  },
  {
    name: "SpendingLimitVault",
    description: "Enforce daily spending caps with automatic per-block reset.",
  },
  {
    name: "RecurringPaymentVault",
    description: "Automated scheduled payments that anyone can trigger on-chain.",
  },
  {
    name: "StreamVault",
    description: "Linear token streaming with per-block vesting calculations.",
  },
  {
    name: "WhitelistVault",
    description: "Restrict withdrawals to pre-approved recipient addresses only.",
  },
  {
    name: "TokenGatedVault",
    description: "Access control using CashToken NFTs or fungible token balances.",
  },
];

const FEATURES = [
  {
    title: "Multi-Signature",
    description: "Require multiple parties to authorize transactions using bitwise approval masks.",
  },
  {
    title: "Time-Locks",
    description: "Lock funds until a specific block height with optional emergency withdrawal.",
  },
  {
    title: "Spending Limits",
    description: "Set daily caps on withdrawals with automatic reset each day.",
  },
  {
    title: "Token Gating",
    description: "Require CashToken NFTs or fungible tokens for vault access.",
  },
  {
    title: "Recurring Payments",
    description: "Schedule automatic payments that can be triggered by anyone.",
  },
  {
    title: "P2S Covenants",
    description: "Enforce transaction constraints using Pay-to-Script covenants.",
  },
];

const STATS = [
  { value: "8", label: "Vault Types" },
  { value: "3", label: "BCH Bounties" },
  { value: "120M", label: "Sats in Prizes" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-semibold text-white">
              FluxVault
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-[#9b9b9b] hover:text-white transition-colors text-sm">
                Features
              </a>
              <a href="#vaults" className="text-[#9b9b9b] hover:text-white transition-colors text-sm">
                Vaults
              </a>
              <a href="https://github.com" className="text-[#9b9b9b] hover:text-white transition-colors text-sm">
                Docs
              </a>
            </div>
          </div>
          <Link href="/app" className="btn-primary text-sm">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 mb-6 text-xs font-medium text-[#9b9b9b] bg-[#1a1a1a] rounded-full border border-[#2a2a2a]">
              BCH Blaze 2025 Hackathon
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold text-white leading-tight mb-6">
              Programmable Vaults for Bitcoin Cash
            </h1>
            <p className="text-lg text-[#9b9b9b] mb-8 leading-relaxed">
              Advanced smart contract vaults with multi-sig, time-locks, spending limits, and token gating.
              Built with CashScript for the May 2026 BCH upgrade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/app" className="btn-primary">
                Get Started
              </Link>
              <a href="#vaults" className="btn-secondary">
                View Vaults
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg">
            {STATS.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-semibold text-white">{stat.value}</div>
                <div className="text-sm text-[#6b6b6b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-3">Features</h2>
            <p className="text-[#9b9b9b]">Powerful primitives for programmable money on Bitcoin Cash.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 bg-[#141414] rounded-xl border border-[#2a2a2a] hover:border-[#333] transition-colors">
                <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-[#9b9b9b] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vaults */}
      <section id="vaults" className="py-20 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-3">Vault Contracts</h2>
            <p className="text-[#9b9b9b]">Choose from 8 specialized vault types or use MasterVault for all features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VAULT_TYPES.map((vault, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border transition-colors ${
                  vault.tag
                    ? "bg-[#141414] border-[#333]"
                    : "bg-[#141414] border-[#2a2a2a] hover:border-[#333]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium">{vault.name}</h3>
                  {vault.tag && (
                    <span className="px-2 py-0.5 text-xs bg-[#1a1a1a] text-[#9b9b9b] rounded border border-[#2a2a2a]">
                      {vault.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#9b9b9b] leading-relaxed">{vault.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical */}
      <section className="py-20 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">Built for BCH</h2>
              <p className="text-[#9b9b9b] mb-6 leading-relaxed">
                FluxVault contracts are built with CashScript and leverage the upcoming May 2026
                Bitcoin Cash upgrade features including native loops, bitwise operations, and P2S covenants.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                  <span className="text-[#9b9b9b]">CashScript 0.13.0</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                  <span className="text-[#9b9b9b]">Chipnet Ready</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                  <span className="text-[#9b9b9b]">BCH Blaze Bounties</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">
              <div className="text-xs text-[#6b6b6b] mb-4 font-mono">MasterVault.cash</div>
              <pre className="text-sm text-[#9b9b9b] font-mono leading-relaxed overflow-x-auto">
{`pragma cashscript ^0.13.0;

contract MasterVault(
  pubkey owner,
  pubkey[3] signers,
  int requiredSigs,
  int unlockBlock,
  int dailyLimit,
  bytes32 covenantHash
) {
  function spend(
    sig ownerSig,
    sig[3] signerSigs,
    bytes8 approvalMask,
    int amount
  ) {
    // Multi-sig + timelock + limit
    require(tx.time >= unlockBlock);
    require(checkMultiSig(...));
    require(amount <= dailyLimit);
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to build?</h2>
          <p className="text-[#9b9b9b] mb-8">
            Deploy your first programmable vault on Bitcoin Cash.
          </p>
          <Link href="/app" className="btn-primary">
            Launch App
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6b6b6b]">
            FluxVault · BCH Blaze 2025
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com" className="text-sm text-[#6b6b6b] hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://twitter.com" className="text-sm text-[#6b6b6b] hover:text-white transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
