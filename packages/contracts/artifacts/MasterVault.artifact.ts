export default {
  contractName: "MasterVault",
  constructorInputs: [
    {
      name: "owner1Pkh",
      type: "bytes20"
    },
    {
      name: "owner2Pkh",
      type: "bytes20"
    },
    {
      name: "owner3Pkh",
      type: "bytes20"
    },
    {
      name: "requiredSignatures",
      type: "int"
    },
    {
      name: "unlockBlock",
      type: "int"
    },
    {
      name: "spendingLimit",
      type: "int"
    },
    {
      name: "recurringPayeePkh",
      type: "bytes20"
    },
    {
      name: "recurringAmount",
      type: "int"
    },
    {
      name: "nextPaymentBlock",
      type: "int"
    },
    {
      name: "requiredTokenCategory",
      type: "bytes32"
    }
  ],
  abi: [
    {
      name: "spend",
      inputs: [
        {
          name: "pk1",
          type: "pubkey"
        },
        {
          name: "s1",
          type: "sig"
        },
        {
          name: "pk2",
          type: "pubkey"
        },
        {
          name: "s2",
          type: "sig"
        },
        {
          name: "amount",
          type: "int"
        },
        {
          name: "destinationLockingBytecode",
          type: "bytes25"
        },
        {
          name: "signerMask",
          type: "bytes1"
        }
      ]
    },
    {
      name: "spendWithToken",
      inputs: [
        {
          name: "holderPk",
          type: "pubkey"
        },
        {
          name: "holderSig",
          type: "sig"
        },
        {
          name: "amount",
          type: "int"
        },
        {
          name: "destinationLockingBytecode",
          type: "bytes25"
        },
        {
          name: "tokenInputIndex",
          type: "int"
        }
      ]
    },
    {
      name: "executeRecurring",
      inputs: []
    },
    {
      name: "claimRecurring",
      inputs: [
        {
          name: "payeePk",
          type: "pubkey"
        },
        {
          name: "payeeSig",
          type: "sig"
        }
      ]
    },
    {
      name: "deposit",
      inputs: []
    },
    {
      name: "emergencyWithdraw",
      inputs: [
        {
          name: "pk1",
          type: "pubkey"
        },
        {
          name: "s1",
          type: "sig"
        },
        {
          name: "pk2",
          type: "pubkey"
        },
        {
          name: "s2",
          type: "sig"
        },
        {
          name: "pk3",
          type: "pubkey"
        },
        {
          name: "s3",
          type: "sig"
        },
        {
          name: "destinationLockingBytecode",
          type: "bytes25"
        }
      ]
    },
    {
      name: "updateConfig",
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
          name: "newSpendingLimit",
          type: "int"
        },
        {
          name: "newUnlockBlock",
          type: "int"
        }
      ]
    }
  ],
  bytecode: "OP_10 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 12 OP_PICK OP_1 OP_AND OP_1 OP_EQUAL OP_IF OP_12 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_13 OP_PICK OP_13 OP_PICK OP_CHECKSIGVERIFY OP_DUP OP_1ADD OP_NIP OP_ENDIF 12 OP_ROLL OP_2 OP_AND OP_2 OP_EQUAL OP_IF OP_14 OP_PICK OP_HASH160 OP_3 OP_PICK OP_EQUALVERIFY OP_15 OP_PICK OP_15 OP_PICK OP_CHECKSIGVERIFY OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY OP_3 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_3 OP_PICK OP_CHECKLOCKTIMEVERIFY OP_DROP OP_ENDIF OP_4 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_14 OP_PICK OP_5 OP_PICK OP_LESSTHANOREQUAL OP_VERIFY OP_ENDIF OP_14 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_0 OP_UTXOVALUE OP_15 OP_PICK e803 OP_ADD OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_15 OP_PICK OP_SUB f401 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE 11 OP_PICK OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_16 OP_PICK 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_ELSE OP_0 OP_OUTPUTBYTECODE 11 OP_PICK OP_EQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_10 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_12 OP_ROLL OP_12 OP_ROLL OP_CHECKSIGVERIFY OP_13 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_13 OP_PICK OP_TXINPUTCOUNT OP_LESSTHAN OP_VERIFY OP_13 OP_ROLL OP_UTXOTOKENCATEGORY OP_10 OP_PICK OP_EQUALVERIFY OP_4 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_4 OP_PICK OP_CHECKLOCKTIMEVERIFY OP_DROP OP_ENDIF OP_5 OP_PICK OP_0 OP_GREATERTHAN OP_IF OP_11 OP_PICK OP_6 OP_PICK OP_LESSTHANOREQUAL OP_VERIFY OP_ENDIF OP_11 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_0 OP_UTXOVALUE OP_12 OP_ROLL OP_SUB f401 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_11 OP_PICK OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_13 OP_PICK OP_EQUALVERIFY OP_ELSE OP_0 OP_OUTPUTBYTECODE OP_13 OP_PICK OP_EQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_10 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_7 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_8 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_0 OP_UTXOVALUE OP_8 OP_PICK e803 OP_ADD OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_8 OP_PICK OP_SUB f401 OP_SUB OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_VERIFY 76a914 OP_7 OP_ROLL OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_7 OP_ROLL 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_10 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_11 OP_PICK OP_HASH160 OP_7 OP_PICK OP_EQUALVERIFY OP_12 OP_ROLL OP_12 OP_ROLL OP_CHECKSIGVERIFY OP_8 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_0 OP_UTXOVALUE OP_8 OP_PICK e803 OP_ADD OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_8 OP_PICK OP_SUB f401 OP_SUB OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_VERIFY 76a914 OP_7 OP_ROLL OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_7 OP_ROLL 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_10 OP_PICK OP_4 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHAN OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_10 OP_PICK OP_5 OP_NUMEQUAL OP_IF OP_11 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_11 OP_ROLL OP_11 OP_ROLL OP_CHECKSIGVERIFY OP_DUP 0000000000000000000000000000000000000000 OP_EQUAL OP_NOTIF OP_10 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_11 OP_PICK OP_11 OP_PICK OP_CHECKSIGVERIFY OP_ENDIF OP_OVER 0000000000000000000000000000000000000000 OP_EQUAL OP_NOTIF OP_12 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_13 OP_PICK OP_13 OP_PICK OP_CHECKSIGVERIFY OP_ENDIF OP_0 OP_OUTPUTBYTECODE OP_15 OP_ROLL OP_EQUALVERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_10 OP_ROLL OP_6 OP_NUMEQUALVERIFY OP_10 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_10 OP_ROLL OP_10 OP_ROLL OP_CHECKSIGVERIFY OP_9 OP_ROLL OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_9 OP_ROLL OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE e803 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// MasterVault - All-in-one programmable vault with combined features\n// Combines: TimeLock + Recurring + SpendingLimit + MultiSig + TokenGating\n// Real-world use: Complete treasury management solution\n//\n// DEMONSTRATES: Bitwise Operations (mask-based multi-sig) + P2SH Covenants + CashTokens\n\npragma cashscript ^0.13.0;\n\ncontract MasterVault(\n    // === Multi-Sig Configuration ===\n    bytes20 owner1Pkh,              // Primary owner\n    bytes20 owner2Pkh,              // Secondary owner (or 0x for single owner)\n    bytes20 owner3Pkh,              // Third owner (or 0x for 1-2 owners)\n    int requiredSignatures,         // 1, 2, or 3 signatures required\n\n    // === Time Lock Configuration ===\n    int unlockBlock,                // Block when vault unlocks (0 = no timelock)\n\n    // === Spending Limits ===\n    int spendingLimit,              // Max per transaction (0 = unlimited)\n\n    // === Recurring Payment ===\n    bytes20 recurringPayeePkh,      // Who receives recurring (0x = disabled)\n    int recurringAmount,            // Amount per recurring payment\n    int nextPaymentBlock,           // When next payment is due\n\n    // === Token Gating ===\n    bytes32 requiredTokenCategory   // Required token (0x = no token required)\n) {\n    // ===================================================================\n    // FUNCTION 1: Standard Spend (with all checks)\n    // Combines: TimeLock + SpendingLimit + MultiSig\n    // ===================================================================\n    function spend(\n        pubkey pk1, sig s1,\n        pubkey pk2, sig s2,\n        int amount,\n        bytes25 destinationLockingBytecode,\n        bytes1 signerMask\n    ) {\n        // --- Multi-Sig Verification using BITWISE ---\n        int validSigs = 0;\n\n        // Check owner 1 (bit 0)\n        if ((signerMask & 0x01) == 0x01) {\n            require(hash160(pk1) == owner1Pkh);\n            require(checkSig(s1, pk1));\n            validSigs = validSigs + 1;\n        }\n\n        // Check owner 2 (bit 1)\n        if ((signerMask & 0x02) == 0x02) {\n            require(hash160(pk2) == owner2Pkh);\n            require(checkSig(s2, pk2));\n            validSigs = validSigs + 1;\n        }\n\n        require(validSigs >= requiredSignatures);\n\n        // --- Time Lock Check ---\n        if (unlockBlock > 0) {\n            require(tx.time >= unlockBlock);\n        }\n\n        // --- Spending Limit Check ---\n        if (spendingLimit > 0) {\n            require(amount <= spendingLimit);\n        }\n\n        // --- Execute Spend ---\n        require(amount > 0);\n        require(tx.inputs[0].value >= amount + 1000);\n\n        int remaining = tx.inputs[0].value - amount - 500;\n\n        if (remaining > 546) {\n            // P2SH Covenant: remaining stays in vault\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remaining);\n\n            // Payment to destination\n            require(tx.outputs[1].lockingBytecode == destinationLockingBytecode);\n            require(tx.outputs[1].value >= amount - 300);\n        } else {\n            require(tx.outputs[0].lockingBytecode == destinationLockingBytecode);\n        }\n    }\n\n    // ===================================================================\n    // FUNCTION 2: Token-Gated Spend\n    // Requires holding specific NFT/token to access\n    // ===================================================================\n    function spendWithToken(\n        pubkey holderPk,\n        sig holderSig,\n        int amount,\n        bytes25 destinationLockingBytecode,\n        int tokenInputIndex\n    ) {\n        require(checkSig(holderSig, holderPk));\n\n        // --- Token Gating Check (Composite CashTokens) ---\n        require(tokenInputIndex >= 0);\n        require(tokenInputIndex < tx.inputs.length);\n        require(tx.inputs[tokenInputIndex].tokenCategory == requiredTokenCategory);\n\n        // --- Time Lock Check ---\n        if (unlockBlock > 0) {\n            require(tx.time >= unlockBlock);\n        }\n\n        // --- Spending Limit Check ---\n        if (spendingLimit > 0) {\n            require(amount <= spendingLimit);\n        }\n\n        // --- Execute Spend ---\n        require(amount > 0);\n\n        int remaining = tx.inputs[0].value - amount - 500;\n\n        if (remaining > 546) {\n            // Preserve vault\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remaining);\n\n            // Preserve token\n            require(tx.outputs[0].tokenCategory == requiredTokenCategory);\n\n            // Payment\n            require(tx.outputs[1].lockingBytecode == destinationLockingBytecode);\n        } else {\n            require(tx.outputs[0].lockingBytecode == destinationLockingBytecode);\n        }\n    }\n\n    // ===================================================================\n    // FUNCTION 3: Execute Recurring Payment\n    // Anyone can trigger when payment is due\n    // ===================================================================\n    function executeRecurring() {\n        // Check recurring is enabled\n        require(recurringAmount > 0);\n\n        // Check payment is due\n        require(tx.time >= nextPaymentBlock);\n\n        // Check sufficient funds\n        require(tx.inputs[0].value >= recurringAmount + 1000);\n\n        int remaining = tx.inputs[0].value - recurringAmount - 500;\n\n        // P2SH Covenant: vault continues\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value >= remaining);\n\n        // Payment to recurring payee\n        bytes25 payeeLockingBytecode = new LockingBytecodeP2PKH(recurringPayeePkh);\n        require(tx.outputs[1].lockingBytecode == payeeLockingBytecode);\n        require(tx.outputs[1].value >= recurringAmount - 300);\n    }\n\n    // ===================================================================\n    // FUNCTION 4: Claim Recurring (Payee pulls payment)\n    // ===================================================================\n    function claimRecurring(pubkey payeePk, sig payeeSig) {\n        require(hash160(payeePk) == recurringPayeePkh);\n        require(checkSig(payeeSig, payeePk));\n\n        require(tx.time >= nextPaymentBlock);\n        require(tx.inputs[0].value >= recurringAmount + 1000);\n\n        int remaining = tx.inputs[0].value - recurringAmount - 500;\n\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value >= remaining);\n\n        bytes25 payeeLockingBytecode = new LockingBytecodeP2PKH(recurringPayeePkh);\n        require(tx.outputs[1].lockingBytecode == payeeLockingBytecode);\n        require(tx.outputs[1].value >= recurringAmount - 300);\n    }\n\n    // ===================================================================\n    // FUNCTION 5: Deposit (Anyone can add funds)\n    // ===================================================================\n    function deposit() {\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value > tx.inputs[0].value);\n    }\n\n    // ===================================================================\n    // FUNCTION 6: Emergency Withdrawal (All owners must sign)\n    // Bypasses all limits when all parties agree\n    // ===================================================================\n    function emergencyWithdraw(\n        pubkey pk1, sig s1,\n        pubkey pk2, sig s2,\n        pubkey pk3, sig s3,\n        bytes25 destinationLockingBytecode\n    ) {\n        // ALL configured owners must sign\n        require(hash160(pk1) == owner1Pkh);\n        require(checkSig(s1, pk1));\n\n        // Only check owner2 if configured\n        if (owner2Pkh != 0x0000000000000000000000000000000000000000) {\n            require(hash160(pk2) == owner2Pkh);\n            require(checkSig(s2, pk2));\n        }\n\n        // Only check owner3 if configured\n        if (owner3Pkh != 0x0000000000000000000000000000000000000000) {\n            require(hash160(pk3) == owner3Pkh);\n            require(checkSig(s3, pk3));\n        }\n\n        // Full withdrawal to destination\n        require(tx.outputs[0].lockingBytecode == destinationLockingBytecode);\n    }\n\n    // ===================================================================\n    // FUNCTION 7: Update Configuration (Owner can modify settings)\n    // ===================================================================\n    function updateConfig(\n        pubkey ownerPk,\n        sig ownerSig,\n        int newSpendingLimit,\n        int newUnlockBlock\n    ) {\n        // Primary owner can update\n        require(hash160(ownerPk) == owner1Pkh);\n        require(checkSig(ownerSig, ownerPk));\n\n        // New values must be valid\n        require(newSpendingLimit >= 0);\n        require(newUnlockBlock >= 0);\n\n        // Preserve funds (P2SH covenant)\n        require(tx.outputs[0].value >= tx.inputs[0].value - 1000);\n    }\n}\n",
  debug: {
    bytecode: "5a79009c630001127951845187635c79a95279885d795d79ad768b776801127a52845287635e79a95379885f795f79ad768b7768547aa269537900a0635379b17568547900a0635e795579a169685e7900a06900c65f7902e80393a26900c65f799402f4019476022202a06300cd00c78800cc78a26951cd0111798851cc6079022c0194a2696700cd01117988686d6d6d6d6d6d6d6d7551675a79519c635c7a5c7aad5d7900a2695d79c39f695d7ace5a7988547900a0635479b17568557900a0635b795679a169685b7900a06900c65c7a9402f4019476022202a06300cd00c78800cc78a26900d15b798851cd5d79886700cd5d7988686d6d6d6d6d6d7551675a79529c63577900a069587ab17500c6587902e80393a26900c658799402f4019400cd00c78800cca1690376a914577a7e0288ac7e51cd8851cc577a022c0194a2696d6d6d6d51675a79539c635b79a95779885c7a5c7aad587ab17500c6587902e80393a26900c658799402f4019400cd00c78800cca1690376a914577a7e0288ac7e51cd8851cc577a022c0194a2696d6d6d6d51675a79549c6300cd00c78800cc00c6a0696d6d6d6d6d7551675a79559c635b79a9885b7a5b7aad7614000000000000000000000000000000000000000087645a79a978885b795b79ad687814000000000000000000000000000000000000000087645c79a95279885d795d79ad6800cd5f7a886d6d6d6d6d6d6d51675a7a569d5a79a9885a7a5a7aad597a00a269597a00a26900cc00c602e80394a2696d6d6d6d7551686868686868",
    sourceMap: "34:4:87:5;;;;;42:24:42:25;45:13:45:23;;:26::30;:13:::1;:35::39:0;:12:::1;:41:49:9:0;46:28:46:31;;:20::32:1;:36::45:0;;:12::47:1;47:29:47:31:0;;:33::36;;:12::39:1;48:24:48:33:0;:::37:1;:12::38;45:41:49:9;52:13:52:23:0;;:26::30;:13:::1;:35::39:0;:12:::1;:41:56:9:0;53:28:53:31;;:20::32:1;:36::45:0;;:12::47:1;54:29:54:31:0;;:33::36;;:12::39:1;55:24:55:33:0;:::37:1;:12::38;52:41:56:9;58:29:58:47:0;;:16:::1;:8::49;61:12:61:23:0;;:26::27;:12:::1;:29:63:9:0;62:31:62:42;;:12::44:1;;61:29:63:9;66:12:66:25:0;;:28::29;:12:::1;:31:68:9:0;67:20:67:26;;:30::43;;:20:::1;:12::45;66:31:68:9;71:16:71:22:0;;:25::26;:16:::1;:8::28;72:26:72:27:0;:16::34:1;:38::44:0;;:47::51;:38:::1;:16;:8::53;74:34:74:35:0;:24::42:1;:45::51:0;;:24:::1;:54::57:0;:24:::1;76:12:76:21:0;:24::27;:12:::1;:29:84:9:0;78:31:78:32;:20::49:1;:63::64:0;:53::81:1;:12::83;79:31:79:32:0;:20::39:1;:43::52:0;:20:::1;:12::54;82:31:82:32:0;:20::49:1;:53::79:0;;:12::81:1;83:31:83:32:0;:20::39:1;:43::49:0;;:52::55;:43:::1;:20;:12::57;84:15:86:9:0;85:31:85:32;:20::49:1;:53::79:0;;:12::81:1;84:15:86:9;34:4:87:5;;;;;;;;;;;93::135::0;;;;;100:25:100:34;;:36::44;;:8::47:1;103:16:103:31:0;;:35::36;:16:::1;:8::38;104:16:104:31:0;;:34::50;:16:::1;:8::52;105:26:105:41:0;;:16::56:1;:60::81:0;;:8::83:1;108:12:108:23:0;;:26::27;:12:::1;:29:110:9:0;109:31:109:42;;:12::44:1;;108:29:110:9;113:12:113:25:0;;:28::29;:12:::1;:31:115:9:0;114:20:114:26;;:30::43;;:20:::1;:12::45;113:31:115:9;118:16:118:22:0;;:25::26;:16:::1;:8::28;120:34:120:35:0;:24::42:1;:45::51:0;;:24:::1;:54::57:0;:24:::1;122:12:122:21:0;:24::27;:12:::1;:29:132:9:0;124:31:124:32;:20::49:1;:63::64:0;:53::81:1;:12::83;125:31:125:32:0;:20::39:1;:43::52:0;:20:::1;:12::54;128:31:128:32:0;:20::47:1;:51::72:0;;:12::74:1;131:31:131:32:0;:20::49:1;:53::79:0;;:12::81:1;132:15:134:9:0;133:31:133:32;:20::49:1;:53::79:0;;:12::81:1;132:15:134:9;93:4:135:5;;;;;;;;;141::161::0;;;;;143:16:143:31;;:34::35;:16:::1;:8::37;146:27:146:43:0;;:8::45:1;;149:26:149:27:0;:16::34:1;:38::53:0;;:56::60;:38:::1;:16;:8::62;151:34:151:35:0;:24::42:1;:45::60:0;;:24:::1;:63::66:0;:24:::1;154:27:154:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;155:27:155:28:0;:16::35:1;:::48;:8::50;158:39:158:82:0;:64::81;;:39::82:1;;;159:27:159:28:0;:16::45:1;:8::71;160:27:160:28:0;:16::35:1;:39::54:0;;:57::60;:39:::1;:16;:8::62;141:4:161:5;;;;;;166::181::0;;;;;167:24:167:31;;:16::32:1;:36::53:0;;:8::55:1;168:25:168:33:0;;:35::42;;:8::45:1;170:27:170:43:0;;:8::45:1;;171:26:171:27:0;:16::34:1;:38::53:0;;:56::60;:38:::1;:16;:8::62;173:34:173:35:0;:24::42:1;:45::60:0;;:24:::1;:63::66:0;:24:::1;175:27:175:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;176:27:176:28:0;:16::35:1;:::48;:8::50;178:39:178:82:0;:64::81;;:39::82:1;;;179:27:179:28:0;:16::45:1;:8::71;180:27:180:28:0;:16::35:1;:39::54:0;;:57::60;:39:::1;:16;:8::62;166:4:181:5;;;;;;186::189::0;;;;;187:27:187:28;:16::45:1;:59::60:0;:49::77:1;:8::79;188:27:188:28:0;:16::35:1;:48::49:0;:38::56:1;:16;:8::58;186:4:189:5;;;;;;;;195::219::0;;;;;202:24:202:27;;:16::28:1;:8::43;203:25:203:27:0;;:29::32;;:8::35:1;206:12:206:21:0;:25::67;:12:::1;::209:9:0;207:28:207:31;;:20::32:1;:36::45:0;:12::47:1;208:29:208:31:0;;:33::36;;:12::39:1;206:69:209:9;212:12:212:21:0;:25::67;:12:::1;::215:9:0;213:28:213:31;;:20::32:1;:36::45:0;;:12::47:1;214:29:214:31:0;;:33::36;;:12::39:1;212:69:215:9;218:27:218:28:0;:16::45:1;:49::75:0;;:8::77:1;195:4:219:5;;;;;;;;;224::240::0;;;;231:24:231:31;;:16::32:1;:8::47;232:25:232:33:0;;:35::42;;:8::45:1;235:16:235:32:0;;:36::37;:16:::1;:8::39;236:16:236:30:0;;:34::35;:16:::1;:8::37;239:27:239:28:0;:16::35:1;:49::50:0;:39::57:1;:60::64:0;:39:::1;:16;:8::66;224:4:240:5;;;;;;9:0:241:1;;;;;",
    logs: [],
    requires: [
      {
        ip: 28,
        line: 46
      },
      {
        ip: 33,
        line: 47
      },
      {
        ip: 50,
        line: 53
      },
      {
        ip: 55,
        line: 54
      },
      {
        ip: 63,
        line: 58
      },
      {
        ip: 71,
        line: 62
      },
      {
        ip: 84,
        line: 67
      },
      {
        ip: 90,
        line: 71
      },
      {
        ip: 98,
        line: 72
      },
      {
        ip: 114,
        line: 78
      },
      {
        ip: 119,
        line: 79
      },
      {
        ip: 124,
        line: 82
      },
      {
        ip: 132,
        line: 83
      },
      {
        ip: 138,
        line: 85
      },
      {
        ip: 160,
        line: 100
      },
      {
        ip: 165,
        line: 103
      },
      {
        ip: 170,
        line: 104
      },
      {
        ip: 176,
        line: 105
      },
      {
        ip: 184,
        line: 109
      },
      {
        ip: 197,
        line: 114
      },
      {
        ip: 203,
        line: 118
      },
      {
        ip: 219,
        line: 124
      },
      {
        ip: 224,
        line: 125
      },
      {
        ip: 229,
        line: 128
      },
      {
        ip: 234,
        line: 131
      },
      {
        ip: 240,
        line: 133
      },
      {
        ip: 260,
        line: 143
      },
      {
        ip: 263,
        line: 146
      },
      {
        ip: 272,
        line: 149
      },
      {
        ip: 284,
        line: 154
      },
      {
        ip: 288,
        line: 155
      },
      {
        ip: 297,
        line: 159
      },
      {
        ip: 305,
        line: 160
      },
      {
        ip: 322,
        line: 167
      },
      {
        ip: 327,
        line: 168
      },
      {
        ip: 330,
        line: 170
      },
      {
        ip: 339,
        line: 171
      },
      {
        ip: 351,
        line: 175
      },
      {
        ip: 355,
        line: 176
      },
      {
        ip: 364,
        line: 179
      },
      {
        ip: 372,
        line: 180
      },
      {
        ip: 388,
        line: 187
      },
      {
        ip: 394,
        line: 188
      },
      {
        ip: 411,
        line: 202
      },
      {
        ip: 416,
        line: 203
      },
      {
        ip: 425,
        line: 207
      },
      {
        ip: 430,
        line: 208
      },
      {
        ip: 441,
        line: 213
      },
      {
        ip: 446,
        line: 214
      },
      {
        ip: 452,
        line: 218
      },
      {
        ip: 469,
        line: 231
      },
      {
        ip: 474,
        line: 232
      },
      {
        ip: 479,
        line: 235
      },
      {
        ip: 484,
        line: 236
      },
      {
        ip: 492,
        line: 239
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-24T11:13:37.668Z"
} as const;