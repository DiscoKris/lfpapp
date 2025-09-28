import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAERRRFKrnd4Od85FqilwpPSdXthmwNacQ",
  authDomain: "lfpapp-f8e73.firebaseapp.com",
  projectId: "lfpapp-f8e73",
  storageBucket: "lfpapp-f8e73.firebasestorage.app",
  messagingSenderId: "1081308819125",
  appId: "1:1081308819125:web:2529881a9e17ec9fe958fc"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
