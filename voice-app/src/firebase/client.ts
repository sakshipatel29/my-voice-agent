// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyD6IEGaMSkwcM6kmlUG6sXiaDJgDUlLzu0",
//   authDomain: "doctor-ai-agent-378a0.firebaseapp.com",
//   projectId: "doctor-ai-agent-378a0",
//   storageBucket: "doctor-ai-agent-378a0.firebasestorage.app",
//   messagingSenderId: "187834812473",
//   appId: "1:187834812473:web:9663d72acc70493592a5e8",
//   measurementId: "G-TZMM92L3ZE"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


// //

// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6IEGaMSkwcM6kmlUG6sXiaDJgDUlLzu0",
  authDomain: "doctor-ai-agent-378a0.firebaseapp.com",
  projectId: "doctor-ai-agent-378a0",
  storageBucket: "doctor-ai-agent-378a0.firebasestorage.app",
  messagingSenderId: "187834812473",
  appId: "1:187834812473:web:9663d72acc70493592a5e8",
  measurementId: "G-TZMM92L3ZE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);