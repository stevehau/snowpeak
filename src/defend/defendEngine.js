// Defend the Village — Pure game logic
// tick(state) → newState, no side effects

import { CANVAS, GAME, RETICLE, PERSPECTIVE } from './defendConfig.js'

export function createDefendState() {
  return {
    phase: 'ready',  // 'ready' | 'playing' | 'gameover' | 'victory'
    reticle: {
      x: CANVAS.WIDTH / 2,
      y: CANVAS.HEIGHT / 2,
    },
    animals: [],
    animalsSpawned: 0,
    animalsDefeated: 0,
    totalAnimals: GAME.TOTAL_ANIMALS,
    frameCount: 0,
    startTime: 0,        // set when game starts
    elapsedMs: 0,
    lastSpawnFrame: 0,
    shotCooldown: 0,
    muzzleFlash: 0,      // frames remaining for flash effect
    lastShotX: 0,
    lastShotY: 0,
    input: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
    events: [],
    // Ammo / reload
    ammo: GAME.AMMO_MAX,
    reloading: false,
    reloadTimer: 0,
    // Halfway announcement
    halfwayShown: false,
    halfwayTimer: 0,        // frames to display "HALFWAY" message
    // Boss state
    bossPhase: false,       // true after 20 regular animals defeated
    bossSpawned: false,
    bossDefeated: false,
    bossDelayTimer: 0,      // countdown before boss appears
  }
}

export function tick(state) {
  if (state.phase !== 'playing') return state

  let s = { ...state, events: [], frameCount: state.frameCount + 1 }

  // Update elapsed time
  s.elapsedMs = Date.now() - s.startTime

  // Move reticle
  s = moveReticle(s)

  // Spawn regular animals (only during regular phase)
  if (!s.bossPhase) {
    s = spawnAnimals(s)
  }

  // Boss phase logic
  if (s.bossPhase && !s.bossSpawned) {
    // Wait for remaining animals to clear, then countdown
    const activeAnimals = s.animals.filter(a => a.state !== 'gone')
    if (activeAnimals.length === 0) {
      if (s.bossDelayTimer <= 0) {
        // Spawn the boss
        s = spawnBoss(s)
      } else {
        s = { ...s, bossDelayTimer: s.bossDelayTimer - 1 }
      }
    }
  }

  // Update animals (approach + retreat)
  s = updateAnimals(s)

  // Decrement cooldowns
  if (s.shotCooldown > 0) s = { ...s, shotCooldown: s.shotCooldown - 1 }
  if (s.muzzleFlash > 0) s = { ...s, muzzleFlash: s.muzzleFlash - 1 }

  // Reload timer
  if (s.reloading) {
    if (s.reloadTimer <= 0) {
      s = { ...s, reloading: false, ammo: GAME.AMMO_MAX, events: [...s.events, 'reload_done'] }
    } else {
      s = { ...s, reloadTimer: s.reloadTimer - 1 }
    }
  }

  // Halfway timer (display countdown)
  if (s.halfwayTimer > 0) {
    s = { ...s, halfwayTimer: s.halfwayTimer - 1 }
  }

  // Check if any animal reached the player
  for (const animal of s.animals) {
    if (animal.state === 'approaching' && animal.scale >= GAME.REACH_SCALE) {
      s = { ...s, phase: 'gameover', events: [...s.events, 'game_over'] }
      return s
    }
  }

  // Halfway announcement
  if (!s.halfwayShown && s.animalsDefeated >= Math.floor(s.totalAnimals / 2)) {
    s = {
      ...s,
      halfwayShown: true,
      halfwayTimer: 120,  // show for ~2 seconds
      events: [...s.events, 'halfway'],
    }
  }

  // Check if regular phase complete → trigger boss
  if (!s.bossPhase && s.animalsDefeated >= s.totalAnimals) {
    s = {
      ...s,
      bossPhase: true,
      bossDelayTimer: GAME.BOSS_SPAWN_DELAY,
      events: [...s.events, 'boss_incoming'],
    }
  }

  // Check victory: boss defeated and no animals left on screen
  if (s.bossDefeated) {
    const remaining = s.animals.filter(a => a.state !== 'gone')
    if (remaining.length === 0) {
      s = { ...s, phase: 'victory', events: [...s.events, 'victory'] }
    }
  }

  return s
}

export function handleShoot(state) {
  if (state.phase !== 'playing') return state
  if (state.shotCooldown > 0) return state
  if (state.reloading) return state
  if (state.ammo <= 0) return state

  const newAmmo = state.ammo - 1

  let s = {
    ...state,
    shotCooldown: GAME.SHOT_COOLDOWN,
    muzzleFlash: GAME.FLASH_DURATION,
    lastShotX: state.reticle.x,
    lastShotY: state.reticle.y,
    ammo: newAmmo,
    events: [...state.events, 'shoot'],
  }

  // Auto-reload when out of ammo
  if (newAmmo <= 0) {
    s = { ...s, reloading: true, reloadTimer: GAME.RELOAD_TIME }
  }

  // Check hit against approaching animals (front to back, hit closest first)
  const approaching = s.animals
    .map((a, i) => ({ ...a, idx: i }))
    .filter(a => a.state === 'approaching')
    .sort((a, b) => b.scale - a.scale) // closest (biggest) first

  for (const animal of approaching) {
    const baseW = animal.type === 'wolf' ? GAME.WOLF_WIDTH : GAME.BEAR_WIDTH
    const drawSize = baseW * animal.scale * (animal.sizeMult || 1)
    const hitRadius = drawSize * GAME.HIT_RADIUS_MULT

    const dx = s.reticle.x - animal.x
    const dy = s.reticle.y - animal.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < hitRadius) {
      // Hit!
      const newAnimals = [...s.animals]
      const target = { ...newAnimals[animal.idx] }
      target.hp -= 1
      target.hitFlash = 8 // flash frames

      if (target.hp <= 0) {
        // Defeated — start retreat
        target.state = 'retreating'
        target.retreatDir = animal.x < CANVAS.WIDTH / 2 ? -1 : 1
        target.retreatTimer = GAME.RETREAT_DURATION

        const isBoss = animal.type === 'boss'
        const retreatSound = animal.type === 'wolf' ? 'wolf_whimper'
          : isBoss ? 'boss_defeat' : 'bear_roar'

        s = {
          ...s,
          animalsDefeated: s.animalsDefeated + 1,
          bossDefeated: isBoss ? true : s.bossDefeated,
          events: [...s.events, retreatSound],
        }
      } else {
        s = { ...s, events: [...s.events, 'hit'] }
      }

      newAnimals[animal.idx] = target
      s = { ...s, animals: newAnimals }
      break // only hit one animal per shot
    }
  }

  return s
}

function moveReticle(state) {
  let { x, y } = state.reticle
  const speed = RETICLE.SPEED

  if (state.input.left) x -= speed
  if (state.input.right) x += speed
  if (state.input.up) y -= speed
  if (state.input.down) y += speed

  // Clamp to canvas
  x = Math.max(10, Math.min(CANVAS.WIDTH - 10, x))
  y = Math.max(PERSPECTIVE.HORIZON_Y, Math.min(CANVAS.HEIGHT - 30, y))

  return { ...state, reticle: { x, y } }
}

function spawnAnimals(state) {
  if (state.animalsSpawned >= state.totalAnimals) return state

  // Calculate spawn interval (gets faster over time)
  const progress = state.animalsSpawned / state.totalAnimals
  const interval = GAME.SPAWN_INTERVAL_START -
    progress * (GAME.SPAWN_INTERVAL_START - GAME.SPAWN_INTERVAL_MIN)

  if (state.frameCount - state.lastSpawnFrame < interval) return state

  const isBear = Math.random() < GAME.BEAR_CHANCE
  const type = isBear ? 'bear' : 'wolf'

  // Random spawn position along horizon
  const x = PERSPECTIVE.SPAWN_X_MIN +
    Math.random() * (PERSPECTIVE.SPAWN_X_MAX - PERSPECTIVE.SPAWN_X_MIN)
  const y = PERSPECTIVE.SPAWN_Y_MIN +
    Math.random() * (PERSPECTIVE.SPAWN_Y_MAX - PERSPECTIVE.SPAWN_Y_MIN)

  // Approach speed varies per animal — wolves faster, bears slower
  const speedMin = type === 'bear' ? GAME.BEAR_SPEED_MIN : GAME.WOLF_SPEED_MIN
  const speedMax = type === 'bear' ? GAME.BEAR_SPEED_MAX : GAME.WOLF_SPEED_MAX
  const speed = speedMin + Math.random() * (speedMax - speedMin)
  // Speed increases slightly as game progresses
  const speedMult = 1 + progress * 0.5

  const animal = {
    type,
    x,
    y,           // current screen Y (moves down as it approaches)
    startX: x,
    startY: y,
    scale: GAME.SCALE_MIN,
    sizeMult: 1,
    approachSpeed: speed * speedMult,
    hp: type === 'wolf' ? 1 : 3,
    maxHp: type === 'wolf' ? 1 : 3,
    state: 'approaching', // 'approaching' | 'retreating' | 'gone'
    retreatDir: 0,
    retreatTimer: 0,
    hitFlash: 0,
    // Lateral drift (animals don't walk in a straight line)
    drift: (Math.random() - 0.5) * 0.8,
    wobble: Math.random() * Math.PI * 2,
  }

  return {
    ...state,
    animals: [...state.animals, animal],
    animalsSpawned: state.animalsSpawned + 1,
    lastSpawnFrame: state.frameCount,
    events: [...state.events, type === 'bear' ? 'bear_spawn' : 'wolf_spawn'],
  }
}

function spawnBoss(state) {
  // Boss spawns center of horizon
  const x = CANVAS.WIDTH / 2
  const y = PERSPECTIVE.SPAWN_Y_MIN + 5

  const speed = GAME.BOSS_SPEED_MIN +
    Math.random() * (GAME.BOSS_SPEED_MAX - GAME.BOSS_SPEED_MIN)

  const boss = {
    type: 'boss',
    x,
    y,
    startX: x,
    startY: y,
    scale: GAME.SCALE_MIN,
    sizeMult: GAME.BOSS_SIZE_MULT,
    approachSpeed: speed,
    hp: GAME.BOSS_HP,
    maxHp: GAME.BOSS_HP,
    state: 'approaching',
    retreatDir: 0,
    retreatTimer: 0,
    hitFlash: 0,
    drift: 0,      // boss walks straight at you
    wobble: 0,
  }

  return {
    ...state,
    animals: [...state.animals, boss],
    bossSpawned: true,
    events: [...state.events, 'boss_roar'],
  }
}

function updateAnimals(state) {
  const animals = state.animals.map(a => {
    if (a.hitFlash > 0) a = { ...a, hitFlash: a.hitFlash - 1 }

    if (a.state === 'approaching') {
      // Move toward player (scale grows, y moves down)
      const newScale = a.scale + a.approachSpeed * 0.008
      const progress = (newScale - GAME.SCALE_MIN) / (GAME.SCALE_MAX - GAME.SCALE_MIN)
      // Y interpolates from spawn to bottom of screen
      const newY = a.startY + progress * (PERSPECTIVE.PLAYER_Y - a.startY)
      // X drifts with wobble
      const wobbleX = Math.sin(a.wobble + state.frameCount * 0.03) * 15 * a.scale
      const newX = a.startX + a.drift * progress * 80 + wobbleX

      return { ...a, scale: newScale, y: newY, x: newX }
    }

    if (a.state === 'retreating') {
      const newTimer = a.retreatTimer - 1
      if (newTimer <= 0) return { ...a, state: 'gone' }
      // Walk sideways off screen
      const newX = a.x + a.retreatDir * GAME.RETREAT_SPEED
      // Shrink slightly as they limp away
      const newScale = a.scale * 0.995
      return { ...a, x: newX, retreatTimer: newTimer, scale: newScale }
    }

    return a
  })

  // Remove animals that are gone
  const filtered = animals.filter(a => a.state !== 'gone')

  return { ...state, animals: filtered }
}
