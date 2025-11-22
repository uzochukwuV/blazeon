export default {
  contractName: "StreamVault",
  constructorInputs: [
    {
      name: "senderPkh",
      type: "bytes20"
    },
    {
      name: "recipientPkh",
      type: "bytes20"
    },
    {
      name: "totalAmount",
      type: "int"
    },
    {
      name: "startBlock",
      type: "int"
    },
    {
      name: "endBlock",
      type: "int"
    }
  ],
  abi: [
    {
      name: "claimAll",
      inputs: [
        {
          name: "recipientPk",
          type: "pubkey"
        },
        {
          name: "recipientSig",
          type: "sig"
        }
      ]
    },
    {
      name: "claimPartial",
      inputs: [
        {
          name: "recipientPk",
          type: "pubkey"
        },
        {
          name: "recipientSig",
          type: "sig"
        },
        {
          name: "claimAmount",
          type: "int"
        }
      ]
    },
    {
      name: "senderCancel",
      inputs: [
        {
          name: "senderPk",
          type: "pubkey"
        },
        {
          name: "senderSig",
          type: "sig"
        }
      ]
    },
    {
      name: "mutualCancel",
      inputs: [
        {
          name: "senderPk",
          type: "pubkey"
        },
        {
          name: "senderSig",
          type: "sig"
        },
        {
          name: "recipientPk",
          type: "pubkey"
        },
        {
          name: "recipientSig",
          type: "sig"
        },
        {
          name: "recipientShare",
          type: "int"
        }
      ]
    }
  ],
  bytecode: "OP_5 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_7 OP_ROLL OP_7 OP_ROLL OP_CHECKSIGVERIFY OP_4 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_5 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_7 OP_ROLL OP_7 OP_ROLL OP_CHECKSIGVERIFY OP_3 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_5 OP_PICK OP_0 OP_GREATERTHAN OP_VERIFY OP_5 OP_PICK OP_3 OP_PICK OP_LESSTHANOREQUAL OP_VERIFY OP_ROT OP_5 OP_PICK OP_SUB 76a914 OP_3 OP_ROLL OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_5 OP_ROLL f401 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_DUP 2202 OP_GREATERTHAN OP_IF OP_1 OP_OUTPUTVALUE OP_OVER f401 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_2DROP OP_2DROP OP_1 OP_ELSE OP_5 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_6 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_7 OP_ROLL OP_7 OP_ROLL OP_CHECKSIGVERIFY 76a914 OP_SWAP OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_5 OP_ROLL OP_3 OP_NUMEQUALVERIFY OP_5 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_5 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_5 OP_PICK OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_5 OP_PICK OP_3 OP_PICK OP_LESSTHANOREQUAL OP_VERIFY OP_ROT OP_5 OP_PICK OP_SUB OP_5 OP_PICK 2202 OP_GREATERTHAN OP_IF 76a914 OP_3 OP_PICK OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_7 OP_PICK 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ENDIF 2202 OP_GREATERTHAN OP_IF 76a914 OP_OVER OP_CAT 88ac OP_CAT OP_5 OP_PICK 2202 OP_GREATERTHAN OP_IF OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_ELSE OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_ENDIF OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_DROP OP_1 OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// StreamVault - Streaming payments with time-based vesting\n// Allows linear release of funds over time\n// Recipient can claim earned funds, sender can cancel and get remaining\n\npragma cashscript ^0.13.0;\n\ncontract StreamVault(\n    bytes20 senderPkh,          // Stream creator's public key hash\n    bytes20 recipientPkh,       // Recipient's public key hash\n    int totalAmount,            // Total amount to stream (in satoshis)\n    int startBlock,             // Block when streaming begins\n    int endBlock                // Block when streaming ends\n) {\n    // Recipient claims all vested funds after stream ends\n    function claimAll(pubkey recipientPk, sig recipientSig) {\n        // Verify recipient identity\n        require(hash160(recipientPk) == recipientPkh);\n        require(checkSig(recipientSig, recipientPk));\n\n        // Verify stream period has ended\n        require(tx.time >= endBlock);\n\n        // All funds go to recipient\n        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipientPkh);\n        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n    }\n\n    // Recipient claims partial funds (must be after start)\n    function claimPartial(pubkey recipientPk, sig recipientSig, int claimAmount) {\n        // Verify recipient identity\n        require(hash160(recipientPk) == recipientPkh);\n        require(checkSig(recipientSig, recipientPk));\n\n        // Must be after stream start\n        require(tx.time >= startBlock);\n\n        // Verify claim amount is reasonable (not more than total)\n        require(claimAmount > 0);\n        require(claimAmount <= totalAmount);\n\n        // Remaining goes back to contract, claimed goes to recipient\n        int remaining = totalAmount - claimAmount;\n\n        // Output 0: Recipient gets claimed amount\n        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipientPkh);\n        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n        require(tx.outputs[0].value >= claimAmount - 500);\n\n        // Output 1: Remaining stays locked (if any significant amount)\n        if (remaining > 546) {\n            require(tx.outputs[1].value >= remaining - 500);\n        }\n    }\n\n    // Sender can always cancel (with recipient getting any vested portion)\n    function senderCancel(pubkey senderPk, sig senderSig) {\n        // Verify sender identity\n        require(hash160(senderPk) == senderPkh);\n        require(checkSig(senderSig, senderPk));\n\n        // Funds return to sender (recipient can use mutualCancel for fair split)\n        bytes25 senderLockingBytecode = new LockingBytecodeP2PKH(senderPkh);\n        require(tx.outputs[0].lockingBytecode == senderLockingBytecode);\n    }\n\n    // Emergency: both parties agree to split\n    function mutualCancel(\n        pubkey senderPk, sig senderSig,\n        pubkey recipientPk, sig recipientSig,\n        int recipientShare\n    ) {\n        // Verify both identities\n        require(hash160(senderPk) == senderPkh);\n        require(checkSig(senderSig, senderPk));\n        require(hash160(recipientPk) == recipientPkh);\n        require(checkSig(recipientSig, recipientPk));\n\n        // Verify share is valid\n        require(recipientShare >= 0);\n        require(recipientShare <= totalAmount);\n\n        int senderShare = totalAmount - recipientShare;\n\n        // Output 0: Recipient's share\n        if (recipientShare > 546) {\n            bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipientPkh);\n            require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n            require(tx.outputs[0].value >= recipientShare - 300);\n        }\n\n        // Output 1: Sender's share (if recipient got something)\n        // Output 0: Sender's share (if recipient got nothing)\n        if (senderShare > 546) {\n            bytes25 senderLockingBytecode = new LockingBytecodeP2PKH(senderPkh);\n            if (recipientShare > 546) {\n                require(tx.outputs[1].lockingBytecode == senderLockingBytecode);\n            } else {\n                require(tx.outputs[0].lockingBytecode == senderLockingBytecode);\n            }\n        }\n    }\n}\n",
  debug: {
    bytecode: "5579009c635679a9527988577a577aad547ab1750376a9147b7e0288ac7e00cd886d6d51675579519c635679a9527988577a577aad537ab175557900a06955795379a1697b5579940376a914537a7e0288ac7e00cd8800cc557a02f40194a26976022202a06351cc7802f40194a269686d6d51675579529c635679a97888577a577aad0376a9147c7e0288ac7e00cd886d6d755167557a539d5579a97888567a567aad5579a9527988567a567aad557900a26955795379a1697b5579945579022202a0630376a91453797e0288ac7e00cd788800cc5779022c0194a2697568022202a0630376a914787e0288ac7e5579022202a06351cd78886700cd78886875686d6d7551686868",
    sourceMap: "15:4:26:5;;;;;17:24:17:35;;:16::36:1;:40::52:0;;:8::54:1;18:25:18:37:0;;:39::50;;:8::53:1;21:27:21:35:0;;:8::37:1;;24:43:24:81:0;:68::80;:43::81:1;;;25:27:25:28:0;:16::45:1;:8::75;15:4:26:5;;;;29::53::0;;;;;31:24:31:35;;:16::36:1;:40::52:0;;:8::54:1;32:25:32:37:0;;:39::50;;:8::53:1;35:27:35:37:0;;:8::39:1;;38:16:38:27:0;;:30::31;:16:::1;:8::33;39:16:39:27:0;;:31::42;;:16:::1;:8::44;42:24:42:35:0;:38::49;;:24:::1;45:43:45:81:0;:68::80;;:43::81:1;;;46:27:46:28:0;:16::45:1;:8::75;47:27:47:28:0;:16::35:1;:39::50:0;;:53::56;:39:::1;:16;:8::58;50:12:50:21:0;:24::27;:12:::1;:29:52:9:0;51:31:51:32;:20::39:1;:43::52:0;:55::58;:43:::1;:20;:12::60;50:29:52:9;29:4:53:5;;;;56::64::0;;;;;58:24:58:32;;:16::33:1;:37::46:0;:8::48:1;59:25:59:34:0;;:36::44;;:8::47:1;62:40:62:75:0;:65::74;:40::75:1;;;63:27:63:28:0;:16::45:1;:8::72;56:4:64:5;;;;;67::101::0;;;;73:24:73:32;;:16::33:1;:37::46:0;:8::48:1;74:25:74:34:0;;:36::44;;:8::47:1;75:24:75:35:0;;:16::36:1;:40::52:0;;:8::54:1;76:25:76:37:0;;:39::50;;:8::53:1;79:16:79:30:0;;:34::35;:16:::1;:8::37;80:16:80:30:0;;:34::45;;:16:::1;:8::47;82:26:82:37:0;:40::54;;:26:::1;85:12:85:26:0;;:29::32;:12:::1;:34:89:9:0;86:47:86:85;:72::84;;:47::85:1;;;87:31:87:32:0;:20::49:1;:53::77:0;:12::79:1;88:31:88:32:0;:20::39:1;:43::57:0;;:60::63;:43:::1;:20;:12::65;85:34:89:9;;93:26:93:29:0;:12:::1;:31:100:9:0;94:44:94:79;:69::78;:44::79:1;;;95:16:95:30:0;;:33::36;:16:::1;:38:97:13:0;96:35:96:36;:24::53:1;:57::78:0;:16::80:1;97:19:99:13:0;98:35:98:36;:24::53:1;:57::78:0;:16::80:1;97:19:99:13;93:31:100:9;;67:4:101:5;;;;7:0:102:1;;",
    logs: [],
    requires: [
      {
        ip: 15,
        line: 17
      },
      {
        ip: 20,
        line: 18
      },
      {
        ip: 23,
        line: 21
      },
      {
        ip: 32,
        line: 25
      },
      {
        ip: 47,
        line: 31
      },
      {
        ip: 52,
        line: 32
      },
      {
        ip: 55,
        line: 35
      },
      {
        ip: 61,
        line: 38
      },
      {
        ip: 67,
        line: 39
      },
      {
        ip: 80,
        line: 46
      },
      {
        ip: 88,
        line: 47
      },
      {
        ip: 99,
        line: 51
      },
      {
        ip: 114,
        line: 58
      },
      {
        ip: 119,
        line: 59
      },
      {
        ip: 127,
        line: 63
      },
      {
        ip: 141,
        line: 73
      },
      {
        ip: 146,
        line: 74
      },
      {
        ip: 152,
        line: 75
      },
      {
        ip: 157,
        line: 76
      },
      {
        ip: 162,
        line: 79
      },
      {
        ip: 168,
        line: 80
      },
      {
        ip: 187,
        line: 87
      },
      {
        ip: 195,
        line: 88
      },
      {
        ip: 214,
        line: 96
      },
      {
        ip: 219,
        line: 98
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:29:12.903Z"
} as const;