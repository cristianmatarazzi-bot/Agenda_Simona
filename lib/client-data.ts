import {collection,doc,getDoc,getDocs,setDoc,deleteDoc,query,orderBy,limit} from 'firebase/firestore';
import {signOut} from 'firebase/auth';
import {auth,db,OWNER_UID} from './firebase-client';
import {feedInput} from './feed-key';
function requireUser(){if(auth().currentUser?.uid!==OWNER_UID)throw Error('Accedi per consultare il giornale.');}
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function saveTopics(topics:unknown[]){requireUser();await setDoc(doc(db(),'preferences','topics'),{payload:JSON.stringify(topics),updatedAt:new Date().toISOString()});}
export async function loadTopics(){requireUser();const snapshot=await getDoc(doc(db(),'preferences','topics'));return snapshot.exists()?JSON.parse(snapshot.data().payload):null;}
export const logout=()=>signOut(auth());
export async function apiFetch(input:string,init:RequestInit={}){requireUser();try{const u=new URL(input,location.origin);let result:unknown;
if(u.pathname==='/api/news'){const key=await hash(feedInput(u.searchParams.get('q')||'',Number(u.searchParams.get('days'))));const snapshot=await getDoc(doc(db(),'feeds',key));result=snapshot.exists()?JSON.parse(snapshot.data().payload):{articles:[],fetchedAt:'',error:'La raccolta per alcuni interessi non è ancora pronta. Comparirà dopo il prossimo aggiornamento automatico.'};}
else if(u.pathname==='/api/monitor'){const snapshot=await getDoc(doc(db(),'edition','monitor'));if(!snapshot.exists())throw Error('Monitor in preparazione');result=JSON.parse(snapshot.data().payload);}
else if(u.pathname==='/api/archive'){if(!init.method||init.method==='GET'){const snapshot=await getDocs(query(collection(db(),'savedArticles'),orderBy('savedAt','desc'),limit(500)));result={articles:snapshot.docs.map(d=>JSON.parse(d.data().payload))};}else{const article=JSON.parse(String(init.body));const ref=doc(db(),'savedArticles',await hash(article.url));if(init.method==='DELETE')await deleteDoc(ref);else await setDoc(ref,{payload:JSON.stringify(article),savedAt:new Date().toISOString()});result={ok:true};}}
else throw Error('Richiesta non supportata');if(init.signal?.aborted)throw new DOMException('Aborted','AbortError');return Response.json(result);
}catch(error){if(init.signal?.aborted)throw error;return Response.json({error:'Dati non disponibili. Verifica la connessione e la configurazione di Firestore.',articles:[],fetchedAt:''},{status:503});}}
