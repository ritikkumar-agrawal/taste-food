import { initializeApp } from 'firebase/app'
import { getFirestore, Timestamp } from 'firebase/firestore'
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "process.env.FIREBASE_API_KEY",
  authDomain: "process.env.FIREBASE_AUTH_DOMAIN",
  projectId: "process.env.FIREBASE_PROJECT_ID",
  storageBucket: "process.env.FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "process.env.FIREBASE_MESSAGING_SENDER_ID",
  appId: "process.env.FIREBASE_APP_ID",
}

// initialize Firebase
const app = initializeApp(firebaseConfig)

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
