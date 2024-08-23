import { useState, useCallback } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { auth, storage } from '../firebase/config'

export const useRecipeImageUpload = (user) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [isImageUploading, setIsImageUploading] = useState(false)

  const uploadRecipeImage = useCallback(async (image, onProgress) => {
    setError(null)
    setIsImageUploading(true)

    try {
      if (!auth.currentUser) {
        setError('User not authenticated')
        return null
      }

      const uploadPath = `recipeImages/${auth.currentUser.uid}/${image.name}`

      const imgRef = ref(storage, uploadPath)

      const uploadTask = uploadBytesResumable(imgRef, image)

      uploadTask.on('state_changed', (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        setUploadProgress(progress)
        onProgress && onProgress(progress)
        if (process.env.NODE_ENV !== 'production') {
          console.log('Upload is ' + progress + '% done')
        }
      })

      await uploadTask

      const imageURL = await getDownloadURL(uploadTask.snapshot.ref)

      setIsImageUploading(false)
      return imageURL
    } catch (err) {
      setError(err.message)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error uploading image:', err)
      }
      setIsImageUploading(false)
      return null
    }
  }, [])

  return {
    uploadRecipeImage,
    setUploadProgress,
    uploadProgress,
    error,
    isImageUploading,
    setIsImageUploading,
  }
}
