// Slalom Challenge — Pure game logic
// tick(state) → newState, no side effects

import {
  CANVAS, SKIER, GATE, OBSTACLE, TREE,
  DIFFICULTY, GAME, WARMUP, CROWD, RIVAL,
} from './slalomConfig.js'

function seedTrees() {
  const trees = []
  // Place trees along both edges from above the screen to well below it
  for (let y = -200; y < CANVAS.HEIGHT + GAME.SPAWN_AHEAD + 400; y += 35 + Math.random() * 30) {
    const size = TREE.MIN_SIZE + Math.random() * (TREE.MAX_SIZE - TREE.MIN_SIZE)
    const side = trees.length % 2 === 0 ? 'left' : 'right'
    const x = side === 'left'
      ? Math.random() * TREE.EDGE_MARGIN
      : CANVAS.WIDTH - TREE.EDGE_MARGIN + Math.random() * TREE.EDGE_MARGIN
    trees.push({ x, y, size })
  }
  return trees
}

export function createSlalomState() {
  return {
    phase: 'ready',  // 'ready' | 'playing' | 'gameover'
    skier: {
      x: CANVAS.WIDTH / 2,
      vx: 0,
      y: SKIER.START_Y,
      width: SKIER.WIDTH,
      height: SKIER.HEIGHT,
    },
    worldY: 0,
    speed: DIFFICULTY.SPEED_MIN,
    gates: [],
    obstacles: [],
    trees: seedTrees(),
    crowds: [],
    lastCrowdAt: 0,           // gatesPassed count when last crowd spawned
    rivals: [],
    lastRivalAt: 0,           // gatesPassed count when last rival spawned
    score: 0,
    gatesPassed: 0,
    gatesMissed: 0,
    gatesSpawned: 0,         // total gates spawned (for warmup tracking)
    lastGateCenterX: CANVAS.WIDTH / 2,  // tracks last gate center for drift limiting
    maxMisses: GAME.MAX_MISSES,
    difficulty: 1,
    input: { left: false, right: false },
    canvasWidth: CANVAS.WIDTH,
    canvasHeight: CANVAS.HEIGHT,
    nextGateY: CANVAS.HEIGHT + 100,  // world-Y for next gate spawn
    // Sound events (consumed by React wrapper each frame)
    events: [],
  }
}

export function tick(state) {
  if (state.phase !== 'playing') return state

  let s = { ...state, events: [] }

  // Update world scroll
  s.worldY += s.speed

  // Update difficulty
  const newDifficulty = Math.min(
    DIFFICULTY.LEVELS,
    Math.floor(s.worldY / DIFFICULTY.DISTANCE_PER_LEVEL) + 1
  )
  if (newDifficulty > s.difficulty) {
    s = { ...s, difficulty: newDifficulty, events: [...s.events, 'speed_up'] }
  }

  // Update speed based on difficulty
  const t = (s.difficulty - 1) / (DIFFICULTY.LEVELS - 1)
  s.speed = DIFFICULTY.SPEED_MIN + t * (DIFFICULTY.SPEED_MAX - DIFFICULTY.SPEED_MIN)

  // Update skier horizontal movement (inertia)
  s = updateSkier(s)

  // Spawn gates
  s = spawnGates(s)

  // Spawn obstacles (suppressed during warmup)
  s = spawnObstacles(s)

  // Spawn trees
  s = spawnTrees(s)

  // Update moving obstacles
  s = updateObstacles(s)

  // Update rival NPC skiers
  s = updateRivals(s)

  // Check gate passage
  s = checkGates(s)

  // Check obstacle collisions
  s = checkObstacles(s)

  // Despawn off-screen entities
  s = despawn(s)

  // Check game over from misses
  if (s.gatesMissed >= s.maxMisses) {
    s = { ...s, phase: 'gameover', events: [...s.events, 'game_over'] }
  }

  return s
}

function updateSkier(state) {
  let { x, vx } = state.skier

  // Apply acceleration from input
  if (state.input.left) vx -= SKIER.ACCEL
  if (state.input.right) vx += SKIER.ACCEL

  // Apply friction
  vx *= SKIER.FRICTION

  // Clamp speed
  vx = Math.max(-SKIER.MAX_VX, Math.min(SKIER.MAX_VX, vx))

  // Tiny velocities → zero
  if (Math.abs(vx) < 0.1) vx = 0

  // Update position
  x += vx

  // Clamp to canvas bounds
  x = Math.max(SKIER.WIDTH / 2, Math.min(CANVAS.WIDTH - SKIER.WIDTH / 2, x))

  return {
    ...state,
    skier: { ...state.skier, x, vx },
  }
}

function isWarmup(gatesSpawned) {
  return gatesSpawned < WARMUP.GATE_COUNT
}

// Blend between warmup and normal values based on how many gates have been spawned
function warmupBlend(gatesSpawned, warmupVal, normalVal) {
  if (gatesSpawned >= WARMUP.GATE_COUNT) return normalVal
  const t = gatesSpawned / WARMUP.GATE_COUNT
  return warmupVal + t * (normalVal - warmupVal)
}

function getGateGap(difficulty, gatesSpawned) {
  const normalGap = GATE.MAX_GAP - ((difficulty - 1) / (DIFFICULTY.LEVELS - 1)) * (GATE.MAX_GAP - GATE.MIN_GAP)
  return warmupBlend(gatesSpawned, WARMUP.GAP, normalGap)
}

function getGateSpacing(difficulty, gatesSpawned) {
  const normalSpacing = GATE.SPAWN_SPACING_MAX - ((difficulty - 1) / (DIFFICULTY.LEVELS - 1)) * (GATE.SPAWN_SPACING_MAX - GATE.SPAWN_SPACING_MIN)
  return warmupBlend(gatesSpawned, WARMUP.SPACING, normalSpacing)
}

function getMaxDrift(spacing, speed, gatesSpawned) {
  // How many frames the skier has between gates
  const framesBetween = spacing / Math.max(speed, 1)
  // Theoretical max horizontal distance the skier can cover
  const theoreticalMax = SKIER.MAX_VX * framesBetween
  // Apply safety factor so the player can actually reach it
  const normalDrift = theoreticalMax * GAME.GATE_DRIFT_FACTOR
  // During warmup, use a tighter drift limit for gentler lateral movement
  return warmupBlend(gatesSpawned, WARMUP.MAX_DRIFT, normalDrift)
}

function spawnGates(state) {
  // Spawn gates when worldY approaches nextGateY
  const spawnThreshold = state.worldY + CANVAS.HEIGHT + GAME.SPAWN_AHEAD
  if (state.nextGateY > spawnThreshold) return state

  const gap = getGateGap(state.difficulty, state.gatesSpawned)
  const spacing = getGateSpacing(state.difficulty, state.gatesSpawned)
  const maxDrift = getMaxDrift(spacing, state.speed, state.gatesSpawned)

  // Determine gate center X, constrained to be reachable from the last gate
  const margin = 40 + gap / 2  // ensure full gate fits on screen
  const minX = Math.max(margin, state.lastGateCenterX - maxDrift)
  const maxX = Math.min(CANVAS.WIDTH - margin, state.lastGateCenterX + maxDrift)
  const centerX = minX + Math.random() * (maxX - minX)

  const leftX = centerX - gap / 2
  const rightX = centerX + gap / 2

  const gate = {
    y: state.nextGateY,
    leftX,
    rightX,
    passed: false,
    missed: false,
  }

  return {
    ...state,
    gates: [...state.gates, gate],
    nextGateY: state.nextGateY + spacing,
    gatesSpawned: state.gatesSpawned + 1,
    lastGateCenterX: centerX,
  }
}

function overlapsGate(x, width, y, gates) {
  const obsPad = 20  // extra clearance around obstacle
  for (const gate of gates) {
    // Check if obstacle is vertically near this gate
    if (Math.abs(y - gate.y) > 60) continue
    // Check if obstacle horizontally overlaps the gate opening
    const obsLeft = x - obsPad
    const obsRight = x + width + obsPad
    if (obsRight > gate.leftX && obsLeft < gate.rightX) return true
  }
  return false
}

function spawnObstacles(state) {
  // No obstacles during warmup
  if (isWarmup(state.gatesSpawned)) return state

  const t = (state.difficulty - 1) / (DIFFICULTY.LEVELS - 1)
  const chance = DIFFICULTY.OBSTACLE_CHANCE_MIN + t * (DIFFICULTY.OBSTACLE_CHANCE_MAX - DIFFICULTY.OBSTACLE_CHANCE_MIN)

  if (Math.random() > chance) return state

  const typeIdx = Math.floor(Math.random() * OBSTACLE.TYPES.length)
  const type = OBSTACLE.TYPES[typeIdx]
  const dims = type === 'rock' ? OBSTACLE.ROCK : type === 'bear' ? OBSTACLE.BEAR : OBSTACLE.SKIER

  const margin = 30
  const x = margin + Math.random() * (CANVAS.WIDTH - 2 * margin - dims.width)
  const y = state.worldY + CANVAS.HEIGHT + GAME.SPAWN_AHEAD + Math.random() * 100

  // Skip if obstacle would land inside a gate opening
  if (overlapsGate(x, dims.width, y, state.gates)) return state

  // Moving skier obstacles in mid-late game
  let vx = 0
  if (type === 'skier' && state.difficulty >= OBSTACLE.SKIER_MOVE_MIN_DIFFICULTY) {
    const dt = (state.difficulty - OBSTACLE.SKIER_MOVE_MIN_DIFFICULTY) /
               (DIFFICULTY.LEVELS - OBSTACLE.SKIER_MOVE_MIN_DIFFICULTY)
    const speed = OBSTACLE.SKIER_VX_MIN + dt * (OBSTACLE.SKIER_VX_MAX - OBSTACLE.SKIER_VX_MIN)
    vx = (Math.random() < 0.5 ? -1 : 1) * speed
  }

  return {
    ...state,
    obstacles: [...state.obstacles, { type, x, y, width: dims.width, height: dims.height, vx }],
  }
}

function updateObstacles(state) {
  let changed = false
  const obstacles = state.obstacles.map(obs => {
    if (!obs.vx || obs.vx === 0) return obs
    changed = true
    let x = obs.x + obs.vx
    let vx = obs.vx
    // Bounce off edges
    if (x < 10) { x = 10; vx = Math.abs(vx) }
    if (x + obs.width > CANVAS.WIDTH - 10) { x = CANVAS.WIDTH - 10 - obs.width; vx = -Math.abs(vx) }
    return { ...obs, x, vx }
  })
  return changed ? { ...state, obstacles } : state
}

function spawnTrees(state) {
  if (Math.random() > GAME.TREE_SPAWN_CHANCE) return state

  const size = TREE.MIN_SIZE + Math.random() * (TREE.MAX_SIZE - TREE.MIN_SIZE)
  // Trees spawn at the left or right edge
  const side = Math.random() < 0.5 ? 'left' : 'right'
  const x = side === 'left'
    ? Math.random() * TREE.EDGE_MARGIN
    : CANVAS.WIDTH - TREE.EDGE_MARGIN + Math.random() * TREE.EDGE_MARGIN
  const y = state.worldY + CANVAS.HEIGHT + GAME.SPAWN_AHEAD + Math.random() * 50

  return {
    ...state,
    trees: [...state.trees, { x, y, size }],
  }
}

function spawnRival(state) {
  // Rival starts just above the visible screen (behind the player, uphill)
  const startY = state.worldY - CANVAS.HEIGHT + 50

  // Collect all gates ahead of the rival's start position for navigation
  const gatePath = [...state.gates]
    .filter(g => g.y > startY)
    .sort((a, b) => a.y - b.y)

  return {
    ...state,
    rivals: [...state.rivals, {
      x: CANVAS.WIDTH / 2,
      y: startY,
      frame: 0,            // frames since spawn (for acceleration)
      gateIndex: 0,        // which gate in the upcoming list to target next
      gateCenters: gatePath.map(g => ({ y: g.y, cx: (g.leftX + g.rightX) / 2 })),
    }],
    lastRivalAt: state.gatesPassed,
  }
}

function updateRivals(state) {
  if (state.rivals.length === 0) return state

  const rivals = state.rivals.map(rival => {
    // Accelerate from SPEED_MULT_START to SPEED_MULT_MAX over ACCEL_FRAMES
    const accelT = Math.min(1, rival.frame / RIVAL.ACCEL_FRAMES)
    const speedMult = RIVAL.SPEED_MULT_START + accelT * (RIVAL.SPEED_MULT_MAX - RIVAL.SPEED_MULT_START)
    const rivalSpeed = state.speed * speedMult

    // Move rival downhill (increasing world Y)
    const newY = rival.y + rivalSpeed

    // Navigate toward the next gate center
    let targetX = rival.x
    const centers = rival.gateCenters
    let gateIndex = rival.gateIndex

    // Advance gate index if we've passed the current target gate
    while (gateIndex < centers.length && newY > centers[gateIndex].y + 20) {
      gateIndex++
    }

    // Steer toward the next gate center
    if (gateIndex < centers.length) {
      targetX = centers[gateIndex].cx
    }

    // Smooth interpolation toward target X
    const dx = targetX - rival.x
    const steerSpeed = Math.min(Math.abs(dx), 4 + accelT * 3)
    const newX = rival.x + Math.sign(dx) * steerSpeed

    return {
      ...rival,
      x: newX,
      y: newY,
      frame: rival.frame + 1,
      gateIndex,
    }
  })

  // Remove rivals that have scrolled well past the bottom of the visible area
  const filtered = rivals.filter(r => {
    const screenY = worldToScreen(r.y, state.worldY)
    return screenY < CANVAS.HEIGHT + 200
  })

  return { ...state, rivals: filtered }
}

function worldToScreen(entityY, worldY) {
  // Entity position on screen: higher worldY means entity scrolls up
  return entityY - worldY + CANVAS.HEIGHT - 100
}

function checkGates(state) {
  let events = [...state.events]
  let score = state.score
  let gatesPassed = state.gatesPassed
  let gatesMissed = state.gatesMissed

  const skierScreenY = state.skier.y
  const skierCenterX = state.skier.x

  const gates = state.gates.map(gate => {
    if (gate.passed || gate.missed) return gate

    const gateScreenY = worldToScreen(gate.y, state.worldY)

    // Gate has scrolled past skier (gate moved above skier)
    if (gateScreenY < skierScreenY - SKIER.HEIGHT / 2) {
      // Check if skier was between the flags
      if (skierCenterX > gate.leftX && skierCenterX < gate.rightX) {
        score += GAME.SCORE_PER_GATE
        gatesPassed += 1
        events.push('gate_pass')
        return { ...gate, passed: true }
      } else {
        gatesMissed += 1
        events.push('gate_miss')
        return { ...gate, missed: true }
      }
    }
    return gate
  })

  let s = { ...state, gates, score, gatesPassed, gatesMissed, events }

  // Spawn crowd every CROWD.GATE_INTERVAL gates
  if (gatesPassed > 0 &&
      gatesPassed >= s.lastCrowdAt + CROWD.GATE_INTERVAL &&
      Math.floor(gatesPassed / CROWD.GATE_INTERVAL) > Math.floor(s.lastCrowdAt / CROWD.GATE_INTERVAL)) {
    s = spawnCrowd(s)
    s = { ...s, lastCrowdAt: gatesPassed, events: [...s.events, 'crowd_cheer'] }
  }

  // Spawn rival NPC every RIVAL.GATE_INTERVAL gates
  if (gatesPassed > 0 &&
      gatesPassed >= s.lastRivalAt + RIVAL.GATE_INTERVAL &&
      Math.floor(gatesPassed / RIVAL.GATE_INTERVAL) > Math.floor(s.lastRivalAt / RIVAL.GATE_INTERVAL)) {
    s = spawnRival(s)
    s = { ...s, events: [...s.events, 'rival_zoom'] }
  }

  return s
}

function spawnCrowd(state) {
  // Place a crowd on both sides at the skier's current world position (slightly ahead)
  const crowdY = state.worldY + SKIER.START_Y + 80
  const people = []

  // Generate random spectators for each side
  for (const side of ['left', 'right']) {
    for (let i = 0; i < CROWD.PEOPLE_PER_SIDE; i++) {
      const color = CROWD.JACKET_COLORS[Math.floor(Math.random() * CROWD.JACKET_COLORS.length)]
      const baseX = side === 'left'
        ? CROWD.SIDE_MARGIN + i * CROWD.SPACING
        : CANVAS.WIDTH - CROWD.SIDE_MARGIN - (i + 1) * CROWD.SPACING
      people.push({
        side,
        x: baseX + (Math.random() - 0.5) * 4,
        offsetY: (Math.random() - 0.5) * 10,
        color,
        armPhase: Math.random() * Math.PI * 2,  // for arm-waving animation
      })
    }
  }

  return {
    ...state,
    crowds: [...state.crowds, { y: crowdY, people }],
  }
}

function checkObstacles(state) {
  const skier = state.skier
  const skierLeft = skier.x - skier.width / 2
  const skierRight = skier.x + skier.width / 2
  const skierTop = skier.y - skier.height / 2
  const skierBottom = skier.y + skier.height / 2

  for (const obs of state.obstacles) {
    const obsScreenY = worldToScreen(obs.y, state.worldY)
    const obsLeft = obs.x
    const obsRight = obs.x + obs.width
    const obsTop = obsScreenY - obs.height / 2
    const obsBottom = obsScreenY + obs.height / 2

    // AABB collision
    if (
      skierLeft < obsRight &&
      skierRight > obsLeft &&
      skierTop < obsBottom &&
      skierBottom > obsTop
    ) {
      return {
        ...state,
        phase: 'gameover',
        events: [...state.events, 'crash'],
      }
    }
  }

  return state
}

function despawn(state) {
  return {
    ...state,
    gates: state.gates.filter(g => worldToScreen(g.y, state.worldY) > GAME.DESPAWN_BEHIND),
    obstacles: state.obstacles.filter(o => worldToScreen(o.y, state.worldY) > GAME.DESPAWN_BEHIND),
    trees: state.trees.filter(t => worldToScreen(t.y, state.worldY) > GAME.DESPAWN_BEHIND),
    crowds: state.crowds.filter(c => worldToScreen(c.y, state.worldY) > GAME.DESPAWN_BEHIND - 30),
    // Rivals are despawned in updateRivals (when off bottom of screen)
  }
}

// Exported for use by renderer
export { worldToScreen }
