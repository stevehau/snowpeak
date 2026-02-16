// Slalom Challenge — Web Audio API sounds
// Same pattern as engine/sounds.js

function playGatePass() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)

    setTimeout(() => ctx.close(), 500)
  } catch {
    // Audio not available
  }
}

function playGateMiss() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)

    setTimeout(() => ctx.close(), 600)
  } catch {
    // Audio not available
  }
}

function playCrash() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Short, muffled thud — not a harsh noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.15)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    // Low-pass filter to soften the high frequencies
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 600)
  } catch {
    // Audio not available
  }
}

function playSpeedUp() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)

    setTimeout(() => ctx.close(), 800)
  } catch {
    // Audio not available
  }
}

function playGameOver() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Descending sad trombone (4 notes)
    const notes = [
      { freq: 466, start: 0, dur: 0.3 },     // Bb4
      { freq: 440, start: 0.35, dur: 0.3 },   // A4
      { freq: 415, start: 0.7, dur: 0.3 },    // Ab4
      { freq: 370, start: 1.05, dur: 0.6 },   // F#4 (held)
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)
      // Slight droop for trombone effect
      osc.frequency.linearRampToValueAtTime(note.freq * 0.97, ctx.currentTime + note.start + note.dur)

      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + note.start + 0.03)
      gain.gain.setValueAtTime(0.1, ctx.currentTime + note.start + note.dur * 0.7)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.05)
    }

    setTimeout(() => ctx.close(), 2500)
  } catch {
    // Audio not available
  }
}

export function playArcadeStart() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Coin-insert jingle (3 ascending square notes)
    const notes = [
      { freq: 660, start: 0, dur: 0.08 },
      { freq: 880, start: 0.1, dur: 0.08 },
      { freq: 1100, start: 0.2, dur: 0.15 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.value = note.freq

      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + note.start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.02)
    }

    setTimeout(() => ctx.close(), 800)
  } catch {
    // Audio not available
  }
}

function playCrowdCheer() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Filtered noise burst that swells — sounds like a crowd roar
    const bufferSize = Math.floor(ctx.sampleRate * 0.8)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    // Bandpass to give it a "voice" quality
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6)
    filter.Q.value = 0.8

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.3)
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()

    // Add a quick rising tone on top for the "wooo!" feel
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.2)
    osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.5)
    oscGain.gain.setValueAtTime(0, ctx.currentTime)
    oscGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.55)

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

function playRivalZoom() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Quick Doppler-style whoosh: high pitch sweeping down
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03)
    gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)

    setTimeout(() => ctx.close(), 800)
  } catch {
    // Audio not available
  }
}

// Dispatcher for in-game sounds
export function playSlalomSound(name) {
  const sounds = {
    gate_pass: playGatePass,
    gate_miss: playGateMiss,
    crash: playCrash,
    speed_up: playSpeedUp,
    game_over: playGameOver,
    crowd_cheer: playCrowdCheer,
    rival_zoom: playRivalZoom,
  }
  const fn = sounds[name]
  if (fn) fn()
}
