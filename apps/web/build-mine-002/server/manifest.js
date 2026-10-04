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
		client: {start:"_app/immutable/entry/start.B7rwvS4q.js",app:"_app/immutable/entry/app.Bq4YYavG.js",imports:["_app/immutable/entry/start.B7rwvS4q.js","_app/immutable/chunks/D-ruAvmK.js","_app/immutable/chunks/CGfNYXgv.js","_app/immutable/chunks/B_W8ZIdn.js","_app/immutable/chunks/Cbpr9sPF.js","_app/immutable/entry/app.Bq4YYavG.js","_app/immutable/chunks/CGfNYXgv.js","_app/immutable/chunks/9Zu001KG.js","_app/immutable/chunks/CQ0UjzDj.js","_app/immutable/chunks/B_W8ZIdn.js","_app/immutable/chunks/SfBxmpeO.js","_app/immutable/chunks/DGXCxajL.js","_app/immutable/chunks/8sCE0D6n.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-B5BE-apR.js')),
			__memo(() => import('./chunks/1-B-M9zoBY.js')),
			__memo(() => import('./chunks/2-D_zpW2eW.js')),
			__memo(() => import('./chunks/3-tAQvEDfy.js')),
			__memo(() => import('./chunks/4-CzZCx_Zc.js')),
			__memo(() => import('./chunks/5-DtDBdEa6.js')),
			__memo(() => import('./chunks/6-DJ9LXMat.js')),
			__memo(() => import('./chunks/7-DaC1_IzN.js')),
			__memo(() => import('./chunks/8-DAbOKTG3.js')),
			__memo(() => import('./chunks/9-B7RE6fuT.js')),
			__memo(() => import('./chunks/10-ChHmaxw4.js')),
			__memo(() => import('./chunks/11-DEX0MdAw.js')),
			__memo(() => import('./chunks/12-B9TWUidm.js')),
			__memo(() => import('./chunks/13-Cnpi5tbp.js')),
			__memo(() => import('./chunks/14-CC8FlvM0.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-C7cchYrb.js'))
			},
			{
				id: "/api/run",
				pattern: /^\/api\/run\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CQHeVUkJ.js'))
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
				id: "/proof/[hash]",
				pattern: /^\/proof\/([^/]+?)\/?$/,
				params: [{"name":"hash","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/rooms",
				pattern: /^\/rooms\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/rooms/[id]",
				pattern: /^\/rooms\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
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
