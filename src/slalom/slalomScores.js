// Slalom Challenge High Scores
// Tracks daily and all-time high scores
// Hybrid approach: localStorage + Firebase sync

import {
  fetchSlalomScoresFromCloud,
  saveSlalomScoreToCloud,
  clearSlalomScoresFromCloud,
} from '../engine/firebase'

const STORAGE_KEY = 'slalom_scores_v1'
const COACH_JOE_DEFAULT = {
  name: 'Coach Joe',
  score: 1000,
  date: '2025-01-01',
}

function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split('T')[0] // YYYY-MM-DD
}

export function getSlalomScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      // Initialize with Coach Joe's default scores
      const defaultScores = {
        allTime: COACH_JOE_DEFAULT,
        daily: {
          date: getTodayDateString(),
          record: COACH_JOE_DEFAULT,
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultScores))
      return defaultScores
    }

    const scores = JSON.parse(data)

    // Check if daily score needs to be reset (new day)
    const today = getTodayDateString()
    if (scores.daily.date !== today) {
      scores.daily = {
        date: today,
        record: COACH_JOE_DEFAULT,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
    }

    return scores
  } catch {
    return {
      allTime: COACH_JOE_DEFAULT,
      daily: {
        date: getTodayDateString(),
        record: COACH_JOE_DEFAULT,
      },
    }
  }
}

export function saveSlalomScore(playerName, score) {
  const scores = getSlalomScores()
  const today = getTodayDateString()
  let beatCoachJoe = false
  let newDailyRecord = false
  let newAllTimeRecord = false

  const scoreEntry = {
    name: playerName || 'Player',
    score,
    date: today,
  }

  // Check if beat Coach Joe's default score (1000)
  // This should trigger anytime someone beats 1000, not just when Coach Joe holds the record
  if (score > COACH_JOE_DEFAULT.score) {
    beatCoachJoe = true
  }

  // Update all-time high score if better
  if (score > scores.allTime.score) {
    scores.allTime = scoreEntry
    newAllTimeRecord = true
  }

  // Update daily high score if better
  if (score > scores.daily.record.score) {
    scores.daily.record = scoreEntry
    newDailyRecord = true
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))

  // Sync to Firebase (async, non-blocking)
  saveSlalomScoreToCloud(scoreEntry).catch(() => {
    // Silently fail if offline
  })

  return {
    beatCoachJoe,
    newDailyRecord,
    newAllTimeRecord,
    dailyRecord: scores.daily.record,
    allTimeRecord: scores.allTime,
  }
}

export function didBeatCoachJoe() {
  const scores = getSlalomScores()
  // Return true if all-time record is NOT Coach Joe
  return scores.allTime.name !== 'Coach Joe'
}

// Fetch and merge scores from Firebase
export async function syncSlalomScoresFromCloud() {
  try {
    const cloudScores = await fetchSlalomScoresFromCloud()
    if (!cloudScores || cloudScores.length === 0) return

    const localScores = getSlalomScores()
    const today = getTodayDateString()
    let updated = false

    // Find best all-time score from cloud
    const cloudBestAllTime = cloudScores.reduce((best, current) => {
      return current.score > best.score ? current : best
    }, { score: 0 })

    if (cloudBestAllTime.score > localScores.allTime.score) {
      localScores.allTime = cloudBestAllTime
      updated = true
    }

    // Find best daily score from cloud
    const cloudBestToday = cloudScores
      .filter(s => s.date === today)
      .reduce((best, current) => {
        return current.score > best.score ? current : best
      }, { score: 0 })

    if (cloudBestToday.score > 0 && cloudBestToday.score > localScores.daily.record.score) {
      localScores.daily.record = cloudBestToday
      updated = true
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localScores))
    }
  } catch (e) {
    // Silently fail if offline
  }
}

// Reset scores to Coach Joe defaults
export function resetSlalomScores() {
  const defaultScores = {
    allTime: COACH_JOE_DEFAULT,
    daily: {
      date: getTodayDateString(),
      record: COACH_JOE_DEFAULT,
    },
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultScores))

  // Clear cloud scores
  clearSlalomScoresFromCloud().catch(() => {
    // Silently fail if offline
  })

  return defaultScores
}
