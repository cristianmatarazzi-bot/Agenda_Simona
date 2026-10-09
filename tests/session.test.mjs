import test from 'node:test';import assert from 'node:assert/strict';
import {issueSession,validSession,checkPassword,TTL} from '../lib/session.mjs';
process.env.APP_PASSWORD='test-password-only';process.env.SESSION_SECRET='test-secret-not-for-production-000000000';
test('correct password, tampering, expiry and password rotation',()=>{assert(checkPassword('test-password-only'));assert(!checkPassword('wrong'));const now=Date.now(),token=issueSession(now);assert(validSession(token,now));assert(!validSession(token+'x',now));assert(!validSession(token,now+(TTL+1)*1000));process.env.APP_PASSWORD='changed';assert(!validSession(token,now));});
test('missing secrets fail closed',()=>{delete process.env.SESSION_SECRET;assert(!validSession('a.b'));assert.throws(()=>issueSession());});
