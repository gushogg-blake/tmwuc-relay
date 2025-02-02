module.exports = {
	apps: [
		{
			name: "printr-relay-prod",
			script: "src/main.js",
			
			env: {
				SERVE_FRONTEND_STATIC: process.env.HOME + "/apps/printr/prod/dist",
			},
		},
	],
};
