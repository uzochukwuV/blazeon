import type { IConnector } from '@bch-wc2/interfaces';
import { Contract, NetworkProvider } from 'cashscript';
import { BaseWallet } from 'mainnet-js';
import TimeLockVaultArtifact from '../../../artifacts/TimeLockVault.artifact.js';
import { deployTimeLockVault } from './deploy.js';
import { withdraw as withdrawFn } from './functions/withdraw.js';
import { emergencyWithdraw as emergencyWithdrawFn } from './functions/emergencyWithdraw.js';

export interface TimeLockVaultParams {
  ownerPkh: Uint8Array;
  recoveryPkh: Uint8Array;
  unlockBlock: bigint;
  vestingAmount?: bigint;
}

export class TimeLockVault {
  public connector: IConnector;
  public wallet: BaseWallet;
  public contract: Contract<typeof TimeLockVaultArtifact>;
  public params: TimeLockVaultParams;

  static async deploy({
    wallet,
    provider,
    connector,
    value,
    ownerPkh,
    recoveryPkh,
    unlockBlock,
  }: {
    wallet: BaseWallet;
    provider: NetworkProvider;
    connector: IConnector;
    value: bigint;
    ownerPkh: Uint8Array;
    recoveryPkh: Uint8Array;
    unlockBlock: bigint;
  }) {
    const params: TimeLockVaultParams = { ownerPkh, recoveryPkh, unlockBlock };
    const contract = await deployTimeLockVault({
      provider,
      wallet,
      connector,
      value,
      params,
    });

    return new TimeLockVault({
      wallet,
      provider,
      connector,
      contract,
      params,
    });
  }

  constructor({
    wallet,
    provider,
    connector,
    contract,
    params,
  }: {
    wallet: BaseWallet;
    provider: NetworkProvider;
    connector: IConnector;
    contract?: Contract<typeof TimeLockVaultArtifact>;
    params: TimeLockVaultParams;
  }) {
    this.wallet = wallet;
    this.connector = connector;
    this.params = params;

    this.contract = contract ?? new Contract<typeof TimeLockVaultArtifact>(
      TimeLockVaultArtifact,
      [params.ownerPkh, params.recoveryPkh, params.unlockBlock, params.vestingAmount ?? 0n],
      { provider, addressType: 'p2sh32' },
    );
  }

  get address(): string {
    return this.contract.address;
  }

  get unlockBlock(): bigint {
    return this.params.unlockBlock;
  }

  async getBalance(): Promise<bigint> {
    const utxos = await this.contract.getUtxos();
    return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
  }

  async withdraw({
    destination,
    value,
  }: {
    destination: string;
    value: bigint;
  }) {
    return withdrawFn({
      destination,
      value: Number(value),
      wallet: this.wallet,
      provider: this.contract.provider,
      connector: this.connector,
      params: this.params,
    });
  }

  async emergencyWithdraw({
    destination,
    value,
    recoveryWallet,
  }: {
    destination: string;
    value: bigint;
    recoveryWallet: BaseWallet;
  }) {
    return emergencyWithdrawFn({
      destination,
      value: Number(value),
      wallet: recoveryWallet,
      provider: this.contract.provider,
      connector: this.connector,
      params: this.params,
    });
  }
}
