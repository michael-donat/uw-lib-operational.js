# Operational Endpoints for node.js

## Ready

### API

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
