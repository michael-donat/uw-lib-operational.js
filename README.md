# Operational Endpoints for node.js

## Ready

### API

- `Ready.handler` - is the standard middleware handler for your http server, it retuens responses as per UW operational endpoints spec - https://github.com/utilitywarehouse/operational-endpoints-spec/blob/master/READY.md
- `Ready.onCall` - registers a callback to be fired on each invocation of the handler. The callback will be called with handler callback method which needs to be called with boolean value to indicate if the service is ready or not. Registering a callback is optional, by default the handler will return OK as soon as the API is up.

### Example

```
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
```
