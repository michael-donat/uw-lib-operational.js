# Operational Endpoints for node.js

## Ready

- `Ready.constructor` - check constructor
- `Ready.handler` - is the standard middleware handler for your http server, it returns responses as per UW operational endpoints spec - https://github.com/utilitywarehouse/operational-endpoints-spec/blob/master/READY.md
- `Ready.onCall(func callback)` - registers a callback to be fired on each invocation of the handler. The callback gets an instance of the reporter as argument,You are *required* to call one of the reprter methods otherwise the middleware won't progress.
- `Reporter.ready` - indicates the service is ready
- `Reporter.waiting` - indicated the service is not ready yet

## Health

- `Health.constructor(string name, string description)` - check constructor
- `Health.handler` - is the standard middleware handler for your http server, it returns responses as per UW operational endpoints spec - https://github.com/utilitywarehouse/operational-endpoints-spec/blob/master/HEALTH.md
- `Ready.addCheck(string name, func callback)` - registers a callback under given name to be executed on each invocation of the handler. The callback gets an instance of the reporter as argument,You are *required* to call one of the reporter methods otherwise the middleware won't progress.
- `Reporter.healthy(string output)` - indicates the check is healthy with given output
- `Reporter.degraded(string output, string action)` - indicates the check is in degraded state with given output and action to be taken to fix the issue
- `Reporter.unhealthy(string output, string action, string impact)` - indicates the check is in unhealthy state with given output, action to be taken to fix the issue as well as the impact the issue has on the service

## About 

- `About.constructor` - constructor
- `About.handler` - is the standard middleware handler for your http server, it returns responses as per UW operational endpoints spec - https://github.com/utilitywarehouse/operational-endpoints-spec/blob/master/ABOUT.md
- `About.fromFile(string filePath)` - will *synchronously* load properties from a JSON file
- `About.setMeta(string name, string description)` - sets meta name information
- `About.addOwner({string name, string slack, string email})` - adds ownership information (can add multiple owners by calling this method multiple times)
- `About.addLink(string description, string link)` - adds link information (can add multiple links by calling this method multiple times)

### Build info

For CI there's an extra command line tool provided called `build-info`:

```
  Usage: build-info [options]

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -l --link <string>      link to build
    -n --number <string>    build number
    -r --revision <string>  code revision
    -o --output [string]    output file
```

### Circle info

For convinience, above command has been preconfigured to read from CircleCI environment, available as `circle-info`.

## Example

```node.js
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
about.fromFile(path(__dirname, 'build.json'));

app.use('/__/about', about.handler);
app.use('/__/ready', ready.handler);
app.use('/__/health', health.handler);

app.listen(3000, () => {
	console.log('Example ready on http://0.0.0.0:3000');
});

```
