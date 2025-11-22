"use client";

import Link from "next/link";

// Icons as SVG components
const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const TokenIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const RepeatIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Home() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
              <span className="text-black font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-semibold">FluxVault</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#vaults" className="text-gray-400 hover:text-white transition-colors">Vaults</a>
            <a href="#roadmap" className="text-gray-400 hover:text-white transition-colors">Roadmap</a>
            <a href="#usecases" className="text-gray-400 hover:text-white transition-colors">Use Cases</a>
          </div>
          <Link href="/app" className="btn-primary text-sm">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="fade-in-up opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-400">BCH Blaze 2025 Hackathon</span>
            </div>
          </div>

          <h1 className="fade-in-up opacity-0 delay-100 text-5xl md:text-7xl font-bold leading-tight mb-6">
            Programmable Vaults for
            <br />
            <span className="gradient-text">Bitcoin Cash</span>
          </h1>

          <p className="fade-in-up opacity-0 delay-200 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Multi-signature security, time-locked savings, spending limits, and token-gated access.
            All powered by CashScript smart contracts.
          </p>

          <div className="fade-in-up opacity-0 delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app" className="btn-primary text-lg">
              Get Started
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-secondary text-lg">
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="fade-in-up opacity-0 delay-400 grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/5">
            <div>
              <div className="text-4xl font-bold gradient-text">8</div>
              <div className="text-gray-500 mt-1">Vault Types</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">3</div>
              <div className="text-gray-500 mt-1">Bounties Targeted</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">120M</div>
              <div className="text-gray-500 mt-1">Sats in Bounties</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">100%</div>
              <div className="text-gray-500 mt-1">On-Chain</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Enterprise-Grade <span className="gradient-text">Security</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built on Bitcoin Cash&apos;s proven security model with advanced smart contract capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="feature-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6">
                <UsersIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Signature</h3>
              <p className="text-gray-400">
                Require multiple approvals for transactions. Perfect for teams, DAOs, and shared treasuries with configurable M-of-N signing.
              </p>
            </div>

            <div className="feature-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
                <ClockIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3">Time-Locked</h3>
              <p className="text-gray-400">
                Lock funds until a specific block height. Ideal for vesting schedules, savings goals, and delayed withdrawals.
              </p>
            </div>

            <div className="feature-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                <ChartIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3">Spending Limits</h3>
              <p className="text-gray-400">
                Set daily or periodic spending caps. Control expenses and protect against unauthorized large withdrawals.
              </p>
            </div>

            <div className="feature-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6">
                <TokenIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3">Token-Gated</h3>
              <p className="text-gray-400">
                Require specific CashTokens for access. Build membership systems, loyalty programs, and exclusive communities.
              </p>
            </div>

            <div className="feature-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6">
                <RepeatIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3">Recurring Payments</h3>
              <p className="text-gray-400">
                Automate subscriptions and payroll. Anyone can trigger payments when due—perfect for DeFi automation.
              </p>
            </div>

            <div className="feature-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                <CodeIcon />
              </div>
              <h3 className="text-xl font-semibold mb-3">P2S Covenants</h3>
              <p className="text-gray-400">
                Pay-to-Script outputs that preserve contract state. Funds stay locked until conditions are met.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vault Types Section */}
      <section id="vaults" className="py-32 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              8 Vault Types, <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From simple time-locks to the all-in-one MasterVault. Choose what fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* MasterVault - Featured */}
            <div className="md:col-span-2 glass-card rounded-3xl p-10 glow">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <ShieldIcon />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold">MasterVault</h3>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">Flagship</span>
                  </div>
                  <p className="text-gray-400 text-lg mb-6">
                    The ultimate programmable vault combining ALL features with dynamic enable/disable.
                    Multi-sig + time-lock + spending limits + recurring payments + token-gating in one contract.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-sm">Bitwise Operations</span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-sm">P2S Covenant</span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-sm">Composite CashTokens</span>
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm">All 3 Bounties</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Vaults */}
            {[
              { name: "TimeLockVault", desc: "Time-locked funds with vesting schedules", bounty: "P2S Covenant", icon: ClockIcon },
              { name: "MultiSigVault", desc: "2-of-3 or M-of-N signature requirements", bounty: "Bitwise Ops", icon: UsersIcon },
              { name: "TokenGatedVault", desc: "NFT or fungible token access control", bounty: "CashTokens", icon: TokenIcon },
              { name: "SpendingLimitVault", desc: "Daily spending caps with auto-reset", bounty: "P2S Covenant", icon: ChartIcon },
              { name: "RecurringPaymentVault", desc: "Automated subscription payments", bounty: "-", icon: RepeatIcon },
              { name: "StreamVault", desc: "Linear token streaming over time", bounty: "-", icon: RepeatIcon },
            ].map((vault) => (
              <div key={vault.name} className="glass-card rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <vault.icon />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{vault.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{vault.desc}</p>
                  {vault.bounty !== "-" && (
                    <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">{vault.bounty}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="roadmap" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Road to <span className="gradient-text">Mainnet</span>
            </h2>
            <p className="text-xl text-gray-400">
              Our journey from hackathon project to production-ready infrastructure.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-500 via-cyan-500 to-purple-500 opacity-30" />

            {/* Timeline items */}
            {[
              { phase: "Phase 1", title: "BCH Blaze 2025", desc: "Hackathon submission with 8 vault contracts, comprehensive test suite, and demo dApp.", status: "current", date: "Q4 2025" },
              { phase: "Phase 2", title: "Chipnet Testing", desc: "Deploy to Chipnet testnet. Community testing, bug bounties, and security audits.", status: "upcoming", date: "Q1 2026" },
              { phase: "Phase 3", title: "May 2026 Upgrade", desc: "Leverage BCH upgrade features: loops, functions, bitwise operations, P2S.", status: "upcoming", date: "May 2026" },
              { phase: "Phase 4", title: "Mainnet Launch", desc: "Production deployment. Enterprise partnerships. SDK release for developers.", status: "upcoming", date: "Q3 2026" },
              { phase: "Phase 5", title: "Ecosystem Growth", desc: "DAO governance, additional vault types, cross-chain bridges, and mobile apps.", status: "upcoming", date: "2027+" },
            ].map((item, index) => (
              <div key={item.phase} className={`relative flex items-start gap-8 mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className={`glass-card rounded-2xl p-6 ${item.status === 'current' ? 'border-green-500/30' : ''}`}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-mono text-gray-500">{item.phase}</span>
                      <span className="text-sm text-gray-600">{item.date}</span>
                      {item.status === 'current' && (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">In Progress</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full ${item.status === 'current' ? 'bg-green-500 animate-pulse-glow' : 'bg-gray-600'} relative z-10`} />
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="usecases" className="py-32 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="gradient-text">Real Business</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From startups to enterprises, FluxVault powers the next generation of BCH applications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8">
              <div className="text-4xl mb-6">🏢</div>
              <h3 className="text-xl font-semibold mb-3">Corporate Treasury</h3>
              <p className="text-gray-400 mb-4">
                Multi-sig approval for large transactions. Spending limits for daily operations. Whitelisted recipients for security.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Multi-Sig Vault</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Spending Limits</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Whitelist Control</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="text-4xl mb-6">💼</div>
              <h3 className="text-xl font-semibold mb-3">Payroll & HR</h3>
              <p className="text-gray-400 mb-4">
                Automated salary distribution. Employee vesting schedules. Expense account limits with daily resets.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Recurring Payments</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> TimeLock Vesting</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Spending Limits</li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="text-4xl mb-6">🎮</div>
              <h3 className="text-xl font-semibold mb-3">DAOs & Gaming</h3>
              <p className="text-gray-400 mb-4">
                Token-gated access to rewards. Member-only treasury withdrawals. NFT-based membership tiers.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Token-Gated Access</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Multi-Sig Governance</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Stream Payments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build on <span className="gradient-text">Bitcoin Cash</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join the BCH renaissance. Deploy your first vault in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app" className="btn-primary text-lg">
              Launch FluxVault App
            </Link>
            <a href="https://dorahacks.io/hackathon/bchblaze2025" target="_blank" rel="noopener noreferrer" className="btn-secondary text-lg">
              BCH Blaze 2025
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-black font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-semibold">FluxVault</span>
              </div>
              <p className="text-gray-500 text-sm">
                Programmable vaults for Bitcoin Cash. Built for BCH Blaze 2025 Hackathon.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#vaults" className="hover:text-white transition-colors">Vault Types</a></li>
                <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
                <li><Link href="/app" className="hover:text-white transition-colors">Launch App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="https://cashscript.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">CashScript Docs</a></li>
                <li><a href="https://bitcoincash.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Bitcoin Cash</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hackathon</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="https://dorahacks.io/hackathon/bchblaze2025" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">BCH Blaze 2025</a></li>
                <li><span className="text-green-400">Bitwise Operations</span> <span className="text-gray-600">10M sats</span></li>
                <li><span className="text-cyan-400">P2S Covenant</span> <span className="text-gray-600">10M sats</span></li>
                <li><span className="text-purple-400">CashTokens</span> <span className="text-gray-600">100M sats</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2025 FluxVault. Built with CashScript on Bitcoin Cash.</p>
            <div className="flex gap-6 text-gray-500 text-sm">
              <span>Chipnet Ready</span>
              <span>•</span>
              <span>May 2026 Upgrade</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
