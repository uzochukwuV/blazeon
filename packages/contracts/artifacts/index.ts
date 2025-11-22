// FluxVault Artifacts - Compiled CashScript contracts
// Note: TimeLockVault, MultiSigVault, StreamVault, TokenGatedVault have class wrappers
// so their artifacts use "Artifact" suffix to avoid naming conflicts

// Artifacts without class wrappers - clean names
export { default as MasterVault } from './MasterVault.artifact.js';
export { default as SpendingLimitVault } from './SpendingLimitVault.artifact.js';
export { default as RecurringPaymentVault } from './RecurringPaymentVault.artifact.js';
export { default as WhitelistVault } from './WhitelistVault.artifact.js';
export { default as P2PKH } from './P2PKH.artifact.js';

// Artifacts with class wrappers - use "Artifact" suffix
export { default as TimeLockVaultArtifact } from './TimeLockVault.artifact.js';
export { default as MultiSigVaultArtifact } from './MultiSigVault.artifact.js';
export { default as StreamVaultArtifact } from './StreamVault.artifact.js';
export { default as TokenGatedVaultArtifact } from './TokenGatedVault.artifact.js';

// Also export with "Artifact" suffix for consistency
export { default as MasterVaultArtifact } from './MasterVault.artifact.js';
export { default as SpendingLimitVaultArtifact } from './SpendingLimitVault.artifact.js';
export { default as RecurringPaymentVaultArtifact } from './RecurringPaymentVault.artifact.js';
export { default as WhitelistVaultArtifact } from './WhitelistVault.artifact.js';
export { default as P2PKHArtifact } from './P2PKH.artifact.js';
