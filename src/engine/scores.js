const STORAGE_KEY = 'snowpeak_high_scores_v3'
const MAX_SCORES = 10

export function getHighScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
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

  // Prevent duplicate entries (React StrictMode runs reducers twice)
  const isDuplicate = scores.some(
    s => s.name === name && s.steps === steps && s.elapsedMs === elapsedMs
  )
  if (!isDuplicate) {
    scores.push({ name, steps, time, elapsedMs, mode: mode || 'standard', date: new Date().toISOString() })
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
  lines.push({ text: '--- HIGH SCORES ---', type: 'system' })
  lines.push({ text: '  #   PLAYER           STEPS  TIME     MODE       DATE', type: 'system' })
  lines.push({ text: '  -   ------           -----  ----     ----       ----', type: 'system' })

  for (let i = 0; i < scores.length; i++) {
    const s = scores[i]
    const line =
      '  ' +
      String(i + 1).padEnd(4) +
      s.name.slice(0, 15).padEnd(18) +
      String(s.steps).padEnd(7) +
      (s.time || '').padEnd(9) +
      (s.mode || 'standard').padEnd(11) +
      formatDate(s.date)
    lines.push({ text: line, type: 'system' })
  }

  lines.push({ text: '', type: 'normal' })
  return lines
}
