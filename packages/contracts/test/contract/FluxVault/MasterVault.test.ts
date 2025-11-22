import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import { hexToBin } from "@bitauth/libauth";
import MasterVaultArtifact from "../../../artifacts/MasterVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobPkh, bobPub, bobSigTemplate,
  charliePkh, charliePub, charlieSigTemplate,
  davePkh,
} from "../../shared.js";

describe("MasterVault", () => {
  let provider: MockNetworkProvider;

  const UNLOCK_BLOCK = 800000n;
  const SPENDING_LIMIT = 500000n;
  const RECURRING_AMOUNT = 100000n;
  const NEXT_PAYMENT_BLOCK = 810000n;
  const REQUIRED_TOKEN_CATEGORY = new Uint8Array(32).fill(0);

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();
  });

  describe("Multi-sig spend (Bitwise Operations bounty)", () => {
    let contract: Contract<typeof MasterVaultArtifact>;

    beforeEach(() => {
      contract = new Contract(
        MasterVaultArtifact,
        [
          alicePkh, bobPkh, charliePkh, 2n,
          UNLOCK_BLOCK,
          SPENDING_LIMIT,
          davePkh, RECURRING_AMOUNT, NEXT_PAYMENT_BLOCK,
          REQUIRED_TOKEN_CATEGORY
        ],
        { provider, addressType: "p2sh32" }
      );
    });

    it("should allow spend with signers 1 and 2 (mask 0x03)", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const amount = 200000n;
      const remaining = 1000000n - amount - 500n;
      const signerMask = hexToBin("03");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        amount,
        aliceAddress,
        signerMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: aliceAddress, amount: amount - 300n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject spend before unlock block", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) - 100);

      const signerMask = hexToBin("03");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        200000n,
        aliceAddress,
        signerMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 799000n })
        .addOutput({ to: aliceAddress, amount: 199700n })
        .setLocktime(Number(UNLOCK_BLOCK) - 100);

      expect(() => tx.build()).toThrow();
    });

    it("should reject spend over spending limit", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const signerMask = hexToBin("03");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        SPENDING_LIMIT + 1n,
        aliceAddress,
        signerMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 499000n })
        .addOutput({ to: aliceAddress, amount: 499700n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      expect(() => tx.build()).toThrow();
    });

    it("should reject spend with insufficient signatures", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const signerMask = hexToBin("01");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        200000n,
        aliceAddress,
        signerMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 799000n })
        .addOutput({ to: aliceAddress, amount: 199700n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      expect(() => tx.build()).toThrow();
    });
  });

  describe("P2S Covenant (preserving funds)", () => {
    let contract: Contract<typeof MasterVaultArtifact>;

    beforeEach(() => {
      contract = new Contract(
        MasterVaultArtifact,
        [
          alicePkh, bobPkh, charliePkh, 2n,
          UNLOCK_BLOCK,
          SPENDING_LIMIT,
          davePkh, RECURRING_AMOUNT, NEXT_PAYMENT_BLOCK,
          REQUIRED_TOKEN_CATEGORY
        ],
        { provider, addressType: "p2sh32" }
      );
    });

    it("should preserve remaining funds in contract (covenant)", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const amount = 200000n;
      const remaining = 1000000n - amount - 500n;
      const signerMask = hexToBin("03");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        amount,
        aliceAddress,
        signerMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: aliceAddress, amount: amount - 300n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });

  describe("Deposit function", () => {
    let contract: Contract<typeof MasterVaultArtifact>;

    beforeEach(() => {
      contract = new Contract(
        MasterVaultArtifact,
        [
          alicePkh, bobPkh, charliePkh, 2n,
          UNLOCK_BLOCK,
          SPENDING_LIMIT,
          davePkh, RECURRING_AMOUNT, NEXT_PAYMENT_BLOCK,
          REQUIRED_TOKEN_CATEGORY
        ],
        { provider, addressType: "p2sh32" }
      );
    });

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

    it("should reject deposit that decreases value", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.deposit();

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 900000n });

      expect(() => tx.build()).toThrow();
    });
  });

  describe("Emergency withdrawal", () => {
    it("should allow all owners to bypass all restrictions", async () => {
      const contract = new Contract(
        MasterVaultArtifact,
        [
          alicePkh, bobPkh, charliePkh, 2n,
          999999999n,
          1n,
          davePkh, RECURRING_AMOUNT, NEXT_PAYMENT_BLOCK,
          REQUIRED_TOKEN_CATEGORY
        ],
        { provider, addressType: "p2sh32" }
      );

      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.emergencyWithdraw(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        aliceAddress
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });

  describe("Single owner mode", () => {
    it("should work with single owner when others are zeroed", async () => {
      const ZERO_PKH = new Uint8Array(20).fill(0);

      const contract = new Contract(
        MasterVaultArtifact,
        [
          alicePkh, ZERO_PKH, ZERO_PKH, 1n,
          0n,
          0n,
          ZERO_PKH, 0n, 0n,
          REQUIRED_TOKEN_CATEGORY
        ],
        { provider, addressType: "p2sh32" }
      );

      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const signerMask = hexToBin("01");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        500000n,
        aliceAddress,
        signerMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 499000n })
        .addOutput({ to: aliceAddress, amount: 499700n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });
});
