import React, { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const TestFirebase = () => {
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Firebase...");

        const snapshot = await getDocs(collection(db, "fees"));

        const data = snapshot.docs.map(doc => doc.data());

        console.log("SUCCESS:", data);
      } catch (error) {
        console.error("ERROR:", error);
      }
    };

    testConnection();
  }, []);

  return <h2>Testing Firebase Connection...</h2>;
};

export default TestFirebase;