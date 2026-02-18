// Coach Joe's whistle — high-pitched trill
function playWhistle() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(3500, ctx.currentTime)

    // LFO for the characteristic pea-whistle trill
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 6
    lfoGain.gain.value = 400
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03)
    gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.55)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7)

    osc.connect(gain)
    gain.connect(ctx.destination)
    lfo.start()
    osc.start()
    osc.stop(ctx.currentTime + 0.75)
    lfo.stop(ctx.currentTime + 0.75)

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Soft footstep — generic room transition
function playFootstep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)

    setTimeout(() => ctx.close(), 500)
  } catch {
    // Audio not available
  }
}

// Creaky door — basement entry
function playCreakDoor() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3)
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.5)
    osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.7)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.06, ctx.currentTime + 0.6)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.85)

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Ski lift motor — riding to the peak
function playLiftMotor() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Low motor hum
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(55, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3)
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.8)
    osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 1.0)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0)

    // Rhythmic clacking of the cable
    const clack = ctx.createOscillator()
    const clackGain = ctx.createGain()
    clack.type = 'square'
    clack.frequency.value = 4
    clackGain.gain.value = 0.03

    osc.connect(gain)
    gain.connect(ctx.destination)
    clack.connect(clackGain)
    clackGain.connect(ctx.destination)

    osc.start()
    clack.start()
    osc.stop(ctx.currentTime + 1.1)
    clack.stop(ctx.currentTime + 1.1)

    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not available
  }
}

// Wind gust — mountain peak, frozen waterfall, exposed areas
function playWind() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const bufferSize = Math.floor(ctx.sampleRate * 0.6)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(600, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.6)
    filter.Q.value = 1

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.35)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Cave water drip with echo — entering hidden cave
function playCaveEcho() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const times = [0, 0.15, 0.32]
    const volumes = [0.15, 0.08, 0.03]

    for (let i = 0; i < times.length; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1800, ctx.currentTime + times[i])
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + times[i] + 0.1)

      gain.gain.setValueAtTime(volumes[i], ctx.currentTime + times[i])
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + times[i] + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + times[i])
      osc.stop(ctx.currentTime + times[i] + 0.18)
    }

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Deep rumble — entering the underground vault
function playVaultRumble() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(40, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.3)
    osc.frequency.linearRampToValueAtTime(35, ctx.currentTime + 0.8)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.85)

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Victory fanfare — trumpet-like ascending notes
export function playVictoryFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const notes = [
      { freq: 523.25, start: 0, dur: 0.15 },     // C5
      { freq: 659.25, start: 0.18, dur: 0.15 },   // E5
      { freq: 783.99, start: 0.36, dur: 0.15 },   // G5
      { freq: 1046.50, start: 0.54, dur: 0.4 },   // C6 (held)
      { freq: 783.99, start: 1.0, dur: 0.12 },    // G5
      { freq: 1046.50, start: 1.15, dur: 0.6 },   // C6 (final hold)
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.value = note.freq

      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.05)
    }

    setTimeout(() => ctx.close(), 3000)
  } catch {
    // Audio not available
  }
}

// Kid giggle — Mr Smiles interactions
function playKidLaugh() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const notes = [
      { freq: 400, start: 0, dur: 0.08 },
      { freq: 520, start: 0.09, dur: 0.07 },
      { freq: 620, start: 0.17, dur: 0.07 },
      { freq: 500, start: 0.25, dur: 0.07 },
      { freq: 680, start: 0.33, dur: 0.09 },
      { freq: 560, start: 0.44, dur: 0.07 },
      { freq: 720, start: 0.52, dur: 0.12 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)

      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + note.start + 0.01)
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

// Arcade start — coin-insert jingle
function playArcadeStart() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

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

// Angry grunt — short grumpy low-pitched burst
function playAngryGrunt() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Low growl oscillator
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)

    // Noise burst for gritty texture
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    const noise = ctx.createBufferSource()
    const noiseGain = ctx.createGain()
    noise.buffer = buffer
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(ctx.currentTime)

    setTimeout(() => ctx.close(), 600)
  } catch {
    // Audio not available
  }
}

// Dispatcher — play a sound by name
// Service bell — bright ding
function playBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.65)

    setTimeout(() => ctx.close(), 1000)
  } catch {
    // Audio not available
  }
}

// Mechanical lock unlock — heavy deadbolt clunk
function playUnlock() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Heavy metallic clunk
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03))
    }
    const clunk = ctx.createBufferSource()
    clunk.buffer = buffer
    const clunkFilter = ctx.createBiquadFilter()
    clunkFilter.type = 'lowpass'
    clunkFilter.frequency.value = 600
    const clunkGain = ctx.createGain()
    clunkGain.gain.setValueAtTime(0.5, ctx.currentTime)
    clunk.connect(clunkFilter)
    clunkFilter.connect(clunkGain)
    clunkGain.connect(ctx.destination)
    clunk.start()

    // Metallic sliding bolt sound (slightly delayed)
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1)
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.25)
    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0, ctx.currentTime)
    oscGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.1)
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)

    setTimeout(() => ctx.close(), 800)
  } catch {
    // Audio not available
  }
}

// Rocking chair creak — Old Dad in the cabin
function playRockingChair() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // First creak — chair rocking forward
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(60, ctx.currentTime)
    osc1.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.2)
    osc1.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.35)
    gain1.gain.setValueAtTime(0, ctx.currentTime)
    gain1.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05)
    gain1.gain.setValueAtTime(0.05, ctx.currentTime + 0.3)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.5)

    // Second creak — chair rocking back
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(90, ctx.currentTime + 0.5)
    osc2.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.65)
    osc2.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.8)
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.5)
    gain2.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.55)
    gain2.gain.setValueAtTime(0.04, ctx.currentTime + 0.75)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.5)
    osc2.stop(ctx.currentTime + 0.95)

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio not available
  }
}

// Camera/selfie click sound — short mechanical snap
function playCameraClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Sharp click — short burst of noise
    const bufferSize = ctx.sampleRate * 0.06
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize
      // Quick attack, fast decay with a sharp transient
      const env = t < 0.05 ? t / 0.05 : Math.exp(-30 * (t - 0.05))
      data[i] = (Math.random() * 2 - 1) * env
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 3000
    filter.Q.value = 1.5
    const gain = ctx.createGain()
    gain.gain.value = 0.25
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start()

    // Mechanical spring — short sine blip after the click
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.03)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08)
    oscGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.03)
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(ctx.currentTime + 0.03)
    osc.stop(ctx.currentTime + 0.12)

    setTimeout(() => ctx.close(), 500)
  } catch {
    // Audio not available
  }
}

// Bag rummaging sound — crinkling and rustling through snacks
function playBagRummage() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Three quick bursts of filtered noise to simulate crinkling
    for (let i = 0; i < 3; i++) {
      const offset = i * 0.15
      const bufLen = ctx.sampleRate * 0.12
      const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let j = 0; j < bufLen; j++) {
        const t = j / bufLen
        const env = Math.sin(t * Math.PI) // smooth rise and fall
        data[j] = (Math.random() * 2 - 1) * env
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 2000 + i * 800
      const gain = ctx.createGain()
      gain.gain.value = 0.08
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start(ctx.currentTime + offset)
    }

    setTimeout(() => ctx.close(), 1000)
  } catch {
    // Audio not available
  }
}

export function playSound(name) {
  const sounds = {
    whistle: playWhistle,
    footstep: playFootstep,
    creak_door: playCreakDoor,
    lift_motor: playLiftMotor,
    wind: playWind,
    cave_echo: playCaveEcho,
    vault_rumble: playVaultRumble,
    kid_laugh: playKidLaugh,
    victory: playVictoryFanfare,
    arcade_start: playArcadeStart,
    angry_grunt: playAngryGrunt,
    bell: playBell,
    unlock: playUnlock,
    rocking_chair: playRockingChair,
    camera_click: playCameraClick,
    bag_rummage: playBagRummage,
  }
  const fn = sounds[name]
  if (fn) fn()
}
