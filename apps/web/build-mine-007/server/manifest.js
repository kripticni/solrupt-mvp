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
		client: {start:"_app/immutable/entry/start.B0L7F5NO.js",app:"_app/immutable/entry/app.exNac2zS.js",imports:["_app/immutable/entry/start.B0L7F5NO.js","_app/immutable/chunks/BJ9ta_OO.js","_app/immutable/chunks/B_uqRuMo.js","_app/immutable/chunks/B1jpxkHn.js","_app/immutable/chunks/CqBDQtAS.js","_app/immutable/entry/app.exNac2zS.js","_app/immutable/chunks/B_uqRuMo.js","_app/immutable/chunks/CVvanCqv.js","_app/immutable/chunks/CyJhm80y.js","_app/immutable/chunks/B1jpxkHn.js","_app/immutable/chunks/CZLB95R_.js","_app/immutable/chunks/DCH2VEDy.js","_app/immutable/chunks/CFq-eEAu.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Dnux2gSb.js')),
			__memo(() => import('./chunks/1-DnzP5Tyb.js')),
			__memo(() => import('./chunks/2-BIkkAqBt.js')),
			__memo(() => import('./chunks/3-_MHSJKx5.js')),
			__memo(() => import('./chunks/4-CqiSYE7S.js')),
			__memo(() => import('./chunks/5-ByAAncnQ.js')),
			__memo(() => import('./chunks/6-DtfYLnUM.js')),
			__memo(() => import('./chunks/7-CnM4vNNe.js')),
			__memo(() => import('./chunks/8-dGk-VoV3.js')),
			__memo(() => import('./chunks/9-B7KuZKgm.js')),
			__memo(() => import('./chunks/10-BfggXAlO.js')),
			__memo(() => import('./chunks/11-BkQflb-F.js')),
			__memo(() => import('./chunks/12-rRYh7Yf4.js')),
			__memo(() => import('./chunks/13-CshGkXgj.js')),
			__memo(() => import('./chunks/14-m5ftE1JH.js')),
			__memo(() => import('./chunks/15-BPXgxDu-.js')),
			__memo(() => import('./chunks/16-DjF-oPLf.js'))
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
				id: "/api/lesson-complete",
				pattern: /^\/api\/lesson-complete\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-B99YAyFf.js'))
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
				id: "/api/rooms/[id]/files",
				pattern: /^\/api\/rooms\/([^/]+?)\/files\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CnWJ8ZSj.js'))
			},
			{
				id: "/api/run",
				pattern: /^\/api\/run\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CG6hMB53.js'))
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
