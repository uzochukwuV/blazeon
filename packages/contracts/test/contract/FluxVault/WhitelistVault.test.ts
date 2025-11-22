import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import { hash160 } from "@bitauth/libauth";
import WhitelistVaultArtifact from "../../../artifacts/WhitelistVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobAddress, bobPkh, bobPub, bobSigTemplate,
} from "../../shared.js";

describe("WhitelistVault", () => {
  let provider: MockNetworkProvider;
  let contract: Contract<typeof WhitelistVaultArtifact>;

  const WHITELIST_HASH = hash160(bobPkh);

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();

    contract = new Contract(
      WhitelistVaultArtifact,
      [alicePkh, bobPkh, WHITELIST_HASH],
      { provider, addressType: "p2sh32" }
    );
  });

  describe("spendToWhitelisted", () => {
    it("should allow spending to whitelisted recipient", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const amount = 200000n;
      const remaining = 1000000n - amount - 500n;

      const unlocker = contract.unlock.spendToWhitelisted(alicePub, aliceSigTemplate, bobPkh, amount);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: contract.address, amount: remaining })
        .addOutput({ to: bobAddress, amount: amount - 300n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });

  describe("adminWithdraw", () => {
    it("should allow admin to withdraw", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.adminWithdraw(bobPub, bobSigTemplate);

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject non-admin withdrawal", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.adminWithdraw(alicePub, aliceSigTemplate);

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
        .addOutput({ to: contract.address, amount: 1500000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });
});
