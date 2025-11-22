export default {
  contractName: "TimeLockVault",
  constructorInputs: [
    {
      name: "ownerPkh",
      type: "bytes20"
    },
    {
      name: "recoveryPkh",
      type: "bytes20"
    },
    {
      name: "unlockBlock",
      type: "int"
    },
    {
      name: "vestingAmount",
      type: "int"
    }
  ],
  abi: [
    {
      name: "withdraw",
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
      name: "partialWithdraw",
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
          name: "withdrawAmount",
          type: "int"
        }
      ]
    },
    {
      name: "vestingWithdraw",
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
      name: "emergencyWithdraw",
      inputs: [
        {
          name: "recoveryPk",
          type: "pubkey"
        },
        {
          name: "recoverySig",
          type: "sig"
        }
      ]
    },
    {
      name: "extendLock",
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
          name: "newUnlockBlock",
          type: "int"
        }
      ]
    },
    {
      name: "deposit",
      inputs: []
    },
    {
      name: "transferOwnership",
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
          name: "newOwnerPkh",
          type: "bytes20"
        }
      ]
    }
  ],
  bytecode: "OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_ROT OP_CHECKLOCKTIMEVERIFY OP_DROP OP_4 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_4 OP_PICK OP_0 OP_UTXOVALUE OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_5 OP_PICK OP_SUB e803 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_2 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_7 OP_PICK f401 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ELSE 76a914 OP_2 OP_PICK OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_ROT OP_CHECKLOCKTIMEVERIFY OP_DROP OP_2 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_0 OP_UTXOVALUE OP_3 OP_ROLL OP_2DUP OP_SWAP 2202 OP_SUB OP_GREATERTHAN OP_IF OP_OVER 2202 OP_SUB OP_NIP OP_ENDIF OP_SUB f401 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_2 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_DROP OP_ELSE 76a914 OP_2 OP_PICK OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_PICK OP_4 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_ROLL OP_ROT OP_GREATERTHAN OP_VERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE e803 OP_SUB OP_GREATERTHANOREQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_4 OP_PICK OP_5 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHAN OP_VERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_4 OP_ROLL OP_6 OP_NUMEQUALVERIFY OP_4 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_ROLL OP_EQUAL OP_NOT OP_VERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE e803 OP_SUB OP_GREATERTHANOREQUAL OP_NIP OP_NIP OP_NIP OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// TimeLockVault - Advanced time-locked vault with P2S covenant support\n// BOUNTY TARGET: P2S Covenant (10M sats)\n//\n// Features:\n// - Time-locked funds with configurable unlock block\n// - Partial withdrawals with covenant to preserve remaining lock\n// - Recovery key for emergencies\n// - Lock extension capability\n// - P2S output support for flexible spending conditions\n\npragma cashscript ^0.13.0;\n\ncontract TimeLockVault(\n    bytes20 ownerPkh,           // Owner's public key hash\n    bytes20 recoveryPkh,        // Recovery key hash for emergencies\n    int unlockBlock,            // Block height when funds can be withdrawn\n    int vestingAmount           // Amount that vests per period (0 = all at once)\n) {\n    // Full withdrawal - only after unlock time\n    function withdraw(pubkey ownerPk, sig ownerSig) {\n        // Verify owner identity\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // Verify time lock has passed\n        require(tx.time >= unlockBlock);\n    }\n\n    // Partial withdrawal with covenant - withdraw some, keep rest locked\n    // This creates a P2S-style output back to the same contract\n    function partialWithdraw(\n        pubkey ownerPk,\n        sig ownerSig,\n        int withdrawAmount\n    ) {\n        // Verify owner identity\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // Verify time lock has passed\n        require(tx.time >= unlockBlock);\n\n        // Verify withdrawal amount is valid\n        require(withdrawAmount > 0);\n        require(withdrawAmount <= tx.inputs[0].value);\n\n        // Calculate remaining amount\n        int remainingAmount = tx.inputs[0].value - withdrawAmount - 1000;\n\n        // If significant amount remains, covenant to keep it locked\n        if (remainingAmount > 546) {\n            // Output 0: Remaining funds stay in same contract (P2S covenant)\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remainingAmount);\n\n            // Output 1: Withdrawn amount to owner\n            bytes25 ownerLockingBytecode = new LockingBytecodeP2PKH(ownerPkh);\n            require(tx.outputs[1].lockingBytecode == ownerLockingBytecode);\n            require(tx.outputs[1].value >= withdrawAmount - 500);\n        } else {\n            // Small remainder - just send everything to owner\n            bytes25 ownerLockingBytecode = new LockingBytecodeP2PKH(ownerPkh);\n            require(tx.outputs[0].lockingBytecode == ownerLockingBytecode);\n        }\n    }\n\n    // Vesting withdrawal - withdraw only the vested amount\n    // Demonstrates time-based P2S covenant for gradual release\n    function vestingWithdraw(pubkey ownerPk, sig ownerSig) {\n        // Verify owner identity\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // Must be after unlock time for any vesting\n        require(tx.time >= unlockBlock);\n\n        // Can only use this function if vestingAmount is set\n        require(vestingAmount > 0);\n\n        // Withdraw exactly the vesting amount\n        int currentValue = tx.inputs[0].value;\n        int toWithdraw = vestingAmount;\n\n        // Don't withdraw more than available\n        if (toWithdraw > currentValue - 546) {\n            toWithdraw = currentValue - 546;\n        }\n\n        int remaining = currentValue - toWithdraw - 500;\n\n        // Covenant: remaining stays locked, vested goes to owner\n        if (remaining > 546) {\n            // Output 0: Remaining stays in contract\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remaining);\n\n            // Output 1: Vested amount to owner\n            bytes25 ownerLockingBytecode = new LockingBytecodeP2PKH(ownerPkh);\n            require(tx.outputs[1].lockingBytecode == ownerLockingBytecode);\n        } else {\n            // Final withdrawal\n            bytes25 ownerLockingBytecode = new LockingBytecodeP2PKH(ownerPkh);\n            require(tx.outputs[0].lockingBytecode == ownerLockingBytecode);\n        }\n    }\n\n    // Emergency withdrawal - requires recovery key (no time restriction)\n    function emergencyWithdraw(pubkey recoveryPk, sig recoverySig) {\n        // Verify recovery key identity\n        require(hash160(recoveryPk) == recoveryPkh);\n        require(checkSig(recoverySig, recoveryPk));\n    }\n\n    // Extend the lock period - owner can delay withdrawal\n    function extendLock(\n        pubkey ownerPk,\n        sig ownerSig,\n        int newUnlockBlock\n    ) {\n        // Verify owner identity\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // New unlock time must be later than current\n        require(newUnlockBlock > unlockBlock);\n\n        // Covenant: output must go back to contract with extended lock\n        // Value must be preserved (minus small fee)\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value >= tx.inputs[0].value - 1000);\n    }\n\n    // Add more funds to the vault (anyone can deposit)\n    function deposit() {\n        // Output must go back to this contract with increased value\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value > tx.inputs[0].value);\n    }\n\n    // Transfer ownership - current owner transfers to new owner\n    function transferOwnership(\n        pubkey ownerPk,\n        sig ownerSig,\n        bytes20 newOwnerPkh\n    ) {\n        // Verify current owner\n        require(hash160(ownerPk) == ownerPkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // New owner must be different\n        require(newOwnerPkh != ownerPkh);\n\n        // Value must be preserved\n        require(tx.outputs[0].value >= tx.inputs[0].value - 1000);\n    }\n}\n",
  debug: {
    bytecode: "5479009c635579a98871ad7cb16d6d51675479519c635579a97888567a567aad7bb175547900a069547900c6a16900c655799402e8039476022202a06300cd00c78800cc78a2690376a91452797e0288ac7e51cd788851cc577902f40194a26975670376a91452797e0288ac7e00cd788875686d6d6d51675479529c635579a97888567a567aad7bb175527900a06900c6537a6e7c02220294a063780222029477689402f4019476022202a06300cd00c78800cc78a2690376a91452797e0288ac7e51cd788875670376a91452797e0288ac7e00cd788875686d6d51675479539c635579a97b8871ad6d6d51675479549c635579a98871ad547a7ba06900cd00c78800cc00c602e80394a2777777675479559c6300cd00c78800cc00c6a0696d6d755167547a569d5479a9788871ad547a87916900cc00c602e80394a2777777686868686868",
    sourceMap: "20:4:27:5;;;;;22:24:22:31;;:16::32:1;:8::46;23:25:23:42:0;:8::45:1;26:27:26:38:0;:8::40:1;20:4:27:5;;;;31::65::0;;;;;37:24:37:31;;:16::32:1;:36::44:0;:8::46:1;38:25:38:33:0;;:35::42;;:8::45:1;41:27:41:38:0;:8::40:1;;44:16:44:30:0;;:33::34;:16:::1;:8::36;45:16:45:30:0;;:44::45;:34::52:1;:16;:8::54;48:40:48:41:0;:30::48:1;:51::65:0;;:30:::1;:68::72:0;:30:::1;51:12:51:27:0;:30::33;:12:::1;:35:60:9:0;53:31:53:32;:20::49:1;:63::64:0;:53::81:1;:12::83;54:31:54:32:0;:20::39:1;:43::58:0;:20:::1;:12::60;57:43:57:77:0;:68::76;;:43::77:1;;;58:31:58:32:0;:20::49:1;:53::73:0;:12::75:1;59:31:59:32:0;:20::39:1;:43::57:0;;:60::63;:43:::1;:20;:12::65;51:35:60:9;60:15:64::0;62:43:62:77;:68::76;;:43::77:1;;;63:31:63:32:0;:20::49:1;:53::73:0;:12::75:1;60:15:64:9;;31:4:65:5;;;;;69::105::0;;;;;71:24:71:31;;:16::32:1;:36::44:0;:8::46:1;72:25:72:33:0;;:35::42;;:8::45:1;75:27:75:38:0;:8::40:1;;78:16:78:29:0;;:32::33;:16:::1;:8::35;81:37:81:38:0;:27::45:1;82:25:82:38:0;;85:12:85:37;;:40::43;:25:::1;:12;:45:87:9:0;86:25:86:37;:40::43;:25:::1;:12::44;85:45:87:9;89:24:89:49;:52::55:0;:24:::1;92:12:92:21:0;:24::27;:12:::1;:29:100:9:0;94:31:94:32;:20::49:1;:63::64:0;:53::81:1;:12::83;95:31:95:32:0;:20::39:1;:43::52:0;:20:::1;:12::54;98:43:98:77:0;:68::76;;:43::77:1;;;99:31:99:32:0;:20::49:1;:53::73:0;:12::75:1;92:29:100:9;100:15:104::0;102:43:102:77;:68::76;;:43::77:1;;;103:31:103:32:0;:20::49:1;:53::73:0;:12::75:1;100:15:104:9;;69:4:105:5;;;;108::112::0;;;;;110:24:110:34;;:16::35:1;:39::50:0;:8::52:1;111:25:111:48:0;:8::51:1;108:4:112:5;;;;115::131::0;;;;;121:24:121:31;;:16::32:1;:8::46;122:25:122:42:0;:8::45:1;125:16:125:30:0;;:33::44;:16:::1;:8::46;129:27:129:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;130:27:130:28:0;:16::35:1;:49::50:0;:39::57:1;:60::64:0;:39:::1;:8::66;115:4:131:5;;;;134::138::0;;;;;136:27:136:28;:16::45:1;:59::60:0;:49::77:1;:8::79;137:27:137:28:0;:16::35:1;:48::49:0;:38::56:1;:16;:8::58;134:4:138:5;;;;;141::155::0;;;;147:24:147:31;;:16::32:1;:36::44:0;:8::46:1;148:25:148:42:0;:8::45:1;151:16:151:27:0;;:::39:1;;:8::41;154:27:154:28:0;:16::35:1;:49::50:0;:39::57:1;:60::64:0;:39:::1;:8::66;141:4:155:5;;;13:0:156:1;;;;;",
    logs: [],
    requires: [
      {
        ip: 12,
        line: 22
      },
      {
        ip: 14,
        line: 23
      },
      {
        ip: 16,
        line: 26
      },
      {
        ip: 30,
        line: 37
      },
      {
        ip: 35,
        line: 38
      },
      {
        ip: 37,
        line: 41
      },
      {
        ip: 43,
        line: 44
      },
      {
        ip: 49,
        line: 45
      },
      {
        ip: 65,
        line: 53
      },
      {
        ip: 70,
        line: 54
      },
      {
        ip: 80,
        line: 58
      },
      {
        ip: 88,
        line: 59
      },
      {
        ip: 100,
        line: 63
      },
      {
        ip: 117,
        line: 71
      },
      {
        ip: 122,
        line: 72
      },
      {
        ip: 124,
        line: 75
      },
      {
        ip: 130,
        line: 78
      },
      {
        ip: 157,
        line: 94
      },
      {
        ip: 162,
        line: 95
      },
      {
        ip: 172,
        line: 99
      },
      {
        ip: 184,
        line: 103
      },
      {
        ip: 200,
        line: 110
      },
      {
        ip: 202,
        line: 111
      },
      {
        ip: 215,
        line: 121
      },
      {
        ip: 217,
        line: 122
      },
      {
        ip: 222,
        line: 125
      },
      {
        ip: 227,
        line: 129
      },
      {
        ip: 235,
        line: 130
      },
      {
        ip: 248,
        line: 136
      },
      {
        ip: 254,
        line: 137
      },
      {
        ip: 268,
        line: 147
      },
      {
        ip: 270,
        line: 148
      },
      {
        ip: 275,
        line: 151
      },
      {
        ip: 283,
        line: 154
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:43:37.574Z"
} as const;