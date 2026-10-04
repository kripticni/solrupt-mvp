/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/l2_owner.json`.
 */
export type L2Owner = {
  "address": "Cm1MRpNCGCVXbft2uKoqhQ81Huw3uUCVnxzBEHqUYwNz",
  "metadata": {
    "name": "l2Owner",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Arena L2: missing owner check (port of z0neSec owner-check, MIT)"
  },
  "instructions": [
    {
      "name": "checkBalanceInsecure",
      "docs": [
        "## INSECURE: balance read, owner never asked",
        "",
        "Attack scenario:",
        "1. A lending flow trusts this check before approving a loan.",
        "2. Attacker creates a System-owned account with fake TokenAccount",
        "bytes: 1_000_000 written at offsets 64..72.",
        "3. The program parses the fabrication and reports a real balance.",
        "The loan that follows is backed by nothing.",
        ""
      ],
      "discriminator": [
        198,
        99,
        72,
        203,
        154,
        155,
        32,
        7
      ],
      "accounts": [
        {
          "name": "tokenAccount"
        }
      ],
      "args": []
    },
    {
      "name": "checkBalanceSecureAnchor",
      "docs": [
        "## SECURE (recommended): the type system checks ownership",
        "",
        "`Account<'info, TokenAccount>` verifies owner plus deserialization",
        "plus discriminator BEFORE the body runs. Less code, fewer places to",
        "forget: the check cannot be skipped at a new call site.",
        ""
      ],
      "discriminator": [
        215,
        235,
        206,
        150,
        145,
        228,
        241,
        239
      ],
      "accounts": [
        {
          "name": "tokenAccount"
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "checkBalanceSecureManual",
      "docs": [
        "## SECURE (manual): refuse any account the Token program does not own",
        "",
        "Same shape as the insecure instruction, plus one explicit owner",
        "compare before parsing. Secure, but every new call site must",
        "remember it.",
        ""
      ],
      "discriminator": [
        219,
        106,
        255,
        246,
        81,
        217,
        239,
        54
      ],
      "accounts": [
        {
          "name": "tokenAccount"
        }
      ],
      "args": []
    },
    {
      "name": "getUserLevelInsecure",
      "docs": [
        "## INSECURE: custom account, same missing question",
        "",
        "The same bug on a program-defined type: a raw `UserProfile` parse",
        "with no owner check. A fabricated account claiming admin passes.",
        ""
      ],
      "discriminator": [
        57,
        139,
        96,
        60,
        156,
        203,
        23,
        6
      ],
      "accounts": [
        {
          "name": "userProfile"
        }
      ],
      "args": []
    },
    {
      "name": "getUserLevelSecure",
      "docs": [
        "## SECURE: the type proves the profile is ours",
        "",
        "`Account<'info, UserProfile>` verifies this program owns the account",
        "plus discriminator plus shape BEFORE the body runs. A fabrication",
        "fails at the door.",
        ""
      ],
      "discriminator": [
        241,
        132,
        81,
        179,
        134,
        79,
        20,
        200
      ],
      "accounts": [
        {
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user_profile.authority",
                "account": "userProfile"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initializeProfile",
      "docs": [
        "Open a user profile for demonstration."
      ],
      "discriminator": [
        32,
        145,
        77,
        213,
        58,
        39,
        251,
        234
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
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
    }
  ],
  "accounts": [
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidOwner",
      "msg": "Account is not owned by the expected program"
    },
    {
      "code": 6001,
      "name": "notTokenOwner",
      "msg": "You do not own this token account"
    },
    {
      "code": 6002,
      "name": "invalidAccountData",
      "msg": "Invalid account data"
    }
  ],
  "types": [
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "isAdmin",
            "type": "bool"
          },
          {
            "name": "level",
            "type": "u32"
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
