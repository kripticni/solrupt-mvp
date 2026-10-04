// Minimal Rust syntax highlighter (no dependencies): escape, then wrap spans.
// Colors are design-system tokens only: comments muted, keywords accent,
// strings warn, attributes/macros muted-bright, fn names text. Content is our
// own static source files, but escaping is unconditional (never trust input).
const ESC: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;"
};

const KEYWORDS = new Set(
	"use pub mod fn let mut struct enum impl trait return if else match for in while loop where crate super self Self const static ref move async await dyn Result Ok Err Option Some None true false as break continue Require require msg".split(
		" "
	)
);

export function highlightRust(src: string): string {
	const out: string[] = [];
	// Merge adjacent same-class tokens: fewer DOM nodes, cheaper scroll paint.
	let open: string | null = null;
	let buf = "";
	const flush = () => {
		if (buf) {
			const esc = buf.replace(/[&<>"]/g, (c) => ESC[c]);
			out.push(open ? `<span class="tok-${open}">${esc}</span>` : esc);
			buf = "";
		}
	};
	const push = (cls: string | null, text: string) => {
		if (cls !== open) {
			flush();
			open = cls;
		}
		buf += text;
	};
	const done = () => {
		flush();
		open = null;
	};
	let i = 0;
	const n = src.length;
	while (i < n) {
		const c = src[i];
		// Line comments (incl. //! and ///).
		if (c === "/" && src[i + 1] === "/") {
			let j = src.indexOf("\n", i);
			if (j < 0) j = n;
			push("com", src.slice(i, j));
			i = j;
			continue;
		}
		// Double-quoted string literals.
		if (c === '"') {
			let j = i + 1;
			while (j < n && src[j] !== '"') {
				if (src[j] === "\\") j++;
				j++;
			}
			push("str", src.slice(i, Math.min(j + 1, n)));
			i = Math.min(j + 1, n);
			continue;
		}
		// Single quotes: char literal vs lifetime vs stray quote. A char is
		// exactly one char (or one escape) between quotes; a lifetime is '
		// plus an identifier (e.g. 'info). Anything else is pushed plain:
		// a stray quote must never open a span that swallows the file.
		if (c === "'") {
			const d1 = src[i + 1] ?? "";
			const d2 = src[i + 2] ?? "";
			const d3 = src[i + 3] ?? "";
			if (d1 === "\\" && d3 === "'") {
				push("str", src.slice(i, i + 4));
				i += 4;
				continue;
			}
			if (d2 === "'" && d1 !== "'") {
				push("str", src.slice(i, i + 3));
				i += 3;
				continue;
			}
			if (/[A-Za-z_]/.test(d1)) {
				let j = i + 2;
				while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
				push(null, src.slice(i, j));
				i = j;
				continue;
			}
			push(null, c);
			i++;
			continue;
		}
		// Attributes and macros: #[...] and ident!.
		if (c === "#" && src[i + 1] === "[") {
			let j = src.indexOf("]", i);
			j = j < 0 ? n : j + 1;
			push("mac", src.slice(i, j));
			i = j;
			continue;
		}
		// Words: keywords, macros, fn names, plain.
		if (/[A-Za-z_]/.test(c)) {
			let j = i + 1;
			while (j < n && /[A-Za-z0-9_!]/.test(src[j])) j++;
			const word = src.slice(i, j);
			if (word.endsWith("!")) {
				push("mac", word);
			} else if (KEYWORDS.has(word)) {
				push("kw", word);
			} else {
				// fn name heuristic: word followed by `(`.
				let k = j;
				while (k < n && src[k] === " ") k++;
				push(src[k] === "(" ? "fn" : null, word);
			}
			i = j;
			continue;
		}
		// Numbers.
		if (/[0-9]/.test(c)) {
			let j = i + 1;
			while (j < n && /[0-9a-fA-F_x]/.test(src[j])) j++;
			push("num", src.slice(i, j));
			i = j;
			continue;
		}
		push(null, c);
		i++;
	}
	done();
	return out.join("");
}
