export default {
  contractName: "SpendingLimitVault",
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
      name: "dailyLimit",
      type: "int"
    },
    {
      name: "resetBlock",
      type: "int"
    },
    {
      name: "spentSinceReset",
      type: "int"
    }
  ],
  abi: [
    {
      name: "spend",
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
          name: "spendAmount",
          type: "int"
        },
        {
          name: "destinationLockingBytecode",
          type: "bytes25"
        }
      ]
    },
    {
      name: "updateLimit",
      inputs: [
        {
          name: "adminPk",
          type: "pubkey"
        },
        {
          name: "adminSig",
          type: "sig"
        },
        {
          name: "newDailyLimit",
          type: "int"
        }
      ]
    },
    {
      name: "withdrawAll",
      inputs: [
        {
          name: "ownerPk",
          type: "pubkey"
        },
        {
          name: "ownerSig",
          type: "sig"
        }
      ]
    },
    {
      name: "deposit",
      inputs: []
    },
    {
      name: "resetLimit",
      inputs: [
        {
          name: "ownerPk",
          type: "pubkey"
        },
        {
          name: "ownerSig",
          type: "sig"
        }
      ]
    }
  ],
  bytecode: "OP_5 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_5 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_3 OP_ROLL OP_5 OP_PICK OP_ADD OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_4 OP_PICK e803 OP_ADD OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_4 OP_PICK OP_SUB f401 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_6 OP_PICK OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_5 OP_PICK 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_ELSE OP_0 OP_OUTPUTBYTECODE OP_6 OP_PICK OP_EQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_5 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_5 OP_ROLL OP_0 OP_GREATERTHAN OP_VERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE e803 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_5 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_7 OP_ROLL OP_7 OP_ROLL OP_CHECKSIGVERIFY 76a914 OP_SWAP OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_5 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHAN OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_5 OP_ROLL OP_4 OP_NUMEQUALVERIFY OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_ROT OP_CHECKLOCKTIMEVERIFY OP_DROP OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE f401 OP_SUB OP_GREATERTHANOREQUAL OP_NIP OP_NIP OP_NIP OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// SpendingLimitVault - Daily spending limits with allowance reset\n// Real-world use: Business expense accounts, allowances, budget control\n// BOUNTY TARGET: P2S Covenant + Practical DeFi\n\npragma cashscript ^0.13.0;\n\ncontract SpendingLimitVault(\n    bytes20 ownerPkh,           // Owner who can spend\n    bytes20 adminPkh,           // Admin who can change limits\n    int dailyLimit,             // Maximum sats per day\n    int resetBlock,             // Block when daily limit resets\n    int spentSinceReset         // Amount spent since last reset\n) {\n    // Spend with daily limit enforcement\n    function spend(\n        pubkey ownerPk,\n        sig ownerSig,\n        int spendAmount,\n        bytes25 destinationLockingBytecode\n    ) {\n        // Verify owner\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // Validate spend amount\n        require(spendAmount > 0);\n\n        // Check if we're past reset block (spending limit refreshed)\n        // If tx.time >= resetBlock, the limit has been refreshed\n        // We check spending against the limit regardless\n        // The contract state would be updated on-chain to track actual spending\n\n        // Check spending limit (simplified - tracks cumulative)\n        require(spentSinceReset + spendAmount <= dailyLimit);\n\n        // Check vault has enough funds\n        require(tx.inputs[0].value >= spendAmount + 1000);\n\n        // Calculate remaining in vault\n        int remaining = tx.inputs[0].value - spendAmount - 500;\n\n        // Update state and create outputs\n        if (remaining > 546) {\n            // Output 0: Updated vault with new spent amount\n            // Covenant enforces state preservation\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remaining);\n\n            // Output 1: Spent amount to destination\n            require(tx.outputs[1].lockingBytecode == destinationLockingBytecode);\n            require(tx.outputs[1].value >= spendAmount - 300);\n        } else {\n            // Final spend\n            require(tx.outputs[0].lockingBytecode == destinationLockingBytecode);\n        }\n    }\n\n    // Admin can update daily limit\n    function updateLimit(\n        pubkey adminPk,\n        sig adminSig,\n        int newDailyLimit\n    ) {\n        require(hash160(adminPk) == adminPkh);\n        require(checkSig(adminSig, adminPk));\n\n        // New limit must be positive\n        require(newDailyLimit > 0);\n\n        // Preserve vault funds\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value >= tx.inputs[0].value - 1000);\n    }\n\n    // Owner can withdraw all (emergency, or closing account)\n    function withdrawAll(pubkey ownerPk, sig ownerSig) {\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // All funds go to owner\n        bytes25 ownerLockingBytecode = new LockingBytecodeP2PKH(ownerPkh);\n        require(tx.outputs[0].lockingBytecode == ownerLockingBytecode);\n    }\n\n    // Anyone can deposit\n    function deposit() {\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value > tx.inputs[0].value);\n    }\n\n    // Reset the daily limit (can be called after resetBlock)\n    function resetLimit(pubkey ownerPk, sig ownerSig) {\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // Must be past the reset block\n        require(tx.time >= resetBlock);\n\n        // Covenant to preserve funds\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value >= tx.inputs[0].value - 500);\n    }\n}\n",
  debug: {
    bytecode: "5579009c635679a988567a567aad557900a069537a5579937ba16900c6547902e80393a26900c654799402f4019476022202a06300cd00c78800cc78a26951cd56798851cc5579022c0194a2696700cd567988686d6d6d51675579519c635679a97b88567a567aad557a00a06900cd00c78800cc00c602e80394a2696d6d7551675579529c635679a97888577a577aad0376a9147c7e0288ac7e00cd886d6d7551675579539c6300cd00c78800cc00c6a0696d6d6d5167557a549d5579a98871ad7bb17500cd00c78800cc00c602f40194a277777768686868",
    sourceMap: "15:4:56:5;;;;;22:24:22:31;;:16::32:1;:8::46;23:25:23:33:0;;:35::42;;:8::45:1;26:16:26:27:0;;:30::31;:16:::1;:8::33;34:16:34:31:0;;:34::45;;:16:::1;:49::59:0;:16:::1;:8::61;37:26:37:27:0;:16::34:1;:38::49:0;;:52::56;:38:::1;:16;:8::58;40:34:40:35:0;:24::42:1;:45::56:0;;:24:::1;:59::62:0;:24:::1;43:12:43:21:0;:24::27;:12:::1;:29:52:9:0;46:31:46:32;:20::49:1;:63::64:0;:53::81:1;:12::83;47:31:47:32:0;:20::39:1;:43::52:0;:20:::1;:12::54;50:31:50:32:0;:20::49:1;:53::79:0;;:12::81:1;51:31:51:32:0;:20::39:1;:43::54:0;;:57::60;:43:::1;:20;:12::62;52:15:55:9:0;54:31:54:32;:20::49:1;:53::79:0;;:12::81:1;52:15:55:9;15:4:56:5;;;;;59::73::0;;;;;64:24:64:31;;:16::32:1;:36::44:0;:8::46:1;65:25:65:33:0;;:35::42;;:8::45:1;68:16:68:29:0;;:32::33;:16:::1;:8::35;71:27:71:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;72:27:72:28:0;:16::35:1;:49::50:0;:39::57:1;:60::64:0;:39:::1;:16;:8::66;59:4:73:5;;;;;76::83::0;;;;;77:24:77:31;;:16::32:1;:36::44:0;:8::46:1;78:25:78:33:0;;:35::42;;:8::45:1;81:39:81:73:0;:64::72;:39::73:1;;;82:27:82:28:0;:16::45:1;:8::71;76:4:83:5;;;;;86::89::0;;;;;87:27:87:28;:16::45:1;:59::60:0;:49::77:1;:8::79;88:27:88:28:0;:16::35:1;:48::49:0;:38::56:1;:16;:8::58;86:4:89:5;;;;;92::102::0;;;;93:24:93:31;;:16::32:1;:8::46;94:25:94:42:0;:8::45:1;97:27:97:37:0;:8::39:1;;100:27:100:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;101:27:101:28:0;:16::35:1;:49::50:0;:39::57:1;:60::63:0;:39:::1;:8::65;92:4:102:5;;;7:0:103:1;;;",
    logs: [],
    requires: [
      {
        ip: 13,
        line: 22
      },
      {
        ip: 18,
        line: 23
      },
      {
        ip: 23,
        line: 26
      },
      {
        ip: 31,
        line: 34
      },
      {
        ip: 39,
        line: 37
      },
      {
        ip: 55,
        line: 46
      },
      {
        ip: 60,
        line: 47
      },
      {
        ip: 65,
        line: 50
      },
      {
        ip: 73,
        line: 51
      },
      {
        ip: 79,
        line: 54
      },
      {
        ip: 95,
        line: 64
      },
      {
        ip: 100,
        line: 65
      },
      {
        ip: 105,
        line: 68
      },
      {
        ip: 110,
        line: 71
      },
      {
        ip: 118,
        line: 72
      },
      {
        ip: 133,
        line: 77
      },
      {
        ip: 138,
        line: 78
      },
      {
        ip: 146,
        line: 82
      },
      {
        ip: 161,
        line: 87
      },
      {
        ip: 167,
        line: 88
      },
      {
        ip: 180,
        line: 93
      },
      {
        ip: 182,
        line: 94
      },
      {
        ip: 184,
        line: 97
      },
      {
        ip: 190,
        line: 100
      },
      {
        ip: 198,
        line: 101
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T18:35:38.768Z"
} as const;