# FluxVault - BCH Blaze 2025 Hackathon

Advanced smart contract suite for Bitcoin Cash demonstrating the power of CashScript 0.13 and the May 2026 upgrade features on Chipnet.

## Bounty Targets

| Bounty | Amount | Contract |
|--------|--------|----------|
| **Bitwise Operations** | 10M sats | MultiSigVault |
| **P2S Covenant** | 10M sats | TimeLockVault |
| **Composite CashTokens** | 100M sats | TokenGatedVault |

## Contracts

### TimeLockVault
Time-locked vault with P2S covenant support for gradual fund release.

**Features:**
- Time-locked withdrawals (configurable unlock block)
- Partial withdrawals with covenant to preserve remaining lock
- Vesting schedule support for gradual release
- Emergency recovery with backup key
- Lock extension capability
- Deposit function for adding funds

**Bounty:** P2S Covenant (10M sats)

### StreamVault
Streaming payments with time-based vesting for continuous fund release.

**Features:**
- Time-based vesting from start to end block
- Partial claims based on elapsed time
- Sender cancellation with fair split
- Mutual cancellation with custom split
- Covenant outputs for remaining funds

### MultiSigVault
Multi-signature vault using bitwise operations for efficient authorization.

**Features:**
- Flexible M-of-N signature requirements
- Bitwise flags for signer selection (`&`, `|`, `^` operators)
- ApprovalMask: `0x01` = signer1, `0x02` = signer2, `0x04` = signer3
- Two-of-three optimized function
- Emergency recovery requiring all signatures

**Bounty:** Bitwise Operations (10M sats)

### TokenGatedVault
NFT-gated access control using Composite CashTokens.

**Features:**
- NFT required for access (proves membership)
- Fungible token balance check (proves stake/reputation)
- Tiered access based on token amounts
- Composite token verification (NFT + FT together)
- Minting NFT premium access tier
- Covenant to preserve token outputs

**Bounty:** Composite CashTokens (100M sats)

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
│   ├── FluxVault/
│   │   ├── TimeLockVault.cash    # P2S Covenant bounty
│   │   ├── StreamVault.cash      # Streaming payments
│   │   ├── MultiSigVault.cash    # Bitwise bounty
│   │   └── TokenGatedVault.cash  # Composite CashTokens bounty
│   └── P2PKH.cash                # Original template
├── src/
│   ├── contract/FluxVault/       # TypeScript wrappers
│   └── utils.ts                  # Utility functions
└── artifacts/                    # Compiled contract artifacts
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

### P2S Covenant (TimeLockVault)
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

## License

MIT
