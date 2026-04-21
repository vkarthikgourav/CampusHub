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

const seedData = async () => {
  try {
    console.log("Seeding classes...");
    const classes = [
      { name: 'Data Structures', code: 'CS201', description: 'Core computer science principles and data organization.' },
      { name: 'Linear Algebra', code: 'MA104', description: 'Vector spaces, matrices, and linear transformations.' },
    ];
    for (const c of classes) {
      await addDoc(collection(db, "classes"), c);
    }

    console.log("Seeding timetable...");
    const schedule = [
      { day: 'Monday', time: '09:00 AM', course: 'CS101', type: 'Lecture', location: 'Room 302' },
      { day: 'Monday', time: '11:00 AM', course: 'CS102', type: 'Lab', location: 'Lab 1' },
      { day: 'Tuesday', time: '10:00 AM', course: 'MA201', type: 'Lecture', location: 'Room 405' },
      { day: 'Wednesday', time: '01:00 PM', course: 'PH101', type: 'Tutorial', location: 'Room 201' },
      { day: 'Thursday', time: '09:00 AM', course: 'CS101', type: 'Lecture', location: 'Room 302' },
    ];
    for (const entry of schedule) {
      await addDoc(collection(db, "timetable"), entry);
    }

    console.log("Seeding contacts...");
    const contacts = [
      { name: 'Ram Mohan', role: 'Professor', department: 'Computer Science', email: 'alan@campus.edu', phone: '+1 234 567 8900' },
      { name: 'Vidhya', role: 'Head of Dept', department: 'Mathematics', email: 'ada@campus.edu', phone: '+1 234 567 8901' },
      { name: 'Joseph', role: 'Administrator', department: 'Administration', email: 'grace@campus.edu', phone: '+1 234 567 8902' },
      { name: 'Ramya', role: 'Professor', department: 'Physics', email: 'john@campus.edu', phone: '+1 234 567 8903' },
    ];
    for (const contact of contacts) {
      await addDoc(collection(db, "contacts"), contact);
    }

    console.log("Data seeding complete!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
  process.exit(0);
};

seedData();
