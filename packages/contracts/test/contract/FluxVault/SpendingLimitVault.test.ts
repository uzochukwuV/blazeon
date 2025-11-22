import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import SpendingLimitVaultArtifact from "../../../artifacts/SpendingLimitVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobPkh, bobPub, bobSigTemplate,
} from "../../shared.js";

describe("SpendingLimitVault", () => {
  let provider: MockNetworkProvider;
  let contract: Contract<typeof SpendingLimitVaultArtifact>;

  const DAILY_LIMIT = 500000n;
  const RESET_BLOCK = 800000n;
  const SPENT_SINCE_RESET = 0n;

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();

    contract = new Contract(
      SpendingLimitVaultArtifact,
      [alicePkh, bobPkh, DAILY_LIMIT, RESET_BLOCK, SPENT_SINCE_RESET],
      { provider, addressType: "p2sh32" }
    );
  });

  describe("spend", () => {
    it("should allow spending within daily limit", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const spendAmount = 200000n;
      const remaining = 1000000n - spendAmount - 500n;

      const unlocker = contract.unlock.spend(alicePub, aliceSigTemplate, spendAmount, aliceAddress);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: aliceAddress, amount: spendAmount - 300n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject spending over daily limit", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const overLimit = DAILY_LIMIT + 1n;
      const unlocker = contract.unlock.spend(alicePub, aliceSigTemplate, overLimit, aliceAddress);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 400000n })
        .addOutput({ to: aliceAddress, amount: overLimit - 300n });

      expect(() => tx.build()).toThrow();
    });
  });

  describe("withdrawAll", () => {
    it("should allow owner to withdraw all funds", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.withdrawAll(alicePub, aliceSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });

  describe("deposit", () => {
    it("should allow anyone to deposit", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.deposit();

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 1500000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });
});
