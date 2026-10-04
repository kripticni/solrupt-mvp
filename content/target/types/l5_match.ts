/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/l5_match.json`.
 */
export type L5Match = {
  "address": "8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J",
  "metadata": {
    "name": "l5Match",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Arena L5: account data matching (port of z0neSec account-data-matching, MIT)"
  },
  "instructions": [
    {
      "name": "initializeVault",
      "docs": [
        "Open a vault's books for demonstration."
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
        "## INSECURE: a signature is verified, an owner is not",
        "",
        "Attack scenario:",
        "1. Alice opens a vault with 100 units (authority = Alice).",
        "2. Bob calls `withdraw_insecure` with:",
        "* vault = ALICE's vault,",
        "* authority = Bob (Bob signs. A perfectly valid signature),",
        "* destination = Bob.",
        "3. The program sees a signer and funds, checks nothing linking them,",
        "and moves Alice's units to Bob.",
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
          "writable": true
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
    },
    {
      "name": "withdrawSecure",
      "docs": [
        "",
        "## SECURE: the relationship is the check",
        "",
        "`has_one = authority` makes Anchor compare the vault's stored authority",
        "against the signer before the body runs. Bob's signature on Alice's",
        "vault fails validation. The body never executes.",
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
          "signer": true,
          "relations": [
            "vault"
          ]
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
      "name": "authorityMismatch",
      "msg": "Vault authority does not match signer"
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
              "The only signer allowed to drain this vault."
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Bookkeeping balance."
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
