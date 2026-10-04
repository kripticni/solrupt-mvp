import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadRooms, splitSections } from "$lib/server/rooms/loader.js";
import { contentDir } from "$lib/server/paths.js";

// Room detail for the lab shell (F2.2): hints + vuln/fixed sources + template.
// Read 7th endpoint (proposed S5-lock amendment): the five listed endpoints
// cannot feed the lab pane without it, and all reads stay server-side.
export const GET: RequestHandler = async ({ params, url }) => {
	const { rooms } = loadRooms();
	const room = rooms.find((r) => r.id === params.id);
	if (!room) return json({ error: "RoomMissing" }, { status: 404 });
	const read = (p: string) => readFileSync(join(contentDir(), "..", p), "utf8");
	// Single-file programs (Anchor `#[program]` requires one module tree) carry
	// both sides behind banner comments; split for the pane when paths coincide.
	const vulnRaw = read(room.program.vuln);
	const fixedRaw = read(room.program.fixed);
	const sectioned =
		room.program.vuln === room.program.fixed ? splitSections(vulnRaw) : null;
	return json({
		meta: {
			id: room.id,
			title: room.title,
			tier: room.tier,
			points: room.points,
			prereq: room.prereq,
			live: room.live
		},
		hints: room.hints,
		vuln: sectioned?.vuln ?? vulnRaw,
		fixed: sectioned?.fixed ?? fixedRaw,
		template: read(room.template),
		...(await target(params.id, url.searchParams.get("session")))
	});
};

// Per-room stable targets, rendered as label/value rows by the lab shell.
// Generalized at the 4th room (L1 vault/authority, L2 fake, L3 vault/program,
// L4 note/ledger): one shape, room-driven rows, no per-room page branches.
async function target(id: string, session: string | null) {
	if (!session || (id !== "l1-signer" && id !== "l2-owner" && id !== "l3-cpi" && id !== "l4-cosplay" && id !== "l5-match" && id !== "l6-vault" && id !== "l7-overflow")) return {};
	try {
		if (id === "l1-signer" || id === "l5-match" || id === "l6-vault" || id === "l7-overflow") {
			const { victimFor, victimForProgram } = await import("$lib/server/verifier/harness.js");
			const progs: Record<string, string> = {
				"l5-match": "8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J",
				"l6-vault": "2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib",
				"l7-overflow": "392HD9NFyhZpR45PcBAJRNrQZ1EAifUSJARCDxW3oEmK"
			};
			const { victim, vault } = id === "l1-signer" ? await victimFor(session) : await victimForProgram(session, progs[id]);
			const note = id === "l1-signer" ? victim.address : `${victim.address} (context only. You were never the authority)`;
			const fields = [{ k: "vault", v: vault }, { k: "authority", v: note }];
			if (id === "l6-vault") fields.push({ k: "book_balance", v: "100000000 (drain it all. Remainder fails)" });
			if (id === "l7-overflow") fields.push({ k: "book_balance", v: "100 (ask for 101, one more than exists)" });
			return { target: { fields } };
		}
		if (id === "l3-cpi") {
			const { victimForProgram } = await import("$lib/server/verifier/harness.js");
			const { vault } = await victimForProgram(session, "HuKUtxW8Y6BWhfyXftZMS1BqENagBJzZFWMzjhx1tCFf");
			return {
				target: {
					fields: [
						{ k: "vault", v: vault },
						{ k: "token_program", v: "HuKUtxW8Y6BWhfyXftZMS1BqENagBJzZFWMzjhx1tCFf (room program: ping stand-in callee)" }
					]
				}
			};
		}
		if (id === "l4-cosplay") {
			const { noteFor, ledgerFor } = await import("$lib/server/verifier/harness.js");
			const { note } = await noteFor(session);
			const { ledger } = await ledgerFor(session);
			return {
				target: {
					fields: [
						{ k: "user", v: `${note} (your NOTE. Sewn costume, not a User)` },
						{ k: "ledger", v: ledger }
					]
				}
			};
		}
		const { fakeFor } = await import("$lib/server/verifier/harness.js");
		const { fake } = await fakeFor(session);
		return { target: { fields: [{ k: "fake_account", v: fake }, { k: "owner", v: "any (never verified)" }] } };
	} catch {
		return {};
	}
};
