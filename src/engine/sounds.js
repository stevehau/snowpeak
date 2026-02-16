export function playVictoryFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Trumpet-like fanfare: short ascending notes
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

      // Shape the envelope for a brass-like attack
      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.dur + 0.05)
    }

    // Clean up after fanfare completes
    setTimeout(() => ctx.close(), 3000)
  } catch {
    // Audio not available — silently skip
  }
}
