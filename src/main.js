let http = require("http");
let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let wsServer = require("./wsServer");
let relay = require("./relay");

let {
	PORT = "3678",
	WS_PORT = "3789",
} = process.env;

(async function() {	
	let app = express();
	
	app.clientsByKey = {};
	
	wsServer(app, Number(WS_PORT));
	
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
	
	relay(app);
	
	app.use(function(req, res) {
		res.status(404);
		res.send("404");
	});
	
	app.use(function(error, req, res, next) {
		console.error(error);
		res.status(500);
		res.send("500");
	});

	http.createServer(app).listen(Number(PORT));
})();
