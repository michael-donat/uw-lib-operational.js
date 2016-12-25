const jsonfile = require('jsonfile');

function addResponseHeaders(res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

class About {
	constructor() {
		this.owners = [];
		this.links = [];
		this.handler = this.handler.bind(this)
	}
	setMeta(name, description) {
		this.name = name;
		this.description = description;
	}

	addOwner(owner) {
		this.owners.push(owner);
	}

	addLink(description, link) {
		this.links.push({description, link});
	}

	setBuildInfo(buildInfo) {
		this['build-info'] = buildInfo;
	}

	setOther(key, value) {
		this[`_${key}`] = value;
	}

	fromFile(filePath) {
		const json = jsonfile.readFileSync(filePath);

		this.setMeta(json.name || this.name, json.description || this.description);
		delete json.name; delete json.description;

		if (json.owners) {
			for (let owner of json.owners) {
				this.addOwner(owner);
			}
		}

		delete json.owners;

		if (json.links) {
			for (let link of json.links) {
				if (!link.description || !link.link) continue;
				this.addLink(link.description, link.link);
			}
		}

		delete json.links;

		if (json['build-info']) {
			this.setBuildInfo(json['build-info']);
		}

		delete json['build-info'];

		Object.keys(json).forEach((key, i) => {
			this.setOther(key, json[key]);
		});
	}

	handler(req, res) {
		addResponseHeaders(res);
		res.json(this);
	}
}

module.exports = About;
