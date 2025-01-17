module.exports = {
	apps: [
		{
			name: "tmwuc-relay-prod",
			script: "src/main.js",
			
			env: {
				SERVE_FRONTEND_STATIC: process.env.HOME + "/apps/tmwuc/prod/dist",
			},
		},
	],
};
