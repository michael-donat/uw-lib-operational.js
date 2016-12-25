function addResponseHeaders(res) {
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

class Ready {
	constructor() {
		this.callback = r => r.ready();
		this.handler = this.handler.bind(this);
	}

	reporter(res) {
		return {
			ready: function (res) {
				addResponseHeaders(res);
				return res.status(200).send('ready\n');
			}.bind(null, res),
			waiting: function () {
				addResponseHeaders(res);
				return res.status(503).end();
			}.bind(null, res)
		};
	}

	handler(req, res) {
		this.callback(this.reporter(res));
	}

	onCall(callback) {
		this.callback = callback;
	}
}

module.exports = Ready;
