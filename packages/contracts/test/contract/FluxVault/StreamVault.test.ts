import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import StreamVaultArtifact from "../../../artifacts/StreamVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobAddress, bobPkh, bobPub, bobSigTemplate,
} from "../../shared.js";

describe("StreamVault", () => {
  let provider: MockNetworkProvider;
  let contract: Contract<typeof StreamVaultArtifact>;

  const TOTAL_AMOUNT = 1000000n;
  const START_BLOCK = 800000n;
  const END_BLOCK = 810000n;

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();

    contract = new Contract(
      StreamVaultArtifact,
      [alicePkh, bobPkh, TOTAL_AMOUNT, START_BLOCK, END_BLOCK],
      { provider, addressType: "p2sh32" }
    );
  });

  describe("claimAll", () => {
    it("should allow recipient to claim all after stream ends", async () => {
      const utxo = randomUtxo({ satoshis: TOTAL_AMOUNT });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(END_BLOCK) + 1);

      const unlocker = contract.unlock.claimAll(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: bobAddress, amount: TOTAL_AMOUNT - 1000n })
        .setLocktime(Number(END_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject claim before stream ends", async () => {
      const utxo = randomUtxo({ satoshis: TOTAL_AMOUNT });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(END_BLOCK) - 1000);

      const unlocker = contract.unlock.claimAll(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: bobAddress, amount: TOTAL_AMOUNT - 1000n })
        .setLocktime(Number(END_BLOCK) - 1000);

      expect(() => tx.build()).toThrow();
    });
  });

  describe("senderCancel", () => {
    it("should allow sender to cancel anytime", async () => {
      const utxo = randomUtxo({ satoshis: TOTAL_AMOUNT });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.senderCancel(alicePub, aliceSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: TOTAL_AMOUNT - 1000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject cancel from non-sender", async () => {
      const utxo = randomUtxo({ satoshis: TOTAL_AMOUNT });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.senderCancel(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: TOTAL_AMOUNT - 1000n });

      expect(() => tx.build()).toThrow();
    });
  });

  describe("mutualCancel", () => {
    it("should allow mutual cancellation with split", async () => {
      const utxo = randomUtxo({ satoshis: TOTAL_AMOUNT });
      provider.addUtxo(contract.address, utxo);

      const recipientShare = 400000n;
      const senderShare = TOTAL_AMOUNT - recipientShare;

      const unlocker = contract.unlock.mutualCancel(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        recipientShare
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: bobAddress, amount: recipientShare - 300n })
        .addOutput({ to: aliceAddress, amount: senderShare - 300n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });
});
