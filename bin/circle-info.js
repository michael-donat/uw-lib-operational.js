#!/usr/bin/env node

const About = require('../src/about');
const jsonfile = require('jsonfile');

const about = new About();

about.setBuildInfo({
	build: {
		link: process.env.CIRCLE_BUILD_URL,
		number: process.env.CIRCLE_BUILD_NUM
	},
	revision: process.env.CIRCLE_SHA1
});

jsonfile.writeFileSync(program.output, about);
