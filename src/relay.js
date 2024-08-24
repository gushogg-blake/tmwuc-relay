module.exports = function(app) {
	let {clientByKey} = app;
	
	app.all("/print/:key", function(req, res) {
		let {key} = req.params;
		let {headers} = req;
		let wsClient = app.clientByKey[key];
		
		if (!wsClient) {
			return res.json(null);
		}
		
		let {
			"content-type": contentType,
		} = headers;
		
		let isJson = contentType === "application/json";
		
		wsClient.send(JSON.stringify({
			type: "log",
			data: {
				key,
				isJson,
				data: isJson ? req.body : req.rawBody,
				headers: displayHeaders,
			},
		}));
		
		res.json(null);
	});
}
