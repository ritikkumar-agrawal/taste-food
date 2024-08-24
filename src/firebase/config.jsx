import { initializeApp } from 'firebase/app'
import { getFirestore, Timestamp } from 'firebase/firestore'
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD8b1UvZLLPz9ZR6vzJ409MLhQvHCmdM08",
  authDomain: "tasty-treats-5fa48.firebaseapp.com",
  projectId: "tasty-treats-5fa48",
  storageBucket: "tasty-treats-5fa48.appspot.com",
  messagingSenderId: "562940553393",
  appId: "1:562940553393:web:64cd9df76aa5a9f8d41a90",
  measurementId: "G-2G54SBZG1Y"
};


// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// initialize Firebase
// const app = initializeApp(firebaseConfig)

// initialize Firestore services
const db = getFirestore(app)

// initialize Firebase Auth
const auth = getAuth(app)

const checkEmailAvailability = async (email) => {
  try {
    const userCredential = await fetchSignInMethodsForEmail(auth, email)
    // If length > 0, email is taken
    return userCredential.length > 0
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error checking email availability:', error)
    }

    return false
  }
}

// initialize Cloud Storage and get a reference to the service
const storage = getStorage(app)

// get server timestamp
const timestamp = Timestamp

export { app, db, auth, storage, timestamp, checkEmailAvailability }
