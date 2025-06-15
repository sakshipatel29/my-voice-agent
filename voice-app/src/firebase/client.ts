
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6IEGaMSkwcM6kmlUG6sXiaDJgDUlLzu0",
  authDomain: "doctor-ai-agent-378a0.firebaseapp.com",
  projectId: "doctor-ai-agent-378a0",
  storageBucket: "doctor-ai-agent-378a0.firebasestorage.app",
  messagingSenderId: "187834812473",
  appId: "1:187834812473:web:9663d72acc70493592a5e8",
  measurementId: "G-TZMM92L3ZE"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);