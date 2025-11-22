import { Contract, NetworkProvider } from 'cashscript';
import TimeLockVaultArtifact from '../../../artifacts/TimeLockVault.artifact.js';

export interface TimeLockVaultParams {
  ownerPkh: Uint8Array;
  recoveryPkh: Uint8Array;
  unlockBlock: bigint;
  vestingAmount?: bigint;
}

export class TimeLockVault {
  public contract: Contract<typeof TimeLockVaultArtifact>;
  public params: TimeLockVaultParams;

  constructor({
    provider,
    params,
  }: {
    provider: NetworkProvider;
    params: TimeLockVaultParams;
  }) {
    this.params = params;

    this.contract = new Contract<typeof TimeLockVaultArtifact>(
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
}
