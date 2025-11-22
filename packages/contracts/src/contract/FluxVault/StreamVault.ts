import type { IConnector } from '@bch-wc2/interfaces';
import { Contract, NetworkProvider } from 'cashscript';
import { BaseWallet } from 'mainnet-js';
import StreamVaultArtifact from '../../../artifacts/StreamVault.artifact.js';
import { deployStreamVault } from './deploy.js';

export interface StreamVaultParams {
  senderPkh: Uint8Array;
  recipientPkh: Uint8Array;
  totalAmount: bigint;
  startBlock: bigint;
  endBlock: bigint;
}

export class StreamVault {
  public connector: IConnector;
  public wallet: BaseWallet;
  public contract: Contract<typeof StreamVaultArtifact>;
  public params: StreamVaultParams;

  static async deploy({
    wallet,
    provider,
    connector,
    value,
    senderPkh,
    recipientPkh,
    totalAmount,
    startBlock,
    endBlock,
  }: {
    wallet: BaseWallet;
    provider: NetworkProvider;
    connector: IConnector;
    value: bigint;
    senderPkh: Uint8Array;
    recipientPkh: Uint8Array;
    totalAmount: bigint;
    startBlock: bigint;
    endBlock: bigint;
  }) {
    const params: StreamVaultParams = { senderPkh, recipientPkh, totalAmount, startBlock, endBlock };
    const contract = await deployStreamVault({
      provider,
      wallet,
      connector,
      value,
      params,
    });

    return new StreamVault({
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
    contract?: Contract<typeof StreamVaultArtifact>;
    params: StreamVaultParams;
  }) {
    this.wallet = wallet;
    this.connector = connector;
    this.params = params;

    this.contract = contract ?? new Contract<typeof StreamVaultArtifact>(
      StreamVaultArtifact,
      [params.senderPkh, params.recipientPkh, params.totalAmount, params.startBlock, params.endBlock],
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
