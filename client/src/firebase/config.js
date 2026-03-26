// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDkALxTU-9kT7Uzr_IIurIIdqK7FxquP6I",
  authDomain: "neurogen-d8df5.firebaseapp.com",
  projectId: "neurogen-d8df5",
  storageBucket: "neurogen-d8df5.firebasestorage.app",
  messagingSenderId: "402784876418",
  appId: "1:402784876418:web:ae82b4fa63394e1cc0c19b",
  measurementId: "G-TZM8M3PHNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
