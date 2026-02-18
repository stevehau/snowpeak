// Snowball Showdown — Pure game logic (no rendering, no sound)
// tick(state) → newState with events array

import { CANVAS, GAME, PLAYER, OPPONENT, FIELD } from './snowballConfig.js'

export function createSnowballState() {
  return {
    phase: 'ready',           // 'ready' | 'playing' | 'gameover'
    turn: 'computer',         // 'computer' | 'player'
    turnPhase: 'throwing',    // 'throwing' | 'switching'

    player: {
      y: PLAYER.Y_CENTER,
      hits: 0,                // hits SCORED by player (on opponent)
      stunTimer: 0,
      splatTimer: 0,
      splatY: 0,              // where the splat effect shows
      throwAnim: 0,           // frames of throw animation remaining
    },
    opponent: {
      y: OPPONENT.Y_CENTER,
      hits: 0,                // hits SCORED by opponent (on player)
      stunTimer: 0,
      splatTimer: 0,
      splatY: 0,
      dodgeTarget: null,      // y position AI is dodging toward
      dodgeDecided: false,    // has AI decided dodge direction for current ball?
      throwAnim: 0,           // frames of throw animation remaining
      wanderTarget: null,     // AI roaming target when not dodging
      wanderTimer: 0,         // frames until next wander decision
    },

    snowballs: [],            // { x, y, vx, vy, arcOffset, thrower: 'player'|'computer' }
    splats: [],               // { x, y, timer } — decorative ground splats on miss

    throwsRemaining: GAME.THROWS_PER_TURN,
    throwCooldown: 0,         // frames until next throw allowed
    switchTimer: 0,           // countdown between turns
    turnTimer: 0,             // counts up each frame during player's throwing turn

    // Player aiming
    aimY: PLAYER.Y_CENTER,    // where player is aiming (vertical)

    frameCount: 0,
    startTime: 0,
    events: [],               // sound events for this frame
    input: { up: false, down: false, space: false },

    // Announcement text
    announcement: '',
    announcementTimer: 0,
  }
}

// Main tick — called every frame
export function tick(state) {
  if (state.phase !== 'playing') return state

  let s = { ...state, frameCount: state.frameCount + 1, events: [] }

  // Update stun timers
  if (s.player.stunTimer > 0) {
    s = { ...s, player: { ...s.player, stunTimer: s.player.stunTimer - 1 } }
  }
  if (s.opponent.stunTimer > 0) {
    s = { ...s, opponent: { ...s.opponent, stunTimer: s.opponent.stunTimer - 1 } }
  }

  // Update splat timers on characters
  if (s.player.splatTimer > 0) {
    s = { ...s, player: { ...s.player, splatTimer: s.player.splatTimer - 1 } }
  }
  if (s.opponent.splatTimer > 0) {
    s = { ...s, opponent: { ...s.opponent, splatTimer: s.opponent.splatTimer - 1 } }
  }

  // Decay throw animations
  if (s.player.throwAnim > 0) {
    s = { ...s, player: { ...s.player, throwAnim: s.player.throwAnim - 1 } }
  }
  if (s.opponent.throwAnim > 0) {
    s = { ...s, opponent: { ...s.opponent, throwAnim: s.opponent.throwAnim - 1 } }
  }

  // Update announcement timer
  if (s.announcementTimer > 0) {
    s = { ...s, announcementTimer: s.announcementTimer - 1 }
    if (s.announcementTimer === 0) s = { ...s, announcement: '' }
  }

  // Decay ground splats
  s = {
    ...s,
    splats: s.splats
      .map(sp => ({ ...sp, timer: sp.timer - 1 }))
      .filter(sp => sp.timer > 0),
  }

  // Move player (only when it's computer's turn — player dodges)
  if (s.turn === 'computer' && s.player.stunTimer === 0) {
    s = movePlayer(s)
  }

  // Move player aim (when it's player's turn)
  if (s.turn === 'player') {
    s = movePlayerAim(s)
  }

  // AI logic
  if (s.turn === 'player' && s.opponent.stunTimer === 0) {
    s = aiDodge(s)
  }
  if (s.turn === 'computer') {
    s = aiThrow(s)
  }

  // Update snowballs
  s = updateSnowballs(s)

  // Check turn switching
  if (s.turnPhase === 'switching') {
    s = { ...s, switchTimer: s.switchTimer - 1 }
    if (s.switchTimer <= 0) {
      s = switchTurn(s)
    }
  }

  // Cooldown
  if (s.throwCooldown > 0) {
    s = { ...s, throwCooldown: s.throwCooldown - 1 }
  }

  // Player turn timer — forfeit remaining throws if idle too long
  if (s.turn === 'player' && s.turnPhase === 'throwing' && s.throwsRemaining > 0) {
    s = { ...s, turnTimer: s.turnTimer + 1 }
    if (s.turnTimer >= GAME.PLAYER_TURN_TIMEOUT) {
      // Forfeit: discard remaining throws and switch turns
      s = {
        ...s,
        throwsRemaining: 0,
        turnTimer: 0,
        announcement: 'TOO SLOW! TURN FORFEIT!',
        announcementTimer: GAME.TURN_SWITCH_DELAY,
      }
      // If no snowballs in flight, immediately start switching
      if (s.snowballs.length === 0) {
        s = {
          ...s,
          turnPhase: 'switching',
          switchTimer: GAME.TURN_SWITCH_DELAY,
          announcement: "OPPONENT'S TURN!",
        }
      }
    }
  }

  return s
}

// Player movement (dodging during computer's turn)
function movePlayer(s) {
  let y = s.player.y
  if (s.input.up) y -= PLAYER.MOVE_SPEED
  if (s.input.down) y += PLAYER.MOVE_SPEED
  y = Math.max(PLAYER.Y_MIN, Math.min(PLAYER.Y_MAX, y))
  return { ...s, player: { ...s.player, y } }
}

// Player aim movement (during player's turn)
function movePlayerAim(s) {
  let aimY = s.aimY
  if (s.input.up) aimY -= PLAYER.MOVE_SPEED
  if (s.input.down) aimY += PLAYER.MOVE_SPEED
  aimY = Math.max(OPPONENT.Y_MIN, Math.min(OPPONENT.Y_MAX, aimY))
  return { ...s, aimY }
}

// Player throws a snowball
export function handlePlayerThrow(state) {
  if (state.phase !== 'playing') return state
  if (state.turn !== 'player') return state
  if (state.turnPhase !== 'throwing') return state
  if (state.throwsRemaining <= 0) return state
  if (state.throwCooldown > 0) return state

  const ball = createSnowball(PLAYER.X, state.player.y, OPPONENT.X, state.aimY, 'player')

  let s = {
    ...state,
    snowballs: [...state.snowballs, ball],
    throwsRemaining: state.throwsRemaining - 1,
    throwCooldown: 30, // half-second between player throws
    turnTimer: 0, // reset forfeit timer on each throw
    player: { ...state.player, throwAnim: 15 }, // trigger throw animation
    events: [...state.events, 'throw'],
  }

  return s
}

// AI throw logic
function aiThrow(s) {
  if (s.turnPhase !== 'throwing') return s
  if (s.throwsRemaining <= 0) return s
  if (s.throwCooldown > 0) return s
  if (s.opponent.stunTimer > 0) return s

  // Throw with some delay
  if (s.throwCooldown === 0 && s.frameCount % GAME.THROW_DELAY === 0) {
    // Aim at player with some randomness
    const aimY = s.player.y + (Math.random() - 0.5) * 80
    const ball = createSnowball(OPPONENT.X, s.opponent.y, PLAYER.X, aimY, 'computer')

    let newBalls = [ball]
    let throwsUsed = 1

    // Chance for double throw
    if (s.throwsRemaining >= 2 && Math.random() < GAME.DOUBLE_THROW_CHANCE) {
      const aimY2 = s.player.y + (Math.random() - 0.5) * 120
      const ball2 = createSnowball(OPPONENT.X, s.opponent.y + 10, PLAYER.X, aimY2, 'computer')
      newBalls.push(ball2)
      throwsUsed = 2
    }

    return {
      ...s,
      snowballs: [...s.snowballs, ...newBalls],
      throwsRemaining: s.throwsRemaining - throwsUsed,
      throwCooldown: GAME.THROW_DELAY,
      opponent: { ...s.opponent, throwAnim: 15 }, // trigger throw animation
      events: [...s.events, 'throw'],
    }
  }
  return s
}

// AI dodge logic — aggressive: roams/feints even before player throws
function aiDodge(s) {
  // Find incoming snowballs aimed at opponent
  const incoming = s.snowballs.filter(b =>
    b.thrower === 'player' && b.x > FIELD.CENTER_LINE && b.vx < 0
  )

  let opp = { ...s.opponent }

  if (incoming.length > 0) {
    // React to the closest snowball
    const closest = incoming.reduce((a, b) => a.x < b.x ? a : b)
    const distToOpponent = closest.x - OPPONENT.X

    // Only start dodging when ball is close enough
    if (distToOpponent < 200 && !opp.dodgeDecided) {
      opp.dodgeDecided = true
      opp.wanderTarget = null // stop wandering, dodge!

      // Predict where ball will hit
      const framesLeft = distToOpponent / Math.abs(closest.vx)
      const predictedY = closest.y + closest.vy * framesLeft

      if (Math.random() < OPPONENT.DODGE_CHANCE) {
        // Dodge away from predicted impact
        const dodgeDir = predictedY > opp.y ? -1 : 1
        opp.dodgeTarget = opp.y + dodgeDir * (60 + Math.random() * 40)
      } else if (Math.random() < OPPONENT.DODGE_MISS_CHANCE) {
        // Dodge INTO the snowball (whoops)
        opp.dodgeTarget = predictedY
      } else {
        // Stand still (freeze)
        opp.dodgeTarget = opp.y
      }
    }

    // Move toward dodge target
    if (opp.dodgeTarget !== null) {
      const diff = opp.dodgeTarget - opp.y
      if (Math.abs(diff) > 2) {
        opp.y += Math.sign(diff) * OPPONENT.MOVE_SPEED * 1.3
      }
      opp.y = Math.max(OPPONENT.Y_MIN, Math.min(OPPONENT.Y_MAX, opp.y))
    }
  } else {
    // No incoming snowballs — roam aggressively to be a harder target
    opp.dodgeDecided = false
    opp.dodgeTarget = null

    // Pick a new wander target periodically
    opp.wanderTimer = (opp.wanderTimer || 0) - 1
    if (opp.wanderTimer <= 0 || opp.wanderTarget === null) {
      // Move to a random position within bounds — biased toward opposite of current pos
      const rangeSize = OPPONENT.Y_MAX - OPPONENT.Y_MIN
      const bias = opp.y > OPPONENT.Y_CENTER ? -0.3 : 0.3
      opp.wanderTarget = OPPONENT.Y_MIN + (Math.random() + bias) * rangeSize
      opp.wanderTarget = Math.max(OPPONENT.Y_MIN, Math.min(OPPONENT.Y_MAX, opp.wanderTarget))
      opp.wanderTimer = 30 + Math.floor(Math.random() * 40) // change direction every 0.5-1.2s
    }

    // Move toward wander target
    const diff = opp.wanderTarget - opp.y
    if (Math.abs(diff) > 2) {
      opp.y += Math.sign(diff) * OPPONENT.MOVE_SPEED * 0.8
    }
    opp.y = Math.max(OPPONENT.Y_MIN, Math.min(OPPONENT.Y_MAX, opp.y))
  }

  return { ...s, opponent: opp }
}

// Create a snowball with arc trajectory
function createSnowball(fromX, fromY, toX, toY, thrower) {
  const dx = toX - fromX
  const dy = toY - fromY
  const dist = Math.sqrt(dx * dx + dy * dy)
  const frames = dist / GAME.SNOWBALL_SPEED
  const vx = dx / frames
  const vy = dy / frames

  return {
    x: fromX,
    y: fromY,
    startX: fromX,
    startY: fromY,
    targetX: toX,
    targetY: toY,
    vx,
    vy,
    progress: 0,        // 0 to 1
    totalFrames: frames,
    thrower,
  }
}

// Update snowball positions and check collisions
function updateSnowballs(s) {
  let newBalls = []
  let player = { ...s.player }
  let opponent = { ...s.opponent }
  let events = [...s.events]
  let splats = [...s.splats]
  let announcement = s.announcement
  let announcementTimer = s.announcementTimer
  let turnPhase = s.turnPhase
  let switchTimer = s.switchTimer
  let throwsRemaining = s.throwsRemaining

  for (const ball of s.snowballs) {
    const updated = {
      ...ball,
      x: ball.x + ball.vx,
      y: ball.y + ball.vy,
      progress: ball.progress + 1 / ball.totalFrames,
    }

    // Arc: parabolic offset peaking at progress=0.5 (only while in flight to target)
    const arcProgress = Math.min(updated.progress, 1.0)
    const arcY = -GAME.SNOWBALL_ARC * updated.totalFrames * 4 *
      arcProgress * (1 - arcProgress)

    // Check if snowball reached target area (hit detection happens once at progress=1.0)
    if (updated.progress >= 1.0 && !ball.resolved) {
      updated.resolved = true // mark so we only check hit once

      if (ball.thrower === 'computer') {
        // Check hit on player
        const hitDist = Math.abs(player.y - ball.targetY)
        if (hitDist < PLAYER.HEIGHT * 0.6) {
          // HIT!
          opponent.hits++
          player.stunTimer = GAME.HIT_STUN
          player.splatTimer = GAME.SPLAT_DURATION
          player.splatY = player.y
          events.push('hit')
          // Snowball consumed on hit — don't continue
          continue
        } else {
          // Miss — ground splat at target, but snowball keeps flying
          splats.push({ x: PLAYER.X + (Math.random() - 0.5) * 30, y: ball.targetY, timer: 60 })
          events.push('miss')
        }
      } else {
        // Check hit on opponent
        const hitDist = Math.abs(opponent.y - ball.targetY)
        if (hitDist < OPPONENT.HEIGHT * 0.6) {
          // HIT!
          player.hits++
          opponent.stunTimer = GAME.HIT_STUN
          opponent.splatTimer = GAME.SPLAT_DURATION
          opponent.splatY = opponent.y
          opponent.dodgeDecided = false
          opponent.dodgeTarget = null
          events.push('hit')
          // Snowball consumed on hit — don't continue
          continue
        } else {
          splats.push({ x: OPPONENT.X + (Math.random() - 0.5) * 30, y: ball.targetY, timer: 60 })
          events.push('miss')
          opponent.dodgeDecided = false
          opponent.dodgeTarget = null
        }
      }
    }

    // Remove snowball if it exits the screen
    if (updated.x < -20 || updated.x > CANVAS.WIDTH + 20 ||
        updated.y < -20 || updated.y > CANVAS.HEIGHT + 20) {
      continue // snowball has left the screen
    }

    // Store arc offset for rendering
    updated.arcOffset = arcY
    newBalls.push(updated)
  }

  let newState = {
    ...s,
    snowballs: newBalls,
    player,
    opponent,
    events,
    splats,
    announcement,
    announcementTimer,
    turnPhase,
    switchTimer,
    throwsRemaining,
  }

  // Check for win conditions
  if (player.hits >= GAME.HITS_TO_WIN) {
    return {
      ...newState,
      phase: 'gameover',
      winner: 'player',
      events: [...newState.events, 'victory'],
    }
  }
  if (opponent.hits >= GAME.HITS_TO_WIN) {
    return {
      ...newState,
      phase: 'gameover',
      winner: 'computer',
      events: [...newState.events, 'game_over'],
    }
  }

  // Check if turn's throws are exhausted and all balls landed
  if (throwsRemaining <= 0 && newBalls.length === 0 && turnPhase === 'throwing') {
    newState = {
      ...newState,
      turnPhase: 'switching',
      switchTimer: GAME.TURN_SWITCH_DELAY,
      announcement: s.turn === 'computer' ? 'YOUR TURN!' : 'OPPONENT\'S TURN!',
      announcementTimer: GAME.TURN_SWITCH_DELAY,
    }
  }

  return newState
}

function switchTurn(s) {
  const newTurn = s.turn === 'computer' ? 'player' : 'computer'
  return {
    ...s,
    turn: newTurn,
    turnPhase: 'throwing',
    throwsRemaining: GAME.THROWS_PER_TURN,
    throwCooldown: GAME.THROW_DELAY,
    turnTimer: 0, // reset forfeit timer for new turn
    aimY: s.opponent.y, // reset aim to opponent position
    opponent: { ...s.opponent, dodgeTarget: null, dodgeDecided: false },
    events: [...s.events, 'turn_switch'],
  }
}
