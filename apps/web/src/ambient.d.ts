declare module "*.md" {
	import type { Component } from "svelte";
	const component: Component;
	export default component;
}

declare module "*.svg" {
	const url: string;
	export default url;
}
