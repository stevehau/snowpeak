// Snowball Showdown — Web Audio API synthesized sounds

function playThrow() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Whoosh — filtered noise sweep
    const bufferSize = Math.floor(ctx.sampleRate * 0.2)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.1)
    filter.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2)
    filter.Q.value = 2
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 500)
  } catch {
    // Audio not available
  }
}

function playHit() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Wet splat — noise burst + low thud
    const bufferSize = Math.floor(ctx.sampleRate * 0.15)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1500
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()

    // Low thud
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1)
    oscGain.gain.setValueAtTime(0.15, ctx.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)

    setTimeout(() => ctx.close(), 500)
  } catch {
    // Audio not available
  }
}

function playMiss() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Soft thud in snow — low muffled hit
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(100, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)

    // Tiny snow puff noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.06)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.05, ctx.currentTime)
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 400)
  } catch {
    // Audio not available
  }
}

function playTurnSwitch() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Two-tone chime
    const notes = [
      { freq: 440, start: 0, dur: 0.12 },
      { freq: 660, start: 0.15, dur: 0.18 },
    ]
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = note.freq
      gain.gain.setValueAtTime(0.08, ctx.currentTime + note.start)
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

function playGameOver() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const notes = [
      { freq: 440, start: 0, dur: 0.25 },
      { freq: 415, start: 0.3, dur: 0.25 },
      { freq: 370, start: 0.6, dur: 0.25 },
      { freq: 330, start: 0.9, dur: 0.5 },
    ]
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)
      osc.frequency.linearRampToValueAtTime(note.freq * 0.97, ctx.currentTime + note.start + note.dur)
      gain.gain.setValueAtTime(0.08, ctx.currentTime + note.start)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.02)
    }
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not available
  }
}

function playVictory() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const notes = [
      { freq: 523, start: 0, dur: 0.15 },
      { freq: 659, start: 0.18, dur: 0.15 },
      { freq: 784, start: 0.36, dur: 0.15 },
      { freq: 1047, start: 0.54, dur: 0.4 },
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
    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Dispatcher
export function playSnowballSound(name) {
  const sounds = {
    throw: playThrow,
    hit: playHit,
    miss: playMiss,
    turn_switch: playTurnSwitch,
    game_over: playGameOver,
    victory: playVictory,
  }
  const fn = sounds[name]
  if (fn) fn()
}
