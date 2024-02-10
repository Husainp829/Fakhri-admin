// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxNT1nnKpTXoEVYOmFTNCfJcNKJdzK3ow",
  authDomain: "fakhri-jamaat.firebaseapp.com",
  projectId: "fakhri-jamaat",
  storageBucket: "fakhri-jamaat.appspot.com",
  messagingSenderId: "159093200328",
  appId: "1:159093200328:web:e4b0da5c8717a157739cfd",
  measurementId: "G-1390XJB39V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export const authObj = getAuth(app);

export default storage;
