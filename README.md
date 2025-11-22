# FluxVault - BCH Blaze 2025 Hackathon

Advanced smart contract suite for Bitcoin Cash demonstrating the power of CashScript 0.13 and the May 2026 upgrade features on Chipnet.

## Bounty Targets

| Bounty | Amount | Contract |
|--------|--------|----------|
| **Bitwise Operations** | 10M sats | MultiSigVault |
| **P2S Covenant** | 10M sats | TimeLockVault, SpendingLimitVault |
| **Composite CashTokens** | 100M sats | TokenGatedVault |

## Real-World Use Cases

### For Businesses
- **SpendingLimitVault**: Employee expense accounts with daily limits
- **MultiSigVault**: Corporate treasury requiring multiple approvals
- **RecurringPaymentVault**: Automated payroll, vendor payments
- **WhitelistVault**: Approved supplier payments only

### For Individuals
- **TimeLockVault**: Savings with self-imposed lock periods
- **StreamVault**: Salary streaming, continuous income
- **SpendingLimitVault**: Budget control, allowances

### For DAOs/Organizations
- **TokenGatedVault**: Member-only reward pools
- **MultiSigVault**: Governance-controlled treasury
- **TimeLockVault**: Vesting schedules for contributors

---

## Contracts (7 Total)

### TimeLockVault
Time-locked vault with P2S covenant support for gradual fund release.

**Real-World Use:** Employee vesting, trust funds, savings discipline, escrow

**Features:**
- Time-locked withdrawals (configurable unlock block)
- Partial withdrawals with covenant to preserve remaining lock
- Vesting schedule support for gradual release
- Emergency recovery with backup key
- Lock extension capability

**Bounty:** P2S Covenant (10M sats)

---

### MultiSigVault
Multi-signature vault using bitwise operations for efficient authorization.

**Real-World Use:** Company treasury, family accounts, DAO governance, escrow

**Features:**
- Flexible M-of-N signature requirements
- Bitwise flags for signer selection (`&`, `|`, `^` operators)
- ApprovalMask: `0x01` = signer1, `0x02` = signer2, `0x04` = signer3
- Two-of-three optimized function
- Emergency recovery requiring all signatures

**Bounty:** Bitwise Operations (10M sats)

---

### TokenGatedVault
NFT-gated access control using Composite CashTokens.

**Real-World Use:** Membership benefits, loyalty programs, staking rewards, creator economy

**Features:**
- NFT required for access (proves membership)
- Fungible token balance check (proves stake/reputation)
- Tiered access based on token amounts
- Composite token verification (NFT + FT together)
- Minting NFT premium access tier
- Covenant to preserve token outputs

**Bounty:** Composite CashTokens (100M sats)

---

### StreamVault
Streaming payments with time-based vesting for continuous fund release.

**Real-World Use:** Salary streaming, subscriptions, freelancer payments, rent

**Features:**
- Time-based vesting from start to end block
- Partial claims based on elapsed time
- Sender cancellation option
- Mutual cancellation with custom split
- Covenant outputs for remaining funds

---

### SpendingLimitVault *(NEW)*
Daily spending limits with allowance reset for budget control.

**Real-World Use:** Business expense accounts, allowances, budget discipline

**Features:**
- Daily spending limit enforcement
- Automatic limit reset after time period
- Admin can adjust limits
- Emergency full withdrawal
- Anyone can deposit

---

### RecurringPaymentVault *(NEW)*
Automated recurring payments for subscriptions and bills.

**Real-World Use:** Subscriptions, rent, salaries, bill payments

**Features:**
- Automated payment execution at intervals
- Payee can claim when due
- **Anyone can trigger payment** (automation-friendly!)
- Payer can cancel and recover funds
- Top-up functionality

---

### WhitelistVault *(NEW)*
Vault with approved recipient whitelist for controlled spending.

**Real-World Use:** Corporate treasury, trust distributions, approved vendor payments

**Features:**
- Only whitelisted addresses can receive funds
- Admin-controlled whitelist
- Deposit function for anyone
- Emergency admin withdrawal

---

## Technical Stack

- **CashScript 0.13.0-next.1** - Latest version with 2026 upgrade support
- **Chipnet** - Bitcoin Cash testnet with May 2026 features active
- **TypeScript SDK** - Full type-safe contract interaction
- **Next.js dApp** - Web interface for vault management

## Getting Started

```bash
# Install dependencies
yarn install

# Compile contracts
cd packages/contracts
yarn compile

# Run tests
yarn test

# Start dApp
cd packages/dapp
yarn dev
```

## Contract Architecture

```
packages/contracts/
├── contracts/
│   └── FluxVault/
│       ├── TimeLockVault.cash        # P2S Covenant bounty
│       ├── StreamVault.cash          # Streaming payments
│       ├── MultiSigVault.cash        # Bitwise bounty
│       ├── TokenGatedVault.cash      # Composite CashTokens bounty
│       ├── SpendingLimitVault.cash   # Budget control
│       ├── RecurringPaymentVault.cash # Subscriptions
│       └── WhitelistVault.cash       # Approved recipients
├── src/
│   └── contract/FluxVault/           # TypeScript wrappers
└── artifacts/                        # Compiled contract artifacts
```

## Bounty Features Used

### Bitwise Operations (MultiSigVault)
```cashscript
// Bitwise AND for flag checking
bytes1 signer1Flag = approvalMask & 0x01;
if (signer1Flag == 0x01) { ... }

// Bitwise OR for mask building
bytes1 expectedMask = 0x01 | 0x02 | 0x04;
```

### P2S Covenant (TimeLockVault, SpendingLimitVault)
```cashscript
// Covenant to preserve funds in contract
require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
require(tx.outputs[0].value >= remainingAmount);
```

### Composite CashTokens (TokenGatedVault)
```cashscript
// Check NFT category AND fungible balance
require(tx.inputs[tokenInputIndex].tokenCategory == accessTokenCategory);
require(tx.inputs[tokenInputIndex].tokenAmount >= minFungibleBalance);

// Preserve NFT commitment
require(tx.outputs[0].nftCommitment == tx.inputs[tokenInputIndex].nftCommitment);
```

## Why FluxVault?

FluxVault isn't just a hackathon project—it's a practical toolkit for real BCH applications:

1. **Treasury Management**: MultiSigVault + WhitelistVault for secure organizational funds
2. **Payroll Automation**: RecurringPaymentVault for automated salary distribution
3. **Budget Control**: SpendingLimitVault for expense management
4. **Membership Systems**: TokenGatedVault for NFT-gated communities
5. **Savings Products**: TimeLockVault for term deposits and vesting

## License

MIT
