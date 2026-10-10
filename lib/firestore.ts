import {getApps,initializeApp,applicationDefault,cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
export function database(){const app=getApps()[0]||initializeApp({credential:process.env.FIREBASE_SERVICE_ACCOUNT?cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)):applicationDefault(),projectId:'agendasimona-561ce'});return getFirestore(app);}
