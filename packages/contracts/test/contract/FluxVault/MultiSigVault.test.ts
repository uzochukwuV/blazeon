import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder } from "cashscript";
import { hexToBin } from "@bitauth/libauth";
import MultiSigVaultArtifact from "../../../artifacts/MultiSigVault.artifact.js";
import {
  aliceAddress, alicePkh, alicePub, aliceSigTemplate,
  bobPkh, bobPub, bobSigTemplate,
  charliePkh, charliePub, charlieSigTemplate,
  davePub, daveSigTemplate,
} from "../../shared.js";

describe("MultiSigVault", () => {
  let provider: MockNetworkProvider;
  let contract: Contract<typeof MultiSigVaultArtifact>;

  const MIN_SIGNATURES = 2n;

  beforeEach(() => {
    provider = new MockNetworkProvider();
    provider.reset();

    contract = new Contract(
      MultiSigVaultArtifact,
      [alicePkh, bobPkh, charliePkh, MIN_SIGNATURES],
      { provider, addressType: "p2sh32" }
    );
  });

  describe("spend with bitwise approvalMask", () => {
    it("should allow spend with signers 1 and 2 (mask 0x03)", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const approvalMask = hexToBin("03");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        approvalMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should allow spend with signers 1 and 3 (mask 0x05)", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const approvalMask = hexToBin("05");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        approvalMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject spend with only 1 signer", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const approvalMask = hexToBin("01");

      const unlocker = contract.unlock.spend(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        approvalMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      expect(() => tx.build()).toThrow();
    });

    it("should reject spend with wrong signer", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const approvalMask = hexToBin("03");

      // Dave is not a signer
      const unlocker = contract.unlock.spend(
        davePub, daveSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        approvalMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      expect(() => tx.build()).toThrow();
    });
  });

  describe("spendWith1And2", () => {
    it("should allow spend with signers 1 and 2", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const unlocker = contract.unlock.spendWith1And2(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });
  });

  describe("emergencyRecovery", () => {
    it("should allow emergency recovery with all 3 signatures", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const confirmMask = hexToBin("07");

      const unlocker = contract.unlock.emergencyRecovery(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        confirmMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      const txHex = tx.build();
      expect(txHex).toBeDefined();
    });

    it("should reject emergency recovery without all signatures", async () => {
      const utxo = randomUtxo({ satoshis: 1000000n });
      provider.addUtxo(contract.address, utxo);

      const confirmMask = hexToBin("03");

      const unlocker = contract.unlock.emergencyRecovery(
        alicePub, aliceSigTemplate,
        bobPub, bobSigTemplate,
        charliePub, charlieSigTemplate,
        confirmMask
      );

      const tx = new TransactionBuilder({ provider })
        .addInput(utxo, unlocker)
        .addOutput({ to: aliceAddress, amount: 999000n });

      expect(() => tx.build()).toThrow();
    });
  });
});
