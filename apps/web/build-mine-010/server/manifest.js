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
		client: {start:"_app/immutable/entry/start.19ggnLyG.js",app:"_app/immutable/entry/app.Cajc-gfq.js",imports:["_app/immutable/entry/start.19ggnLyG.js","_app/immutable/chunks/26Y8TQnx.js","_app/immutable/chunks/DIUwmX-5.js","_app/immutable/chunks/B-COqaGz.js","_app/immutable/chunks/DBPLEi_2.js","_app/immutable/entry/app.Cajc-gfq.js","_app/immutable/chunks/DIUwmX-5.js","_app/immutable/chunks/BO4xmTjz.js","_app/immutable/chunks/Cgfx7ag4.js","_app/immutable/chunks/B-COqaGz.js","_app/immutable/chunks/DSVtn6Ld.js","_app/immutable/chunks/BL4xY6Vh.js","_app/immutable/chunks/OPTVuR2p.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CwsHNpjQ.js')),
			__memo(() => import('./chunks/1-Da-02Kao.js')),
			__memo(() => import('./chunks/2-BzPPZAlH.js')),
			__memo(() => import('./chunks/3-DvGwHyhU.js')),
			__memo(() => import('./chunks/4-D86bFEiI.js')),
			__memo(() => import('./chunks/5-CbbemnIn.js')),
			__memo(() => import('./chunks/6-CzFLgBcN.js')),
			__memo(() => import('./chunks/7-B8YVN5h4.js')),
			__memo(() => import('./chunks/8-aqAbUtEe.js')),
			__memo(() => import('./chunks/9-Cje3Y3rX.js')),
			__memo(() => import('./chunks/10-CgYa46bw.js')),
			__memo(() => import('./chunks/11-pstDOFBs.js')),
			__memo(() => import('./chunks/12-BRfSzWeX.js')),
			__memo(() => import('./chunks/13-DgA0BG_8.js')),
			__memo(() => import('./chunks/14-Cfj540Zw.js')),
			__memo(() => import('./chunks/15-CoAOPM0Q.js')),
			__memo(() => import('./chunks/16-CAP6MFgt.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-DOv64_3o.js'))
			},
			{
				id: "/api/health",
				pattern: /^\/api\/health\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DmmFT6Fu.js'))
			},
			{
				id: "/api/lesson-complete",
				pattern: /^\/api\/lesson-complete\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-SJBF8knw.js'))
			},
			{
				id: "/api/proof/[hash]",
				pattern: /^\/api\/proof\/([^/]+?)\/?$/,
				params: [{"name":"hash","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-xCJY-k7a.js'))
			},
			{
				id: "/api/quiz/[id]",
				pattern: /^\/api\/quiz\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-vo8It_xx.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-CeAt44Ay.js'))
			},
			{
				id: "/api/rooms/[id]/files",
				pattern: /^\/api\/rooms\/([^/]+?)\/files\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Bz_eovdn.js'))
			},
			{
				id: "/api/run",
				pattern: /^\/api\/run\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BHbuS5YD.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-DmWSOmOQ.js'))
			},
			{
				id: "/api/users/[nickname]",
				pattern: /^\/api\/users\/([^/]+?)\/?$/,
				params: [{"name":"nickname","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BPl6uHqq.js'))
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
				id: "/profile/[nickname]",
				pattern: /^\/profile\/([^/]+?)\/?$/,
				params: [{"name":"nickname","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/proof/[hash]",
				pattern: /^\/proof\/([^/]+?)\/?$/,
				params: [{"name":"hash","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/rooms",
				pattern: /^\/rooms\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/rooms/[id]",
				pattern: /^\/rooms\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
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
