import test from 'node:test';
import assert from 'node:assert/strict';
import {feedInput} from '../lib/feed-key';
import {upcoming} from '../lib/institutions';
import {readFileSync,readdirSync} from 'node:fs';
test('le chiavi delle raccolte normalizzano spazi e periodo',()=>{assert.equal(feedInput(' politica ',14),'14|politica');assert.equal(feedInput('politica',0),'1|politica');assert.notEqual(feedInput('politica',1),feedInput('politica',14));});
test('il calendario copre sette giorni italiani senza includere il giorno otto',()=>{const csv='meeting_identifier,meeting_start,meeting_type,meeting_place,meeting_uri\n1,2026-10-10,part-session,Roma,https://example.org/1\n2,2026-10-16,part-session,Roma,https://example.org/2\n3,2026-10-17,part-session,Roma,https://example.org/3';assert.equal(upcoming(csv,new Date('2026-10-09T22:30:00Z')).length,2);});
test('la configurazione Hosting è statica e limitata al progetto richiesto',()=>{const c=JSON.parse(readFileSync('firebase.json','utf8'));assert.equal(c.hosting.site,'agendasimona-561ce');assert.equal(c.hosting.public,'out');assert.equal(c.functions,undefined);assert.ok(!readdirSync('app').includes('api'));});
