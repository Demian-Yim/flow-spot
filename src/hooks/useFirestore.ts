'use client'

import { useCallback, useState } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FirebaseError } from '@/types'

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} 시간 초과 (${ms / 1000}초). 네트워크 연결을 확인해주세요.`))
    }, ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) }
    )
  })
}

export function useFirestore() {
  const [error, setError] = useState<FirebaseError | null>(null)
  const [loading, setLoading] = useState(false)

  const getDocument = useCallback(
    async <T,>(collectionName: string, docId: string): Promise<T | null> => {
      setLoading(true)
      try {
        const docRef = doc(db, collectionName, docId)
        const docSnap = await withTimeout(getDoc(docRef), 10000, 'getDocument')
        if (docSnap.exists()) {
          return docSnap.data() as T
        }
        return null
      } catch (err: any) {
        const firebaseError: FirebaseError = {
          code: err.code || 'unknown',
          message: err.message || 'Failed to fetch document',
        }
        setError(firebaseError)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const createDocument = useCallback(
    async (collectionName: string, docId: string, data: Record<string, any>): Promise<{ success: boolean; errorMessage?: string }> => {
      setLoading(true)
      try {
        const docRef = doc(db, collectionName, docId)
        await withTimeout(setDoc(docRef, { ...data }), 15000, 'createDocument')
        setError(null)
        return { success: true }
      } catch (err: any) {
        console.error(`createDocument(${collectionName}) failed:`, err)
        const firebaseError: FirebaseError = {
          code: err.code || 'timeout',
          message: err.message || 'Failed to create document',
        }
        setError(firebaseError)
        return { success: false, errorMessage: firebaseError.message }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateDocument = useCallback(
    async <T,>(collectionName: string, docId: string, data: Partial<T>): Promise<boolean> => {
      setLoading(true)
      try {
        const docRef = doc(db, collectionName, docId)
        await withTimeout(updateDoc(docRef, data as any), 10000, 'updateDocument')
        setError(null)
        return true
      } catch (err: any) {
        const firebaseError: FirebaseError = {
          code: err.code || 'unknown',
          message: err.message || 'Failed to update document',
        }
        setError(firebaseError)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteDocument = useCallback(
    async (collectionName: string, docId: string): Promise<boolean> => {
      setLoading(true)
      try {
        const docRef = doc(db, collectionName, docId)
        await withTimeout(deleteDoc(docRef), 10000, 'deleteDocument')
        setError(null)
        return true
      } catch (err: any) {
        const firebaseError: FirebaseError = {
          code: err.code || 'unknown',
          message: err.message || 'Failed to delete document',
        }
        setError(firebaseError)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const queryDocuments = useCallback(
    async <T,>(collectionName: string, constraints: Array<any>): Promise<T[]> => {
      setLoading(true)
      try {
        const q = query(collection(db, collectionName), ...constraints)
        const querySnapshot = await withTimeout(getDocs(q), 10000, 'queryDocuments')
        const results: T[] = []
        querySnapshot.forEach((doc) => {
          results.push(doc.data() as T)
        })
        setError(null)
        return results
      } catch (err: any) {
        console.error(`queryDocuments(${collectionName}) failed:`, err)
        const firebaseError: FirebaseError = {
          code: err.code || 'unknown',
          message: err.message || 'Failed to query documents',
        }
        setError(firebaseError)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const subscribeToDocument = useCallback(
    <T,>(
      collectionName: string,
      docId: string,
      callback: (data: T | null) => void
    ): (() => void) => {
      const docRef = doc(db, collectionName, docId)
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            callback(docSnap.data() as T)
          } else {
            callback(null)
          }
        },
        (err: any) => {
          const firebaseError: FirebaseError = {
            code: err.code || 'unknown',
            message: err.message || 'Failed to listen to document',
          }
          setError(firebaseError)
        }
      )
      return unsubscribe
    },
    []
  )

  const subscribeToQuery = useCallback(
    <T,>(
      collectionName: string,
      constraints: Array<any>,
      callback: (data: T[]) => void
    ): (() => void) => {
      const q = query(collection(db, collectionName), ...constraints)
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const results: T[] = []
          querySnapshot.forEach((doc) => {
            results.push(doc.data() as T)
          })
          callback(results)
        },
        (err: any) => {
          const firebaseError: FirebaseError = {
            code: err.code || 'unknown',
            message: err.message || 'Failed to listen to query',
          }
          setError(firebaseError)
        }
      )
      return unsubscribe
    },
    []
  )

  return {
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    subscribeToDocument,
    subscribeToQuery,
    error,
    loading,
  }
}
