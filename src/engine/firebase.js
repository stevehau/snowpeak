import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC0DwgLW_TZ0_F_sFtV7ClXiRamS19Ko0k",
  authDomain: "snowpeak-16fcc.firebaseapp.com",
  projectId: "snowpeak-16fcc",
  storageBucket: "snowpeak-16fcc.firebasestorage.app",
  messagingSenderId: "516645386130",
  appId: "1:516645386130:web:926f1606c8e82e5f27b34b",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const SCORES_COLLECTION = 'high_scores'
const SLALOM_SCORES_COLLECTION = 'slalom_scores'

export async function fetchScoresFromCloud() {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      orderBy('steps', 'asc'),
      limit(50)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  } catch (e) {
    console.warn('Failed to fetch scores from cloud:', e)
    return null
  }
}

export async function saveScoreToCloud(scoreData) {
  try {
    await addDoc(collection(db, SCORES_COLLECTION), scoreData)
  } catch (e) {
    console.warn('Failed to save score to cloud:', e)
  }
}

export async function clearScoresFromCloud() {
  try {
    const snapshot = await getDocs(collection(db, SCORES_COLLECTION))
    const deletes = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletes)
  } catch (e) {
    console.warn('Failed to clear scores from cloud:', e)
  }
}

// Slalom Scores Firebase Functions
export async function fetchSlalomScoresFromCloud() {
  try {
    const q = query(
      collection(db, SLALOM_SCORES_COLLECTION),
      orderBy('score', 'desc'),
      limit(100)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  } catch (e) {
    console.warn('Failed to fetch slalom scores from cloud:', e)
    return null
  }
}

export async function saveSlalomScoreToCloud(scoreData) {
  try {
    await addDoc(collection(db, SLALOM_SCORES_COLLECTION), scoreData)
  } catch (e) {
    console.warn('Failed to save slalom score to cloud:', e)
  }
}

export async function clearSlalomScoresFromCloud() {
  try {
    const snapshot = await getDocs(collection(db, SLALOM_SCORES_COLLECTION))
    const deletes = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletes)
  } catch (e) {
    console.warn('Failed to clear slalom scores from cloud:', e)
  }
}
