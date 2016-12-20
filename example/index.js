const express = require('express');
const operational = require('../index');
const app = express();

const ready = new operational.Ready();

ready.onCall((callback) => {
	//do some checks here
	if (false) {
		return callback(true);
	} else {
		return callback(false);
	}
})

app.use('/__/ready', ready.handler);

app.listen(3000, () => {
	console.log('Example ready on http://0.0.0.0:3000');
})
