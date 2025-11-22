import type { IConnector } from '@bch-wc2/interfaces';
import { Contract, NetworkProvider } from 'cashscript';
import { BaseWallet } from 'mainnet-js';
import MultiSigVaultArtifact from '../../../artifacts/MultiSigVault.artifact.js';
import { deployMultiSigVault } from './deploy.js';

export interface MultiSigVaultParams {
  signer1Pkh: Uint8Array;
  signer2Pkh: Uint8Array;
  signer3Pkh: Uint8Array;
  minSignatures: bigint;
}

export class MultiSigVault {
  public connector: IConnector;
  public wallet: BaseWallet;
  public contract: Contract<typeof MultiSigVaultArtifact>;
  public params: MultiSigVaultParams;

  static async deploy({
    wallet,
    provider,
    connector,
    value,
    signer1Pkh,
    signer2Pkh,
    signer3Pkh,
    minSignatures = 2n,
  }: {
    wallet: BaseWallet;
    provider: NetworkProvider;
    connector: IConnector;
    value: bigint;
    signer1Pkh: Uint8Array;
    signer2Pkh: Uint8Array;
    signer3Pkh: Uint8Array;
    minSignatures?: bigint;
  }) {
    const params: MultiSigVaultParams = { signer1Pkh, signer2Pkh, signer3Pkh, minSignatures };
    const contract = await deployMultiSigVault({
      provider,
      wallet,
      connector,
      value,
      params,
    });

    return new MultiSigVault({
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
    contract?: Contract<typeof MultiSigVaultArtifact>;
    params: MultiSigVaultParams;
  }) {
    this.wallet = wallet;
    this.connector = connector;
    this.params = params;

    this.contract = contract ?? new Contract<typeof MultiSigVaultArtifact>(
      MultiSigVaultArtifact,
      [params.signer1Pkh, params.signer2Pkh, params.signer3Pkh, params.minSignatures],
      { provider, addressType: 'p2sh32' },
    );
  }

  get address(): string {
    return this.contract.address;
  }

  async getBalance(): Promise<bigint> {
    const utxos = await this.contract.getUtxos();
    return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
  }
}
