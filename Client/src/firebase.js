// Import the functions you need from the SDKs ryou need
import { initializeApp } from 'firebase/app'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'reading-book-web.firebaseapp.com',
  projectId: 'reading-book-web',
  storageBucket: 'reading-book-web.appspot.com',
  messagingSenderId: '348486324876',
  appId: '1:348486324876:web:1c2c2c5aada6d343b261a9',
  measurementId: 'G-7BTW8XZ8SW',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
