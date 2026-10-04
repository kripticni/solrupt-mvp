// S6 Diff-2 canary (GO 2026-10-03): LiteSVM in-process via the official `litesvm`
// npm wrapper on Node 22. Precursor to `$lib/server/verifier/*` (see 19 §1).
// Run: node canary.mjs (after `npm install`). Exits 0 on GO, 1 naming the miss.
import { LiteSVM } from "litesvm";

const svm = new LiteSVM();
// Fresh random address (never the system program: airdrops there are no-ops).
const fresh = "4Asp6QR6bwaazaaGnSSSbMQdjx2uaALjHRPt7sjHQzfe";
const pre = svm.getBalance(fresh) ?? 0n; // fresh accounts read null
svm.airdrop(fresh, 1000000000n);
const post = svm.getBalance(fresh) ?? 0n;
console.log("CANARY pre=" + pre.toString() + " post=" + post.toString());
if (post - pre !== 1000000000n) {
	console.error("CANARY FAIL: delta wrong");
	process.exit(1);
}
console.log("CANARY GO: LiteSVM in-process on Node " + process.version);
