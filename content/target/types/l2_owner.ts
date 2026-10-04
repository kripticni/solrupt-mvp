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
        "",
        "## [INSECURE] INSECURE: No Owner Verification",
        "",
        "This instruction reads token balance from an account without verifying",
        "that the account is actually owned by the SPL Token program.",
        "",
        "### Attack Scenario:",
        "1. Lending protocol uses this to check collateral before lending",
        "2. Attacker creates a System Program-owned account",
        "3. Attacker writes fake data that looks like TokenAccount with 1M tokens",
        "4. Program reads the fake balance and approves a massive loan",
        "5. Attacker defaults, protocol loses real funds",
        "",
        "### Why This Happens:",
        "`AccountInfo` is just raw bytes - it doesn't verify:",
        "- Who owns the account",
        "- Whether the data is valid",
        "- Whether it's actually the type we expect",
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
        "",
        "## [SECURE][SECURE] RECOMMENDED: Use Anchor's Account Type",
        "",
        "This is the idiomatic Anchor approach. Using `Account<'info, TokenAccount>`",
        "automatically verifies:",
        "1. The account is owned by SPL Token program",
        "2. The data deserializes correctly to TokenAccount",
        "3. The account is not closed (rent-exempt check)",
        "",
        "### Why This Is Best:",
        "- Less code = fewer bugs",
        "- Anchor handles edge cases",
        "- Compile-time type safety",
        "- Clear intent to code reviewers",
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
        "",
        "## [SECURE] SECURE: Manual Owner Verification",
        "",
        "This version manually checks that the account is owned by the Token program",
        "before trusting its data. This is the \"raw\" approach.",
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
        "",
        "## [INSECURE] INSECURE: Custom Account Without Validation",
        "",
        "This demonstrates the vulnerability with program-defined accounts.",
        "Using raw AccountInfo allows attacker to pass fake UserProfile data.",
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
        "",
        "## [SECURE] SECURE: Custom Account With Full Validation",
        "",
        "Using `Account<'info, UserProfile>` ensures:",
        "1. Account is owned by THIS program",
        "2. Discriminator matches UserProfile type",
        "3. Data deserializes correctly",
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
        "Initialize a user profile for testing"
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
