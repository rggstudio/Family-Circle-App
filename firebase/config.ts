// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOEdfmEiPs_EqAE0jperwPfAHQ5rEwCiY",
  authDomain: "family-circle-a3506.firebaseapp.com",
  projectId: "family-circle-a3506",
  storageBucket: "family-circle-a3506.firebasestorage.app",
  messagingSenderId: "598727881357",
  appId: "1:598727881357:web:672405287656c32d8768c4",
  measurementId: "G-6C7ZLKSVV4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app; 