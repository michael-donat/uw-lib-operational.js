const express = require('express');
const operational = require('../index');
const path = require('path');

const app = express();

const ready = new operational.Ready();
const health = new operational.Health();
const about = new oprtational.About();

ready.onCall(r => {
	r.ready();
});

health.addCheck('api', r => {
	r.healthy('api is available');
});

health.addCheck('cache', r => {
	r.degraded('redis went away', 'check pods');
});

health.addCheck('db', r => {
	r.unhealthy('db not configured', 'configure db', 'app unusable');
});

about.setMeta('name', 'description');
about.addOwner({name: 'Web Systems Team', slack: '#web-systems', email: 'it-websystems@utilitywarehosue.co.uk'});
about.addLink('README', 'https://github.com/utilitywarehouse/uw-lib-operational.js/README.md');
about.fromFile(path(__dirname, 'about.json'));

app.use('/__/about', about.handler);
app.use('/__/ready', ready.handler);
app.use('/__/health', health.handler);

app.listen(3000, () => {
	console.log('Example ready on http://0.0.0.0:3000');
});
