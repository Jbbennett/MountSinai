// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFSIkujSrh9XkXIPACUnoLRZZnOrI03uw",
  authDomain: "mountain-sinai.firebaseapp.com",
  projectId: "mountain-sinai",
  storageBucket: "mountain-sinai.firebasestorage.app",
  messagingSenderId: "485797131813",
  appId: "1:485797131813:web:e31da23abc9584a7ac71cc",
  measurementId: "G-DKG6ZGL0CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };