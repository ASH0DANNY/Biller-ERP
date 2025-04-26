// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig1 = {
  apiKey: "AIzaSyCx35vRqs-unNyusiePCkbsibjGA8QDReY",
  authDomain: "billing-erp-429f4.firebaseapp.com",
  projectId: "billing-erp-429f4",
  storageBucket: "billing-erp-429f4.firebasestorage.app",
  messagingSenderId: "257836658941",
  appId: "1:257836658941:web:cf18a1c5ac9800de9a8e94",
  measurementId: "G-V3QPKC4QMY"
};

// Check if Firebase app is already initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig1);

// Initialize Firestore
export const db = getFirestore(app);
