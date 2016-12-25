#!/usr/bin/env node

const program = require('commander');
const About = require('../src/about');
const jsonfile = require('jsonfile');

program
	.version('1.0.0')
	.option('-l --link <string>', 'link to build')
	.option('-n --number <string>', 'build number')
	.option('-r --revision <string>', 'code revision')
	.option('-o --output [string]', 'output file', 'build.json')
	.parse(process.argv);


const about = new About();

about.setBuildInfo({
	build: {
		link: program.link,
		number: program.number
	},
	revision: program.revision
});

jsonfile.writeFileSync(program.output, about);
