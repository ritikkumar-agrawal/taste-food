import { useEffect, useState } from 'react'
import {
  doc,
  onSnapshot,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const useDocument = (collectionName, id) => {
  const [document, setDocument] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let documentRef

        if (collectionName === 'favorites') {
          // For 'favorites', query based on 'idMeal' only
          const qIdMeal = query(
            collection(db, collectionName),
            where('idMeal', '==', id)
          )

          const snapshotIdMeal = await getDocs(qIdMeal)

          if (snapshotIdMeal.size > 0 && snapshotIdMeal.docs[0]) {
            const data = snapshotIdMeal.docs[0].data()
            setDocument({ ...data, id: snapshotIdMeal.docs[0].id })
            setError(null)
          } else {
            setError('No such document exists')
          }
        } else if (collectionName === 'comments') {
          // For other collections or regular IDs
          const qIdMeal = query(
            collection(db, collectionName),
            where('idMeal', '==', id)
          )
          const unsubscribe = onSnapshot(qIdMeal, (snapshot) => {
            if (!snapshot.empty) {
              const data = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
              }))
              setDocument(data)
              setError(null)
            } else {
              setDocument([])
              setError('No comments available')
            }
          })
        } else {
          // For other collections or regular IDs
          documentRef = doc(db, collectionName, id)

          const unsubscribe = onSnapshot(
            documentRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setDocument({ ...snapshot.data(), id: snapshot.id })
                setError(null)
              } else {
                setError('No such document exists')
              }
            },
            (err) => {
              if (process.env.NODE_ENV !== 'production') {
                console.log(err.message)
              }
              setError('Failed to get document')
            }
          )

          // Unsubscribe on unmount
          return () => unsubscribe()
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching document:', err)
        }
        setError('Failed to get document')
      }
    }

    // Call the function
    fetchData()
  }, [collectionName, id])

  return { document, error }
}
