import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { store } from './redux/store';
import { loginSuccess, logout, setRole } from './redux/slices/authSlice';
import axios from 'axios';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Ensure Firebase persistence is set
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error during Google sign-in:", error);
  }
};

export const signOutWithGoogle = async () => {
  try {
    await signOut(auth);
    store.dispatch(logout());
  } catch (error) {
    console.error("Error during Google sign-out:", error);
  }
};

// Call onAuthStateChanged to handle user state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    store.dispatch(loginSuccess({
      email: user.email,
      displayName: user.displayName,
      uid: user.uid,
    }));
    
    try {
      const response = await axios.get('/api/society/check-admin', {
        params: { email: user.email }
      });
      const { isAdmin } = response.data;
      const role = isAdmin ? 'admin' : 'user';
      
      store.dispatch(setRole(role));
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  } else {
    console.log('User logged out');
    store.dispatch(logout());
  }
});

export { auth };
