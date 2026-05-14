// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyAr81cx_B5DXpcwklFaF8bRO8BAO3EBUe8",
authDomain: "tourexpo-50ba9.firebaseapp.com",
projectId: "tourexpo-50ba9",
storageBucket: "tourexpo-50ba9.firebasestorage.app",
messagingSenderId: "616902289649",
appId: "1:616902289649:web:5418ef6aaa8ade27bc2150",
measurementId: "G-K9MN3G3WH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
