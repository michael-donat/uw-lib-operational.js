install:
	yarn install
lint:
	./node_modules/.bin/xo src

test:
	./node_modules/.bin/mocha tests/about.spec.js

