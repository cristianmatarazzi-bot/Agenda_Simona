import {getApps,initializeApp,applicationDefault} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
export function database(){const app=getApps()[0]||initializeApp({credential:applicationDefault(),projectId:process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT});return getFirestore(app);}
