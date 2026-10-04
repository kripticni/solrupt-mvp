// TS side of the verifier boundary (19 §4.2, scope §11 bridge: official `litesvm`
// npm wrapper primary). Fresh LiteSVM per call (hermetic, UUID-per-run isolation
// at the session layer). Room logic = predicate registry (pure pre/post fns).
// L1 is wired; other rooms throw VerifierUnavailable until their track lands.
// Every PASS verdict pairs exploit-vs-vuln (state moved) with exploit-vs-fixed
// (refused): the negative control runs INSIDE the verdict, never as an afterthought.
import { createHash } from "node:crypto";
import { LiteSVM, FailedTransactionMetadata } from "litesvm";
import {
	AccountRole,
	address,
	appendTransactionMessageInstruction,
	createKeyPairSignerFromPrivateKeyBytes,
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
import { contentDir } from "$lib/server/paths.js";
import { loadRooms } from "$lib/server/rooms/loader.js";
import type { Verdict } from "$lib/shared/types.js";
import { join } from "node:path";

export class VerifierUnavailable extends Error {
	constructor(room: string) {
		super(`no wired verifier for room: ${room}`);
	}
}

export class FixedPassed extends Error {
	constructor(room: string) {
		super(`CRITICAL lab broken: exploit passed the fixed program (${room})`);
	}
}

const L1_PROGRAM = "JA3qiz3KpQkEtL4bMLWoWazcSHYYrUHyKRg5UgtVkzuA";
const L2_PROGRAM = "Cm1MRpNCGCVXbft2uKoqhQ81Huw3uUCVnxzBEHqUYwNz";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const L3_PROGRAM = "HuKUtxW8Y6BWhfyXftZMS1BqENagBJzZFWMzjhx1tCFf";
const L4_PROGRAM = "9QrjdkjrnFXC2kaqB7pb3zUMSDRDmQZrQysiCYRvERZA";
const L5_PROGRAM = "8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J";
const L6_PROGRAM = "2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib";
const L7_PROGRAM = "392HD9NFyhZpR45PcBAJRNrQZ1EAifUSJARCDxW3oEmK";
const INITIAL = 100_000_000n;

/** Deterministic per-session fake account for L2 (stable target the lab shows).
 * Same session → same address, every call. The harness fabricates its bytes;
 * the player supplies the amount they claim. */
export async function fakeFor(session: string) {
	const seed = createHash("sha256").update(`arena-fake-v1:${session}`).digest();
	const fake = await createKeyPairSignerFromPrivateKeyBytes(new Uint8Array(seed));
	return { fake: fake.address };
}
/** Deterministic per-session costume prop (stable target the lab shows).
 * Same session → same address, every call. The harness fabricates its bytes;
 * the player pastes the address and signs as themselves. */
export async function noteFor(session: string) {
	const seed = createHash("sha256").update(`arena-note-v1:${session}`).digest();
	const note = await createKeyPairSignerFromPrivateKeyBytes(new Uint8Array(seed));
	return { note: note.address };
}
/** Deterministic per-session ledger PDA (stable target the lab shows).
 * Derived [ledger, victim] under the L4 program; the harness opens it with
 * the victim as payer before the attack. */
export async function ledgerFor(session: string) {
	const { victim } = await victimForProgram(session, L4_PROGRAM);
	const [ledger] = await getProgramDerivedAddress({
		programAddress: address(L4_PROGRAM),
		seeds: [new TextEncoder().encode("ledger"), getAddressCodec().encode(victim.address)]
	});
	return { ledger };
}
/** Deterministic per-session victim (stable target the lab can display).
 * Same session → same victim → same vault, every call. No DB change needed. */
export async function victimFor(session: string) {
	const seed = createHash("sha256").update(`arena-victim-v1:${session}`).digest();
	const victim = await createKeyPairSignerFromPrivateKeyBytes(new Uint8Array(seed));
	const [vault] = await getProgramDerivedAddress({
		programAddress: address(L1_PROGRAM),
		seeds: [new TextEncoder().encode("vault"), getAddressCodec().encode(victim.address)]
	});
	return { victim, vault };
}

export async function victimForProgram(session: string, program: string) {
	const seed = createHash("sha256").update(`arena-victim-v1:${session}:${program}`).digest();
	const victim = await createKeyPairSignerFromPrivateKeyBytes(new Uint8Array(seed));
	const [vault] = await getProgramDerivedAddress({
		programAddress: address(program),
		seeds: [new TextEncoder().encode("vault"), getAddressCodec().encode(victim.address)]
	});
	return { victim, vault };
}

const disc = (name: string) =>
	Uint8Array.from(createHash("sha256").update(`global:${name}`).digest().subarray(0, 8));

const accountDisc = (name: string) =>
	Uint8Array.from(createHash("sha256").update(`account:${name}`).digest().subarray(0, 8));

const u64le = (n: bigint) => {
	const b = Buffer.alloc(8);
	b.writeBigUInt64LE(n);
	return new Uint8Array(b);
};

interface ParsedExploit {
	vault: string;
	authority: string;
	instruction: string;
	amount: bigint;
}

function parseL1(kv: Record<string, string>): ParsedExploit | { fail: string } {
	if (kv["instruction"] !== "withdraw_insecure") {
		return { fail: "unknown instruction. The template calls withdraw_insecure" };
	}
	let amount: bigint;
	try {
		amount = BigInt(kv["amount"] ?? "");
		if (amount <= 0n) throw new Error();
	} catch {
		return { fail: "amount must be a positive lamport integer" };
	}
	if (!kv["vault"] || !kv["authority"] || kv["vault"].includes("<") || kv["authority"].includes("<")) {
		return { fail: "vault + authority must be pasted from the lab (no <TODO> left)" };
	}
	return { vault: kv["vault"], authority: kv["authority"], instruction: kv["instruction"], amount };
}

function parseL2(kv: Record<string, string>): { fake: string; balance: bigint } | { fail: string } {
	if (kv["instruction"] !== "check_balance_insecure") {
		return { fail: "unknown instruction. The template calls check_balance_insecure" };
	}
	let balance: bigint;
	try {
		balance = BigInt(kv["fake_balance"] ?? "");
		if (balance <= 0n) throw new Error();
	} catch {
		return { fail: "fake_balance must be a positive lamport integer" };
	}
	if (!kv["fake_account"] || kv["fake_account"].includes("<")) {
		return { fail: "fake_account must be pasted from the lab (no <TODO> left)" };
	}
	return { fake: kv["fake_account"], balance };
}

function parseL3(kv: Record<string, string>): ParsedExploit | { fail: string } {
	if (kv["instruction"] !== "release_insecure") {
		return { fail: "unknown instruction. The template calls release_insecure" };
	}
	let amount: bigint;
	try {
		amount = BigInt(kv["amount"] ?? "");
		if (amount <= 0n) throw new Error();
	} catch {
		return { fail: "amount must be a positive book integer" };
	}
	if (!kv["vault"] || !kv["token_program"] || kv["vault"].includes("<") || kv["token_program"].includes("<")) {
		return { fail: "vault + token_program must be pasted from the lab (no <TODO> left)" };
	}
	return { vault: kv["vault"], authority: kv["token_program"], instruction: kv["instruction"], amount };
}

function readReleased(svm: LiteSVM, vaultAddr: string): bigint {	const acc = svm.getAccount(address(vaultAddr));
	if (!acc || !("data" in acc)) throw new Error("vault missing");
	const raw = acc.data;
	const data = raw instanceof Uint8Array ? raw : Uint8Array.from(Buffer.from(raw, "base64"));
	return Buffer.from(data.buffer, data.byteOffset + 8 + 32 + 8, 8).readBigUInt64LE(0);
}

export async function verifyL3(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l3-cpi";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL3(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const svm = new LiteSVM();
	const { victim, vault } = await victimForProgram(session, L3_PROGRAM);
	const attacker = await generateKeyPairSigner();
	svm.airdrop(victim.address, lamports(10_000_000_000n));
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L3_PROGRAM), soPath);

	if (parsed.vault !== vault) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong vault. Use the victim vault shown in the lab",
			code_hash: ""
		};
	}

	await initVictimVault(svm, L3_PROGRAM, vault, victim, room);

	// The attack: invoke the room program ITSELF as the callee. Its `ping`
	// answers Ok to anything: the hermetic stand in for an attacker's fake
	// token program. Books move; no tokens do.
	const pre = readReleased(svm, vault);
	const attack = await send(
		svm,
		{
			programAddress: address(L3_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: address(parsed.authority), role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("release_insecure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}
	const post = readReleased(svm, vault);
	if (post <= pre) {
		return { pass: false, state_diff: "", logs: "no state movement observed", code_hash: "" };
	}

	// Negative controls: BOTH secure variants MUST refuse the same shape.
	// Manual fails on the key compare; anchor fails at Program<Token>
	// validation before the body; no real token accounts needed.
	const manual = await send(
		svm,
		{
			programAddress: address(L3_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: address(parsed.authority), role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("release_secure_manual"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (!(manual instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room + " (manual)");
	}
	const anchored = await send(
		svm,
		{
			programAddress: address(L3_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: address(parsed.authority), role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("release_secure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (!(anchored instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room + " (anchor)");
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `released ${pre} to ${post} (books moved, no tokens transferred); both secure variants refused`,
		logs: "release_insecure trusted the stand-in callee; manual + anchor refused it",
		code_hash
	};
}

function parseL4(kv: Record<string, string>): { user: string; ledger: string } | { fail: string } {
	if (kv["instruction"] !== "claim_insecure") {
		return { fail: "unknown instruction. The template calls claim_insecure" };
	}
	if (!kv["user"] || !kv["ledger"] || kv["user"].includes("<") || kv["ledger"].includes("<")) {
		return { fail: "user + ledger must be pasted from the lab (no <TODO> left)" };
	}
	return { user: kv["user"], ledger: kv["ledger"] };
}

function readClaims(svm: LiteSVM, ledgerAddr: string): bigint {
	const acc = svm.getAccount(address(ledgerAddr));
	if (!acc || !("data" in acc)) throw new Error("ledger missing");
	const raw = acc.data;
	const data = raw instanceof Uint8Array ? raw : Uint8Array.from(Buffer.from(raw, "base64"));
	return Buffer.from(data.buffer, data.byteOffset + 8, 8).readBigUInt64LE(0);
}

export async function verifyL4(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l4-cosplay";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL4(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const svm = new LiteSVM();
	const { note: expectedNote } = await noteFor(session);
	const { victim } = await victimForProgram(session, L4_PROGRAM);
	const { ledger: expectedLedger } = await ledgerFor(session);
	const attacker = await generateKeyPairSigner();
	svm.airdrop(victim.address, lamports(10_000_000_000n));
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L4_PROGRAM), soPath);

	if (parsed.user !== expectedNote || parsed.ledger !== expectedLedger) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong addresses. Use the note + ledger shown in the lab",
			code_hash: ""
		};
	}

	// Fabricate the costume: a genuine Note (correct discriminator, owned by
	// the room program) whose first field holds the ATTACKER's key, exactly
	// what register_note would create, without needing a setup ceremony.
	const costume = Buffer.alloc(8 + 32 + 1, 0);
	Buffer.from(accountDisc("Note")).copy(costume, 0);
	Buffer.from(getAddressCodec().encode(attacker.address)).copy(costume, 8);
	svm.setAccount({
		address: address(parsed.user),
		lamports: lamports(1_000_000n),
		data: new Uint8Array(costume),
		programAddress: address(L4_PROGRAM),
		executable: false,
		space: BigInt(costume.length)
	});

	const init = await send(
		svm,
		{
			programAddress: address(L4_PROGRAM),
			accounts: [
				{ address: address(parsed.ledger), role: AccountRole.WRITABLE },
				{ address: victim.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY }
			],
			data: disc("initialize_ledger")
		},
		victim
	);
	if (init instanceof FailedTransactionMetadata) throw new VerifierUnavailable(room + " (setup failed)");

	// The attack: a Note where a User belongs. Bytes 8..40 match the signer,
	// so the check passes on the wrong type and the ledger moves.
	const pre = readClaims(svm, parsed.ledger);
	const attack = await send(
		svm,
		{
			programAddress: address(L4_PROGRAM),
			accounts: [
				{ address: address(parsed.user), role: AccountRole.READONLY },
				{ address: address(parsed.ledger), role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.READONLY_SIGNER }
			],
			data: disc("claim_insecure")
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}
	const post = readClaims(svm, parsed.ledger);
	if (post <= pre) {
		return { pass: false, state_diff: "", logs: "no state movement observed", code_hash: "" };
	}

	// Negative control: the secure variant MUST refuse the same costume.
	const control = await send(
		svm,
		{
			programAddress: address(L4_PROGRAM),
			accounts: [
				{ address: address(parsed.user), role: AccountRole.READONLY },
				{ address: address(parsed.ledger), role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.READONLY_SIGNER }
			],
			data: disc("claim_secure")
		},
		attacker
	);
	if (!(control instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room);
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `claims ${pre} to ${post} (ledger moved for a user that never existed); secure refused the costume`,
		logs: "claim_insecure trusted the bytes; claim_secure refused the type",
		code_hash
	};
}

function parseL5(kv: Record<string, string>): ParsedExploit | { fail: string } {
	if (kv["instruction"] !== "withdraw_insecure") {
		return { fail: "unknown instruction. The template calls withdraw_insecure" };
	}
	let amount: bigint;
	try {
		amount = BigInt(kv["amount"] ?? "");
		if (amount <= 0n) throw new Error();
	} catch {
		return { fail: "amount must be a positive book integer" };
	}
	if (!kv["vault"] || kv["vault"].includes("<")) {
		return { fail: "vault must be pasted from the lab (no <TODO> left)" };
	}
	return { vault: kv["vault"], authority: "", instruction: kv["instruction"], amount };
}

export async function verifyL5(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l5-match";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL5(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const svm = new LiteSVM();
	const { victim, vault } = await victimForProgram(session, L5_PROGRAM);
	const attacker = await generateKeyPairSigner();
	svm.airdrop(victim.address, lamports(10_000_000_000n));
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L5_PROGRAM), soPath);

	if (parsed.vault !== vault) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong vault. Use the victim vault shown in the lab",
			code_hash: ""
		};
	}

	await initVictimVault(svm, L5_PROGRAM, vault, victim, room);

	// The attack: a VALID signature (Bob's) on the WRONG vault (Alice's).
	// The program checks the signature exists, never the relationship.
	const pre = readBalance(svm, vault);
	const attack = await send(
		svm,
		{
			programAddress: address(L5_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER }
			],
			data: new Uint8Array([...disc("withdraw_insecure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}
	const post = readBalance(svm, vault);
	if (post >= pre) {
		return { pass: false, state_diff: "", logs: "no state movement observed", code_hash: "" };
	}

	// Negative control: has_one MUST refuse the stranger's signature.
	const control = await send(
		svm,
		{
			programAddress: address(L5_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER }
			],
			data: new Uint8Array([...disc("withdraw_secure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (!(control instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room);
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `vault ${pre} to ${post} (stranger's signature moved victim funds); secure refused`,
		logs: "withdraw_insecure ignored the relationship; has_one refused it",
		code_hash
	};
}

function parseL6(kv: Record<string, string>): ParsedExploit | { fail: string } {
	if (kv["instruction"] !== "withdraw_insecure") {
		return { fail: "unknown instruction. The template calls withdraw_insecure" };
	}
	let amount: bigint;
	try {
		amount = BigInt(kv["amount"] ?? "");
		if (amount <= 0n) throw new Error();
	} catch {
		return { fail: "amount must be a positive lamport integer" };
	}
	if (!kv["vault"] || kv["vault"].includes("<")) {
		return { fail: "vault must be pasted from the lab (no <TODO> left)" };
	}
	return { vault: kv["vault"], authority: "", instruction: kv["instruction"], amount };
}

export async function verifyL6(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l6-vault";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL6(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const svm = new LiteSVM();
	const { victim, vault } = await victimForProgram(session, L6_PROGRAM);
	const attacker = await generateKeyPairSigner();
	svm.airdrop(victim.address, lamports(10_000_000_000n));
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L6_PROGRAM), soPath);

	if (parsed.vault !== vault) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong vault. Use the victim vault shown in the lab",
			code_hash: ""
		};
	}

	await initVictimVault(svm, L6_PROGRAM, vault, victim, room);

	// The raid: NOBODY is checked. The caller account is decoration; the
	// attacker passes themselves READONLY and takes everything.
	const pre = readBalance(svm, vault);
	const attack = await send(
		svm,
		{
			programAddress: address(L6_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("withdraw_insecure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}
	const post = readBalance(svm, vault);
	if (post !== 0n) {
		return { pass: false, state_diff: "", logs: `capstone demands 100%. Remainder ${post}`, code_hash: "" };
	}

	// Negative control: the secure instruction MUST refuse the same shape.
	const control = await send(
		svm,
		{
			programAddress: address(L6_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER }
			],
			data: new Uint8Array([...disc("withdraw_secure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (!(control instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room);
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `vault ${pre} to 0 (100% drained in one transaction); secure refused`,
		logs: "withdraw_insecure never questioned the caller; withdraw_secure refused the stranger",
		code_hash
	};
}

function parseL7(kv: Record<string, string>): ParsedExploit | { fail: string } {
	if (kv["instruction"] !== "withdraw_insecure") {
		return { fail: "unknown instruction. The template calls withdraw_insecure" };
	}
	let amount: bigint;
	try {
		amount = BigInt(kv["amount"] ?? "");
		if (amount <= 0n) throw new Error();
	} catch {
		return { fail: "amount must be a positive integer" };
	}
	if (!kv["vault"] || kv["vault"].includes("<")) {
		return { fail: "vault must be pasted from the lab (no <TODO> left)" };
	}
	return { vault: kv["vault"], authority: "", instruction: kv["instruction"], amount };
}

const L7_OPENING = 100n;
const U64_MAX = 18446744073709551615n;

export async function verifyL7(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l7-overflow";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL7(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const svm = new LiteSVM();
	const { victim, vault } = await victimForProgram(session, L7_PROGRAM);
	const attacker = await generateKeyPairSigner();
	svm.airdrop(victim.address, lamports(10_000_000_000n));
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L7_PROGRAM), soPath);

	if (parsed.vault !== vault) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong vault. Use the victim vault shown in the lab",
			code_hash: ""
		};
	}

	await initVictimVault(svm, L7_PROGRAM, vault, victim, room, L7_OPENING);

	// Negative control FIRST (state-dependent room): on the pristine 100-unit
	// vault, checked_sub MUST refuse 101. After the attack wraps the books,
	// even the secure instruction would succeed; order matters here.
	const control = await send(
		svm,
		{
			programAddress: address(L7_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER }
			],
			data: new Uint8Array([...disc("withdraw_secure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (!(control instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room);
	}

	// The attack: 100 minus 101. Debug would panic; BPF release wraps to
	// u64::MAX, and this lab runs the release build.
	const pre = readBalance(svm, vault);
	const attack = await send(
		svm,
		{
			programAddress: address(L7_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER }
			],
			data: new Uint8Array([...disc("withdraw_insecure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}
	const post = readBalance(svm, vault);
	if (post !== U64_MAX) {
		return { pass: false, state_diff: "", logs: `no wrap observed (books at ${post})`, code_hash: "" };
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `balance ${pre} to ${post} (wrapped past u64::MAX); secure refused`,
		logs: "withdraw_insecure wrapped silently; checked_sub refused loudly",
		code_hash
	};
}

async function send(	svm: LiteSVM,
	ix: { programAddress: ReturnType<typeof address>; accounts: { address: ReturnType<typeof address>; role: AccountRole }[]; data: Uint8Array },
	payer: Awaited<ReturnType<typeof generateKeyPairSigner>>
) {
	const tx = await pipe(
		createTransactionMessage({ version: 0 }),
		(tx) => setTransactionMessageFeePayerSigner(payer, tx),
		(tx) => svm.setTransactionMessageLifetimeUsingLatestBlockhash(tx),
		(tx) => appendTransactionMessageInstruction(ix, tx),
		(tx) => signTransactionMessageWithSigners(tx)
	);
	return svm.sendTransaction(tx);
}

function readBalance(svm: LiteSVM, vaultAddr: string): bigint {
	const acc = svm.getAccount(address(vaultAddr));
	if (!acc || !("data" in acc)) throw new Error("vault missing");
	const raw = acc.data;
	const data = raw instanceof Uint8Array ? raw : Uint8Array.from(Buffer.from(raw, "base64"));
	return Buffer.from(data.buffer, data.byteOffset + 8 + 32, 8).readBigUInt64LE(0);
}

export async function verify(session: string, room: string, exploit: string): Promise<Verdict> {
	if (room !== "l1-signer" && room !== "l2-owner" && room !== "l3-cpi" && room !== "l4-cosplay" && room !== "l5-match" && room !== "l6-vault" && room !== "l7-overflow") throw new VerifierUnavailable(room);

	const rooms = loadRooms().rooms;
	const meta = rooms.find((r) => r.id === room);
	if (!meta || !meta.live || !meta.program.so || meta.program.so === "UNBUILT") {
		throw new VerifierUnavailable(room + " (unbuilt)");
	}
	const soPath = join(contentDir(), "..", meta.program.so);

	if (room === "l2-owner") return verifyL2(session, exploit, soPath);
	if (room === "l3-cpi") return verifyL3(session, exploit, soPath);
	if (room === "l4-cosplay") return verifyL4(session, exploit, soPath);
	if (room === "l5-match") return verifyL5(session, exploit, soPath);
	if (room === "l6-vault") return verifyL6(session, exploit, soPath);
	if (room === "l7-overflow") return verifyL7(session, exploit, soPath);
	return verifyL1(session, exploit, soPath);
}

/** Shared vault opener (gen-6 consolidation): L1/L3/L5/L6 initialize
 * byte-identical Vault layouts with the victim as payer. One helper, four
 * call sites; throws VerifierUnavailable naming setup on failure. L7 passes
 * its own small opening balance (default: INITIAL). */
async function initVictimVault(
	svm: LiteSVM,
	program: string,
	vaultAddr: ReturnType<typeof address>,
	victim: Awaited<ReturnType<typeof generateKeyPairSigner>>,
	room: string,
	initial: bigint = INITIAL
) {
	const init = await send(
		svm,
		{
			programAddress: address(program),
			accounts: [
				{ address: vaultAddr, role: AccountRole.WRITABLE },
				{ address: victim.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("initialize_vault"), ...u64le(initial)])
		},
		victim
	);
	if (init instanceof FailedTransactionMetadata) throw new VerifierUnavailable(room + " (setup failed)");
}

function parseKv(text: string): Record<string, string> | { fail: string } {
	const kv: Record<string, string> = {};
	for (const line of text.split("\n")) {
		const t = line.trim();
		if (!t || t.startsWith("#")) continue;
		const i = t.indexOf(":");
		if (i < 0) return { fail: "could not parse exploit. Fill the template TODOs" };
		kv[t.slice(0, i).trim()] = t.slice(i + 1).trim();
	}
	return kv;
}

export async function verifyL1(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l1-signer";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL1(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const svm = new LiteSVM();
	const { victim, vault } = await victimFor(session);
	const attacker = await generateKeyPairSigner();
	svm.airdrop(victim.address, lamports(10_000_000_000n));
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L1_PROGRAM), soPath);

	if (vault !== parsed.vault || victim.address !== parsed.authority) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong vault. Use the victim vault shown in the lab",
			code_hash: ""
		};
	}

	await initVictimVault(svm, L1_PROGRAM, vault, victim, room);

	const pre = readBalance(svm, vault);
	const attack = await send(
		svm,
		{
			programAddress: address(L1_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: victim.address, role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("withdraw_insecure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}
	const post = readBalance(svm, vault);
	if (post >= pre) {
		return { pass: false, state_diff: "", logs: "no state movement observed", code_hash: "" };
	}

	// Negative control: identical shape against withdraw_secure MUST refuse.
	const control = await send(
		svm,
		{
			programAddress: address(L1_PROGRAM),
			accounts: [
				{ address: vault, role: AccountRole.WRITABLE },
				{ address: victim.address, role: AccountRole.READONLY }
			],
			data: new Uint8Array([...disc("withdraw_secure"), ...u64le(parsed.amount)])
		},
		attacker
	);
	if (!(control instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room);
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `vault ${pre} to ${post} (attacker gained ${pre - post})`,
		logs: "withdraw_insecure moved state; withdraw_secure refused the same shape",
		code_hash
	};
}

export async function verifyL2(session: string, exploit: string, soPath: string): Promise<Verdict> {
	const room = "l2-owner";
	const kv = parseKv(exploit);
	if ("fail" in kv) {
		return { pass: false, state_diff: "", logs: kv.fail, code_hash: "" };
	}
	const parsed = parseL2(kv);
	if ("fail" in parsed) {
		return { pass: false, state_diff: "", logs: parsed.fail, code_hash: "" };
	}

	const { fake: expectedFake } = await fakeFor(session);
	if (parsed.fake !== expectedFake) {
		return {
			pass: false,
			state_diff: "",
			logs: "wrong account. Use the fake account shown in the lab",
			code_hash: ""
		};
	}

	const svm = new LiteSVM();
	const attacker = await generateKeyPairSigner();
	svm.airdrop(attacker.address, lamports(1_000_000_000n));
	svm.addProgramFromFile(address(L2_PROGRAM), soPath);

	// Fabricate: System-owned account with token-shaped bytes, claimed amount at [64..72].
	const bytes = Buffer.alloc(80, 0);
	Buffer.from(u64le(parsed.balance)).copy(bytes, 64);
	svm.setAccount({
		address: address(parsed.fake),
		lamports: lamports(1_000_000n),
		data: new Uint8Array(bytes),
		programAddress: SYSTEM_PROGRAM_ADDRESS,
		executable: false,
		space: BigInt(bytes.length)
	});

	const attack = await send(
		svm,
		{
			programAddress: address(L2_PROGRAM),
			accounts: [{ address: address(parsed.fake), role: AccountRole.READONLY }],
			data: disc("check_balance_insecure")
		},
		attacker
	);
	if (attack instanceof FailedTransactionMetadata) {
		return { pass: false, state_diff: "", logs: "exploit refused by the vulnerable program", code_hash: "" };
	}

	// Negative controls: BOTH secure variants MUST refuse the same fabrication.
	const manual = await send(
		svm,
		{
			programAddress: address(L2_PROGRAM),
			accounts: [{ address: address(parsed.fake), role: AccountRole.READONLY }],
			data: disc("check_balance_secure_manual")
		},
		attacker
	);
	if (!(manual instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room + " (manual)");
	}
	const anchored = await send(
		svm,
		{
			programAddress: address(L2_PROGRAM),
			accounts: [
				{ address: address(parsed.fake), role: AccountRole.READONLY },
				{ address: attacker.address, role: AccountRole.WRITABLE_SIGNER },
				{ address: address(TOKEN_PROGRAM), role: AccountRole.READONLY }
			],
			data: disc("check_balance_secure_anchor")
		},
		attacker
	);
	if (!(anchored instanceof FailedTransactionMetadata)) {
		throw new FixedPassed(room + " (anchor)");
	}

	const code_hash = createHash("sha256").update(exploit).digest("hex");
	return {
		pass: true,
		state_diff: `unverified balance ${parsed.balance} trusted from System owned account; both secure variants refused`,
		logs: "check_balance_insecure trusted the fabrication; manual + anchor refused it",
		code_hash
	};
}
