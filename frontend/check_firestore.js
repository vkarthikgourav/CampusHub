import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzPr-SpMRZyk_jyzJWoMEaMxzP54DZ0kk",
  authDomain: "campus-management-system-2932f.firebaseapp.com",
  projectId: "campus-management-system-2932f",
  storageBucket: "campus-management-system-2932f.firebasestorage.app",
  messagingSenderId: "883005579981",
  appId: "1:883005579981:web:16dbd0080c11b06893ff84",
  measurementId: "G-FLH1GN47KV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  console.log("--- USERS ---");
  usersSnap.forEach(doc => {
    console.log(doc.id, doc.data());
  });

  const feesRef = collection(db, "fees");
  const feesSnap = await getDocs(feesRef);
  console.log("--- FEES ---");
  feesSnap.forEach(doc => {
    console.log(doc.id, doc.data());
  });

  process.exit(0);
}

check().catch(console.error);
