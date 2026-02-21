// Polyp Sniper — Web Audio API synthesized sounds
// No external audio files needed

export function playPolypSound(name) {
  try {
    switch (name) {
      case 'snip': playSnip(); break
      case 'miss': playMiss(); break
      case 'polyp_spawn': playSpawn(); break
      case 'boss_spawn': playBossSpawn(); break
      case 'boss_hit': playBossHit(); break
      case 'boss_defeat': playBossDefeat(); break
      case 'section_clear': playSectionClear(); break
      case 'game_over': playGameOver(); break
      case 'victory': playVictory(); break
    }
  } catch (_) { /* audio not available */ }
}

function makeCtx() {
  const c = new (window.AudioContext || window.webkitAudioContext)()
  setTimeout(() => c.close(), 3000)
  return c
}

// ─── Snip: satisfying zap/click ───
function playSnip() {
  const c = makeCtx()
  const t = c.currentTime

  // Sharp click
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(1400, t)
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.06)
  g.gain.setValueAtTime(0.18, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  osc.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 0.12)

  // Tiny metallic ping
  const osc2 = c.createOscillator()
  const g2 = c.createGain()
  osc2.type = 'sine'
  osc2.frequency.value = 2200
  g2.gain.setValueAtTime(0.06, t)
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
  osc2.connect(g2); g2.connect(c.destination)
  osc2.start(t); osc2.stop(t + 0.1)
}

// ─── Miss: wet squelch + buzzer ───
function playMiss() {
  const c = makeCtx()
  const t = c.currentTime

  // Squelch (low sine descending)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(350, t)
  osc.frequency.linearRampToValueAtTime(150, t + 0.15)
  g.gain.setValueAtTime(0.15, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 0.25)

  // Noise burst (buzzer)
  const bufSize = Math.floor(c.sampleRate * 0.12)
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize)
  const src = c.createBufferSource()
  src.buffer = buf
  const ng = c.createGain()
  ng.gain.value = 0.1
  const filt = c.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = 800
  src.connect(filt); filt.connect(ng); ng.connect(c.destination)
  src.start(t + 0.02)

  // Error tone
  const osc2 = c.createOscillator()
  const g2 = c.createGain()
  osc2.type = 'sawtooth'
  osc2.frequency.value = 120
  g2.gain.setValueAtTime(0.08, t + 0.05)
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc2.connect(g2); g2.connect(c.destination)
  osc2.start(t + 0.05); osc2.stop(t + 0.25)
}

// ─── Polyp spawn: subtle bloop ───
function playSpawn() {
  const c = makeCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(500, t)
  osc.frequency.linearRampToValueAtTime(300, t + 0.1)
  g.gain.setValueAtTime(0.06, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
  osc.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 0.18)
}

// ─── Boss spawn: ominous gurgle ───
function playBossSpawn() {
  const c = makeCtx()
  const t = c.currentTime

  // Deep rumble
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(80, t)
  osc.frequency.linearRampToValueAtTime(50, t + 0.8)
  g.gain.setValueAtTime(0.12, t)
  g.gain.linearRampToValueAtTime(0.15, t + 0.4)
  g.gain.exponentialRampToValueAtTime(0.001, t + 1)
  const filt = c.createBiquadFilter()
  filt.type = 'lowpass'; filt.frequency.value = 200
  osc.connect(filt); filt.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 1.1)

  // Eerie overtone
  const osc2 = c.createOscillator()
  const g2 = c.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(200, t + 0.2)
  osc2.frequency.linearRampToValueAtTime(120, t + 0.9)
  g2.gain.setValueAtTime(0.05, t + 0.2)
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.9)
  osc2.connect(g2); g2.connect(c.destination)
  osc2.start(t + 0.2); osc2.stop(t + 1)

  // Noise gurgle
  const bufSize = Math.floor(c.sampleRate * 0.6)
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1)
  const src = c.createBufferSource(); src.buffer = buf
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.04, t)
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
  const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 150; f2.Q.value = 3
  src.connect(f2); f2.connect(ng); ng.connect(c.destination)
  src.start(t)
}

// ─── Boss hit: heavy thud ───
function playBossHit() {
  const c = makeCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, t)
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.15)
  g.gain.setValueAtTime(0.2, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 0.25)
}

// ─── Boss defeat: dramatic death gurgle ───
function playBossDefeat() {
  const c = makeCtx()
  const t = c.currentTime

  const notes = [
    { freq: 300, start: 0, dur: 0.2, type: 'square' },
    { freq: 200, start: 0.15, dur: 0.2, type: 'sawtooth' },
    { freq: 120, start: 0.3, dur: 0.3, type: 'sawtooth' },
    { freq: 80, start: 0.5, dur: 0.4, type: 'sine' },
  ]
  for (const n of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = n.type
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.12, t + n.start)
    g.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + n.start); osc.stop(t + n.start + n.dur + 0.05)
  }

  // Victory sting after the gurgle
  const sting = [
    { freq: 660, start: 0.7, dur: 0.1 },
    { freq: 880, start: 0.8, dur: 0.15 },
  ]
  for (const n of sting) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.1, t + n.start)
    g.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + n.start); osc.stop(t + n.start + n.dur + 0.05)
  }
}

// ─── Section clear: ascending chime ───
function playSectionClear() {
  const c = makeCtx()
  const t = c.currentTime
  const notes = [
    { freq: 660, start: 0, dur: 0.12 },
    { freq: 880, start: 0.12, dur: 0.12 },
    { freq: 1100, start: 0.24, dur: 0.12 },
    { freq: 1320, start: 0.36, dur: 0.25 },
  ]
  for (const n of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.15, t + n.start)
    g.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + n.start); osc.stop(t + n.start + n.dur + 0.05)
  }
}

// ─── Game over: sad descending tones ───
function playGameOver() {
  const c = makeCtx()
  const t = c.currentTime
  const notes = [
    { freq: 440, start: 0, dur: 0.3 },
    { freq: 370, start: 0.3, dur: 0.3 },
    { freq: 330, start: 0.6, dur: 0.3 },
    { freq: 262, start: 0.9, dur: 0.5 },
  ]
  for (const n of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.12, t + n.start)
    g.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + n.start); osc.stop(t + n.start + n.dur + 0.05)
  }
}

// ─── Victory: triumphant fanfare ───
function playVictory() {
  const c = makeCtx()
  const t = c.currentTime
  const notes = [
    { freq: 523, start: 0, dur: 0.15 },      // C5
    { freq: 659, start: 0.15, dur: 0.15 },    // E5
    { freq: 784, start: 0.3, dur: 0.15 },     // G5
    { freq: 1047, start: 0.45, dur: 0.4 },    // C6
    { freq: 784, start: 0.85, dur: 0.1 },     // G5
    { freq: 1047, start: 0.95, dur: 0.5 },    // C6 sustained
  ]
  for (const n of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.15, t + n.start)
    g.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + n.start); osc.stop(t + n.start + n.dur + 0.05)
  }

  // Harmony layer
  const harmony = [
    { freq: 392, start: 0.45, dur: 0.4 },   // G4
    { freq: 523, start: 0.95, dur: 0.5 },    // C5
  ]
  for (const n of harmony) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.08, t + n.start)
    g.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + n.start); osc.stop(t + n.start + n.dur + 0.05)
  }
}
