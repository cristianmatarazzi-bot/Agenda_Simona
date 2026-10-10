'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {onAuthStateChanged,signOut} from 'firebase/auth';
import {auth,OWNER_UID} from '@/lib/firebase-client';
export default function AuthGate({children}:{children:ReactNode}){const [ready,setReady]=useState(false);useEffect(()=>onAuthStateChanged(auth(),user=>{if(user?.uid===OWNER_UID)setReady(true);else{setReady(false);if(user)void signOut(auth());location.replace('/login/');}}),[]);return ready?<>{children}</>:<main style={{padding:40,color:'#0b2f5b'}}>Verifica dell’accesso…</main>}
