export default {
  contractName: "MultiSigVault",
  constructorInputs: [
    {
      name: "signer1Pkh",
      type: "bytes20"
    },
    {
      name: "signer2Pkh",
      type: "bytes20"
    },
    {
      name: "signer3Pkh",
      type: "bytes20"
    },
    {
      name: "minSignatures",
      type: "int"
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
          name: "pk3",
          type: "pubkey"
        },
        {
          name: "s3",
          type: "sig"
        },
        {
          name: "approvalMask",
          type: "bytes1"
        }
      ]
    },
    {
      name: "spendTwoOfThree",
      inputs: [
        {
          name: "pkA",
          type: "pubkey"
        },
        {
          name: "sA",
          type: "sig"
        },
        {
          name: "pkB",
          type: "pubkey"
        },
        {
          name: "sB",
          type: "sig"
        },
        {
          name: "signerMask",
          type: "bytes1"
        }
      ]
    },
    {
      name: "emergencyRecovery",
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
          name: "confirmMask",
          type: "bytes1"
        }
      ]
    },
    {
      name: "spendWith1And2",
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
        }
      ]
    },
    {
      name: "spendWith1And3",
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
          name: "pk3",
          type: "pubkey"
        },
        {
          name: "s3",
          type: "sig"
        }
      ]
    },
    {
      name: "spendWith2And3",
      inputs: [
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
        }
      ]
    }
  ],
  bytecode: "OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_12 OP_PICK OP_1 OP_AND OP_1 OP_EQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_7 OP_PICK OP_7 OP_PICK OP_CHECKSIGVERIFY OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_12 OP_PICK OP_2 OP_AND OP_2 OP_EQUAL OP_IF OP_8 OP_PICK OP_HASH160 OP_3 OP_PICK OP_EQUALVERIFY OP_9 OP_PICK OP_9 OP_PICK OP_CHECKSIGVERIFY OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_12 OP_ROLL OP_4 OP_AND OP_4 OP_EQUAL OP_IF OP_10 OP_PICK OP_HASH160 OP_4 OP_PICK OP_EQUALVERIFY OP_11 OP_PICK OP_11 OP_PICK OP_CHECKSIGVERIFY OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_9 OP_PICK OP_3 OP_EQUAL OP_10 OP_PICK OP_5 OP_EQUAL OP_BOOLOR OP_10 OP_PICK OP_6 OP_EQUAL OP_BOOLOR OP_VERIFY OP_9 OP_PICK OP_1 OP_AND OP_1 OP_EQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_6 OP_PICK OP_6 OP_PICK OP_CHECKSIGVERIFY OP_ENDIF OP_9 OP_PICK OP_2 OP_AND OP_2 OP_EQUAL OP_IF OP_9 OP_PICK OP_1 OP_AND OP_1 OP_EQUAL OP_IF OP_7 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_8 OP_PICK OP_8 OP_PICK OP_CHECKSIGVERIFY OP_ELSE OP_5 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_6 OP_PICK OP_6 OP_PICK OP_CHECKSIGVERIFY OP_ENDIF OP_ENDIF OP_9 OP_ROLL OP_4 OP_AND OP_4 OP_EQUAL OP_IF OP_7 OP_PICK OP_HASH160 OP_3 OP_PICK OP_EQUALVERIFY OP_8 OP_PICK OP_8 OP_PICK OP_CHECKSIGVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_4 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_1 OP_2 OP_OR OP_4 OP_OR OP_12 OP_ROLL OP_EQUALVERIFY OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIGVERIFY OP_3 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2SWAP OP_CHECKSIG OP_NIP OP_NIP OP_ELSE OP_4 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG OP_NIP OP_NIP OP_NIP OP_ELSE OP_4 OP_PICK OP_4 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG OP_NIP OP_NIP OP_NIP OP_ELSE OP_4 OP_ROLL OP_5 OP_NUMEQUALVERIFY OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIGVERIFY OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_2SWAP OP_CHECKSIG OP_NIP OP_NIP OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// MultiSigVault - Multi-signature vault with BITWISE operations\n// Demonstrates bitwise operations for efficient multi-party authorization\n// Uses bytes for permission flags with & (AND), | (OR), ^ (XOR) operators\n// BOUNTY TARGET: Bitwise Operations (10M sats)\n\npragma cashscript ^0.13.0;\n\ncontract MultiSigVault(\n    bytes20 signer1Pkh,         // First signer's public key hash\n    bytes20 signer2Pkh,         // Second signer's public key hash\n    bytes20 signer3Pkh,         // Third signer's public key hash\n    int minSignatures           // Minimum signatures required (1, 2, or 3)\n) {\n    // Flexible spend with signature selection using bitwise flags\n    // approvalMask: 0x01 = signer1, 0x02 = signer2, 0x04 = signer3\n    function spend(\n        pubkey pk1, sig s1,\n        pubkey pk2, sig s2,\n        pubkey pk3, sig s3,\n        bytes1 approvalMask\n    ) {\n        int sigCount = 0;\n\n        // Check if signer 1 approved (bit 0 set)\n        // Using bitwise AND to check specific bit\n        bytes1 signer1Flag = approvalMask & 0x01;\n        if (signer1Flag == 0x01) {\n            require(hash160(pk1) == signer1Pkh);\n            require(checkSig(s1, pk1));\n            sigCount = sigCount + 1;\n        }\n\n        // Check if signer 2 approved (bit 1 set)\n        bytes1 signer2Flag = approvalMask & 0x02;\n        if (signer2Flag == 0x02) {\n            require(hash160(pk2) == signer2Pkh);\n            require(checkSig(s2, pk2));\n            sigCount = sigCount + 1;\n        }\n\n        // Check if signer 3 approved (bit 2 set)\n        bytes1 signer3Flag = approvalMask & 0x04;\n        if (signer3Flag == 0x04) {\n            require(hash160(pk3) == signer3Pkh);\n            require(checkSig(s3, pk3));\n            sigCount = sigCount + 1;\n        }\n\n        // Verify minimum signatures requirement\n        require(sigCount >= minSignatures);\n    }\n\n    // Two-of-three spend (explicit function for common case)\n    function spendTwoOfThree(\n        pubkey pkA, sig sA,\n        pubkey pkB, sig sB,\n        bytes1 signerMask\n    ) {\n        // signerMask indicates which two signers are participating\n        // 0x03 = signers 1 and 2\n        // 0x05 = signers 1 and 3\n        // 0x06 = signers 2 and 3\n\n        // Validate exactly 2 bits are set using explicit check\n        // Valid masks: 0x03, 0x05, 0x06\n        require(\n            signerMask == 0x03 ||\n            signerMask == 0x05 ||\n            signerMask == 0x06\n        );\n\n        // Check first signer based on mask using bitwise AND\n        if ((signerMask & 0x01) == 0x01) {\n            require(hash160(pkA) == signer1Pkh);\n            require(checkSig(sA, pkA));\n        }\n\n        // Check second signer (either signer2 or signer3 depending on mask)\n        if ((signerMask & 0x02) == 0x02) {\n            // Signer 2 is participating\n            if ((signerMask & 0x01) == 0x01) {\n                // Mask is 0x03: signer1 was pkA, so signer2 is pkB\n                require(hash160(pkB) == signer2Pkh);\n                require(checkSig(sB, pkB));\n            } else {\n                // Mask is 0x06: signer2 is pkA\n                require(hash160(pkA) == signer2Pkh);\n                require(checkSig(sA, pkA));\n            }\n        }\n\n        // Check third signer if participating\n        if ((signerMask & 0x04) == 0x04) {\n            // Signer 3 is pkB (for masks 0x05 and 0x06)\n            require(hash160(pkB) == signer3Pkh);\n            require(checkSig(sB, pkB));\n        }\n    }\n\n    // Emergency recovery requires ALL signatures (bitwise OR check)\n    function emergencyRecovery(\n        pubkey pk1, sig s1,\n        pubkey pk2, sig s2,\n        pubkey pk3, sig s3,\n        bytes1 confirmMask\n    ) {\n        // All three must confirm - use bitwise OR to build expected mask\n        // confirmMask must equal 0x07 (all bits set: 0x01 | 0x02 | 0x04)\n        bytes1 expectedMask = 0x01 | 0x02 | 0x04;\n        require(confirmMask == expectedMask);\n\n        // All three must sign\n        require(hash160(pk1) == signer1Pkh);\n        require(checkSig(s1, pk1));\n\n        require(hash160(pk2) == signer2Pkh);\n        require(checkSig(s2, pk2));\n\n        require(hash160(pk3) == signer3Pkh);\n        require(checkSig(s3, pk3));\n    }\n\n    // Simple spend with signers 1 and 2 (backward compatible)\n    function spendWith1And2(\n        pubkey pk1, sig s1,\n        pubkey pk2, sig s2\n    ) {\n        require(hash160(pk1) == signer1Pkh);\n        require(checkSig(s1, pk1));\n\n        require(hash160(pk2) == signer2Pkh);\n        require(checkSig(s2, pk2));\n    }\n\n    // Simple spend with signers 1 and 3\n    function spendWith1And3(\n        pubkey pk1, sig s1,\n        pubkey pk3, sig s3\n    ) {\n        require(hash160(pk1) == signer1Pkh);\n        require(checkSig(s1, pk1));\n\n        require(hash160(pk3) == signer3Pkh);\n        require(checkSig(s3, pk3));\n    }\n\n    // Simple spend with signers 2 and 3\n    function spendWith2And3(\n        pubkey pk2, sig s2,\n        pubkey pk3, sig s3\n    ) {\n        require(hash160(pk2) == signer2Pkh);\n        require(checkSig(s2, pk2));\n\n        require(hash160(pk3) == signer3Pkh);\n        require(checkSig(s3, pk3));\n    }\n}\n",
  debug: {
    bytecode: "5479009c63005c7951845187635679a952798857795779ad768b77685c7952845287635879a953798859795979ad768b77685c7a54845487635a79a95479885b795b79ad768b7768547aa2696d6d6d6d6d51675479519c63597953875a7955879b5a7956879b69597951845187635579a9788856795679ad6859795284528763597951845187635779a952798858795879ad675579a952798856795679ad6868597a54845487635779a953798858795879ad686d6d6d6d7551675479529c6351528554855c7a885579a98871ad5479a988547a547aad5379a98872ac7777675479539c635579a98871ad5479a988547a547aac777777675479549c635579a98871ad5479a97b88547a547aac77777767547a559d5479a97b88547a547aad5379a97b8872ac77776868686868",
    sourceMap: "16:4:51:5;;;;;22:23:22:24;26:29:26:41;;:44::48;:29:::1;27:27:27:31:0;:12:::1;:33:31:9:0;28:28:28:31;;:20::32:1;:36::46:0;;:12::48:1;29:29:29:31:0;;:33::36;;:12::39:1;30:23:30:31:0;:::35:1;:12::36;27:33:31:9;34:29:34:41:0;;:44::48;:29:::1;35:27:35:31:0;:12:::1;:33:39:9:0;36:28:36:31;;:20::32:1;:36::46:0;;:12::48:1;37:29:37:31:0;;:33::36;;:12::39:1;38:23:38:31:0;:::35:1;:12::36;35:33:39:9;42:29:42:41:0;;:44::48;:29:::1;43:27:43:31:0;:12:::1;:33:47:9:0;44:28:44:31;;:20::32:1;:36::46:0;;:12::48:1;45:29:45:31:0;;:33::36;;:12::39:1;46:23:46:31:0;:::35:1;:12::36;43:33:47:9;50:28:50:41:0;;:16:::1;:8::43;16:4:51:5;;;;;;;54::98::0;;;;;67:12:67:22;;:26::30;:12:::1;68::68:22:0;;:26::30;:12:::1;67;69::69:22:0;;:26::30;:12:::1;67;66:8:70:10;73:13:73:23:0;;:26::30;:13:::1;:35::39:0;:12:::1;:41:76:9:0;74:28:74:31;;:20::32:1;:36::46:0;:12::48:1;75:29:75:31:0;;:33::36;;:12::39:1;73:41:76:9;79:13:79:23:0;;:26::30;:13:::1;:35::39:0;:12:::1;:41:90:9:0;81:17:81:27;;:30::34;:17:::1;:39::43:0;:16:::1;:45:85:13:0;83:32:83:35;;:24::36:1;:40::50:0;;:16::52:1;84:33:84:35:0;;:37::40;;:16::43:1;85:19:89:13:0;87:32:87:35;;:24::36:1;:40::50:0;;:16::52:1;88:33:88:35:0;;:37::40;;:16::43:1;85:19:89:13;79:41:90:9;93:13:93:23:0;;:26::30;:13:::1;:35::39:0;:12:::1;:41:97:9:0;95:28:95:31;;:20::32:1;:36::46:0;;:12::48:1;96:29:96:31:0;;:33::36;;:12::39:1;93:41:97:9;54:4:98:5;;;;;;;101::121::0;;;;;109:30:109:34;:37::41;:30:::1;:44::48:0;:30:::1;110:16:110:27:0;;:8::45:1;113:24:113:27:0;;:16::28:1;:8::44;114:25:114:32:0;:8::35:1;116:24:116:27:0;;:16::28:1;:8::44;117:25:117:27:0;;:29::32;;:8::35:1;119:24:119:27:0;;:16::28:1;:8::44;120:25:120:32:0;:8::35:1;101:4:121:5;;;124::133::0;;;;;128:24:128:27;;:16::28:1;:8::44;129:25:129:32:0;:8::35:1;131:24:131:27:0;;:16::28:1;:8::44;132:25:132:27:0;;:29::32;;:8::35:1;124:4:133:5;;;;136::145::0;;;;;140:24:140:27;;:16::28:1;:8::44;141:25:141:32:0;:8::35:1;143:24:143:27:0;;:16::28:1;:32::42:0;:8::44:1;144:25:144:27:0;;:29::32;;:8::35:1;136:4:145:5;;;;148::157::0;;;;152:24:152:27;;:16::28:1;:32::42:0;:8::44:1;153:25:153:27:0;;:29::32;;:8::35:1;155:24:155:27:0;;:16::28:1;:32::42:0;:8::44:1;156:25:156:32:0;:8::35:1;148:4:157:5;;8:0:158:1;;;;",
    logs: [],
    requires: [
      {
        ip: 22,
        line: 28
      },
      {
        ip: 27,
        line: 29
      },
      {
        ip: 44,
        line: 36
      },
      {
        ip: 49,
        line: 37
      },
      {
        ip: 66,
        line: 44
      },
      {
        ip: 71,
        line: 45
      },
      {
        ip: 79,
        line: 50
      },
      {
        ip: 106,
        line: 66
      },
      {
        ip: 118,
        line: 74
      },
      {
        ip: 123,
        line: 75
      },
      {
        ip: 144,
        line: 83
      },
      {
        ip: 149,
        line: 84
      },
      {
        ip: 156,
        line: 87
      },
      {
        ip: 161,
        line: 88
      },
      {
        ip: 176,
        line: 95
      },
      {
        ip: 181,
        line: 96
      },
      {
        ip: 202,
        line: 110
      },
      {
        ip: 206,
        line: 113
      },
      {
        ip: 208,
        line: 114
      },
      {
        ip: 212,
        line: 116
      },
      {
        ip: 217,
        line: 117
      },
      {
        ip: 221,
        line: 119
      },
      {
        ip: 224,
        line: 120
      },
      {
        ip: 235,
        line: 128
      },
      {
        ip: 237,
        line: 129
      },
      {
        ip: 241,
        line: 131
      },
      {
        ip: 247,
        line: 132
      },
      {
        ip: 259,
        line: 140
      },
      {
        ip: 261,
        line: 141
      },
      {
        ip: 266,
        line: 143
      },
      {
        ip: 272,
        line: 144
      },
      {
        ip: 284,
        line: 152
      },
      {
        ip: 289,
        line: 153
      },
      {
        ip: 294,
        line: 155
      },
      {
        ip: 297,
        line: 156
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:43:37.422Z"
} as const;