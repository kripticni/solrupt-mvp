import adapter from "@sveltejs/adapter-node";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ".md"],
	preprocess: [mdsvex({ extensions: [".md"] })],
	kit: {
		adapter: adapter(),
		alias: {
			$content: "../../content"
		}
	}
};

export default config;
