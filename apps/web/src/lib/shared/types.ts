// Shared vocabulary (19 §3, 18 §2): single definition for room/session/verdict/proof.
export interface Verdict {
	pass: boolean;
	state_diff: string;
	logs: string;
	code_hash: string;
}

export interface RoomMeta {
	id: string;
	title: string;
	tier: "Easy" | "Medium" | "Hard";
	points: number;
	prereq: string;
	solved?: boolean;
}

export interface ProofPayload {
	solver_hash: string;
	room: string;
	code_digest: string;
	verdict_pin: string;
	attempts: number;
	hints_used: number;
}

export interface AttemptRow {
	session: string;
	code_hash: string;
	verdict: string;
	at: string;
}
