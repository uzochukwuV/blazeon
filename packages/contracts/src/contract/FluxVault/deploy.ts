import { IConnector } from '@bch-wc2/interfaces';
import { WrapWallet } from '@bch-wc2/mainnet-js-signer';
import { Contract, NetworkProvider } from 'cashscript';
import { BaseWallet, SendRequest } from 'mainnet-js';
import TimeLockVaultArtifact from '../../../artifacts/TimeLockVault.artifact.js';
import StreamVaultArtifact from '../../../artifacts/StreamVault.artifact.js';
import MultiSigVaultArtifact from '../../../artifacts/MultiSigVault.artifact.js';
import TokenGatedVaultArtifact from '../../../artifacts/TokenGatedVault.artifact.js';
import type { TimeLockVaultParams } from './TimeLockVault.js';
import type { StreamVaultParams } from './StreamVault.js';
import type { MultiSigVaultParams } from './MultiSigVault.js';
import type { TokenGatedVaultParams } from './TokenGatedVault.js';

export const deployTimeLockVault = async ({
  wallet,
  provider,
  connector,
  value,
  params,
}: {
  wallet: BaseWallet;
  provider: NetworkProvider;
  connector: IConnector;
  value: bigint;
  params: TimeLockVaultParams;
}) => {
  if (value < 1000n) {
    throw new Error('Value must be at least 1000 satoshis to deploy the contract.');
  }

  const signer = WrapWallet(wallet, connector);

  const contract = new Contract(
    TimeLockVaultArtifact,
    [params.ownerPkh, params.recoveryPkh, params.unlockBlock, params.vestingAmount ?? 0n],
    { provider, addressType: 'p2sh32' }
  );

  await signer.send(new SendRequest({
    cashaddr: contract.address,
    value: Number(value),
    unit: 'satoshis',
  }), {
    userPrompt: `Sign to deploy TimeLockVault (unlocks at block ${params.unlockBlock})`,
  });

  return contract;
};

export const deployStreamVault = async ({
  wallet,
  provider,
  connector,
  value,
  params,
}: {
  wallet: BaseWallet;
  provider: NetworkProvider;
  connector: IConnector;
  value: bigint;
  params: StreamVaultParams;
}) => {
  if (value < 1000n) {
    throw new Error('Value must be at least 1000 satoshis to deploy the contract.');
  }

  const signer = WrapWallet(wallet, connector);

  const contract = new Contract(
    StreamVaultArtifact,
    [params.senderPkh, params.recipientPkh, params.totalAmount, params.startBlock, params.endBlock],
    { provider, addressType: 'p2sh32' }
  );

  await signer.send(new SendRequest({
    cashaddr: contract.address,
    value: Number(value),
    unit: 'satoshis',
  }), {
    userPrompt: `Sign to deploy StreamVault (${params.totalAmount} sats from block ${params.startBlock} to ${params.endBlock})`,
  });

  return contract;
};

export const deployMultiSigVault = async ({
  wallet,
  provider,
  connector,
  value,
  params,
}: {
  wallet: BaseWallet;
  provider: NetworkProvider;
  connector: IConnector;
  value: bigint;
  params: MultiSigVaultParams;
}) => {
  if (value < 1000n) {
    throw new Error('Value must be at least 1000 satoshis to deploy the contract.');
  }

  const signer = WrapWallet(wallet, connector);

  const contract = new Contract(
    MultiSigVaultArtifact,
    [params.signer1Pkh, params.signer2Pkh, params.signer3Pkh, params.minSignatures ?? 2n],
    { provider, addressType: 'p2sh32' }
  );

  await signer.send(new SendRequest({
    cashaddr: contract.address,
    value: Number(value),
    unit: 'satoshis',
  }), {
    userPrompt: `Sign to deploy MultiSigVault (2-of-3)`,
  });

  return contract;
};

export const deployTokenGatedVault = async ({
  wallet,
  provider,
  connector,
  value,
  params,
}: {
  wallet: BaseWallet;
  provider: NetworkProvider;
  connector: IConnector;
  value: bigint;
  params: TokenGatedVaultParams;
}) => {
  if (value < 1000n) {
    throw new Error('Value must be at least 1000 satoshis to deploy the contract.');
  }

  const signer = WrapWallet(wallet, connector);

  const contract = new Contract(
    TokenGatedVaultArtifact,
    [params.accessTokenCategory, params.minFungibleBalance, params.adminPkh],
    { provider, addressType: 'p2sh32' }
  );

  await signer.send(new SendRequest({
    cashaddr: contract.address,
    value: Number(value),
    unit: 'satoshis',
  }), {
    userPrompt: `Sign to deploy TokenGatedVault`,
  });

  return contract;
};
