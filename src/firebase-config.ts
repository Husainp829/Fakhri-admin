import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDxNT1nnKpTXoEVYOmFTNCfJcNKJdzK3ow",
  authDomain: "fakhri-jamaat.firebaseapp.com",
  projectId: "fakhri-jamaat",
  storageBucket: "fakhri-jamaat.appspot.com",
  messagingSenderId: "159093200328",
  appId: "1:159093200328:web:e4b0da5c8717a157739cfd",
  measurementId: "G-1390XJB39V",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export const authObj = getAuth(app);

export default storage;
