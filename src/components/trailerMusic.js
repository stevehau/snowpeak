// Cinematic synth soundtrack for Snowpeak Resort trailer
// Uses Web Audio API — no external files needed
// Timeline synced to trailer SVG scenes:
//   Scene 0 (0-2.5s):   Black + tagline — sparse, mysterious pad
//   Scene 1 (2.5-6s):   Mountain + lodge — warm strings swell
//   Scene 2 (6-12s):    Characters — melodic theme
//   Scene 3 (12-19s):   Arcade showcase — energetic pulse
//   Scene 4 (19-23s):   Mystery cave — dark tension
//   Scene 5 (23-30s):   Epic finale — full climax + resolve

let ctx = null
let masterGain = null
let isPlaying = false
let scheduledNodes = []
let musicStartTime = 0

function getCtx() {
  if (!ctx || ctx.state === 'closed') {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.35
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Must be called during a user gesture (click/tap) to unlock audio.
// This creates and resumes the AudioContext while the gesture is active.
export function initTrailerAudio() {
  const c = getCtx()
  // Play a silent buffer to fully unlock on iOS/Safari
  const silentBuf = c.createBuffer(1, 1, c.sampleRate)
  const src = c.createBufferSource()
  src.buffer = silentBuf
  src.connect(c.destination)
  src.start()
  return c
}

// ─── Utility: create an oscillator note ───
function playNote(freq, startTime, duration, type = 'sine', gainVal = 0.15, fadeIn = 0.05, fadeOut = 0.1) {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()

  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainVal, startTime + fadeIn)
  gain.gain.setValueAtTime(gainVal, startTime + duration - fadeOut)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.connect(gain)
  gain.connect(masterGain)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)

  scheduledNodes.push(osc, gain)
  return osc
}

// ─── Utility: pad (detuned oscillators for width) ───
function playPad(freq, startTime, duration, gainVal = 0.08) {
  const detune = 6
  playNote(freq, startTime, duration, 'sine', gainVal, 0.3, 0.5)
  playNote(freq * (1 + detune / 1200), startTime, duration, 'sine', gainVal * 0.6, 0.3, 0.5)
  playNote(freq * (1 - detune / 1200), startTime, duration, 'triangle', gainVal * 0.4, 0.3, 0.5)
}

// ─── Utility: filtered noise burst ───
function playNoise(startTime, duration, filterFreq = 2000, gainVal = 0.04) {
  const c = getCtx()
  const bufferSize = c.sampleRate * duration
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = c.createBufferSource()
  source.buffer = buffer

  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = filterFreq

  const gain = c.createGain()
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.1)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  source.start(startTime)
  source.stop(startTime + duration + 0.05)

  scheduledNodes.push(source, filter, gain)
}

// ─── Utility: deep sub bass ───
function playSub(freq, startTime, duration, gainVal = 0.12) {
  playNote(freq, startTime, duration, 'sine', gainVal, 0.15, 0.3)
}

// ─── Utility: pluck-like synth ───
function playPluck(freq, startTime, gainVal = 0.12) {
  const c = getCtx()
  const osc = c.createOscillator()
  const osc2 = c.createOscillator()
  const gain = c.createGain()
  const filter = c.createBiquadFilter()

  osc.type = 'triangle'
  osc.frequency.value = freq
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(freq * 4, startTime)
  filter.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + 0.8)

  gain.gain.setValueAtTime(gainVal, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9)

  osc.connect(filter)
  osc2.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  osc.start(startTime)
  osc2.start(startTime)
  osc.stop(startTime + 1)
  osc2.stop(startTime + 1)

  scheduledNodes.push(osc, osc2, gain, filter)
}

// ─── Utility: shimmer / bell tone ───
function playBell(freq, startTime, duration = 2, gainVal = 0.06) {
  const c = getCtx()
  const osc = c.createOscillator()
  const osc2 = c.createOscillator()
  const gain = c.createGain()

  osc.type = 'sine'
  osc.frequency.value = freq
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2.02  // slight inharmonicity for bell-like quality

  gain.gain.setValueAtTime(gainVal, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.connect(gain)
  osc2.connect(gain)
  gain.connect(masterGain)
  osc.start(startTime)
  osc2.start(startTime)
  osc.stop(startTime + duration + 0.05)
  osc2.stop(startTime + duration + 0.05)

  scheduledNodes.push(osc, osc2, gain)
}

// Musical constants (key of D minor / F major)
const D3 = 146.83, F3 = 174.61, A3 = 220, Bb3 = 233.08, C4 = 261.63
const D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392, A4 = 440
const Bb4 = 466.16, C5 = 523.25, D5 = 587.33, F5 = 698.46

// ═══════════════════════════════════════════
// SCENE 0: Mystery intro (0 – 2.5s)
// Sparse, haunting — single notes in darkness
// ═══════════════════════════════════════════
function scene0(t) {
  // Deep wind-like noise
  playNoise(t, 3, 400, 0.025)

  // Single haunting bell
  playBell(D5, t + 0.3, 2.5, 0.05)

  // Low mysterious pad fading in
  playPad(D3, t + 0.5, 2.5, 0.04)

  // Subtle sub
  playSub(D3 / 2, t + 0.8, 2, 0.06)
}

// ═══════════════════════════════════════════
// SCENE 1: Mountain reveal (2.5 – 6s)
// Warm, majestic — strings swell with wonder
// ═══════════════════════════════════════════
function scene1(t) {
  const s = t + 2.5

  // Warm swelling pad — Dm chord
  playPad(D3, s, 3.5, 0.06)
  playPad(F3, s + 0.2, 3.3, 0.05)
  playPad(A3, s + 0.4, 3.1, 0.05)

  // Rising melody — awe-inspiring mountain reveal
  playPluck(D4, s + 0.5, 0.08)
  playPluck(F4, s + 1.2, 0.1)
  playPluck(A4, s + 1.9, 0.12)
  playPluck(D5, s + 2.6, 0.1)

  // Sub bass following root
  playSub(D3 / 2, s, 3.5, 0.08)

  // Gentle shimmer
  playBell(A4 * 2, s + 1.5, 2, 0.03)
  playBell(F5, s + 2.2, 2, 0.025)

  // Wind texture
  playNoise(s, 3.5, 600, 0.018)
}

// ═══════════════════════════════════════════
// SCENE 2: Characters (6 – 12s)
// Melodic, warm — the main theme
// ═══════════════════════════════════════════
function scene2(t) {
  const s = t + 6

  // Main theme melody (D minor → Bb major → F major → C)
  // Phrase 1 (6-9s) — Dm to Bb
  playPad(D3, s, 3, 0.07)
  playPad(F3, s, 3, 0.05)
  playPad(A3, s, 3, 0.05)

  playPluck(A4, s + 0.2, 0.1)
  playPluck(G4, s + 0.7, 0.08)
  playPluck(F4, s + 1.2, 0.1)
  playPluck(E4, s + 1.7, 0.08)
  playPluck(D4, s + 2.2, 0.12)

  playSub(D3 / 2, s, 1.5, 0.08)
  playSub(Bb3 / 2, s + 1.5, 1.5, 0.08)

  // Phrase 2 (9-12s) — F major to C resolve
  playPad(F3, s + 3, 3, 0.07)
  playPad(A3, s + 3, 3, 0.05)
  playPad(C4, s + 3, 3, 0.05)

  playPluck(C5, s + 3.2, 0.1)
  playPluck(Bb4, s + 3.7, 0.09)
  playPluck(A4, s + 4.2, 0.11)
  playPluck(G4, s + 4.7, 0.09)
  playPluck(F4, s + 5.2, 0.13)

  playSub(F3 / 2, s + 3, 1.5, 0.08)
  playSub(C4 / 2, s + 4.5, 1.5, 0.08)

  // Warm bells on character reveals
  playBell(D5, s + 0.5, 1.5, 0.04)
  playBell(F5, s + 1.5, 1.5, 0.035)
  playBell(A4 * 2, s + 3, 1.5, 0.04)
  playBell(C5, s + 4.5, 1.5, 0.035)
}

// ═══════════════════════════════════════════
// SCENE 3: Arcade showcase (12 – 19s)
// Energetic — pulsing arpeggios, driving bass
// ═══════════════════════════════════════════
function scene3(t) {
  const s = t + 12

  // Driving pulse — eighth note arpeggios
  const arpNotes = [D4, F4, A4, D5, A4, F4, D4, F4]
  for (let i = 0; i < 7; i++) {
    const beatTime = s + i * 0.85
    for (let j = 0; j < 8; j++) {
      playNote(arpNotes[j], beatTime + j * 0.105, 0.12, 'sawtooth', 0.03, 0.01, 0.04)
    }
  }

  // Strong sub bass — pulsing
  for (let i = 0; i < 14; i++) {
    playSub(i % 4 < 2 ? D3 / 2 : A3 / 2, s + i * 0.5, 0.45, 0.09)
  }

  // Pad underneath — shifts between Dm and Am
  playPad(D3, s, 3.5, 0.05)
  playPad(A3, s + 3.5, 3.5, 0.05)

  // Mini-game reveal accents (one per ~1.7s)
  playBell(F5, s + 0.5, 1, 0.06)    // Slalom
  playBell(A4 * 2, s + 2.2, 1, 0.06) // Defend
  playBell(D5, s + 3.9, 1, 0.06)    // Snowball
  playBell(C5 * 2, s + 5.6, 1, 0.06) // Ice Breaker

  // Noise hits for energy
  playNoise(s + 0.4, 0.3, 3000, 0.03)
  playNoise(s + 2.1, 0.3, 3000, 0.03)
  playNoise(s + 3.8, 0.3, 3000, 0.03)
  playNoise(s + 5.5, 0.3, 3000, 0.03)
}

// ═══════════════════════════════════════════
// SCENE 4: Mystery cave (19 – 23s)
// Dark, tense — low drones, dissonant intervals
// ═══════════════════════════════════════════
function scene4(t) {
  const s = t + 19

  // Dark drone — Dm with b9 tension
  playPad(D3, s, 4, 0.07)
  playPad(D3 * 1.06, s + 0.5, 3.5, 0.04)  // Eb — dissonant
  playPad(A3, s + 1, 3, 0.04)

  // Deep rumble
  playSub(D3 / 2, s, 4, 0.1)
  playNoise(s, 4, 300, 0.03)

  // Eerie high harmonics
  playBell(D5 * 2, s + 0.8, 2.5, 0.025)
  playBell(A4 * 3, s + 1.8, 2, 0.02)

  // Tension build — rising pitch
  const c = getCtx()
  const riser = c.createOscillator()
  const riserGain = c.createGain()
  riser.type = 'sawtooth'
  riser.frequency.setValueAtTime(100, s)
  riser.frequency.exponentialRampToValueAtTime(800, s + 3.5)
  riserGain.gain.setValueAtTime(0, s)
  riserGain.gain.linearRampToValueAtTime(0.025, s + 1)
  riserGain.gain.linearRampToValueAtTime(0.05, s + 3)
  riserGain.gain.linearRampToValueAtTime(0, s + 3.8)

  const riserFilter = c.createBiquadFilter()
  riserFilter.type = 'lowpass'
  riserFilter.frequency.setValueAtTime(200, s)
  riserFilter.frequency.exponentialRampToValueAtTime(2000, s + 3.5)

  riser.connect(riserFilter)
  riserFilter.connect(riserGain)
  riserGain.connect(masterGain)
  riser.start(s)
  riser.stop(s + 4)

  scheduledNodes.push(riser, riserGain, riserFilter)
}

// ═══════════════════════════════════════════
// SCENE 5: Epic finale (23 – 30s)
// Full climax — title reveal, majestic resolve
// ═══════════════════════════════════════════
function scene5(t) {
  const s = t + 23

  // Impact hit — noise burst + low sub
  playNoise(s, 0.5, 5000, 0.06)
  playSub(D3 / 2, s, 1, 0.15)

  // Grand chord — Dm → F → Bb → resolution to Dm
  // First chord: Dm (23-25s)
  playPad(D3, s + 0.2, 2.5, 0.09)
  playPad(F3, s + 0.2, 2.5, 0.07)
  playPad(A3, s + 0.2, 2.5, 0.07)
  playPad(D4, s + 0.2, 2.5, 0.06)

  // Melody — triumphant title theme
  playPluck(D5, s + 0.3, 0.15)
  playPluck(F5, s + 0.9, 0.15)
  playPluck(A4 * 2, s + 1.5, 0.18)  // high A

  playSub(D3 / 2, s + 0.2, 2.5, 0.1)

  // Second chord: Bb major (25-27s)
  playPad(Bb3, s + 2.7, 2.3, 0.09)
  playPad(D4, s + 2.7, 2.3, 0.07)
  playPad(F4, s + 2.7, 2.3, 0.07)

  playPluck(D5, s + 2.8, 0.15)
  playPluck(Bb4, s + 3.3, 0.12)
  playPluck(F4, s + 3.8, 0.1)

  playSub(Bb3 / 2, s + 2.7, 2.3, 0.1)

  // Final resolution: Dm (27-30s) — gentle decay
  playPad(D3, s + 5, 2.5, 0.08)
  playPad(F3, s + 5, 2.5, 0.06)
  playPad(A3, s + 5, 2.5, 0.06)

  // Final melody note — resolving high D
  playBell(D5, s + 5.2, 3, 0.07)
  playBell(A4, s + 5.5, 2.5, 0.04)

  playSub(D3 / 2, s + 5, 2.5, 0.08)

  // Gentle wind fade out
  playNoise(s + 5, 3, 500, 0.02)
}

// ═══════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════
export function startTrailerMusic() {
  if (isPlaying) return
  const c = getCtx()
  const t = c.currentTime + 0.1

  isPlaying = true
  scheduledNodes = []

  scene0(t)
  scene1(t)
  scene2(t)
  scene3(t)
  scene4(t)
  scene5(t)
}

export function stopTrailerMusic() {
  if (!isPlaying) return
  isPlaying = false

  // Fade out gracefully
  if (masterGain && ctx) {
    const now = ctx.currentTime
    masterGain.gain.setValueAtTime(masterGain.gain.value, now)
    masterGain.gain.linearRampToValueAtTime(0, now + 0.5)

    // Clean up after fade
    setTimeout(() => {
      for (const node of scheduledNodes) {
        try {
          if (node.stop) node.stop()
          if (node.disconnect) node.disconnect()
        } catch (_) { /* already stopped */ }
      }
      scheduledNodes = []
      if (masterGain) masterGain.gain.value = 0.35
    }, 600)
  }
}

export function setTrailerVolume(vol) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, vol))
  }
}

export function isTrailerPlaying() {
  return isPlaying
}
