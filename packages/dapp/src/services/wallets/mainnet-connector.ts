/**
 * Mainnet.cash Wallet Connector
 * Provides integration with mainnet.cash wallet library
 */

import { TestNetWallet, Wallet } from 'mainnet-js';
import { hash160 } from '@bitauth/libauth';
import {
  IWalletConnector,
  WalletType,
  WalletInfo,
  WalletBalance,
  Transaction,
  SignedTransaction,
} from '../../types/wallet';

type MainnetWallet = Wallet | TestNetWallet;

export class MainnetConnector implements IWalletConnector {
  type = WalletType.MAINNET;
  private wallet: MainnetWallet | null = null;
  private network: 'mainnet' | 'testnet' | 'chipnet';

  constructor(network: 'mainnet' | 'testnet' | 'chipnet' = 'chipnet') {
    this.network = network;
  }

  async isAvailable(): Promise<boolean> {
    return true; // mainnet-js is always available if imported
  }

  async connect(seedPhrase?: string): Promise<WalletInfo> {
    try {
      if (seedPhrase) {
        this.wallet = await this.importWallet(seedPhrase);
        const walletId = this.wallet.toString();
        localStorage.setItem('mainnet_wallet_id', walletId);
        localStorage.setItem('mainnet_wallet_seed', seedPhrase);
      } else {
        const savedSeed = localStorage.getItem('mainnet_wallet_seed');
        const savedWalletId = localStorage.getItem('mainnet_wallet_id');

        if (savedSeed) {
          this.wallet = await this.importWallet(savedSeed);
        } else if (savedWalletId) {
          this.wallet = await this.restoreWallet(savedWalletId);
        } else {
          this.wallet = await this.createWallet();
          const walletId = this.wallet.toString();
          const seed = await this.getSeedPhrase();
          localStorage.setItem('mainnet_wallet_id', walletId);
          localStorage.setItem('mainnet_wallet_seed', seed);
          console.warn('NEW WALLET CREATED! Save this seed phrase:', seed);
        }
      }

      const address = await this.getAddress();
      const publicKey = await this.getPublicKey();
      const balance = await this.getBalance();

      return { address, publicKey, balance, network: this.network };
    } catch (error) {
      console.error('Failed to connect mainnet wallet:', error);
      throw new Error('Failed to connect to mainnet.cash wallet');
    }
  }

  private async createWallet(): Promise<MainnetWallet> {
    if (this.network === 'mainnet') {
      return await Wallet.newRandom();
    }
    return await TestNetWallet.newRandom();
  }

  private async restoreWallet(walletId: string): Promise<MainnetWallet> {
    try {
      if (this.network === 'mainnet') {
        return await Wallet.fromId(walletId);
      }
      return await TestNetWallet.fromId(walletId);
    } catch {
      return this.createWallet();
    }
  }

  private async importWallet(seedPhrase: string): Promise<MainnetWallet> {
    if (this.network === 'mainnet') {
      return await Wallet.fromSeed(seedPhrase);
    }
    return await TestNetWallet.fromSeed(seedPhrase);
  }

  async disconnect(): Promise<void> {
    this.wallet = null;
    localStorage.removeItem('mainnet_wallet_id');
  }

  async getAddress(): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not connected');
    return this.wallet.getDepositAddress();
  }

  async getPublicKey(): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not connected');
    const publicKeyBytes = this.wallet.publicKey;
    if (!publicKeyBytes) throw new Error('Public key not available');
    return Array.from(publicKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async getPublicKeyHash(): Promise<Uint8Array> {
    if (!this.wallet) throw new Error('Wallet not connected');
    const publicKeyBytes = this.wallet.publicKey;
    if (!publicKeyBytes) throw new Error('Public key not available');
    return hash160(publicKeyBytes);
  }

  async getBalance(): Promise<WalletBalance> {
    if (!this.wallet) throw new Error('Wallet not connected');
    try {
      const balanceResponse = await this.wallet.getBalance();
      let satoshis = 0;
      if (typeof balanceResponse === 'number') {
        satoshis = balanceResponse;
      } else if (balanceResponse && typeof balanceResponse === 'object') {
        satoshis = (balanceResponse as { sat?: number }).sat || 0;
      }
      return { bch: satoshis / 100000000, sat: satoshis };
    } catch {
      return { bch: 0, sat: 0 };
    }
  }

  async signTransaction(tx: Transaction): Promise<SignedTransaction> {
    if (!this.wallet) throw new Error('Wallet not connected');
    const response = await this.wallet.send([{ cashaddr: tx.to, value: tx.amount, unit: 'sat' }]);
    let txId = '';
    if (typeof response === 'string') {
      txId = response;
    } else if (response && typeof response === 'object') {
      txId = (response as { txId?: string }).txId || '';
    }
    return { txId, hex: '' };
  }

  async signMessage(message: string): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not connected');
    const signature = await this.wallet.sign(message);
    return signature.signature;
  }

  async getSeedPhrase(): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not connected');
    const seed = await this.wallet.getSeed();
    return seed.seed;
  }

  getWallet(): MainnetWallet | null {
    return this.wallet;
  }
}
