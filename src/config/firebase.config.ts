import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
    FIREBASE_API_KEY,
    FIREBASE_APP_ID,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
} from '.';

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: FIREBASE_API_KEY!,
    authDomain: FIREBASE_AUTH_DOMAIN!,
    projectId: FIREBASE_PROJECT_ID!,
    storageBucket: FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID!,
    appId: FIREBASE_APP_ID!,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export default auth;
