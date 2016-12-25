install:
	yarn install

lint:
	./node_modules/.bin/xo 'src/**/*.js'

test:
	./node_modules/.bin/mocha 'tests/*.spec.js'
