// Firebase Configuration for "הדוור הבא" (Next Mail Employees)
// This file contains the Firebase initialization and configuration

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIidWZpCvP682BqCt3OjkHEi3LSxErNJE",
  authDomain: "hadavar-deliveries.firebaseapp.com",
  projectId: "hadavar-deliveries",
  storageBucket: "hadavar-deliveries.firebasestorage.app",
  messagingSenderId: "906027089203",
  appId: "1:906027089203:web:0d20bca3b99155c24e1246",
  measurementId: "G-R5EXD5JHHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const functions = getFunctions(app, 'europe-west1'); // Use appropriate region

export default app;

