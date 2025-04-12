import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3FvouitWrS1eyzm8LATvjNwo8vtO05os",
  authDomain: "photopholio-3fac2.firebaseapp.com",
  projectId: "photopholio-3fac2",
  storageBucket: "photopholio-3fac2.firebasestorage.app",
  messagingSenderId: "595750679635",
  appId: "1:595750679635:web:dabb0d0fa2cdb0b70e42a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
