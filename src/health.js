const async = require('async');

function addResponseHeaders(res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

class CheckResult {
	constructor(name, output) {
		this.name = name;
		this.output = output;
	}
}

class Healthy extends CheckResult {
	constructor(name, output) {
		super(name, output);
		this.health = 'healthy';
	}

	get precedence() {
		return 2;
	}

	get json() {
		return {
			name: this.name,
			output: this.output,
			health: this.health
		};
	}
}

class Degraded extends CheckResult {
	constructor(name, output, action) {
		super(name, output);
		this.action = action;
		this.health = 'degraded';
	}

	get precedence() {
		return 1;
	}

	get json() {
		return {
			name: this.name,
			output: this.output,
			action: this.action,
			health: this.health
		};
	}
}

class Unhealthy extends CheckResult {
	constructor(name, output, action, impact) {
		super(name, output);
		this.action = action;
		this.impact = impact;
		this.health = 'unhealthy';
	}

	get precedence() {
		return 0;
	}

	get json() {
		return {
			name: this.name,
			output: this.output,
			action: this.action,
			impact: this.impact,
			health: this.health
		};
	}
}

class Reporter {
	constructor(name, callback) {
		this.name = name;
		this.callback = callback;
	}
	healthy(output) {
		if (!output) {
			throw new Error('output required for Healthy status');
		}
		this.callback(new Healthy(this.name, output));
	}
	degraded(output, action) {
		if (!output || !action) {
			throw new Error('output and action required for Degraded status');
		}
		this.callback(new Degraded(this.name, output, action));
	}
	unhealthy(output, action, impact) {
		if (!output || !action || !impact) {
			throw new Error('output, action and impact required for Unhealthy status');
		}
		this.callback(new Unhealthy(this.name, output, action, impact));
	}
}

class Check {
	constructor(name, callback) {
		this.name = name;
		this.callback = callback;
	}

	execute(callback) {
		callback.bind(null);
		this.callback(new Reporter(this.name, callback));
	}
}

class Health {
	constructor(name, description) {
		if (!name || !description) {
			throw new Error('name and description required for construction');
		}
		this.name = name;
		this.description = description;
		this.checks = [];

		this.handler = this.handler.bind(this);
	}

	addCheck(name, checkCallback) {
		this.checks.push(new Check(name, checkCallback));
	}

	_prepareResponse(result) {
		return {
			name: this.name,
			description: this.description,
			health: result.sort((a, b) => {
				return a.precedence > b.precedence ? 1 : b.precedence > a.precedence ? -1 : 0
			})[0].health,
			checks: result.map(check => check.json)
		};
	}

	handler(req, res) {
		if (this.checks.length === 0) {
			addResponseHeaders(res);
			return res.status(501).end();
		}
		const checks = this.checks.map(check => asyncCallback => check.execute(result => {
			if (!(result instanceof CheckResult)) {
				throw new Error(`Unexpected result from '${check.name}' check, expected instance of CheckResult`);
			}
			result.name = check.name;
			asyncCallback(null, result);
		}, this.status));
		async.parallel(
			checks,
			(err, result) => {
				if (err) {
					throw err;
				}
				addResponseHeaders(res);
				res.json(this._prepareResponse(result));
			}
		);
	}

	get status() {
		return {Healthy, Degraded, Unhealthy};
	}
}

module.exports = Health;
