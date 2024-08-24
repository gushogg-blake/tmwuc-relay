let ws = require("ws");
let {removeInPlace} = require("./utils/arrayMethods");

module.exports = function(app, port) {
	let socket = new ws.Server({
		port,
	});
	
	// remove default EventEmitter limit
	socket.setMaxListeners(0);
	
	socket.on("connection", function(ws, req) {
		let {clientsByKey} = app;
		
		console.log(req);
		
		if (key) {
			if (!clientsByKey[key]) {
				clientsByKey[key] = [];
			}
			
			clientsByKey[key].push(ws);
		} else {
			// TODO close
		}
		
		ws.on("close", function() {
			if (clientsByKey[key]) {
				removeInPlace(clientsByKey[key], ws);
				
				if (clientsByKey[key].length === 0) {
					delete clientsByKey[key];
				}
			}
		});
	});
}
