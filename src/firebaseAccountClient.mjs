import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
import {firebaseAccountRemote} from './firebaseAccountRemote.mjs';

// Explicit construction only. No project is created and no external service is
// contacted on application load. Production connection needs the release config.
export function createFirebaseAccountClient({config,emulators,allowProduction=false,name=crypto.randomUUID()}){
 if(!emulators&&!allowProduction)throw Error('Firebase production activation is not configured.');
 if(emulators&&(!config.projectId.startsWith('demo-')||emulators.host!=='127.0.0.1'))throw Error('Use a local demo project for emulator tests.');
 const app=initializeApp(config,name),auth=getAuth(app),db=getFirestore(app);
 if(emulators){connectAuthEmulator(auth,'http://127.0.0.1:'+emulators.authPort,{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',emulators.firestorePort);}
 return {auth,remote:firebaseAccountRemote(db),uid:()=>auth.currentUser?.uid??null,
  signIn:()=>signInWithPopup(auth,new GoogleAuthProvider()),signOut:()=>signOut(auth),close:()=>deleteApp(app)};
}
