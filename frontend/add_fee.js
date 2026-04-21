import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

async function addFee() {
  await addDoc(collection(db, "fees"), {
    userId: 'aJWhMmN8dKWdg1C0eZGXqR3p4qo2',
    studentName: 'test',
    rollNo: 'TEST001',
    total: 30000,
    paid: 15000
  });
  console.log("Added fee record for test user");
  process.exit(0);
}
addFee().catch(console.error);
