export default {
  contractName: "RecurringPaymentVault",
  constructorInputs: [
    {
      name: "payerPkh",
      type: "bytes20"
    },
    {
      name: "payeePkh",
      type: "bytes20"
    },
    {
      name: "paymentAmount",
      type: "int"
    },
    {
      name: "nextPaymentBlock",
      type: "int"
    }
  ],
  abi: [
    {
      name: "claimPayment",
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
      name: "cancel",
      inputs: [
        {
          name: "payerPk",
          type: "pubkey"
        },
        {
          name: "payerSig",
          type: "sig"
        }
      ]
    },
    {
      name: "topUp",
      inputs: [
        {
          name: "payerPk",
          type: "pubkey"
        },
        {
          name: "payerSig",
          type: "sig"
        }
      ]
    },
    {
      name: "executePayment",
      inputs: []
    }
  ],
  bytecode: "OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_2 OP_PICK OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY OP_3 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_0 OP_UTXOVALUE OP_3 OP_PICK e803 OP_ADD OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_3 OP_PICK OP_SUB f401 OP_SUB OP_DUP 2202 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY 76a914 OP_3 OP_PICK OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_5 OP_PICK 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ELSE 76a914 OP_3 OP_PICK OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_DROP OP_ENDIF OP_2DROP OP_2DROP OP_DROP OP_1 OP_ELSE OP_4 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_OVER OP_EQUALVERIFY OP_6 OP_ROLL OP_6 OP_ROLL OP_CHECKSIGVERIFY 76a914 OP_SWAP OP_CAT 88ac OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_PICK OP_2 OP_NUMEQUAL OP_IF OP_5 OP_PICK OP_HASH160 OP_EQUALVERIFY OP_2ROT OP_CHECKSIGVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_GREATERTHAN OP_VERIFY OP_2DROP OP_2DROP OP_1 OP_ELSE OP_4 OP_ROLL OP_3 OP_NUMEQUALVERIFY OP_3 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_0 OP_UTXOVALUE OP_3 OP_PICK e803 OP_ADD OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_UTXOVALUE OP_3 OP_PICK OP_SUB f401 OP_SUB OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_VERIFY 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_ROT 2c01 OP_SUB OP_GREATERTHANOREQUAL OP_NIP OP_ENDIF OP_ENDIF OP_ENDIF",
  source: "// RecurringPaymentVault - Automated recurring payments\n// Real-world use: Subscriptions, rent, salaries, bills\n// Demonstrates practical DeFi automation\n\npragma cashscript ^0.13.0;\n\ncontract RecurringPaymentVault(\n    bytes20 payerPkh,           // Who funds the vault\n    bytes20 payeePkh,           // Who receives payments\n    int paymentAmount,          // Amount per payment\n    int nextPaymentBlock        // Block when next payment is allowed\n) {\n    // Payee claims their recurring payment\n    function claimPayment(pubkey payeePk, sig payeeSig) {\n        // Verify payee\n        require(hash160(payeePk) == payeePkh);\n        require(checkSig(payeeSig, payeePk));\n\n        // Check enough time has passed (next payment block reached)\n        require(tx.time >= nextPaymentBlock);\n\n        // Check vault has enough funds\n        require(tx.inputs[0].value >= paymentAmount + 1000);\n\n        // Calculate remaining\n        int remaining = tx.inputs[0].value - paymentAmount - 500;\n\n        // Create outputs\n        if (remaining > 546) {\n            // Output 0: Updated vault (covenant preserves contract)\n            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n            require(tx.outputs[0].value >= remaining);\n\n            // Output 1: Payment to payee\n            bytes25 payeeLockingBytecode = new LockingBytecodeP2PKH(payeePkh);\n            require(tx.outputs[1].lockingBytecode == payeeLockingBytecode);\n            require(tx.outputs[1].value >= paymentAmount - 300);\n        } else {\n            // Final payment - send all to payee\n            bytes25 payeeLockingBytecode = new LockingBytecodeP2PKH(payeePkh);\n            require(tx.outputs[0].lockingBytecode == payeeLockingBytecode);\n        }\n    }\n\n    // Payer can cancel and withdraw remaining funds\n    function cancel(pubkey payerPk, sig payerSig) {\n        require(hash160(payerPk) == payerPkh);\n        require(checkSig(payerSig, payerPk));\n\n        // Return funds to payer\n        bytes25 payerLockingBytecode = new LockingBytecodeP2PKH(payerPkh);\n        require(tx.outputs[0].lockingBytecode == payerLockingBytecode);\n    }\n\n    // Payer can top up the vault\n    function topUp(pubkey payerPk, sig payerSig) {\n        require(hash160(payerPk) == payerPkh);\n        require(checkSig(payerSig, payerPk));\n\n        // Vault must receive more funds\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value > tx.inputs[0].value);\n    }\n\n    // Anyone can trigger payment if conditions met (automation friendly)\n    // This enables bots/services to execute payments automatically\n    function executePayment() {\n        // Check enough time has passed\n        require(tx.time >= nextPaymentBlock);\n\n        // Check vault has enough funds\n        require(tx.inputs[0].value >= paymentAmount + 1000);\n\n        int remaining = tx.inputs[0].value - paymentAmount - 500;\n\n        // Output 0: Updated vault\n        require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n        require(tx.outputs[0].value >= remaining);\n\n        // Output 1: Payment to payee\n        bytes25 payeeLockingBytecode = new LockingBytecodeP2PKH(payeePkh);\n        require(tx.outputs[1].lockingBytecode == payeeLockingBytecode);\n        require(tx.outputs[1].value >= paymentAmount - 300);\n    }\n}\n",
  debug: {
    bytecode: "5479009c635579a9527988567a567aad537ab17500c6537902e80393a26900c653799402f4019476022202a06300cd00c78800cc78a2690376a91453797e0288ac7e51cd788851cc5579022c0194a26975670376a91453797e0288ac7e00cd788875686d6d7551675479519c635579a97888567a567aad0376a9147c7e0288ac7e00cd886d6d51675479529c635579a98871ad00cd00c78800cc00c6a0696d6d5167547a539d537ab17500c6537902e80393a26900c653799402f4019400cd00c78800cca1690376a9147b7e0288ac7e51cd8851cc7b022c0194a277686868",
    sourceMap: "14:4:43:5;;;;;16:24:16:31;;:16::32:1;:36::44:0;;:8::46:1;17:25:17:33:0;;:35::42;;:8::45:1;20:27:20:43:0;;:8::45:1;;23:26:23:27:0;:16::34:1;:38::51:0;;:54::58;:38:::1;:16;:8::60;26:34:26:35:0;:24::42:1;:45::58:0;;:24:::1;:61::64:0;:24:::1;29:12:29:21:0;:24::27;:12:::1;:29:38:9:0;31:31:31:32;:20::49:1;:63::64:0;:53::81:1;:12::83;32:31:32:32:0;:20::39:1;:43::52:0;:20:::1;:12::54;35:43:35:77:0;:68::76;;:43::77:1;;;36:31:36:32:0;:20::49:1;:53::73:0;:12::75:1;37:31:37:32:0;:20::39:1;:43::56:0;;:59::62;:43:::1;:20;:12::64;29:29:38:9;38:15:42::0;40:43:40:77;:68::76;;:43::77:1;;;41:31:41:32:0;:20::49:1;:53::73:0;:12::75:1;38:15:42:9;;14:4:43:5;;;;;46::53::0;;;;;47:24:47:31;;:16::32:1;:36::44:0;:8::46:1;48:25:48:33:0;;:35::42;;:8::45:1;51:39:51:73:0;:64::72;:39::73:1;;;52:27:52:28:0;:16::45:1;:8::71;46:4:53:5;;;;56::63::0;;;;;57:24:57:31;;:16::32:1;:8::46;58:25:58:42:0;:8::45:1;61:27:61:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;62:27:62:28:0;:16::35:1;:48::49:0;:38::56:1;:16;:8::58;56:4:63:5;;;;67::84::0;;;;69:27:69:43;;:8::45:1;;72:26:72:27:0;:16::34:1;:38::51:0;;:54::58;:38:::1;:16;:8::60;74:34:74:35:0;:24::42:1;:45::58:0;;:24:::1;:61::64:0;:24:::1;77:27:77:28:0;:16::45:1;:59::60:0;:49::77:1;:8::79;78:27:78:28:0;:16::35:1;:::48;:8::50;81:39:81:73:0;:64::72;:39::73:1;;;82:27:82:28:0;:16::45:1;:8::71;83:27:83:28:0;:16::35:1;:39::52:0;:55::58;:39:::1;:8::60;67:4:84:5;7:0:85:1;;",
    logs: [],
    requires: [
      {
        ip: 14,
        line: 16
      },
      {
        ip: 19,
        line: 17
      },
      {
        ip: 22,
        line: 20
      },
      {
        ip: 31,
        line: 23
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
        ip: 62,
        line: 36
      },
      {
        ip: 70,
        line: 37
      },
      {
        ip: 82,
        line: 41
      },
      {
        ip: 99,
        line: 47
      },
      {
        ip: 104,
        line: 48
      },
      {
        ip: 112,
        line: 52
      },
      {
        ip: 125,
        line: 57
      },
      {
        ip: 127,
        line: 58
      },
      {
        ip: 132,
        line: 61
      },
      {
        ip: 138,
        line: 62
      },
      {
        ip: 149,
        line: 69
      },
      {
        ip: 158,
        line: 72
      },
      {
        ip: 170,
        line: 77
      },
      {
        ip: 174,
        line: 78
      },
      {
        ip: 182,
        line: 82
      },
      {
        ip: 189,
        line: 83
      }
    ]
  },
  compiler: {
    name: "cashc",
    version: "0.13.0-next.1"
  },
  updatedAt: "2025-11-22T15:43:37.453Z"
} as const;