// Sound cues (UX_PREMIUM §7): Web Audio oscillators only, no assets, no loops.
// OFF by default; the AudioContext is created on first opt-in click only
// (Chrome gesture policy: pre-gesture contexts start suspended). Master peak
// <= -18 dBFS, every cue <= 150 ms, 100 ms debounce, no overlap stacking.
// Toggle persisted to localStorage (`arena_sound=on`).
import { browser } from "$app/environment";

let ctx: AudioContext | null = null;
let last = 0;

export function soundEnabled(): boolean {
	if (!browser) return false;
	return localStorage.getItem("arena_sound") === "on";
}

export function setSound(on: boolean): void {
	if (!browser) return;
	localStorage.setItem("arena_sound", on ? "on" : "off");
	if (on && !ctx) {
		ctx = new AudioContext();
	}
}

function blip(from: number, to: number, ms: number, type: OscillatorType, peak: number): void {
	if (!browser || !soundEnabled()) return;
	const now = Date.now();
	if (now - last < 100) return;
	last = now;
	if (!ctx) ctx = new AudioContext();
	if (ctx.state === "suspended") void ctx.resume();
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(from, t);
	osc.frequency.exponentialRampToValueAtTime(to, t + ms / 1000);
	gain.gain.setValueAtTime(peak, t);
	gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
	osc.connect(gain).connect(ctx.destination);
	osc.start(t);
	osc.stop(t + ms / 1000 + 0.02);
}

const dbfs = (db: number) => Math.pow(10, db / 20);

export const sfx = {
	pass: () => blip(660, 880, 120, "sine", dbfs(-18)),
	fail: () => blip(220, 160, 150, "triangle", dbfs(-18)),
	click: () => blip(1200, 1200, 40, "square", dbfs(-24))
};
