/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/l6_vault.json`.
 */
export type L6Vault = {
  "address": "2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib",
  "metadata": {
    "name": "l6Vault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Arena L6: insecure vault capstone (port of z0neSec challenge-1, MIT)"
  },
  "instructions": [
    {
      "name": "deposit",
      "docs": [
        "Honest deposit: anyone may add to any vault (filling the target)."
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "depositor",
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
      "name": "initializeVault",
      "docs": [
        "Open a vault for the victim."
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
        "## INSECURE: withdraw checks nothing about the caller",
        "",
        "No Signer, no authority compare, no has_one. Anyone naming any vault",
        "drains it. Deposit is honest so the vault can fill before the raid.",
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
          "name": "caller"
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
        "## SECURE: authority signs AND matches",
        "",
        "Both halves from lessons 101 and 105 in one struct: `Signer` proves",
        "consent, the equality compare binds it to this vault.",
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
              "The owner on paper. The insecure instruction never reads it."
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Pooled deposits. The raid target."
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
