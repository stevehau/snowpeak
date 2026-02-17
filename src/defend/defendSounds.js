// Defend the Village — Web Audio API sounds
// Same pattern as slalom sounds

function playShoot() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // BB gun pop — short, thin crack
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)

    // Tiny noise burst for the "crack"
    const bufferSize = Math.floor(ctx.sampleRate * 0.03)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.08, ctx.currentTime)
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 400)
  } catch {
    // Audio not available
  }
}

function playHit() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)

    setTimeout(() => ctx.close(), 400)
  } catch {
    // Audio not available
  }
}

function playWolfWhimper() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Descending whine — sounds like a yelping whimper
    const notes = [
      { freq: 800, start: 0, dur: 0.12 },
      { freq: 600, start: 0.12, dur: 0.1 },
      { freq: 400, start: 0.22, dur: 0.15 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)
      osc.frequency.linearRampToValueAtTime(note.freq * 0.7, ctx.currentTime + note.start + note.dur)

      gain.gain.setValueAtTime(0.1, ctx.currentTime + note.start)
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

function playBearRoar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Low rumbling roar
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.55)

    // Add noise for texture
    const bufferSize = Math.floor(ctx.sampleRate * 0.4)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 300
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 1000)
  } catch {
    // Audio not available
  }
}

function playBossRoar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Deep, terrifying boss roar — much lower and longer than normal bear
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.8)

    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.1)

    // Second oscillator for rumble
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(55, ctx.currentTime)
    osc2.frequency.linearRampToValueAtTime(35, ctx.currentTime + 0.9)
    gain2.gain.setValueAtTime(0.1, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start()
    osc2.stop(ctx.currentTime + 1.0)

    // Heavy noise texture
    const bufferSize = Math.floor(ctx.sampleRate * 0.8)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 200
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.08, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7)
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

function playBossIncoming() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Ominous warning — low pulsing notes
    const notes = [
      { freq: 110, start: 0, dur: 0.2 },
      { freq: 110, start: 0.3, dur: 0.2 },
      { freq: 110, start: 0.6, dur: 0.2 },
      { freq: 80, start: 0.9, dur: 0.5 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = note.freq
      gain.gain.setValueAtTime(0.12, ctx.currentTime + note.start)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.05)
    }

    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not available
  }
}

function playBossDefeat() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Massive final roar — loud, long, earth-shaking
    // Main roar voice
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(90, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.3)
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.8)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 2.1)

    // Sub-bass rumble
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(45, ctx.currentTime)
    osc2.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.3)
    osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5)
    gain2.gain.setValueAtTime(0.15, ctx.currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.6)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start()
    osc2.stop(ctx.currentTime + 1.7)

    // Harsh growl overtone
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'square'
    osc3.frequency.setValueAtTime(150, ctx.currentTime)
    osc3.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.2)
    gain3.gain.setValueAtTime(0.08, ctx.currentTime)
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start()
    osc3.stop(ctx.currentTime + 1.1)

    // Heavy noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 1.5)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 180
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.12, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.3)
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 2500)
  } catch {
    // Audio not available
  }
}

function playHalfway() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Upbeat chime — two ascending notes
    const notes = [
      { freq: 660, start: 0, dur: 0.12 },
      { freq: 880, start: 0.15, dur: 0.2 },
    ]
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = note.freq
      gain.gain.setValueAtTime(0.1, ctx.currentTime + note.start)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.02)
    }
    setTimeout(() => ctx.close(), 600)
  } catch {
    // Audio not available
  }
}

function playReloadDone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Metallic click-clack reload sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.08)

    // Second click
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'square'
    osc2.frequency.setValueAtTime(400, ctx.currentTime + 0.08)
    osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12)
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.08)
    osc2.stop(ctx.currentTime + 0.16)

    setTimeout(() => ctx.close(), 400)
  } catch {
    // Audio not available
  }
}

function playGameOver() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Descending sad notes
    const notes = [
      { freq: 466, start: 0, dur: 0.3 },
      { freq: 440, start: 0.35, dur: 0.3 },
      { freq: 415, start: 0.7, dur: 0.3 },
      { freq: 370, start: 1.05, dur: 0.6 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)
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

function playVictory() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Triumphant ascending fanfare
    const notes = [
      { freq: 523, start: 0, dur: 0.15 },      // C5
      { freq: 659, start: 0.18, dur: 0.15 },    // E5
      { freq: 784, start: 0.36, dur: 0.15 },    // G5
      { freq: 1047, start: 0.54, dur: 0.4 },    // C6 (held)
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.value = note.freq

      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + note.start + 0.02)
      gain.gain.setValueAtTime(0.12, ctx.currentTime + note.start + note.dur * 0.7)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.05)
    }

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Dispatcher
export function playDefendSound(name) {
  const sounds = {
    shoot: playShoot,
    hit: playHit,
    wolf_whimper: playWolfWhimper,
    bear_roar: playBearRoar,
    boss_roar: playBossRoar,
    boss_incoming: playBossIncoming,
    boss_defeat: playBossDefeat,
    halfway: playHalfway,
    reload_done: playReloadDone,
    game_over: playGameOver,
    victory: playVictory,
  }
  const fn = sounds[name]
  if (fn) fn()
}
