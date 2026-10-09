import {NextRequest,NextResponse} from 'next/server';
import {COOKIE,validSession} from './lib/session.mjs';
export function proxy(req:NextRequest){const path=req.nextUrl.pathname;if(path==='/login'||path==='/api/login')return NextResponse.next();if(validSession(req.cookies.get(COOKIE)?.value))return NextResponse.next();if(path.startsWith('/api/'))return NextResponse.json({error:'Accedi con la password.'},{status:401});return NextResponse.redirect(new URL('/login',req.url));}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg|favicon.ico).*)']};
