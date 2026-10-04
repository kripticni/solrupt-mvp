/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/l4_cosplay.json`.
 */
export type L4Cosplay = {
  "address": "9QrjdkjrnFXC2kaqB7pb3zUMSDRDmQZrQysiCYRvERZA",
  "metadata": {
    "name": "l4Cosplay",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Arena L4: type cosplay (port of z0neSec type-cosplay, MIT)"
  },
  "instructions": [
    {
      "name": "claimInsecure",
      "docs": [
        "",
        "## INSECURE: bytes read, type never asked",
        "",
        "Attack scenario:",
        "1. Victim registers a `User` (authority = victim).",
        "2. Attacker registers a `Note` (account = attacker). Same layout,",
        "different discriminator, but nobody looks at it here.",
        "3. Attacker calls `claim_insecure` with the Note where a User belongs,",
        "signing as themselves. Bytes 8..40 hold the attacker's key, the",
        "equality check passes, the ledger records a claim.",
        ""
      ],
      "discriminator": [
        51,
        139,
        70,
        249,
        42,
        169,
        172,
        142
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "ledger",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimSecure",
      "docs": [
        "",
        "## SECURE: the discriminator is checked before the body runs",
        "",
        "`Account<'info, User>` proves the bytes are really a User: discriminator",
        "matches, owner is this program, shape deserializes. A Note presented",
        "here fails validation. The body never executes.",
        ""
      ],
      "discriminator": [
        110,
        44,
        254,
        112,
        68,
        144,
        167,
        224
      ],
      "accounts": [
        {
          "name": "user",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
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
          "name": "ledger",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeLedger",
      "docs": [
        "Open the reward ledger for demonstration."
      ],
      "discriminator": [
        104,
        2,
        30,
        235,
        31,
        207,
        174,
        162
      ],
      "accounts": [
        {
          "name": "ledger",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  101,
                  100,
                  103,
                  101,
                  114
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
      "args": []
    },
    {
      "name": "registerNote",
      "docs": [
        "Register a note pointing at anyone (the attacker runs this to sew",
        "the costume: a Note whose first field holds their own key)."
      ],
      "discriminator": [
        178,
        160,
        144,
        97,
        158,
        29,
        83,
        6
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
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
      "args": []
    },
    {
      "name": "registerUser",
      "docs": [
        "Register a genuine user (the victim runs this)."
      ],
      "discriminator": [
        2,
        241,
        150,
        223,
        99,
        214,
        116,
        97
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "ledger",
      "discriminator": [
        43,
        41,
        21,
        213,
        180,
        176,
        95,
        32
      ]
    },
    {
      "name": "note",
      "discriminator": [
        203,
        75,
        252,
        196,
        81,
        210,
        122,
        126
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Stored authority does not match signer"
    },
    {
      "code": 6001,
      "name": "invalidData",
      "msg": "Account data too short to parse"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Arithmetic overflow occurred"
    }
  ],
  "types": [
    {
      "name": "ledger",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claims",
            "docs": [
              "Cumulative claims recorded."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "note",
      "docs": [
        "Note pointing at some account. SAME first field layout as User.",
        "discriminator sha256(\"account:Note\")[..8] is the only difference."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "account",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "user",
      "docs": [
        "Genuine user. Discriminator: sha256(\"account:User\")[..8]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
