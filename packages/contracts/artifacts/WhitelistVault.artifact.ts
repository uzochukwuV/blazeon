export default {
  contractName: "WhitelistVault",
  constructorInputs: [
    {
      name: "ownerPkh",
      type: "bytes20"
    },
    {
      name: "adminPkh",
      type: "bytes20"
    },
    {
      name: "whitelistHash",
      type: "bytes20"
    }
  ],
  abi: [
    {
      name: "spendToWhitelisted",
      inputs: [
        {
          name: "ownerPk",
          type: "pubkey"
        },
        {
          name: "ownerSig",
          type: "sig"
        },
        {
          name: "recipientPkh",
          type: "bytes20"
        },
        {
          name: "amount",
          type: "int"
        }
      ]
    },
    {
      name: "adminWithdraw",
      inputs: [
        {
          name: "adminPk",
          type: "pubkey"
        },
        {
          name: "adminSig",
          type: "sig"
        }
      ]
    },
    {
      name: "deposit",
      inputs: []
    }
  ],
  bytecode: "OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_4 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIGVERIFY OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_3 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_3 OP_PICK OP_0 OP_UTXOVALUE OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_4 OP_ROLL OP_SUB f401 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_4 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_DROP OP_ELSE 76a914 OP_4 OP_PICK OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_1 OP_ELSE OP_3 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_2 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHAN OP_NIP OP_NIP OP_NIP OP_ENDIF OP_ENDIF",
  source: "// WhitelistVault - Vault with approved recipient whitelist\n// Real-world use: Corporate treasury, family accounts, trust distributions\n// Only pre-approved addresses can receive funds\n\npragma cashscript ^0.13.0;\n\ncontract WhitelistVault(\n    bytes20 ownerPkh,           // Owner who can spend\n    bytes20 adminPkh,           // Admin who manages whitelist\n    bytes20 whitelistHash       // Hash of approved addresses (Merkle root or simple hash)\n) {\n    // Spend to a whitelisted address\n    function spendToWhitelisted(\n        pubkey ownerPk,\n        sig ownerSig,\n        bytes20 recipientPkh,\n        int amount\n    ) {\n        // Verify owner\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // Verify recipient is whitelisted\n        // Simple check: recipient hash must match one of the whitelisted\n        // In production, this could use a Merkle proof\n        require(hash160(recipientPkh) == whitelistHash);\n\n        // Verify amount\n        require(amount > 0);\n        require(amount <= tx.inputs[0].value);\n\n        int remaining = tx.inputs[0].value - amount - 500;\n\n        // Create outputs\n        if (remaining > 546) {\n            // Output 0: Remaining in vault\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remaining);\n\n            // Output 1: Payment to whitelisted recipient\n            bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipientPkh);\n            require(tx.outputs[1].lockingBytecode == recipientLockingBytecode);\n        } else {\n            // Final spend\n            bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipientPkh);\n            require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n        }\n    }\n\n    // Admin withdrawal (emergency)\n    function adminWithdraw(pubkey adminPk, sig adminSig) {\n        require(hash160(adminPk) == adminPkh);\n        require(checkSig(adminSig, adminPk));\n    }\n\n    // Deposit funds\n    function deposit() {\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value > tx.inputs[0].value);\n    }\n}\n",
  debug: {
    bytecode: "5379009c635479a988547a547aad5379a97b88537900a069537900c6a16900c6547a9402f4019476022202a06300cd00c78800cc78a2690376a91454797e0288ac7e51cd788875670376a91454797e0288ac7e00cd788875686d6d51675379519c635479a97b88547a547aac77777767537a529d00cd00c78800cc00c6a07777776868",
    sourceMap: "13:4:48:5;;;;;20:24:20:31;;:16::32:1;:8::46;21:25:21:33:0;;:35::42;;:8::45:1;26:24:26:36:0;;:16::37:1;:41::54:0;:8::56:1;29:16:29:22:0;;:25::26;:16:::1;:8::28;30:16:30:22:0;;:36::37;:26::44:1;:16;:8::46;32:34:32:35:0;:24::42:1;:45::51:0;;:24:::1;:54::57:0;:24:::1;35:12:35:21:0;:24::27;:12:::1;:29:43:9:0;37:31:37:32;:20::49:1;:63::64:0;:53::81:1;:12::83;38:31:38:32:0;:20::39:1;:43::52:0;:20:::1;:12::54;41:47:41:85:0;:72::84;;:47::85:1;;;42:31:42:32:0;:20::49:1;:53::77:0;:12::79:1;35:29:43:9;43:15:47::0;45:47:45:85;:72::84;;:47::85:1;;;46:31:46:32:0;:20::49:1;:53::77:0;:12::79:1;43:15:47:9;;13:4:48:5;;;;51::54::0;;;;;52:24:52:31;;:16::32:1;:36::44:0;:8::46:1;53:25:53:33:0;;:35::42;;:8::45:1;51:4:54:5;;;;57::60::0;;;;58:27:58:28;:16::45:1;:59::60:0;:49::77:1;:8::79;59:27:59:28:0;:16::35:1;:48::49:0;:38::56:1;:8::58;57:4:60:5;;;7:0:61:1;",
    logs: [],
    requires: [
      {
        ip: 11,
        line: 20
      },
      {
        ip: 16,
        line: 21
      },
      {
        ip: 21,
        line: 26
      },
      {
        ip: 26,
        line: 29
      },
      {
        ip: 32,
        line: 30
      },
      {
        ip: 48,
        line: 37
      },
      {
        ip: 53,
        line: 38
      },
      {
        ip: 63,
        line: 42
      },
      {
        ip: 75,
        line: 46
      },
      {
        ip: 91,
        line: 52
      },
      {
        ip: 97,
        line: 53
      },
      {
        ip: 109,
        line: 58
      },
      {
        ip: 115,
        line: 59
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:43:37.617Z"
} as const;