install:
	yarn install

lint:
	./node_modules/.bin/eslint --fix . && ./node_modules/.bin/prettier --write './*.js'

test:
	./node_modules/.bin/mocha 'tests/*.spec.js'
