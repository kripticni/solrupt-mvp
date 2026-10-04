import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { c as contentDir } from './paths-BVo4bQLA.js';
import { o as objectType, s as stringType, a as arrayType, n as numberType, e as enumType } from './types-YoPt2-1h.js';

const RoomSchema = objectType({
  id: stringType(),
  title: stringType(),
  tier: enumType(["Easy", "Medium", "Hard"]),
  points: numberType(),
  prereq: stringType(),
  program: objectType({
    vuln: stringType(),
    fixed: stringType(),
    so: stringType().optional(),
    so_digest: stringType()
  }),
  template: stringType(),
  hints: arrayType(stringType()).length(3),
  checks: objectType({ pass_when: stringType(), negative_control: stringType() }),
  pins: objectType({ anchor: stringType(), litesvm: stringType(), rust: stringType() })
});
function roomsDir() {
  return join(contentDir(), "rooms");
}
function loadRooms(dir = roomsDir()) {
  const rooms = [];
  const greyed = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".yaml")) continue;
    try {
      const parsed = RoomSchema.parse(yaml.load(readFileSync(join(dir, f), "utf8")));
      rooms.push({ ...parsed, live: parsed.program.so_digest !== "UNBUILT" });
    } catch (e) {
      greyed.push(f);
      console.warn(`room greyed: ${f}: ${e.message.split("\n")[0]}`);
    }
  }
  return { rooms, greyed };
}
function toMeta(r) {
  return { id: r.id, title: r.title, tier: r.tier, points: r.points, prereq: r.prereq };
}
function splitSections(src) {
  const lines = src.split("\n");
  const vuln = [];
  const fixed = [];
  let side = "both";
  let marked = false;
  for (const line of lines) {
    const m = line.match(/^\s*\/\/\s*PANEL:\s*(both|vuln|fixed)\s*$/);
    if (m) {
      side = m[1];
      marked = true;
      continue;
    }
    if (side === "both") {
      vuln.push(line);
      fixed.push(line);
    } else if (side === "vuln") {
      vuln.push(line);
    } else {
      fixed.push(line);
    }
  }
  if (!marked) return { vuln: src, fixed: src };
  const v = vuln.join("\n").trim();
  const f = fixed.join("\n").trim();
  if (!v || !f || v === f) return { vuln: src, fixed: src };
  return { vuln: v, fixed: f };
}

export { loadRooms as l, splitSections as s, toMeta as t };
//# sourceMappingURL=loader-7j8kK69B.js.map
