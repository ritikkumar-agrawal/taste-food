import { useEffect, useState, useRef } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const useCollection = (collectionName, _query, _orderBy) => {
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState(null)

  // If we don't use a ref --> infinite loop in useEffect
  // _query and _orderBy are reference data types that are "different" on every function call
  const queryRef = useRef(_query)
  const orderByRef = useRef(_orderBy)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let ref = collection(db, collectionName)

        if (queryRef.current) {
          queryRef.current.forEach((q) => {
            ref = query(ref, where(...q))
          })
        }

        if (orderByRef.current) {
          orderByRef.current.forEach((o) => {
            ref = query(ref, orderBy(...o))
          })
        }

        const unsubscribe = onSnapshot(
          ref,
          (snapshot) => {
            const results = []
            snapshot.forEach((doc) => {
              results.push({ ...doc.data(), id: doc.id })
            })
            setDocuments(results)
            setError(null)
          },
          (error) => {
            if (process.env.NODE_ENV !== 'production') {
              console.error('Error fetching data:', error)
            }
            setError('Could not fetch the data')
          }
        )

        return unsubscribe
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching data:', error)
        }
        setError('Could not fetch the data')
      }
    }

    fetchData()
  }, [collectionName, queryRef, orderByRef])

  return { documents, error }
}
