let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let expressWs = require("express-ws");

let {
	PORT = "3789",
	SERVE_FRONTEND_STATIC = null,
} = process.env;

(async function() {	
	let app = express();
	let clientsByKey = {};
	
	let ws = expressWs(app);
	
	// remove default EventEmitter limit
	ws.getWss().setMaxListeners(0);
	
	app.enable("trust proxy");
	app.use(cors());
	
	function saveRawBody(req, res, buffer, encoding) {
		if (buffer && buffer.length > 0) {
			req.rawBody	= buffer.toString(encoding || "uft8");
		}
	}
	
	app.use(bodyParser.raw({
		verify: saveRawBody,
	}));
	
	app.use(bodyParser.text({
		verify: saveRawBody,
	}));
	
	app.use(bodyParser.urlencoded({
		limit: "100mb",
		extended: true,
		verify: saveRawBody,
	}));
	
	app.use(bodyParser.json({
		limit: "100mb",
		strict: false,
		verify: saveRawBody,
	}));
	
	app.ws("/ws/:key", function(ws, req) {
		let {key} = req.params;
		
		if (!clientsByKey[key]) {
			clientsByKey[key] = new Set();
		}
		
		clientsByKey[key].add(ws);
		
		ws.on("close", function() {
			if (clientsByKey[key]) {
				clientsByKey[key].delete(ws);
				
				if (clientsByKey[key].size === 0) {
					delete clientsByKey[key];
				}
			}
		});
	});
	
	let printRouter = express.Router({
		mergeParams: true,
	});
	
	app.use("/print/:key", function(req, res) {
		let {key} = req.params;
		let {path, headers} = req;
		let wsClients = clientsByKey[key];
		
		if (!wsClients) {
			return res.json(null);
		}
		
		let {
			"content-type": contentType,
		} = headers;
		
		let isJson = contentType === "application/json";
		
		for (let ws of wsClients) {
			ws.send(JSON.stringify({
				type: "log",
				data: {
					key,
					path, // will be / if no path given after the key
					isJson,
					data: isJson ? req.body : req.rawBody,
					headers,
				},
			}));
		}
		
		res.json(null);
	});
	
	if (SERVE_FRONTEND_STATIC) {
		app.use(express.static(SERVE_FRONTEND_STATIC));
	}
	
	app.use(function(req, res) {
		res.status(404);
		res.send("404");
	});
	
	app.use(function(error, req, res, next) {
		console.error(error);
		res.status(500);
		res.send("500");
	});

	app.listen(Number(PORT));
})();
