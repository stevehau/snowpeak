// White Out — Web Audio synthesized 8-bit sounds

let audioCtx = null
function getCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

export function playWhiteoutSound(name) {
  try {
    const fn = SOUNDS[name]
    if (fn) fn()
  } catch {
    // Ignore audio errors
  }
}

const SOUNDS = {
  paddle() {
    // Short bright bounce
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  },

  brick_hit() {
    // Dull thud — brick damaged but not destroyed
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  },

  brick_break() {
    // Bright pop + crumble
    const ctx = getCtx()
    const t = ctx.currentTime
    // Pop
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'square'
    osc1.frequency.setValueAtTime(600, t)
    osc1.frequency.exponentialRampToValueAtTime(1200, t + 0.04)
    gain1.gain.setValueAtTime(0.12, t)
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(t + 0.1)
    // Crumble noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const nGain = ctx.createGain()
    nGain.gain.setValueAtTime(0.08, t + 0.03)
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    noise.connect(filter)
    filter.connect(nGain)
    nGain.connect(ctx.destination)
    noise.start(t + 0.03)
    noise.stop(t + 0.12)
  },

  wall() {
    // Quiet tick
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(330, ctx.currentTime)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  },

  serve() {
    // Whoosh upward
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  },

  ball_lost() {
    // Descending sad tone
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.45)
  },

  powerup() {
    // Bright ascending chime
    const ctx = getCtx()
    const t = ctx.currentTime
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, t + i * 0.06)
      gain.gain.setValueAtTime(0.1, t + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t + i * 0.06)
      osc.stop(t + i * 0.06 + 0.15)
    })
  },

  level_complete() {
    // Triumphant ascending fanfare
    const ctx = getCtx()
    const t = ctx.currentTime
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, t + i * 0.12)
      gain.gain.setValueAtTime(0.12, t + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t + i * 0.12)
      osc.stop(t + i * 0.12 + 0.35)
    })
  },

  victory() {
    // Epic victory jingle
    const ctx = getCtx()
    const t = ctx.currentTime
    const melody = [523, 659, 784, 659, 784, 1047]
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, t + i * 0.15)
      gain.gain.setValueAtTime(0.13, t + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t + i * 0.15)
      osc.stop(t + i * 0.15 + 0.35)
    })
  },

  game_over() {
    // Descending dirge
    const ctx = getCtx()
    const t = ctx.currentTime
    const notes = [392, 330, 262, 196]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, t + i * 0.2)
      gain.gain.setValueAtTime(0.1, t + i * 0.2)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t + i * 0.2)
      osc.stop(t + i * 0.2 + 0.4)
    })
  },
}
