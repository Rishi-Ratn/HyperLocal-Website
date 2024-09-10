import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { store } from './redux/store';
import { loginSuccess, logout, setRole } from './redux/slices/authSlice';
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyDK2m7dpAILoS9EgUXqelaARiLmtYeswdk",
  authDomain: "hyper-local-f7d10.firebaseapp.com",
  projectId: "hyper-local-f7d10",
  storageBucket: "hyper-local-f7d10.appspot.com",
  messagingSenderId: "1013935915906",
  appId: "1:1013935915906:web:af8d6397a796328a3a459b"
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
      const response = await axios.get('http://localhost:5000/api/society/check-admin', {
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
