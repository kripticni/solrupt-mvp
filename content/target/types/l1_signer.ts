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
        "Open a vault for demonstration."
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
        "## INSECURE: authority compared, signature never checked",
        "",
        "Attack scenario:",
        "1. Alice holds a vault (authority = Alice).",
        "2. Attacker calls `withdraw_insecure` with:",
        "- vault = Alice's vault,",
        "- authority = Alice's pubkey (passed, NOT signed).",
        "3. The equality check compares names, never signatures. Funds move.",
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
        "## SECURE: the signature is checked before the body runs",
        "",
        "`Signer<'info>` makes Anchor verify `is_signer` during validation, so",
        "an unsigned authority fails before the instruction body executes.",
        "Same shape, same inputs. The attacker's transaction never reaches",
        "the equality check.",
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
              "Who may withdraw (checked against a Signer on the secure side)."
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Bookkeeping balance in lamports."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
