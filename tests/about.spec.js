const About = require('./../src/about');
const express = require('express');
const request = require('supertest');
const chai = require('chai');
const path = require('path');

chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('About', function () {
	beforeEach(function () {
		this.app = express();
		this.about = new About();
		this.app.use('/', this.about.handler);
	});
	it('returns no cache headers', function (done) {
		request(this.app)
			.get('/')
			.expect('Content-Type', /application\/json/)
			.expect('Cache-Control', 'no-cache, no-store, must-revalidate')
			.expect('Pragma', 'no-cache')
			.expect('Expires', '0', done);
	});
	it('returns 200 with about info', function (done) {

		this.about.setMeta('name', 'desc');
		this.about.addLink('readme', 'link#readme');
		this.about.addLink('git', 'link#git');
		this.about.addOwner({team: 'web team'});
		this.about.addOwner({slack: '#webteam'});
		this.about.setBuildInfo({revision: 'rev'});

		request(this.app)
			.get('/')
			.expect(200)
			.expect({
				name: 'name',
				description: 'desc',
				links: [
					{description: 'readme', link: 'link#readme'},
					{description: 'git', link: 'link#git'}
				],
				owners: [
					{team: 'web team'},
					{slack: '#webteam'}
				],
				'build-info': {revision: 'rev'}
			}, done)
	});

	it('fails to load from file if file does not exist or not json', function() {
		expect(()=>this.about.fromFile('some file')).to.throw();
		expect(()=>this.about.fromFile(__filename)).to.throw();
	});

	it('loads from file', function() {

		const file = require('./about.fixture.json');

		this.about.setMeta('override', 'override2');
		this.about.addOwner({'team': 'web team'});
		this.about.addLink('readme', 'link#readme');

		this.about.fromFile(path.join(__dirname, 'about.fixture.json'));

		expect(JSON.parse(JSON.stringify(this.about))).to.be.eql({
			name: file.name,
			description: file.description,
			owners: [
				{team: 'web team'},
				file.owners.pop()
			],
			links: [
				{description: 'readme', link: 'link#readme'},
				file.links.pop()
			],
			'build-info': {
				revision: 'rev#123'
			},
			_some: file.some,
			_even: file.even
		});

	})

});
