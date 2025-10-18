import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCIidWZpCvP682BqCt3OjkHEi3LSxErNJE",
  authDomain: "hadavar-deliveries.firebaseapp.com",
  projectId: "hadavar-deliveries",
  storageBucket: "hadavar-deliveries.firebasestorage.app",
  messagingSenderId: "906027089203",
  appId: "1:906027089203:web:0d20bca3b99155c24e1246",
  measurementId: "G-R5EXD5JHHQ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

