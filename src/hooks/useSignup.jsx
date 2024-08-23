import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { auth, storage, db } from '../firebase/config'
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { dispatch } = useAuthContext()

  const signup = async (email, password, displayName, thumbnail) => {
    setError(null)
    setIsPending(true)

    try {
      // signup user
      const res = await createUserWithEmailAndPassword(auth, email, password)

      if (!res.user) {
        throw new Error(
          'We could not complete your sign up. Please try again after some time!'
        )
      }

      // Determine whether to update the photoURL
      let updatePhotoURL = false
      let photoURL = null

      if (thumbnail) {
        // upload user profile thumbnail image
        const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`
        const imgRef = ref(storage, uploadPath)

        // upload bytes instead of file directly
        const uploadTask = uploadBytesResumable(imgRef, thumbnail)

        // listen for state changes of the upload task
        uploadTask.on('state_changed', (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          setUploadProgress(progress)
          if (process.env.NODE_ENV !== 'production') {
            console.log('Upload is ' + progress + '% done')
          }
        })

        await uploadTask

        photoURL = await getDownloadURL(uploadTask.snapshot.ref)
        updatePhotoURL = true
      } else {
        // If no thumbnail, use the URL of the default thumbnail
        photoURL =
          'https://firebasestorage.googleapis.com/v0/b/tasty-treats-site.appspot.com/o/thumbnails%2Fdefault%2FnoAvatar.png?alt=media&token=7525b0ff-7ae7-4435-a5f1-6fdf2f8dc67a'
        updatePhotoURL = true
      }

      // Update user profile if displayName is provided
      if (displayName) {
        await updateProfile(res.user, { displayName })
      }

      // Create/update user document
      const usersCollectionRef = doc(db, 'users', res.user.uid)
      const userData = {
        online: true,
        displayName,
      }

      if (updatePhotoURL) {
        userData.photoURL = photoURL
      }

      await setDoc(usersCollectionRef, userData)

      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user })

      // update state
      if (!isCancelled) {
        setIsPending(false)
        setError(null)
      }

      //return here is to prevent further execution of the function if isCancelled is true
      return
    } catch (err) {
      if (!isCancelled) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(err.message)
        }
        setError(err.message)
        setIsPending(false)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('The component is unmounted')
      }
      setIsCancelled(true)
    }
  }, [isCancelled])

  return { error, isPending, signup, uploadProgress }
}
