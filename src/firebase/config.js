// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDG4blJrbYgaTV9QbsPdCXN56GX1xGp_GY",
  authDomain: "mychart-clone.firebaseapp.com",
  projectId: "mychart-clone",
  storageBucket: "mychart-clone.firebasestorage.app",
  messagingSenderId: "441812431656",
  appId: "1:441812431656:web:320aa2d6bd105d58db561d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };