import {getApps,initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
export const OWNER_UID='RwWKrgrMJRRk7MYWGjSFrgvLKwg2';
const config={projectId:'agendasimona-561ce',appId:'1:202037412917:web:0591189b0498d9201f1d7c',apiKey:'AIzaSyBefX04dyYRHLMer445pJ18w-VNkqyk5Eg',authDomain:'agendasimona-561ce.firebaseapp.com',messagingSenderId:'202037412917'};
const app=()=>getApps()[0]||initializeApp(config);
export const auth=()=>getAuth(app());
export const db=()=>getFirestore(app());
