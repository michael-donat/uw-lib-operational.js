class Ready {
	constructor() {
		this.callback = f => f(true);
		this.handler = this.handler.bind(this);
	}

	handler(req, res) {
		this.callback((result) => {
			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			if (!result) {
				return res.status(503).end();
			}
			return res.status(200).send("ready\n");
		})
	}

	onCall(callback) {
		this.callback = callback;
	}
}

module.exports = Ready;
