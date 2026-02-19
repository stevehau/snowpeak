// Ice Breaker — Pure game logic (no rendering, no sound)
import { CANVAS, PADDLE, BALL, BRICKS, GAME, COLORS, POWERUPS } from './icebreakerConfig.js'

// ─── Level layouts ───
function createBricks(level) {
  const bricks = []
  for (let row = 0; row < BRICKS.ROWS; row++) {
    for (let col = 0; col < BRICKS.COLS; col++) {
      const x = BRICKS.OFFSET_LEFT + col * (BRICKS.WIDTH + BRICKS.PADDING)
      const y = BRICKS.OFFSET_TOP + row * (BRICKS.HEIGHT + BRICKS.PADDING)
      let hits = 1
      let color = COLORS.BRICK_ROWS[row] || '#FFFFFF'

      // Level variations
      if (level >= 2 && row < 2) {
        hits = 2  // top rows take 2 hits
        color = COLORS.BRICK_SILVER
      }
      if (level >= 3 && row === 0) {
        hits = 3  // top row takes 3 hits
        color = COLORS.BRICK_GOLD
      }
      if (level >= 4) {
        // Checkerboard gaps
        if ((row + col) % 3 === 0) continue
        if (row < 3) hits = Math.min(hits + 1, 3)
      }
      if (level >= 5) {
        // Fortress pattern
        if (row >= 3 && row <= 6 && col >= 3 && col <= 6) {
          hits = 3
          color = COLORS.BRICK_GOLD
        }
      }

      bricks.push({ x, y, w: BRICKS.WIDTH, h: BRICKS.HEIGHT, hits, maxHits: hits, color, row, col })
    }
  }
  return bricks
}

function createBall(speed) {
  // Launch at random angle between 30-60 degrees upward
  const angle = -(Math.PI / 6 + Math.random() * Math.PI / 6)  // -30 to -60 deg
  return {
    x: CANVAS.WIDTH / 2,
    y: PADDLE.Y - BALL.RADIUS - 2,
    vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
    vy: Math.sin(angle) * speed,
    speed,
    stuck: true,  // stuck to paddle until serve
  }
}

// ─── Initial state ───
export function createIcebreakerState() {
  const speed = BALL.BASE_SPEED
  return {
    phase: 'ready',     // 'ready' | 'playing' | 'serving' | 'levelup' | 'gameover'
    level: 1,
    score: 0,
    lives: GAME.LIVES,
    combo: 0,
    paddle: {
      x: CANVAS.WIDTH / 2 - PADDLE.WIDTH / 2,
      y: PADDLE.Y,
      w: PADDLE.WIDTH,
      h: PADDLE.HEIGHT,
      baseWidth: PADDLE.WIDTH,
    },
    balls: [createBall(speed)],
    bricks: createBricks(1),
    particles: [],
    powerups: [],
    activePowerups: {},  // { WIDE: framesLeft, SLOW: framesLeft, ... }
    input: { left: false, right: false },
    events: [],
    frameCount: 0,
    serveTimer: 0,
    levelTimer: 0,
    wallFlash: 0,
    startTime: null,
    winner: null,
  }
}

// ─── Tick ───
export function tick(state) {
  if (state.phase === 'ready' || state.phase === 'gameover') {
    return { ...state, frameCount: state.frameCount + 1 }
  }

  let s = { ...state, events: [], frameCount: state.frameCount + 1 }

  // Level transition
  if (s.phase === 'levelup') {
    s.levelTimer--
    if (s.levelTimer <= 0) {
      const nextLevel = s.level + 1
      if (nextLevel > GAME.MAX_LEVELS) {
        // Won the game!
        return { ...s, phase: 'gameover', winner: 'player', events: ['victory'] }
      }
      const speed = BALL.BASE_SPEED + (nextLevel - 1) * BALL.SPEED_INCREMENT
      return {
        ...s,
        phase: 'serving',
        level: nextLevel,
        bricks: createBricks(nextLevel),
        balls: [createBall(speed)],
        powerups: [],
        activePowerups: {},
        paddle: { ...s.paddle, w: PADDLE.WIDTH },
        serveTimer: GAME.SERVE_DELAY,
        combo: 0,
      }
    }
    return s
  }

  // Serving phase
  if (s.phase === 'serving') {
    s = movePaddle(s)
    // Keep ball stuck to paddle
    const ball = s.balls[0]
    if (ball && ball.stuck) {
      s.balls = [{ ...ball, x: s.paddle.x + s.paddle.w / 2, y: s.paddle.y - BALL.RADIUS - 2 }]
    }
    s.serveTimer--
    return s
  }

  // ─── Main playing phase ───
  s = movePaddle(s)
  s = tickPowerups(s)
  s = moveBalls(s)
  s = moveDrops(s)
  s = tickParticles(s)

  if (s.wallFlash > 0) s = { ...s, wallFlash: s.wallFlash - 1 }

  // Check if all bricks destroyed
  if (s.bricks.length === 0) {
    return { ...s, phase: 'levelup', levelTimer: GAME.LEVEL_DELAY, events: [...s.events, 'level_complete'] }
  }

  // Check if all balls lost
  if (s.balls.length === 0) {
    const lives = s.lives - 1
    if (lives <= 0) {
      return { ...s, lives: 0, phase: 'gameover', winner: 'computer', events: [...s.events, 'game_over'] }
    }
    const speed = BALL.BASE_SPEED + (s.level - 1) * BALL.SPEED_INCREMENT
    return {
      ...s,
      lives,
      balls: [createBall(speed)],
      phase: 'serving',
      serveTimer: GAME.SERVE_DELAY,
      combo: 0,
      activePowerups: {},
      paddle: { ...s.paddle, w: PADDLE.WIDTH },
      events: [...s.events, 'ball_lost'],
    }
  }

  return s
}

// ─── Serve (called from input) ───
export function serveBall(state) {
  if (state.phase !== 'serving') return state
  const ball = state.balls[0]
  if (!ball || !ball.stuck) return state

  const speed = ball.speed || BALL.BASE_SPEED
  const angle = -(Math.PI / 6 + Math.random() * Math.PI / 6)
  const dir = state.input.left ? -1 : state.input.right ? 1 : (Math.random() > 0.5 ? 1 : -1)

  return {
    ...state,
    phase: 'playing',
    balls: [{
      ...ball,
      stuck: false,
      vx: Math.cos(angle) * speed * dir,
      vy: -Math.abs(Math.sin(angle) * speed),
    }],
    events: [...state.events, 'serve'],
  }
}

// ─── Paddle movement ───
function movePaddle(s) {
  let px = s.paddle.x
  const speed = PADDLE.SPEED
  if (s.input.left) px -= speed
  if (s.input.right) px += speed
  px = Math.max(0, Math.min(CANVAS.WIDTH - s.paddle.w, px))
  return { ...s, paddle: { ...s.paddle, x: px } }
}

// ─── Ball physics ───
function moveBalls(s) {
  let events = [...s.events]
  let bricks = [...s.bricks]
  let particles = [...s.particles]
  let powerups = [...s.powerups]
  let score = s.score
  let combo = s.combo
  let wallFlash = s.wallFlash
  const slowActive = s.activePowerups.SLOW > 0

  const survivingBalls = []

  for (const ball of s.balls) {
    if (ball.stuck) { survivingBalls.push(ball); continue }

    let bx = ball.x + ball.vx * (slowActive ? 0.6 : 1)
    let by = ball.y + ball.vy * (slowActive ? 0.6 : 1)
    let bvx = ball.vx
    let bvy = ball.vy

    // Wall collisions
    if (bx - BALL.RADIUS <= 0) {
      bx = BALL.RADIUS
      bvx = Math.abs(bvx)
      events.push('wall')
      wallFlash = 6
    }
    if (bx + BALL.RADIUS >= CANVAS.WIDTH) {
      bx = CANVAS.WIDTH - BALL.RADIUS
      bvx = -Math.abs(bvx)
      events.push('wall')
      wallFlash = 6
    }
    if (by - BALL.RADIUS <= 0) {
      by = BALL.RADIUS
      bvy = Math.abs(bvy)
      events.push('wall')
      wallFlash = 6
    }

    // Bottom — ball lost
    if (by + BALL.RADIUS > CANVAS.HEIGHT + 10) {
      continue  // don't add to surviving balls
    }

    // Paddle collision
    const pad = s.paddle
    if (bvy > 0 && by + BALL.RADIUS >= pad.y && by + BALL.RADIUS <= pad.y + pad.h + 4 &&
        bx >= pad.x - 2 && bx <= pad.x + pad.w + 2) {
      // Reflect based on where ball hit paddle
      const hitPos = (bx - pad.x) / pad.w  // 0 = left, 1 = right
      const angle = -(Math.PI * 0.15 + hitPos * Math.PI * 0.7)  // -27 to -153 degrees
      const speed = Math.sqrt(bvx * bvx + bvy * bvy)
      bvx = Math.cos(angle) * speed
      bvy = Math.sin(angle) * speed
      by = pad.y - BALL.RADIUS - 1
      events.push('paddle')
      combo = 0
    }

    // Brick collisions
    let hitBrick = false
    for (let i = bricks.length - 1; i >= 0; i--) {
      const br = bricks[i]
      if (bx + BALL.RADIUS > br.x && bx - BALL.RADIUS < br.x + br.w &&
          by + BALL.RADIUS > br.y && by - BALL.RADIUS < br.y + br.h) {
        // Determine collision side
        const overlapLeft = (bx + BALL.RADIUS) - br.x
        const overlapRight = (br.x + br.w) - (bx - BALL.RADIUS)
        const overlapTop = (by + BALL.RADIUS) - br.y
        const overlapBottom = (br.y + br.h) - (by - BALL.RADIUS)
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          bvx = -bvx
        } else {
          bvy = -bvy
        }

        // Damage brick
        const newHits = br.hits - 1
        if (newHits <= 0) {
          bricks.splice(i, 1)
          combo++
          const pts = (GAME.POINTS_PER_BRICK + (BRICKS.ROWS - br.row) * GAME.POINTS_BONUS_ROW) * Math.min(combo, 8)
          score += pts

          // Spawn particles
          for (let p = 0; p < 8; p++) {
            particles.push({
              x: br.x + br.w / 2,
              y: br.y + br.h / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 20 + Math.random() * 20,
              color: br.color,
            })
          }

          // Maybe drop powerup
          if (Math.random() < GAME.POWERUP_CHANCE) {
            const types = Object.keys(POWERUPS)
            const type = types[Math.floor(Math.random() * types.length)]
            powerups.push({
              x: br.x + br.w / 2,
              y: br.y + br.h / 2,
              type,
              vy: GAME.POWERUP_SPEED,
            })
          }

          events.push('brick_break')
        } else {
          bricks[i] = { ...br, hits: newHits, color: newHits === 1 ? COLORS.BRICK_SILVER : br.color }
          events.push('brick_hit')
        }

        hitBrick = true
        break  // one brick per frame per ball
      }
    }

    survivingBalls.push({ ...ball, x: bx, y: by, vx: bvx, vy: bvy })
  }

  return { ...s, balls: survivingBalls, bricks, particles, powerups, score, combo, events, wallFlash }
}

// ─── Powerup drops ───
function moveDrops(s) {
  let events = [...s.events]
  let activePowerups = { ...s.activePowerups }
  let paddle = { ...s.paddle }
  let balls = [...s.balls]
  const surviving = []

  for (const pu of s.powerups) {
    const ny = pu.y + pu.vy
    // Catch with paddle
    if (ny + GAME.POWERUP_SIZE / 2 >= paddle.y && ny - GAME.POWERUP_SIZE / 2 <= paddle.y + paddle.h &&
        pu.x >= paddle.x && pu.x <= paddle.x + paddle.w) {
      events.push('powerup')
      const def = POWERUPS[pu.type]
      if (pu.type === 'WIDE') {
        paddle = { ...paddle, w: Math.min(paddle.baseWidth * 1.6, paddle.w * 1.4) }
        activePowerups.WIDE = def.duration
      } else if (pu.type === 'SLOW') {
        activePowerups.SLOW = def.duration
      } else if (pu.type === 'MULTI') {
        // Split each ball into 3
        const newBalls = []
        for (const ball of balls) {
          if (ball.stuck) { newBalls.push(ball); continue }
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
          const angle = Math.atan2(ball.vy, ball.vx)
          newBalls.push(ball)
          newBalls.push({ ...ball, vx: Math.cos(angle - 0.4) * speed, vy: Math.sin(angle - 0.4) * speed })
          newBalls.push({ ...ball, vx: Math.cos(angle + 0.4) * speed, vy: Math.sin(angle + 0.4) * speed })
        }
        balls = newBalls
      }
      continue
    }
    if (ny > CANVAS.HEIGHT + 20) continue
    surviving.push({ ...pu, y: ny })
  }

  return { ...s, powerups: surviving, activePowerups, paddle, balls, events }
}

// ─── Active powerup timers ───
function tickPowerups(s) {
  const ap = { ...s.activePowerups }
  let paddle = s.paddle
  if (ap.WIDE > 0) {
    ap.WIDE--
    if (ap.WIDE <= 0) {
      paddle = { ...paddle, w: paddle.baseWidth }
    }
  }
  if (ap.SLOW > 0) ap.SLOW--
  return { ...s, activePowerups: ap, paddle }
}

// ─── Particles ───
function tickParticles(s) {
  const particles = s.particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 1 }))
    .filter(p => p.life > 0)
  return { ...s, particles }
}
