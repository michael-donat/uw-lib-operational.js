const Ready = require('./../src/ready');
const express = require('express');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('Ready', function () {
	beforeEach(function () {
		this.app = express();
		this.ready = new Ready();
		this.app.use('/', this.ready.handler);
	});
	it('returns no cache headers', function (done) {
		request(this.app)
			.get('/')
			.expect('Content-Type', /plain/)
			.expect('Cache-Control', 'no-cache, no-store, must-revalidate')
			.expect('Pragma', 'no-cache')
			.expect('Expires', '0', done);
	});
	it('returns 200 with ready by default', function (done) {
		request(this.app)
			.get('/')
			.expect('ready\n')
			.expect(200, done);
	});
	it('handler calls registered callback with reporter', function () {
		const spy = sinon.spy();
		this.ready.onCall(spy);
		this.ready.handler();

		expect(spy).to.have.been.calledWith(
			sinon.match.has('ready', sinon.match.func).and(
				sinon.match.has('waiting', sinon.match.func)
			)
		);
	});
	it('returns 503 with no body on failed check', function (done) {
		this.ready.onCall(r => r.waiting());
		request(this.app)
			.get('/')
			.expect('')
			.expect(503, done);
	});
});
