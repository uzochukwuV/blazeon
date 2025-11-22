import { WrapBuilder } from '@bch-wc2/cashscript-signer';
import { IConnector } from '@bch-wc2/interfaces';
import { Contract, NetworkProvider, placeholderPublicKey, placeholderSignature, TransactionBuilder } from 'cashscript';
import { BaseWallet } from 'mainnet-js';
import TimeLockVaultArtifact from '../../../../artifacts/TimeLockVault.artifact.js';
import type { TimeLockVaultParams } from '../TimeLockVault.js';

export const emergencyWithdraw = async ({
  destination,
  value,
  wallet,
  provider,
  connector,
  params,
}: {
  destination: string;
  value: number;
  wallet: BaseWallet;
  provider: NetworkProvider;
  connector: IConnector;
  params: TimeLockVaultParams;
}) => {
  value = Math.floor(value);

  if (value <= 0) {
    throw new Error('value must be greater than 0');
  }

  const contract = new Contract<typeof TimeLockVaultArtifact>(
    TimeLockVaultArtifact,
    [params.ownerPkh, params.recoveryPkh, params.unlockBlock],
    { provider, addressType: 'p2sh32' },
  );

  const contractUtxos = await provider.getUtxos(contract.address);
  const contractTotalValue = contractUtxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);

  if (contractTotalValue < BigInt(value)) {
    throw new Error(`Insufficient funds in contract. Available: ${contractTotalValue}, required: ${BigInt(value)}`);
  }

  const builder = new TransactionBuilder({ provider })
    .addInputs(contractUtxos, contract.unlock.emergencyWithdraw(placeholderPublicKey(), placeholderSignature()))
    .addOutput({ to: destination, amount: BigInt(value) });

  // Calculate initial tx size and change
  let txSize = BigInt(builder.build().length / 2);
  let inputSum = builder.inputs.reduce((sum, input) => sum + input.satoshis, 0n);
  let outputSum = builder.outputs.reduce((sum, output) => sum + output.amount, 0n);
  let change = inputSum - outputSum;

  // If change is greater than dust threshold, add a change output
  const dustThreshold = 546n;
  if (change > dustThreshold + txSize) {
    builder.addOutput({
      to: contract.address,
      amount: change - txSize,
    });
    txSize = BigInt(builder.build().length / 2);
    inputSum = builder.inputs.reduce((sum, input) => sum + input.satoshis, 0n);
    outputSum = builder.outputs.reduce((sum, output) => sum + output.amount, 0n);
    change = inputSum - outputSum;
  }

  // If change does not cover fee, reduce last output to cover fee
  if (change < txSize) {
    const deficit = txSize - change;
    builder.outputs.at(-1)!.amount -= deficit;
    txSize = BigInt(builder.build().length / 2);
    inputSum = builder.inputs.reduce((sum, input) => sum + input.satoshis, 0n);
    outputSum = builder.outputs.reduce((sum, output) => sum + output.amount, 0n);
    change = inputSum - outputSum;
  }

  const feePerByte = Number(change) / Number(txSize);
  console.debug(`Transaction size: ${txSize} bytes, change: ${change} satoshis, fee/byte ${feePerByte.toFixed(2)}`);

  const result = await WrapBuilder(builder, connector).send({
    userPrompt: `Sign emergency withdrawal from TimeLockVault`,
    broadcast: false,
  });

  await provider.sendRawTransaction(result.signedTransaction);

  return {
    txSize,
    change,
    feePerByte,
    ...result,
  };
};
