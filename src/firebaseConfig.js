// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Added GoogleAuthProvider
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional (yeah, I'm gonna still add it anyways)
const firebaseConfig = {
  apiKey: "AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo",
  authDomain: "thera-mind.firebaseapp.com",
  projectId: "thera-mind",
  storageBucket: "thera-mind.firebasestorage.app",
  messagingSenderId: "996770367618",
  appId: "1:996770367618:web:4cb475e35a7de6a4094c9b",
  measurementId: "G-0N9P4B7GKZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app); // Export Firebase Auth instance
export const provider = new GoogleAuthProvider(); // Create and export Google Auth provider
export const db = getFirestore(app); // Export Firestore instance
export default app; // Export the app instance
