const Health = require('./../src/health');
const express = require('express');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('Health', function () {
	beforeEach(function () {
		this.app = express();
		this.name = 'uw-operational-test';
		this.description = 'test suite for operational endpoints';
		this.health = new Health(this.name, this.description);
		this.app.use('/', this.health.handler);
	});
	it('requires name and description', function () {
		expect(() => new Health()).to.throw();
		expect(() => new Health(true)).to.throw();
		expect(() => new Health(true, true)).to.not.throw();
	});

	it('returns 501 not implemented when no checks registered', function (done) {
		request(this.app)
			.get('/')
			.expect('')
			.expect('Content-Type', /application\/json/)
			.expect('Cache-Control', 'no-cache, no-store, must-revalidate')
			.expect('Pragma', 'no-cache')
			.expect('Expires', '0')
			.expect(501, done);
	});

	it('handler calls registered callbacks with reporter', function () {
		const spy = sinon.spy();
		this.health.addCheck('check', spy);
		this.health.handler();

		expect(spy).to.have.been.calledWith(
			sinon.match.has('healthy', sinon.match.func).and(
				sinon.match.has('unhealthy', sinon.match.func)
			).and(
				sinon.match.has('degraded', sinon.match.func)
			)
		);
	});

	it('returns name, description and no cache headers', function (done) {
		this.health.addCheck('check', r => r.healthy('ok'));

		request(this.app)
			.get('/')
			.expect('Content-Type', /application\/json/)
			.expect('Cache-Control', 'no-cache, no-store, must-revalidate')
			.expect('Pragma', 'no-cache')
			.expect('Expires', '0')
			.expect(200)
			.end((err, res) => {
				expect(res.body).to.have.property('name', this.name);
				expect(res.body).to.have.property('description', this.description);
				done();
			});
	});

	it('returns details of healthy check', function (done) {
		this.health.addCheck('check', r => r.healthy('ok'));

		request(this.app)
			.get('/')
			.end((err, res) => {
				expect(res.body.checks[0]).to.have.property('name', 'check');
				expect(res.body.checks[0]).to.have.property('health', 'healthy');
				expect(res.body.checks[0]).to.have.property('output', 'ok');
				done();
			});
	});

	it('returns details of degraded check', function (done) {
		this.health.addCheck('check', r => r.degraded('foo', 'bar'));

		request(this.app)
			.get('/')
			.end((err, res) => {
				expect(res.body.checks[0]).to.have.property('name', 'check');
				expect(res.body.checks[0]).to.have.property('health', 'degraded');
				expect(res.body.checks[0]).to.have.property('output', 'foo');
				expect(res.body.checks[0]).to.have.property('action', 'bar');
				done();
			});
	});

	it('returns details of unhealthy check', function (done) {
		this.health.addCheck('check', r => r.unhealthy('foo', 'bar', 'baz'));

		request(this.app)
			.get('/')
			.end((err, res) => {
				expect(res.body.checks[0]).to.have.property('name', 'check');
				expect(res.body.checks[0]).to.have.property('health', 'unhealthy');
				expect(res.body.checks[0]).to.have.property('output', 'foo');
				expect(res.body.checks[0]).to.have.property('action', 'bar');
				expect(res.body.checks[0]).to.have.property('impact', 'baz');
				done();
			});
	});

	it('plucks most severe health for top level healt property', function (done) {
		this.health.addCheck('check', r => r.degraded('foo', 'bar'));
		this.health.addCheck('check', r => r.unhealthy('foo', 'bar', 'baz'));

		request(this.app)
			.get('/')
			.end((err, res) => {
				expect(res.body).to.have.property('health', 'unhealthy');
				done();
			});
	});

	it('returns for all checks', function (done) {
		this.health.addCheck('check', r => r.degraded('foo', 'bar'));
		this.health.addCheck('check', r => r.unhealthy('foo', 'bar', 'baz'));

		request(this.app)
			.get('/')
			.end((err, res) => {
				expect(res.body.checks.length).to.be.equal(2);
				done();
			});
	});
});
