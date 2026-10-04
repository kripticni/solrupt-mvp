const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["logo.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DqLOo927.js",app:"_app/immutable/entry/app.BLkyagDr.js",imports:["_app/immutable/entry/start.DqLOo927.js","_app/immutable/chunks/3VMUWT23.js","_app/immutable/chunks/B_J7QaOW.js","_app/immutable/chunks/BucwR5VF.js","_app/immutable/chunks/DK2zSr3R.js","_app/immutable/entry/app.BLkyagDr.js","_app/immutable/chunks/B_J7QaOW.js","_app/immutable/chunks/Btt10tim.js","_app/immutable/chunks/Bznu-J8q.js","_app/immutable/chunks/BucwR5VF.js","_app/immutable/chunks/9OWkdZpz.js","_app/immutable/chunks/C3BVd-Br.js","_app/immutable/chunks/Uj1jFbG_.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CpW-atXj.js')),
			__memo(() => import('./chunks/1-DNiV_NIt.js')),
			__memo(() => import('./chunks/2-DZ8c-m69.js')),
			__memo(() => import('./chunks/3-DJ79J_cR.js')),
			__memo(() => import('./chunks/4-BlUz530Q.js')),
			__memo(() => import('./chunks/5-sLkBFFnx.js')),
			__memo(() => import('./chunks/6-vrk3Z7GY.js')),
			__memo(() => import('./chunks/7-CT3SzMxG.js')),
			__memo(() => import('./chunks/8-DytZpw6L.js')),
			__memo(() => import('./chunks/9-CQygkoju.js')),
			__memo(() => import('./chunks/10-DVuxdQdx.js')),
			__memo(() => import('./chunks/11-B66-FTI9.js')),
			__memo(() => import('./chunks/12-m31T0gtM.js')),
			__memo(() => import('./chunks/13-glJXFBTe.js')),
			__memo(() => import('./chunks/14-B8dkVyrz.js')),
			__memo(() => import('./chunks/15-CteI5urM.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/board",
				pattern: /^\/api\/board\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DDUC3TfC.js'))
			},
			{
				id: "/api/finding",
				pattern: /^\/api\/finding\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CQ1qCQwO.js'))
			},
			{
				id: "/api/health",
				pattern: /^\/api\/health\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DmmFT6Fu.js'))
			},
			{
				id: "/api/proof/[hash]",
				pattern: /^\/api\/proof\/([^/]+?)\/?$/,
				params: [{"name":"hash","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CMhML6eM.js'))
			},
			{
				id: "/api/quiz/[id]",
				pattern: /^\/api\/quiz\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Tx4D2xgX.js'))
			},
			{
				id: "/api/rooms",
				pattern: /^\/api\/rooms\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CZ3qjYdL.js'))
			},
			{
				id: "/api/rooms/[id]",
				pattern: /^\/api\/rooms\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-VbhlgeJm.js'))
			},
			{
				id: "/api/run",
				pattern: /^\/api\/run\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BW2NXVA_.js'))
			},
			{
				id: "/api/search",
				pattern: /^\/api\/search\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BWKQsoLC.js'))
			},
			{
				id: "/api/session",
				pattern: /^\/api\/session\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BhqAkNGJ.js'))
			},
			{
				id: "/board",
				pattern: /^\/board\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/finding",
				pattern: /^\/finding\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/learn",
				pattern: /^\/learn\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/learn/101",
				pattern: /^\/learn\/101\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/learn/102",
				pattern: /^\/learn\/102\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/learn/103",
				pattern: /^\/learn\/103\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/learn/104",
				pattern: /^\/learn\/104\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/learn/105",
				pattern: /^\/learn\/105\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/learn/106",
				pattern: /^\/learn\/106\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/learn/107",
				pattern: /^\/learn\/107\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/proof/[hash]",
				pattern: /^\/proof\/([^/]+?)\/?$/,
				params: [{"name":"hash","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/rooms",
				pattern: /^\/rooms\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/rooms/[id]",
				pattern: /^\/rooms\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
