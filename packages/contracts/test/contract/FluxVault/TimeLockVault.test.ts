import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import TimeLockVaultArtifact from "../../../artifacts/TimeLockVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobPkh, bobPub, bobSigTemplate,
} from "../../shared.js";

describe("TimeLockVault", () => {
  let provider: MockNetworkProvider;
  let contract: Contract<typeof TimeLockVaultArtifact>;

  const UNLOCK_BLOCK = 800000n;
  const VESTING_AMOUNT = 100000n;

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();

    contract = new Contract(
      TimeLockVaultArtifact,
      [alicePkh, bobPkh, UNLOCK_BLOCK, VESTING_AMOUNT],
      { provider, addressType: "p2sh32" }
    );
  });

  describe("withdraw", () => {
    it("should allow owner to withdraw after unlock time", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const unlocker = contract.unlock.withdraw(alicePub, aliceSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject withdrawal before unlock time", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) - 100);

      const unlocker = contract.unlock.withdraw(alicePub, aliceSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n })
        .setLocktime(Number(UNLOCK_BLOCK) - 100);

      expect(() => tx.build()).toThrow();
    });

    it("should reject withdrawal with wrong owner key", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const unlocker = contract.unlock.withdraw(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      expect(() => tx.build()).toThrow();
    });
  });

  describe("emergencyWithdraw", () => {
    it("should allow recovery key to withdraw anytime", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) - 1000);

      const unlocker = contract.unlock.emergencyWithdraw(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject emergency withdrawal with wrong key", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.emergencyWithdraw(alicePub, aliceSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      expect(() => tx.build()).toThrow();
    });
  });

  describe("deposit", () => {
    it("should allow anyone to deposit", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.deposit();

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 1400000n });

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

  describe("extendLock", () => {
    it("should allow owner to extend lock period", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const newUnlockBlock = UNLOCK_BLOCK + 10000n;
      const unlocker = contract.unlock.extendLock(alicePub, aliceSigTemplate, newUnlockBlock);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject extending to earlier time", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const earlierBlock = UNLOCK_BLOCK - 1000n;
      const unlocker = contract.unlock.extendLock(alicePub, aliceSigTemplate, earlierBlock);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 999000n });

      expect(() => tx.build()).toThrow();
    });
  });

  describe("partialWithdraw", () => {
    it("should allow partial withdrawal with covenant", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(UNLOCK_BLOCK) + 1);

      const withdrawAmount = 300000n;
      const remaining = 1000000n - withdrawAmount - 1000n;

      const unlocker = contract.unlock.partialWithdraw(alicePub, aliceSigTemplate, withdrawAmount);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: aliceAddress, amount: withdrawAmount - 500n })
        .setLocktime(Number(UNLOCK_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });
});
