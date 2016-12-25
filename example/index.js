const express = require('express');
const operational = require('../index');

const app = express();

const ready = new operational.Ready();
const health = new operational.Health();

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

app.use('/__/ready', ready.handler);
app.use('/__/health', health.handler);

app.listen(3000, () => {
	console.log('Example ready on http://0.0.0.0:3000');
});
