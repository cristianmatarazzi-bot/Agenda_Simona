import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
export const COOKIE='agenda_session';
export const TTL=7*24*60*60;
function config(){const key=process.env.SESSION_SECRET;const password=process.env.APP_PASSWORD;if(!key||key.length<32||!password)throw Error('Accesso non configurato');return {key,password};}
function equal(a,b){const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();return timingSafeEqual(x,y);}
export function checkPassword(input){return typeof input==='string'&&equal(input,config().password);}
function sign(body){const {key,password}=config();return createHmac('sha256',key).update(body+'|'+password).digest('base64url');}
export function issueSession(now=Date.now()){const body=Buffer.from(JSON.stringify({exp:Math.floor(now/1000)+TTL})).toString('base64url');return body+'.'+sign(body);}
export function validSession(token,now=Date.now()){try{if(typeof token!=='string'||token.length>1024)return false;const [body,sig,extra]=token.split('.');if(extra||!body||!sig||!equal(sig,sign(body)))return false;const payload=JSON.parse(Buffer.from(body,'base64url').toString());return Number.isInteger(payload.exp)&&payload.exp>now/1000&&payload.exp<=now/1000+TTL;}catch{return false;}}
