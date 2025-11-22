import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import RecurringPaymentVaultArtifact from "../../../artifacts/RecurringPaymentVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobAddress, bobPkh, bobPub, bobSigTemplate,
} from "../../shared.js";

describe("RecurringPaymentVault", () => {
  let provider: MockNetworkProvider;
  let contract: Contract<typeof RecurringPaymentVaultArtifact>;

  const PAYMENT_AMOUNT = 100000n;
  const NEXT_PAYMENT_BLOCK = 800000n;

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();

    contract = new Contract(
      RecurringPaymentVaultArtifact,
      [alicePkh, bobPkh, PAYMENT_AMOUNT, NEXT_PAYMENT_BLOCK],
      { provider, addressType: "p2sh32" }
    );
  });

  describe("claimPayment", () => {
    it("should allow payee to claim payment after due date", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(NEXT_PAYMENT_BLOCK) + 1);

      const remaining = 1000000n - PAYMENT_AMOUNT - 500n;

      const unlocker = contract.unlock.claimPayment(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: bobAddress, amount: PAYMENT_AMOUNT - 300n })
        .setLocktime(Number(NEXT_PAYMENT_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject claim before payment is due", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(NEXT_PAYMENT_BLOCK) - 100);

      const unlocker = contract.unlock.claimPayment(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: 899000n })
        .addOutput({ to: bobAddress, amount: 99700n })
        .setLocktime(Number(NEXT_PAYMENT_BLOCK) - 100);

      expect(() => tx.build()).toThrow();
    });
  });

  describe("executePayment", () => {
    it("should allow anyone to trigger payment when due", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);
      provider.setBlockHeight(Number(NEXT_PAYMENT_BLOCK) + 1);

      const remaining = 1000000n - PAYMENT_AMOUNT - 500n;

      const unlocker = contract.unlock.executePayment();

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: bobAddress, amount: PAYMENT_AMOUNT - 300n })
        .setLocktime(Number(NEXT_PAYMENT_BLOCK) + 1);

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });

  describe("cancel", () => {
    it("should allow payer to cancel and recover funds", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.cancel(alicePub, aliceSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });
});
