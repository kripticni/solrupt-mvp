import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { strToU8, zipSync } from 'fflate';
import { l as loadRooms } from './loader-7j8kK69B.js';
import { c as contentDir } from './paths-BVo4bQLA.js';
import 'js-yaml';
import './types-YoPt2-1h.js';
import 'node:url';

function buildRoomFiles(id) {
  const { rooms } = loadRooms();
  const room = rooms.find((r) => r.id === id);
  if (!room) return { error: "RoomMissing" };
  const base = join(contentDir(), "..");
  const read = (p) => readFileSync(join(base, p), "utf8");
  const source = read(room.program.vuln);
  const template = read(room.template);
  let manifest = "";
  try {
    manifest = read(join(dirname(dirname(room.program.vuln)), "Cargo.toml"));
  } catch {
    manifest = "";
  }
  const readme = [
    `${room.title} (${room.tier}, ${room.points} pts)`,
    "",
    "Files:",
    "- exploit-template.txt: fill the TODOs with the target shown on the room page.",
    "- src/lib.rs: the room program (vulnerable + fixed sides, PANEL markers).",
    manifest ? "- Cargo.toml: the room manifest (anchor 0.32.2)." : "- (no Cargo manifest for this room)",
    "",
    "How to submit:",
    "1. Open the room page and claim a nickname.",
    "2. Paste your filled exploit into the editor and press Run.",
    "3. The verifier checks on-chain state, never your logs.",
    "",
    `Prerequisite: ${room.prereq}. Hints live on the room page (3 per room).`
  ].join("\n");
  const entries = {
    [`${id}/README.md`]: strToU8(readme),
    [`${id}/exploit-template.txt`]: strToU8(template),
    [`${id}/src/lib.rs`]: strToU8(source)
  };
  if (manifest) entries[`${id}/Cargo.toml`] = strToU8(manifest);
  return { filename: `${id}-files.zip`, bytes: zipSync(entries) };
}
const GET = async ({ params }) => {
  const out = buildRoomFiles(params.id ?? "");
  if ("error" in out) {
    return new Response(JSON.stringify({ error: "RoomMissing", action: "pick a live room from the picker" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(Buffer.from(out.bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${out.filename}"`
    }
  });
};

export { GET };
//# sourceMappingURL=_server.ts-Bz_eovdn.js.map
