import {createHash} from 'node:crypto';
import {GET as news} from './news';
import {GET as monitor} from './monitor';
import {database} from '../lib/firestore';
import {defaults} from '../lib/topics';
import {feedInput} from '../lib/feed-key';
const db=database();
let topics=defaults;
const preferences=await db.collection('preferences').doc('topics').get();
if(preferences.exists){const raw=JSON.parse(preferences.data()!.payload);if(!Array.isArray(raw)||raw.length>20)throw Error('Elenco interessi non valido');topics=raw.filter(t=>typeof t.query==='string'&&t.query.length<=180&&typeof t.enabled==='boolean'&&[1,14].includes(t.days));}
let successes=0,failures=0;
// Bounded concurrency limits traffic and avoids excessive resource use.
const active=topics.filter(t=>t.enabled);
for(let i=0;i<active.length;i+=2){await Promise.all(active.slice(i,i+2).map(async t=>{const key=createHash('sha256').update(feedInput(t.query,t.days)).digest('hex');try{const response=await news(new Request('https://collector.invalid/?'+new URLSearchParams({q:t.query,days:String(t.days)})));if(!response.ok)throw Error('Fonti indisponibili');const payload=await response.json();await db.collection('feeds').doc(key).set({payload:JSON.stringify(payload),updatedAt:payload.fetchedAt});successes++;}catch{failures++;console.warn('Una raccolta non è riuscita; conservata l’edizione precedente.');}}));}
const response=await monitor();await db.collection('edition').doc('monitor').set({payload:JSON.stringify(await response.json()),updatedAt:new Date().toISOString()});
await db.collection('edition').doc('status').set({checkedAt:new Date().toISOString(),successes,failures});
console.log(`Raccolta completata: ${successes} sezioni aggiornate, ${failures} non raggiungibili.`);
if(failures>0)process.exitCode=1;
