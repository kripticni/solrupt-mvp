/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/l1_signer.json`.
 */
export type L1Signer = {
  "address": "JA3qiz3KpQkEtL4bMLWoWazcSHYYrUHyKRg5UgtVkzuA",
  "metadata": {
    "name": "l1Signer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Arena L1: missing signer check (port of z0neSec signer-authorization, MIT)"
  },
  "instructions": [
    {
      "name": "initializeVault",
      "docs": [
        "Initialize a new vault for demonstration"
      ],
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initialBalance",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawInsecure",
      "docs": [
        "",
        "## [INSECURE] INSECURE: Missing Signer Check",
        "",
        "This instruction allows ANYONE to withdraw funds by simply passing any",
        "public key as the `authority`. The program never verifies that the",
        "authority actually signed the transaction.",
        "",
        "### Attack Scenario:",
        "1. Alice has a vault with 100 SOL, authority = Alice's pubkey",
        "2. Attacker calls `withdraw_insecure` with:",
        "- vault = Alice's vault",
        "- authority = Alice's pubkey (NOT signed by Alice!)",
        "3. Program accepts it because it never checks if authority signed",
        "4. Attacker steals Alice's 100 SOL",
        "",
        "### Why This Happens:",
        "The `authority` field is typed as `AccountInfo`, which is just a raw",
        "reference to any account. It doesn't enforce any security checks.",
        ""
      ],
      "discriminator": [
        52,
        106,
        127,
        121,
        117,
        233,
        11,
        29
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSecure",
      "docs": [
        "",
        "## [SECURE] SECURE: Proper Signer Verification",
        "",
        "This instruction properly verifies that the authority has signed the",
        "transaction using Anchor's `Signer<'info>` type.",
        "",
        "### How `Signer` Protects:",
        "1. Anchor automatically checks `authority.is_signer == true`",
        "2. If the account didn't sign, the transaction fails BEFORE your code runs",
        "3. The check happens at the constraint validation phase",
        "",
        "### Attack Attempt (FAILS):",
        "1. Attacker tries to call `withdraw_secure` with Alice's pubkey",
        "2. Transaction fails immediately: \"Signature verification failed\"",
        "3. Alice's funds are safe",
        ""
      ],
      "discriminator": [
        22,
        173,
        114,
        7,
        175,
        179,
        168,
        58
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedAccess",
      "msg": "You are not authorized to perform this action"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in the vault"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Arithmetic overflow occurred"
    }
  ],
  "types": [
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authorized owner who can withdraw from this vault"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Current balance in lamports"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
