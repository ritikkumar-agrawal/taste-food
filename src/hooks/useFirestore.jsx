import { useReducer, useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db, timestamp } from '../firebase/config'

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null,
}

const firestoreReducer = (state, action) => {
  switch (action.type) {
    case 'IS_PENDING':
      return {
        ...state,
        isPending: true,
        document: null,
        success: false,
        error: null,
      }
    case 'ADDED_DOCUMENT':
      return {
        ...state,
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      }
    case 'DELETED_DOCUMENT':
      return {
        ...state,
        isPending: false,
        document: null,
        success: true,
        error: null,
      }
    case 'UPDATED_DOCUMENT':
      return {
        ...state,
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      }
    case 'ERROR':
      return {
        ...state,
        isPending: false,
        document: null,
        success: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export const useFirestore = (collectionName) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState)

  // Handling cleanup
  const [isCancelled, setIsCancelled] = useState(false)

  // Firestore collection reference
  const collectionRef = collection(db, collectionName)

  // Only dispatch if not cancelled
  const dispatchIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action)
    }
  }
  const addDocument = async (docData, options = {}) => {
    dispatch({ type: 'IS_PENDING' })

    try {
      const { id, ...otherOptions } = options

      if (collectionRef.id === 'favorites' && id) {
        // For 'favorites' collection with custom ID
        const docRef = doc(collectionRef, id)
        await setDoc(docRef, {
          ...docData,
          createdAt: timestamp.now(),
        })
        dispatch({ type: 'ADDED_DOCUMENT', payload: docRef })
      } else {
        // For any other collection or 'favorites' without custom ID
        const createdAt = timestamp.now()
        const addedDocument = await addDoc(collectionRef, {
          ...docData,
          createdAt,
          // Include other options if needed
          ...otherOptions,
        })
        dispatch({ type: 'ADDED_DOCUMENT', payload: addedDocument })
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error adding document to Firestore:', err)
      }
      dispatch({ type: 'ERROR', payload: err.message })
    }
  }

  // Delete a document
  const deleteDocument = async (docRef, options = {}) => {
    dispatch({ type: 'IS_PENDING' })

    try {
      // Extract the document ID from options
      const { id, ...otherOptions } = options

      if (collectionRef.id === 'favorites' && id) {
        // For 'favorites' collection with custom ID
        const favoriteDocRef = doc(collectionRef, id)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Deleting document with ID:', favoriteDocRef.id)
        }

        await deleteDoc(favoriteDocRef)
        dispatchIfNotCancelled({ type: 'DELETED_DOCUMENT' })
      } else {
        // For any other collection or 'favorites' without custom ID use the provided docRef
        await deleteDoc(docRef)
        dispatchIfNotCancelled({ type: 'DELETED_DOCUMENT' })
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error deleting document:', err)
      }
      dispatchIfNotCancelled({
        type: 'ERROR',
        payload: "Can't delete the item",
      })
    }
  }

  // Update a document
  const updateDocument = async (id, updates) => {
    dispatch({ type: 'IS_PENDING' })

    try {
      const updatedDocument = await updateDoc(doc(collectionRef, id), updates)
      dispatchIfNotCancelled({
        type: 'UPDATED_DOCUMENT',
        payload: updatedDocument,
      })
      return updatedDocument
    } catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: err.message })
      return null
    }
  }

  // Clean up function
  useEffect(() => {
    setIsCancelled(false)
    return () => setIsCancelled(true)
  }, [])

  return { addDocument, deleteDocument, updateDocument, response }
}
