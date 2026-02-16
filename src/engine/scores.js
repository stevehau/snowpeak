import { fetchScoresFromCloud, saveScoreToCloud, clearScoresFromCloud } from './firebase'

const STORAGE_KEY = 'snowpeak_high_scores_v4'
const MAX_SCORES = 10
const FOUR_MINUTES_MS = 4 * 60 * 1000

export function getHighScores() {
  try {
    // Check new key first, then migrate from old key
    let data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      data = localStorage.getItem('snowpeak_high_scores_v3')
      if (data) {
        const oldScores = migrateScores(JSON.parse(data))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(oldScores))
        localStorage.removeItem('snowpeak_high_scores_v3')
        return oldScores
      }
    }
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function sortScores(scores) {
  return scores.sort((a, b) => {
    // 1. Standard mode before easy mode
    const modeOrder = { standard: 0, easy: 1 }
    const modeDiff = (modeOrder[a.mode] || 0) - (modeOrder[b.mode] || 0)
    if (modeDiff !== 0) return modeDiff
    // 2. Fewest steps first
    if (a.steps !== b.steps) return a.steps - b.steps
    // 3. More recent date first
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })
}

export function saveHighScore(name, steps, elapsedMs, mode) {
  const time = formatTime(elapsedMs)
  const scores = getHighScores()

  const scoreEntry = {
    name,
    steps,
    time,
    elapsedMs,
    mode: mode || 'standard',
    date: new Date().toISOString(),
    migrated_v4: true,
  }

  // Prevent duplicate entries
  const isDuplicate = scores.some(
    s => s.name === name && s.steps === steps && s.elapsedMs === elapsedMs
  )
  if (!isDuplicate) {
    scores.push(scoreEntry)
    // Fire-and-forget save to cloud
    saveScoreToCloud(scoreEntry)
  }

  sortScores(scores)

  // Keep only top scores
  const trimmed = scores.slice(0, MAX_SCORES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage full or unavailable
  }

  // Return the rank (1-indexed) of the new score
  const rank = trimmed.findIndex(
    s => s.name === name && s.steps === steps && s.elapsedMs === elapsedMs
  )
  return { rank: rank + 1, scores: trimmed }
}

// Add 4 minutes to scores that haven't been migrated yet
function migrateScores(scores) {
  return scores.map(s => {
    if (s.migrated_v4) return s
    const newElapsedMs = (s.elapsedMs || 0) + FOUR_MINUTES_MS
    return {
      ...s,
      elapsedMs: newElapsedMs,
      time: formatTime(newElapsedMs),
      migrated_v4: true,
    }
  })
}

// Fetch scores from Firestore and merge into localStorage
export async function loadScoresFromCloud() {
  const cloudScores = await fetchScoresFromCloud()
  if (!cloudScores || cloudScores.length === 0) return getHighScores()

  // Migrate cloud scores FIRST so elapsedMs matches local (already migrated)
  const migratedCloud = migrateScores(cloudScores)
  const localScores = getHighScores()
  const merged = [...migratedCloud]

  for (const local of localScores) {
    const exists = merged.some(
      s => s.name === local.name && s.steps === local.steps && s.elapsedMs === local.elapsedMs
    )
    if (!exists) merged.push(local)
  }

  sortScores(merged)
  const trimmed = merged.slice(0, MAX_SCORES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage full or unavailable
  }

  return trimmed
}

// Clear all scores from localStorage and Firestore
export async function clearAllScores() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('snowpeak_high_scores_v3')
  } catch {
    // localStorage unavailable
  }
  try {
    await clearScoresFromCloud()
  } catch {
    // Cloud clear failed
  }
}

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function formatScoreBoard(scores) {
  const lines = []
  lines.push({ text: '', type: 'normal' })
  lines.push({ text: '--------- TOP ADVENTURERS WHO UNLOCKED THE SECRET ---------', type: 'system' })
  lines.push({ text: '  #   PLAYER           STEPS   ELAPSED TIME   MODE        DATE', type: 'system' })
  lines.push({ text: '  --  --------         -----   ------------   ---------   ----', type: 'system' })

  for (let i = 0; i < scores.length; i++) {
    const s = scores[i]
    const line =
      '  ' +
      String(i + 1).padEnd(4) +
      s.name.slice(0, 15).padEnd(18) +
      String(s.steps).padEnd(7) +
      (s.time || '').padEnd(14) +
      (s.mode || 'standard').padEnd(11) +
      formatDate(s.date)
    lines.push({ text: line, type: 'system' })
  }

  lines.push({ text: '', type: 'normal' })
  return lines
}
