import {database} from '@/lib/firestore';
import {createHash} from 'node:crypto';
import {z} from 'zod';
const article=z.object({title:z.string().max(1500),url:z.string().url().max(4000).refine(u=>/^https?:\/\//.test(u)),source:z.string().max(150),date:z.string().refine(d=>Number.isFinite(Date.parse(d))),image:z.string().url().max(4000).optional(),topic:z.string().max(100).optional()});
const collection=()=>database().collection('savedArticles');
const key=(url:string)=>createHash('sha256').update(url).digest('hex');
export async function GET(){try{const snapshot=await collection().orderBy('savedAt','desc').get();return Response.json({articles:snapshot.docs.map(d=>d.data())},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Archivio temporaneamente non disponibile.'},{status:503})}}
export async function POST(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});try{const a=article.parse(await req.json());await collection().doc(key(a.url)).set(JSON.parse(JSON.stringify({...a,savedAt:new Date().toISOString()})));return Response.json({ok:true});}catch(e){return Response.json({error:'Salvataggio non riuscito.'},{status:e instanceof z.ZodError?400:503})}}
export async function DELETE(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});try{const {url}=z.object({url:z.string().url().max(4000)}).parse(await req.json());await collection().doc(key(url)).delete();return Response.json({ok:true});}catch{return Response.json({error:'Rimozione non riuscita.'},{status:503})}}
