import { j as json } from './index-C5EvGOh5.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { l as loadRooms, s as splitSections } from './loader-7j8kK69B.js';
import { c as contentDir } from './paths-BVo4bQLA.js';
import 'js-yaml';
import './types-YoPt2-1h.js';
import 'node:url';

const GET = async ({ params, url }) => {
  const { rooms } = loadRooms();
  const room = rooms.find((r) => r.id === params.id);
  if (!room) return json({ error: "RoomMissing" }, { status: 404 });
  const read = (p) => readFileSync(join(contentDir(), "..", p), "utf8");
  const vulnRaw = read(room.program.vuln);
  const fixedRaw = read(room.program.fixed);
  const sectioned = room.program.vuln === room.program.fixed ? splitSections(vulnRaw) : null;
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
    ...await target(params.id, url.searchParams.get("session"))
  });
};
async function target(id, session) {
  if (!session || id !== "l1-signer" && id !== "l2-owner" && id !== "l3-cpi" && id !== "l4-cosplay" && id !== "l5-match" && id !== "l6-vault") return {};
  try {
    if (id === "l1-signer" || id === "l5-match" || id === "l6-vault") {
      const { victimFor, victimForProgram } = await import('./harness-DDWNktFb.js');
      const prog = id === "l5-match" ? "8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J" : "2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib";
      const { victim, vault } = id === "l1-signer" ? await victimFor(session) : await victimForProgram(session, prog);
      const note = id === "l1-signer" ? victim.address : `${victim.address} (context only — you were never the authority)`;
      const fields = [{ k: "vault", v: vault }, { k: "authority", v: note }];
      if (id === "l6-vault") fields.push({ k: "book_balance", v: "100000000 (drain it all — remainder fails)" });
      return { target: { fields } };
    }
    if (id === "l3-cpi") {
      const { victimForProgram } = await import('./harness-DDWNktFb.js');
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
      const { noteFor, ledgerFor } = await import('./harness-DDWNktFb.js');
      const { note } = await noteFor(session);
      const { ledger } = await ledgerFor(session);
      return {
        target: {
          fields: [
            { k: "user", v: `${note} (your NOTE — sewn costume, not a User)` },
            { k: "ledger", v: ledger }
          ]
        }
      };
    }
    const { fakeFor } = await import('./harness-DDWNktFb.js');
    const { fake } = await fakeFor(session);
    return { target: { fields: [{ k: "fake_account", v: fake }, { k: "owner", v: "any (never verified)" }] } };
  } catch {
    return {};
  }
}

export { GET };
//# sourceMappingURL=_server.ts-C7cchYrb.js.map
