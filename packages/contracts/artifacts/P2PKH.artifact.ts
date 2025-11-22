export default {
  contractName: "P2PKH",
  constructorInputs: [
    {
      name: "pkh",
      type: "bytes20"
    }
  ],
  abi: [
    {
      name: "spend",
      inputs: [
        {
          name: "pk",
          type: "pubkey"
        },
        {
          name: "s",
          type: "sig"
        }
      ]
    }
  ],
  bytecode: "OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG",
  source: "// P2PKH wrapped in P2SH\ncontract P2PKH(bytes20 pkh) {\n    // Require pk to match stored pkh and signature to match\n    function spend(pubkey pk, sig s) {\n        require(hash160(pk) == pkh);\n        require(checkSig(s, pk));\n    }\n}\n",
  debug: {
    bytecode: "78a988ac",
    sourceMap: "5:24:5:26;:16::27:1;:8::36;6::6:33",
    logs: [],
    requires: [
      {
        ip: 3,
        line: 5
      },
      {
        ip: 5,
        line: 6
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:29:12.992Z"
} as const;