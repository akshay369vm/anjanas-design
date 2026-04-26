import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your web app's Firebase configuration
// REPLACE THESE WITH YOUR ACTUAL KEYS
const firebaseConfig = {
    apiKey: "AIzaSyCddVMjeRb4-6FVmpeA3A2TIc1wGzKwTTM",
    authDomain: "anjanas-design.firebaseapp.com",
    projectId: "anjanas-design",
    storageBucket: "anjanas-design.firebasestorage.app",
    messagingSenderId: "784272115162",
    appId: "1:784272115162:web:8eb21f126db9cd9a176ce3",
    measurementId: "G-1XD9ZSFNWH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ImgBB API Key for image uploads
export const IMGBB_API_KEY = "42f7e5c72ecbd5894afaaaf97eae5d29";
