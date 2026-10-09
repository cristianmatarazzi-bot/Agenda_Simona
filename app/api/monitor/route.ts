import {mep,parseActivities,upcoming} from '@/lib/institutions';
import {database} from '@/lib/firestore';
import seedActivities from '@/data/activities.json';
import seedCalendar from '@/data/calendar.json';
export const dynamic='force-dynamic';
async function get(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{Accept:'text/html,text/csv;q=0.9,*/*;q=0.8'}});if(!r.ok)throw Error('HTTP '+r.status);const text=await r.text();if(/verify that you're not a robot|<title>[^<]*captcha/i.test(text))throw Error('Verifica richiesta dalla fonte');return text;}
async function stored<T>(id:string,fallback:T):Promise<{value:T;updatedAt:string}|null>{try{const doc=await database().collection('institutionCache').doc(id).get();const row=doc.data();return row?{value:JSON.parse(row.payload),updatedAt:row.updatedAt}:null;}catch{return null;}}
async function persist(id:string,value:unknown,updatedAt:string){try{await database().collection('institutionCache').doc(id).set({payload:JSON.stringify(value),updatedAt});}catch{console.warn('Institution cache unavailable');}}
export async function GET(){
 const now=new Date().toISOString();
 const [savedActivities,savedCalendar]=await Promise.all([stored('activities',seedActivities.activities),stored('calendar',seedCalendar.csv)]);
 let activities=savedActivities?.value||seedActivities.activities,activitiesUpdatedAt=savedActivities?.updatedAt||seedActivities.updatedAt;
 let csv=savedCalendar?.value||seedCalendar.csv,calendarUpdatedAt=savedCalendar?.updatedAt||seedCalendar.updatedAt;
 let cachedActivities=true,cachedCalendar=true;
 await Promise.all([
 (async()=>{if(savedActivities&&Date.now()-Date.parse(activitiesUpdatedAt)<900000){cachedActivities=false;return;}const pages=[['home','Attività parlamentare'],['main-activities/plenary-speeches','Interventi in aula'],['other-activities/written-questions-other','Interrogazioni scritte'],['main-activities/motions-instit','Proposte di risoluzione']];const results=await Promise.allSettled(pages.map(async([path,label])=>{const rows=parseActivities(await get(mep+path),label);if(!rows.length)throw Error('Nessuna attività riconosciuta');return rows;}));const fresh=results.flatMap(r=>r.status==='fulfilled'?r.value:[]);for(let i=0;i<results.length;i++){const r=results[i];if(r.status==='rejected')console.warn('Institution activity source',pages[i][0],String(r.reason));}if(fresh.length){activities=[...new Map([...activities,...fresh].map(a=>[a.url,a])).values()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,60);activitiesUpdatedAt=now;cachedActivities=results.some(r=>r.status==='rejected');await persist('activities',activities,now);}})(),
 (async()=>{if(savedCalendar&&Date.now()-Date.parse(calendarUpdatedAt)<3600000){cachedCalendar=false;return;}try{const fresh=await get(`https://data.europarl.europa.eu/distribution/meetings_${new Date().getUTCFullYear()}_4_en.csv`);if(!fresh.replace(/^\uFEFF/,'').startsWith('meeting_identifier,'))throw Error('Formato calendario non valido');csv=fresh;calendarUpdatedAt=now;cachedCalendar=false;await persist('calendar',csv,now);}catch(e){console.warn('Institution calendar source',String(e));}})()
 ]);
 const events=upcoming(csv);
 return Response.json({activities:activities.slice(0,20),events,agendaError:false,activityError:activities.length===0,checkedAt:now,activitiesUpdatedAt,calendarUpdatedAt,cachedActivities,cachedCalendar},{headers:{'Cache-Control':'private, max-age=300'}});
}
