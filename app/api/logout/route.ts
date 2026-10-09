import {NextResponse} from 'next/server';
import {COOKIE} from '@/lib/session.mjs';
export async function POST(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});const r=NextResponse.json({ok:true});r.cookies.set(COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:0,path:'/'});return r;}
