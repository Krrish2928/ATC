import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6Hzn59BrQlY61L9Xbd5kgiysNYBKtV9o",
  authDomain: "atc-502f2.firebaseapp.com",
  projectId: "atc-502f2",
  storageBucket: "atc-502f2.firebasestorage.app",
  messagingSenderId: "500010599228",
  appId: "1:500010599228:web:a6bd2f14f918a813529439"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Authentication Helper Functions
 */

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const loginWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const logout = () => firebaseSignOut(auth);

export { onAuthStateChanged };
export default app;
