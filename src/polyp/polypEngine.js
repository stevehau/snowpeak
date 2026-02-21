// Polyp Sniper — Pure game logic
// No side effects — returns new state each tick

import { CANVAS, RETICLE, GAME, TUNNEL, SECTIONS } from './polypConfig.js'

let nextId = 1

// ─── Polyp factory ───

function createPolyp(section, index, total) {
  const progress = index / total  // 0→1 over section
  const rand = Math.random()

  let type, size, points, drift, hp, colorKey, hiKey
  if (rand < 0.45) {
    type = 'small'; size = GAME.SMALL_SIZE; points = GAME.SMALL_PTS
    drift = GAME.SMALL_DRIFT; hp = 1; colorKey = 'POLYP_SMALL'; hiKey = 'POLYP_SMALL_HI'
  } else if (rand < 0.80) {
    type = 'medium'; size = GAME.MEDIUM_SIZE; points = GAME.MEDIUM_PTS
    drift = GAME.MEDIUM_DRIFT; hp = 1; colorKey = 'POLYP_MEDIUM'; hiKey = 'POLYP_MEDIUM_HI'
  } else {
    type = 'large'; size = GAME.LARGE_SIZE; points = GAME.LARGE_PTS
    drift = GAME.LARGE_DRIFT; hp = 1; colorKey = 'POLYP_LARGE'; hiKey = 'POLYP_LARGE_HI'
  }

  // Harder sections → more large polyps, faster drift
  drift += section * 0.004

  // Place on colon wall at random angle
  const angle = Math.random() * Math.PI * 2
  const radius = TUNNEL.MID_RADIUS * (0.5 + Math.random() * 0.45)
  const x = TUNNEL.CENTER_X + Math.cos(angle) * radius
  const y = TUNNEL.CENTER_Y + Math.sin(angle) * radius

  return {
    id: nextId++,
    type, size, points, drift, hp, maxHp: hp,
    colorKey, hiKey,
    x, y, angle, radius,
    state: 'growing',   // 'growing' | 'active' | 'snipped' | 'escaped'
    growTimer: 30,       // frames to grow in
    lifetime: GAME.POLYP_LIFETIME,
    hitFlash: 0,
    wobble: Math.random() * Math.PI * 2,
  }
}

function createBossPolyp(section) {
  const angle = Math.random() * Math.PI * 2
  const radius = TUNNEL.MID_RADIUS * 0.6
  return {
    id: nextId++,
    type: 'boss',
    size: GAME.BOSS_SIZE,
    points: GAME.BOSS_PTS,
    drift: GAME.BOSS_DRIFT + section * 0.002,
    hp: GAME.BOSS_HP,
    maxHp: GAME.BOSS_HP,
    colorKey: 'POLYP_BOSS',
    hiKey: 'POLYP_BOSS_HI',
    x: TUNNEL.CENTER_X + Math.cos(angle) * radius,
    y: TUNNEL.CENTER_Y + Math.sin(angle) * radius,
    angle, radius,
    state: 'growing',
    growTimer: 50,
    lifetime: GAME.POLYP_LIFETIME * 1.5,
    hitFlash: 0,
    wobble: 0,
  }
}

// ─── Initial state ───

export function createPolypState() {
  return {
    phase: 'ready',  // 'ready' | 'playing' | 'sectionclear' | 'gameover' | 'victory'

    reticle: { x: CANVAS.WIDTH / 2, y: CANVAS.HEIGHT / 2 },

    polyps: [],
    polypHits: 0,
    polypTotal: 0,            // spawned count this section
    collectedSpecimens: [],   // { colorKey } for jar display

    currentSection: 0,
    sectionPolypsKilled: 0,
    sectionTarget: GAME.POLYPS_PER_SECTION + 1, // +1 for boss
    bossSpawned: false,

    damageCount: 0,

    score: 0,
    totalClicks: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,

    frameCount: 0,
    startTime: 0,
    elapsedMs: 0,
    lastSpawnFrame: -GAME.SPAWN_INITIAL_DELAY,
    sectionClearTimer: 0,

    // Miss feedback
    missFlashTimer: 0,
    lastMissX: 0,
    lastMissY: 0,
    ouchTimer: 0,

    // Screen shake
    shakeTimer: 0,
    shakeX: 0,
    shakeY: 0,

    input: { left: false, right: false, up: false, down: false },
    particles: [],
    bubbles: [],
    events: [],
  }
}

// ─── Main tick ───

export function tick(state) {
  if (state.phase === 'ready') {
    return { ...state, frameCount: state.frameCount + 1 }
  }

  if (state.phase === 'sectionclear') {
    const timer = state.sectionClearTimer - 1
    if (timer <= 0) {
      // Advance to next section or victory
      const nextSection = state.currentSection + 1
      if (nextSection >= GAME.TOTAL_SECTIONS) {
        return { ...state, phase: 'victory', sectionClearTimer: 0, events: ['victory'], frameCount: state.frameCount + 1 }
      }
      return {
        ...state,
        phase: 'playing',
        currentSection: nextSection,
        sectionPolypsKilled: 0,
        sectionTarget: GAME.POLYPS_PER_SECTION + 1,
        polypTotal: 0,
        bossSpawned: false,
        lastSpawnFrame: state.frameCount,
        polyps: [],
        sectionClearTimer: 0,
        frameCount: state.frameCount + 1,
        events: [],
      }
    }
    return { ...state, sectionClearTimer: timer, frameCount: state.frameCount + 1 }
  }

  if (state.phase === 'gameover' || state.phase === 'victory') {
    return { ...state, frameCount: state.frameCount + 1 }
  }

  // Playing phase
  let s = { ...state, events: [], frameCount: state.frameCount + 1 }
  s.elapsedMs = Date.now() - s.startTime

  s = moveReticle(s)
  s = spawnPolyps(s)
  s = updatePolyps(s)
  s = updateParticles(s)
  s = updateBubbles(s)
  s = updateTimers(s)

  // Check section clear
  if (s.sectionPolypsKilled >= s.sectionTarget && s.polyps.filter(p => p.state === 'active' || p.state === 'growing').length === 0) {
    s = { ...s, phase: 'sectionclear', sectionClearTimer: GAME.SECTION_CLEAR_FRAMES, events: [...s.events, 'section_clear'] }
  }

  return s
}

// ─── Snip action ───

export function handleSnip(state) {
  if (state.phase !== 'playing') return state

  const { x, y } = state.reticle
  let s = { ...state, totalClicks: state.totalClicks + 1, events: [] }

  // Find hit polyp (check active ones, closest first isn't needed — flat view)
  const active = s.polyps.filter(p => p.state === 'active')
  let hitPolyp = null
  let hitDist = Infinity

  for (const p of active) {
    const dx = x - p.x
    const dy = y - p.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const hitRadius = p.size * GAME.HIT_RADIUS_MULT
    if (dist < hitRadius && dist < hitDist) {
      hitPolyp = p
      hitDist = dist
    }
  }

  if (hitPolyp) {
    // Hit!
    const newHp = hitPolyp.hp - 1
    if (newHp <= 0) {
      // Polyp fully snipped
      const comboMult = 1 + s.combo * GAME.COMBO_BONUS
      const pts = Math.floor(hitPolyp.points * comboMult)
      const newCombo = s.combo + 1

      s = {
        ...s,
        score: s.score + pts,
        polypHits: s.polypHits + 1,
        sectionPolypsKilled: s.sectionPolypsKilled + 1,
        combo: newCombo,
        comboTimer: GAME.COMBO_WINDOW,
        bestCombo: Math.max(s.bestCombo, newCombo),
        collectedSpecimens: [...s.collectedSpecimens, { colorKey: hitPolyp.colorKey }],
        polyps: s.polyps.map(p => p.id === hitPolyp.id ? { ...p, state: 'snipped', hp: 0 } : p),
        events: [...s.events, hitPolyp.type === 'boss' ? 'boss_defeat' : 'snip'],
      }

      // Snip particles
      s = spawnSnipParticles(s, hitPolyp.x, hitPolyp.y, hitPolyp.colorKey)
    } else {
      // Boss took a hit but not dead yet
      s = {
        ...s,
        polyps: s.polyps.map(p => p.id === hitPolyp.id ? { ...p, hp: newHp, hitFlash: 12 } : p),
        events: [...s.events, 'boss_hit'],
      }
    }
  } else {
    // Miss — damaged healthy tissue
    s = {
      ...s,
      damageCount: s.damageCount + 1,
      combo: 0,
      comboTimer: 0,
      missFlashTimer: 15,
      lastMissX: x,
      lastMissY: y,
      ouchTimer: 40,
      shakeTimer: 10,
      events: [...s.events, 'miss'],
    }

    // Check game over
    if (s.damageCount >= GAME.MAX_MISSES) {
      s = { ...s, phase: 'gameover', events: [...s.events, 'game_over'] }
    }
  }

  return s
}

// ─── Advance section (called from sectionclear timeout) ───

export function advanceSection(state) {
  const next = state.currentSection + 1
  if (next >= GAME.TOTAL_SECTIONS) {
    return { ...state, phase: 'victory', events: ['victory'] }
  }
  return {
    ...state,
    phase: 'playing',
    currentSection: next,
    sectionPolypsKilled: 0,
    sectionTarget: GAME.POLYPS_PER_SECTION + 1,
    polypTotal: 0,
    bossSpawned: false,
    lastSpawnFrame: state.frameCount,
    polyps: [],
  }
}

// ─── Helpers ───

function moveReticle(state) {
  let { x, y } = state.reticle
  const spd = RETICLE.SPEED
  if (state.input.left) x -= spd
  if (state.input.right) x += spd
  if (state.input.up) y -= spd
  if (state.input.down) y += spd

  x = Math.max(10, Math.min(CANVAS.WIDTH - 10, x))
  y = Math.max(10, Math.min(CANVAS.HEIGHT - 10, y))

  return { ...state, reticle: { x, y } }
}

function spawnPolyps(state) {
  const maxForSection = GAME.POLYPS_PER_SECTION + (state.bossSpawned ? 1 : 0)
  if (state.polypTotal >= maxForSection) {
    // All regular polyps spawned — spawn boss if not yet
    if (!state.bossSpawned && state.polypTotal >= GAME.POLYPS_PER_SECTION) {
      // Wait for existing polyps to thin out a bit
      const activeCount = state.polyps.filter(p => p.state === 'active' || p.state === 'growing').length
      if (activeCount <= 2) {
        const boss = createBossPolyp(state.currentSection)
        return {
          ...state,
          polyps: [...state.polyps, boss],
          polypTotal: state.polypTotal + 1,
          bossSpawned: true,
          events: [...state.events, 'boss_spawn'],
        }
      }
    }
    return state
  }

  // Spawn interval decreases with progress
  const progress = state.polypTotal / GAME.POLYPS_PER_SECTION
  const sectionMult = 1 - state.currentSection * 0.15 // faster in later sections
  const interval = Math.max(
    GAME.SPAWN_INTERVAL_MIN,
    (GAME.SPAWN_INTERVAL_START - progress * (GAME.SPAWN_INTERVAL_START - GAME.SPAWN_INTERVAL_MIN)) * sectionMult
  )

  if (state.frameCount - state.lastSpawnFrame < interval) return state

  const polyp = createPolyp(state.currentSection, state.polypTotal, GAME.POLYPS_PER_SECTION)
  return {
    ...state,
    polyps: [...state.polyps, polyp],
    polypTotal: state.polypTotal + 1,
    lastSpawnFrame: state.frameCount,
    events: [...state.events, 'polyp_spawn'],
  }
}

function updatePolyps(state) {
  const polyps = state.polyps.map(p => {
    if (p.state === 'growing') {
      const gt = p.growTimer - 1
      if (gt <= 0) return { ...p, state: 'active', growTimer: 0 }
      return { ...p, growTimer: gt }
    }

    if (p.state === 'active') {
      // Drift along the wall
      const newAngle = p.angle + p.drift
      const wobble = p.wobble + 0.03
      const wobbleOffset = Math.sin(wobble) * 3
      const newX = TUNNEL.CENTER_X + Math.cos(newAngle) * (p.radius + wobbleOffset)
      const newY = TUNNEL.CENTER_Y + Math.sin(newAngle) * (p.radius + wobbleOffset)
      const newLifetime = p.lifetime - 1
      const hitFlash = Math.max(0, p.hitFlash - 1)

      if (newLifetime <= 0) {
        return { ...p, state: 'escaped' }
      }

      return { ...p, angle: newAngle, x: newX, y: newY, wobble, lifetime: newLifetime, hitFlash }
    }

    if (p.state === 'snipped') {
      // Shrink and fade out
      const newSize = p.size - 0.8
      if (newSize <= 0) return null
      return { ...p, size: newSize }
    }

    return p
  }).filter(Boolean)

  return { ...state, polyps }
}

function updateParticles(state) {
  const particles = state.particles.map(p => ({
    ...p,
    x: p.x + p.vx,
    y: p.y + p.vy,
    vy: p.vy + 0.05,
    life: p.life - 1,
  })).filter(p => p.life > 0)

  return { ...state, particles }
}

function updateBubbles(state) {
  let bubbles = state.bubbles.map(b => ({
    ...b,
    x: b.x + b.vx + Math.sin(b.wobble) * 0.3,
    y: b.y + b.vy,
    wobble: b.wobble + 0.05,
    life: b.life - 1,
    size: b.size + 0.01,
  })).filter(b => b.life > 0)

  // Spawn new bubbles
  if (bubbles.length < GAME.MAX_BUBBLES && Math.random() < GAME.BUBBLE_SPAWN_CHANCE) {
    bubbles = [...bubbles, {
      x: Math.random() * CANVAS.WIDTH,
      y: CANVAS.HEIGHT + 5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.3 + Math.random() * 0.5),
      size: 2 + Math.random() * 4,
      wobble: Math.random() * Math.PI * 2,
      life: 300 + Math.random() * 200,
    }]
  }

  return { ...state, bubbles }
}

function updateTimers(state) {
  let s = state
  if (s.comboTimer > 0) {
    const ct = s.comboTimer - 1
    s = { ...s, comboTimer: ct }
    if (ct <= 0) s = { ...s, combo: 0 }
  }
  if (s.missFlashTimer > 0) s = { ...s, missFlashTimer: s.missFlashTimer - 1 }
  if (s.ouchTimer > 0) s = { ...s, ouchTimer: s.ouchTimer - 1 }
  if (s.shakeTimer > 0) {
    const shake = s.shakeTimer - 1
    s = {
      ...s,
      shakeTimer: shake,
      shakeX: shake > 0 ? (Math.random() - 0.5) * 6 : 0,
      shakeY: shake > 0 ? (Math.random() - 0.5) * 6 : 0,
    }
  }
  return s
}

function spawnSnipParticles(state, x, y, colorKey) {
  const newParticles = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4
    const speed = 1.5 + Math.random() * 3
    newParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 25 + Math.random() * 20,
      colorKey,
    })
  }
  return { ...state, particles: [...state.particles, ...newParticles] }
}
