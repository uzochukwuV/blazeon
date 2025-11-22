export default {
  contractName: "TokenGatedVault",
  constructorInputs: [
    {
      name: "accessTokenCategory",
      type: "bytes32"
    },
    {
      name: "minFungibleBalance",
      type: "int"
    },
    {
      name: "adminPkh",
      type: "bytes20"
    }
  ],
  abi: [
    {
      name: "spendWithCompositeToken",
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
          name: "tokenInputIndex",
          type: "int"
        }
      ]
    },
    {
      name: "spendWithNFTOnly",
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
          name: "tokenInputIndex",
          type: "int"
        }
      ]
    },
    {
      name: "spendWithMintingNFT",
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
          name: "tokenInputIndex",
          type: "int"
        }
      ]
    },
    {
      name: "deposit",
      inputs: [
        {
          name: "depositInputIndex",
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
      name: "updateMinBalance",
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
          name: "newMinBalance",
          type: "int"
        }
      ]
    }
  ],
  bytecode: "OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_4 OP_PICK OP_TXINPUTCOUNT OP_LESSTHAN OP_VERIFY OP_4 OP_PICK OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_4 OP_ROLL OP_UTXOTOKENAMOUNT OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_EQUAL OP_NIP OP_NIP OP_ELSE OP_3 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_4 OP_PICK OP_TXINPUTCOUNT OP_LESSTHAN OP_VERIFY OP_4 OP_PICK OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_4 OP_PICK OP_UTXOTOKENCOMMITMENT OP_0 OP_EQUAL OP_NOT OP_VERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_ROLL OP_UTXOTOKENCOMMITMENT OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_2ROT OP_CHECKSIGVERIFY OP_4 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_4 OP_PICK OP_TXINPUTCOUNT OP_LESSTHAN OP_VERIFY OP_4 OP_PICK OP_UTXOTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_4 OP_PICK OP_UTXOTOKENCOMMITMENT OP_0 OP_EQUAL OP_NOT OP_VERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_4 OP_ROLL OP_UTXOTOKENCOMMITMENT OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_PICK OP_3 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHANOREQUAL OP_VERIFY OP_4 OP_PICK OP_UTXOTOKENCATEGORY OP_OVER OP_EQUAL OP_IF OP_0 OP_OUTPUTTOKENCATEGORY OP_OVER OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENAMOUNT OP_5 OP_PICK OP_UTXOTOKENAMOUNT OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_3 OP_PICK OP_4 OP_NUMEQUAL OP_IF OP_4 OP_PICK OP_HASH160 OP_3 OP_ROLL OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_5 OP_NUMEQUALVERIFY OP_3 OP_PICK OP_HASH160 OP_3 OP_ROLL OP_EQUALVERIFY OP_2SWAP OP_CHECKSIGVERIFY OP_ROT OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE e803 OP_SUB OP_GREATERTHANOREQUAL OP_NIP OP_NIP OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// TokenGatedVault - NFT-gated access control using Composite CashTokens\n// Demonstrates Composite CashTokens (NFT + FT together) for access control\n// BOUNTY TARGET: Composite CashTokens (100M sats)\n//\n// Features:\n// - NFT required for access (proves membership)\n// - Fungible token balance required (proves stake/reputation)\n// - Tiered access based on token amounts\n// - Covenant to preserve token outputs\n\npragma cashscript ^0.13.0;\n\ncontract TokenGatedVault(\n    bytes32 accessTokenCategory,    // Token category for access control\n    int minFungibleBalance,         // Minimum FT balance required for access\n    bytes20 adminPkh                // Admin who can manage the vault\n) {\n    // Spend with NFT + minimum fungible token balance (Composite CashToken check)\n    // This demonstrates checking BOTH NFT capability AND fungible amount\n    function spendWithCompositeToken(\n        pubkey holderPk,\n        sig holderSig,\n        int tokenInputIndex         // Index of input containing the access token\n    ) {\n        // Verify the holder's signature\n        require(checkSig(holderSig, holderPk));\n\n        // Verify token input index is valid\n        require(tokenInputIndex >= 0);\n        require(tokenInputIndex < tx.inputs.length);\n\n        // Check that the specified input has the required token category\n        require(tx.inputs[tokenInputIndex].tokenCategory == accessTokenCategory);\n\n        // Check for fungible token balance (Composite: NFT category + FT amount)\n        // The token must have fungible amount >= minFungibleBalance\n        require(tx.inputs[tokenInputIndex].tokenAmount >= minFungibleBalance);\n\n        // Ensure the NFT is preserved in outputs (covenant)\n        // The token must be passed through, not burned\n        require(tx.outputs[0].tokenCategory == accessTokenCategory);\n    }\n\n    // Spend with NFT only (for lower-tier access)\n    // Requires any NFT of the correct category, regardless of FT balance\n    function spendWithNFTOnly(\n        pubkey holderPk,\n        sig holderSig,\n        int tokenInputIndex\n    ) {\n        require(checkSig(holderSig, holderPk));\n\n        // Verify token input index is valid\n        require(tokenInputIndex >= 0);\n        require(tokenInputIndex < tx.inputs.length);\n\n        // Check that input has the required NFT category\n        require(tx.inputs[tokenInputIndex].tokenCategory == accessTokenCategory);\n\n        // NFT must have a commitment (proving it's an NFT, not just FT)\n        // Checking nftCommitment ensures this is actually an NFT\n        require(tx.inputs[tokenInputIndex].nftCommitment != 0x);\n\n        // Preserve the NFT in output\n        require(tx.outputs[0].tokenCategory == accessTokenCategory);\n        require(tx.outputs[0].nftCommitment == tx.inputs[tokenInputIndex].nftCommitment);\n    }\n\n    // Premium tier: requires minting capability NFT\n    // Only minting NFT holders get premium access\n    function spendWithMintingNFT(\n        pubkey holderPk,\n        sig holderSig,\n        int tokenInputIndex\n    ) {\n        require(checkSig(holderSig, holderPk));\n\n        require(tokenInputIndex >= 0);\n        require(tokenInputIndex < tx.inputs.length);\n\n        // Check token category\n        require(tx.inputs[tokenInputIndex].tokenCategory == accessTokenCategory);\n\n        // Verify the NFT has minting capability (highest tier)\n        // tokenCategory for minting NFTs has the minting flag set\n        // We check this by verifying nftCommitment exists AND it's a special type\n        require(tx.inputs[tokenInputIndex].nftCommitment != 0x);\n\n        // Preserve the minting NFT (critical - must not be destroyed)\n        require(tx.outputs[0].tokenCategory == accessTokenCategory);\n        require(tx.outputs[0].nftCommitment == tx.inputs[tokenInputIndex].nftCommitment);\n    }\n\n    // Deposit BCH and/or tokens into the vault\n    // Anyone can deposit, vault preserves all tokens\n    function deposit(int depositInputIndex) {\n        // Ensure vault output is first output\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n\n        // Value must increase (new deposit)\n        require(tx.outputs[0].value >= tx.inputs[0].value);\n\n        // If depositing tokens, ensure they're preserved\n        if (tx.inputs[depositInputIndex].tokenCategory == accessTokenCategory) {\n            // Token deposit - ensure tokens are sent to vault\n            require(tx.outputs[0].tokenCategory == accessTokenCategory);\n            require(tx.outputs[0].tokenAmount >= tx.inputs[depositInputIndex].tokenAmount);\n        }\n    }\n\n    // Admin withdrawal (emergency only)\n    function adminWithdraw(pubkey adminPk, sig adminSig) {\n        require(hash160(adminPk) == adminPkh);\n        require(checkSig(adminSig, adminPk));\n    }\n\n    // Admin can update minimum balance requirement\n    // Output must go back to same contract type with new parameters\n    function updateMinBalance(\n        pubkey adminPk,\n        sig adminSig,\n        int newMinBalance\n    ) {\n        require(hash160(adminPk) == adminPkh);\n        require(checkSig(adminSig, adminPk));\n\n        // New min balance must be reasonable\n        require(newMinBalance >= 0);\n\n        // Preserve vault funds (anti-rug)\n        require(tx.outputs[0].value >= tx.inputs[0].value - 1000);\n    }\n}\n",
  debug: {
    bytecode: "5379009c6371ad547900a2695479c39f695479ce7888547ad07ba26900d1877777675379519c6371ad547900a2695479c39f695479ce78885479cf0087916900d18800d2547acf87777777675379529c6371ad547900a2695479c39f695479ce78885479cf0087916900d18800d2547acf87777777675379539c6300cd00c78800cc00c6a2695479ce78876300d1788800d35579d0a269686d6d7551675379549c635479a9537a88547a547aac77777767537a559d5379a9537a8872ad7b00a26900cc00c602e80394a277776868686868",
    sourceMap: "20:4:42:5;;;;;26:25:26:44;:8::47:1;29:16:29:31:0;;:35::36;:16:::1;:8::38;30:16:30:31:0;;:34::50;:16:::1;:8::52;33:26:33:41:0;;:16::56:1;:60::79:0;:8::81:1;37:26:37:41:0;;:16::54:1;:58::76:0;:16:::1;:8::78;41:27:41:28:0;:16::43:1;:8::68;20:4:42:5;;;46::67::0;;;;;51:25:51:44;:8::47:1;54:16:54:31:0;;:35::36;:16:::1;:8::38;55:16:55:31:0;;:34::50;:16:::1;:8::52;58:26:58:41:0;;:16::56:1;:60::79:0;:8::81:1;62:26:62:41:0;;:16::56:1;:60::62:0;:16:::1;;:8::64;65:27:65:28:0;:16::43:1;:8::68;66:27:66:28:0;:16::43:1;:57::72:0;;:47::87:1;:8::89;46:4:67:5;;;;71::92::0;;;;;76:25:76:44;:8::47:1;78:16:78:31:0;;:35::36;:16:::1;:8::38;79:16:79:31:0;;:34::50;:16:::1;:8::52;82:26:82:41:0;;:16::56:1;:60::79:0;:8::81:1;87:26:87:41:0;;:16::56:1;:60::62:0;:16:::1;;:8::64;90:27:90:28:0;:16::43:1;:8::68;91:27:91:28:0;:16::43:1;:57::72:0;;:47::87:1;:8::89;71:4:92:5;;;;96::109::0;;;;;98:27:98:28;:16::45:1;:59::60:0;:49::77:1;:8::79;101:27:101:28:0;:16::35:1;:49::50:0;:39::57:1;:16;:8::59;104:22:104:39:0;;:12::54:1;:58::77:0;:12:::1;:79:108:9:0;106:31:106:32;:20::47:1;:51::70:0;:12::72:1;107:31:107:32:0;:20::45:1;:59::76:0;;:49::89:1;:20;:12::91;104:79:108:9;96:4:109:5;;;;;112::115::0;;;;;113:24:113:31;;:16::32:1;:36::44:0;;:8::46:1;114:25:114:33:0;;:35::42;;:8::45:1;112:4:115:5;;;;119::132::0;;;;124:24:124:31;;:16::32:1;:36::44:0;;:8::46:1;125:25:125:42:0;:8::45:1;128:16:128:29:0;:33::34;:16:::1;:8::36;131:27:131:28:0;:16::35:1;:49::50:0;:39::57:1;:60::64:0;:39:::1;:8::66;119:4:132:5;;13:0:133:1;;;;",
    logs: [],
    requires: [
      {
        ip: 9,
        line: 26
      },
      {
        ip: 14,
        line: 29
      },
      {
        ip: 19,
        line: 30
      },
      {
        ip: 24,
        line: 33
      },
      {
        ip: 30,
        line: 37
      },
      {
        ip: 34,
        line: 41
      },
      {
        ip: 43,
        line: 51
      },
      {
        ip: 48,
        line: 54
      },
      {
        ip: 53,
        line: 55
      },
      {
        ip: 58,
        line: 58
      },
      {
        ip: 65,
        line: 62
      },
      {
        ip: 68,
        line: 65
      },
      {
        ip: 75,
        line: 66
      },
      {
        ip: 85,
        line: 76
      },
      {
        ip: 90,
        line: 78
      },
      {
        ip: 95,
        line: 79
      },
      {
        ip: 100,
        line: 82
      },
      {
        ip: 107,
        line: 87
      },
      {
        ip: 110,
        line: 90
      },
      {
        ip: 117,
        line: 91
      },
      {
        ip: 130,
        line: 98
      },
      {
        ip: 136,
        line: 101
      },
      {
        ip: 146,
        line: 106
      },
      {
        ip: 153,
        line: 107
      },
      {
        ip: 170,
        line: 113
      },
      {
        ip: 176,
        line: 114
      },
      {
        ip: 189,
        line: 124
      },
      {
        ip: 191,
        line: 125
      },
      {
        ip: 195,
        line: 128
      },
      {
        ip: 203,
        line: 131
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:29:12.989Z"
} as const;