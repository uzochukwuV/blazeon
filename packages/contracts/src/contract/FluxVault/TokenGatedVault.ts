import type { IConnector } from '@bch-wc2/interfaces';
import { Contract, NetworkProvider } from 'cashscript';
import { BaseWallet } from 'mainnet-js';
import TokenGatedVaultArtifact from '../../../artifacts/TokenGatedVault.artifact.js';
import { deployTokenGatedVault } from './deploy.js';

export interface TokenGatedVaultParams {
  accessTokenCategory: Uint8Array;
  minFungibleBalance: bigint;
  adminPkh: Uint8Array;
}

export class TokenGatedVault {
  public connector: IConnector;
  public wallet: BaseWallet;
  public contract: Contract<typeof TokenGatedVaultArtifact>;
  public params: TokenGatedVaultParams;

  static async deploy({
    wallet,
    provider,
    connector,
    value,
    accessTokenCategory,
    minFungibleBalance,
    adminPkh,
  }: {
    wallet: BaseWallet;
    provider: NetworkProvider;
    connector: IConnector;
    value: bigint;
    accessTokenCategory: Uint8Array;
    minFungibleBalance: bigint;
    adminPkh: Uint8Array;
  }) {
    const params: TokenGatedVaultParams = { accessTokenCategory, minFungibleBalance, adminPkh };
    const contract = await deployTokenGatedVault({
      provider,
      wallet,
      connector,
      value,
      params,
    });

    return new TokenGatedVault({
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
    contract?: Contract<typeof TokenGatedVaultArtifact>;
    params: TokenGatedVaultParams;
  }) {
    this.wallet = wallet;
    this.connector = connector;
    this.params = params;

    this.contract = contract ?? new Contract<typeof TokenGatedVaultArtifact>(
      TokenGatedVaultArtifact,
      [params.accessTokenCategory, params.minFungibleBalance, params.adminPkh],
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
