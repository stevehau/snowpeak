// Ice Breaker — Canvas 2D renderer (winter/snow theme)
import { CANVAS, COLORS, FONTS, PADDLE, BALL, BRICKS, GAME, POWERUPS } from './icebreakerConfig.js'

// Detect touch capability for instruction text
const hasTouch = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

// Responsive font scaling — detect small canvas renders
let fontScale = 1

// Pre-generate snow positions for background
const bgSnow = []
for (let i = 0; i < GAME.SNOW_COUNT; i++) {
  bgSnow.push({
    x: Math.random() * CANVAS.WIDTH,
    y: Math.random() * CANVAS.HEIGHT,
    r: 1 + Math.random() * 2.5,
    speed: 0.3 + Math.random() * 0.7,
    drift: (Math.random() - 0.5) * 0.4,
    phase: Math.random() * Math.PI * 2,
  })
}

export function render(ctx, state) {
  ctx.imageSmoothingEnabled = false

  drawBackground(ctx, state)
  drawBricks(ctx, state)
  drawPowerups(ctx, state)
  drawParticles(ctx, state)
  drawBalls(ctx, state)
  drawPaddle(ctx, state)
  drawHUD(ctx, state)

  if (state.phase === 'ready') drawReadyOverlay(ctx, state)
  if (state.phase === 'gameover') drawGameOverOverlay(ctx, state)
  if (state.phase === 'levelup') drawLevelUpOverlay(ctx, state)
  if (state.phase === 'serving') drawServingOverlay(ctx, state)
}

// ─── Background — winter night sky with falling snow ───
function drawBackground(ctx, state) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT)
  grad.addColorStop(0, COLORS.SKY_TOP)
  grad.addColorStop(0.5, COLORS.SKY_MID)
  grad.addColorStop(1, COLORS.SKY_BOT)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  // Stars
  const f = state.frameCount
  for (let i = 0; i < 50; i++) {
    const sx = (i * 127 + 23) % CANVAS.WIDTH
    const sy = (i * 89 + 11) % (CANVAS.HEIGHT * 0.35)
    const twinkle = Math.sin(f * 0.02 + i * 2.1) * 0.3 + 0.5
    ctx.fillStyle = `rgba(200,220,255,${twinkle * 0.5})`
    const sz = (i % 3 === 0) ? 2 : 1.5
    ctx.fillRect(sx, sy, sz, sz)
  }

  // Falling snow
  ctx.fillStyle = COLORS.SNOW_PARTICLE
  for (const flake of bgSnow) {
    const yOff = (f * flake.speed) % CANVAS.HEIGHT
    const y = (flake.y + yOff) % CANVAS.HEIGHT
    const x = flake.x + Math.sin(f * 0.015 + flake.phase) * 8 * flake.drift
    const a = 0.15 + flake.r * 0.12
    ctx.globalAlpha = a
    ctx.beginPath()
    ctx.arc(((x % CANVAS.WIDTH) + CANVAS.WIDTH) % CANVAS.WIDTH, y, flake.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Icy wall borders
  if (state.wallFlash > 0) {
    const a = state.wallFlash / 6
    ctx.fillStyle = `rgba(180,220,255,${a * 0.25})`
    ctx.fillRect(0, 0, 4, CANVAS.HEIGHT)
    ctx.fillRect(CANVAS.WIDTH - 4, 0, 4, CANVAS.HEIGHT)
    ctx.fillStyle = `rgba(180,220,255,${a * 0.2})`
    ctx.fillRect(0, 0, CANVAS.WIDTH, 4)
  }

  // Subtle scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.04)'
  for (let y = 0; y < CANVAS.HEIGHT; y += 3) {
    ctx.fillRect(0, y, CANVAS.WIDTH, 1)
  }
}

// ─── Snow/Ice Bricks ───
function drawBricks(ctx, state) {
  for (const br of state.bricks) {
    // Shadow
    ctx.fillStyle = COLORS.BRICK_SHADOW
    ctx.fillRect(br.x + 2, br.y + 2, br.w, br.h)

    // Brick body color
    let color = br.color
    if (br.hits < br.maxHits && br.hits === 2) color = COLORS.BRICK_SILVER
    if (br.hits < br.maxHits && br.hits === 1) {
      color = COLORS.BRICK_ROWS[br.row] || '#CCCCCC'
    }
    ctx.fillStyle = color
    ctx.fillRect(br.x, br.y, br.w, br.h)

    // Snow/ice texture — speckled surface
    const seed = br.row * 31 + br.col * 17
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    for (let sp = 0; sp < 4; sp++) {
      const spx = br.x + ((seed + sp * 13) % (br.w - 4)) + 2
      const spy = br.y + ((seed + sp * 7) % (br.h - 3)) + 1
      ctx.fillRect(spx, spy, 2, 1)
    }

    // Frosty highlight (top-left bevel — ice glint)
    ctx.fillStyle = COLORS.BRICK_HIGHLIGHT
    ctx.fillRect(br.x, br.y, br.w, 3)
    ctx.fillRect(br.x, br.y, 3, br.h)

    // Dark edge (bottom-right — shadow)
    ctx.fillStyle = COLORS.BRICK_SHADOW
    ctx.fillRect(br.x, br.y + br.h - 2, br.w, 2)
    ctx.fillRect(br.x + br.w - 2, br.y, 2, br.h)

    // Crack marks for damaged bricks — ice fractures
    if (br.hits < br.maxHits) {
      ctx.strokeStyle = 'rgba(100,140,180,0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(br.x + br.w * 0.2, br.y + 1)
      ctx.lineTo(br.x + br.w * 0.4, br.y + br.h * 0.5)
      ctx.lineTo(br.x + br.w * 0.3, br.y + br.h - 1)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(br.x + br.w * 0.6, br.y + 2)
      ctx.lineTo(br.x + br.w * 0.7, br.y + br.h * 0.6)
      ctx.stroke()
    }

    // Glacier ice shimmer for multi-hit bricks
    if (br.maxHits >= 3 && br.hits >= 2) {
      const shimmer = Math.sin(state.frameCount * 0.06 + br.col * 0.8) * 0.12 + 0.08
      ctx.fillStyle = `rgba(150,210,255,${shimmer})`
      ctx.fillRect(br.x + 3, br.y + 3, br.w - 6, br.h - 6)
    }
  }
}

// ─── Paddle — Reindeer-pulled sleigh ───
// Track paddle facing direction for reindeer orientation
let paddleFacing = 1  // 1 = right, -1 = left
let lastPaddleX = 0

function drawPaddle(ctx, state) {
  const pad = state.paddle
  const f = state.frameCount

  // Update facing based on paddle movement
  const dx = pad.x - lastPaddleX
  if (dx > 0.5) paddleFacing = 1
  else if (dx < -0.5) paddleFacing = -1
  lastPaddleX = pad.x

  const moving = Math.abs(dx) > 0.3
  const cx = pad.x + pad.w / 2  // center x
  const by = pad.y              // base y of paddle area

  ctx.save()

  // ── Sleigh body (the main paddle hitbox area) ──
  const sleighW = pad.w * 0.55
  const sleighH = pad.h
  // Sleigh is at the rear (opposite of facing direction)
  const sleighX = paddleFacing > 0
    ? pad.x + pad.w - sleighW
    : pad.x

  // Warm glow under sleigh
  ctx.shadowColor = 'rgba(200,80,40,0.3)'
  ctx.shadowBlur = 10

  // Runner (bottom curved metal strip)
  ctx.fillStyle = COLORS.SLEIGH_RUNNER
  const runnerExt = 4  // extends past sleigh
  roundRect(ctx,
    sleighX - (paddleFacing > 0 ? runnerExt : 0),
    by + sleighH - 3,
    sleighW + runnerExt,
    4, 2)
  ctx.fill()

  // Curved runner front (the curled-up part)
  const curlX = paddleFacing > 0 ? sleighX - runnerExt : sleighX + sleighW
  ctx.beginPath()
  ctx.arc(curlX + (paddleFacing > 0 ? 0 : runnerExt),
    by + sleighH - 5, 4,
    paddleFacing > 0 ? Math.PI * 0.5 : 0,
    paddleFacing > 0 ? Math.PI : Math.PI * 0.5)
  ctx.strokeStyle = COLORS.SLEIGH_RUNNER
  ctx.lineWidth = 2
  ctx.stroke()

  // Sleigh body — red with gold trim
  ctx.fillStyle = COLORS.SLEIGH_RED
  roundRect(ctx, sleighX, by, sleighW, sleighH - 2, 3)
  ctx.fill()

  // Dark bottom half
  ctx.fillStyle = COLORS.SLEIGH_DARK
  ctx.fillRect(sleighX + 2, by + sleighH * 0.5, sleighW - 4, sleighH * 0.35)

  // Gold trim stripe
  ctx.fillStyle = COLORS.SLEIGH_TRIM
  ctx.fillRect(sleighX + 2, by + 2, sleighW - 4, 2)
  // Gold trim on front edge
  const frontEdgeX = paddleFacing > 0 ? sleighX : sleighX + sleighW - 3
  ctx.fillRect(frontEdgeX, by + 2, 3, sleighH - 5)

  // Highlight on top
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(sleighX + 4, by + 1, sleighW * 0.5, 2)

  // Small gift sack on sleigh (rear)
  const sackX = paddleFacing > 0 ? sleighX + sleighW - 10 : sleighX + 4
  ctx.fillStyle = '#556B2F'
  ctx.beginPath()
  ctx.arc(sackX + 3, by - 1, 5, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(sackX, by - 1, 7, 4)
  // Sack tie
  ctx.fillStyle = COLORS.SLEIGH_TRIM
  ctx.fillRect(sackX + 2, by - 3, 3, 2)

  ctx.shadowBlur = 0

  // ── Harness lines connecting reindeer to sleigh ──
  const harnessStartX = paddleFacing > 0 ? sleighX : sleighX + sleighW
  const deerCenterX = paddleFacing > 0
    ? pad.x + pad.w * 0.18
    : pad.x + pad.w * 0.82
  const harnessEndY = by + 4

  ctx.strokeStyle = COLORS.HARNESS
  ctx.lineWidth = 1.2
  ctx.setLineDash([3, 2])
  // Two harness lines
  ctx.beginPath()
  ctx.moveTo(harnessStartX, by + 3)
  ctx.lineTo(deerCenterX, harnessEndY - 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(harnessStartX, by + 6)
  ctx.lineTo(deerCenterX, harnessEndY + 2)
  ctx.stroke()
  ctx.setLineDash([])

  // ── Reindeer (tiny pixel-art, at the leading edge) ──
  const deerX = deerCenterX
  const deerY = by + 2  // body center

  ctx.save()
  ctx.translate(deerX, deerY)
  if (paddleFacing < 0) ctx.scale(-1, 1)  // flip when facing left

  // Leg animation — 2-frame walk cycle when moving
  const legFrame = moving ? Math.floor(f * 0.15) % 4 : 0
  const legOffsets = [
    [0, 0, 0, 0],     // standing
    [-1, 1, 1, -1],   // walk 1
    [0, 0, 0, 0],     // standing
    [1, -1, -1, 1],   // walk 2
  ][legFrame]

  // Legs (4 thin legs)
  ctx.fillStyle = COLORS.DEER_DARK
  const legY = 4
  const legH = 5
  // Back legs
  ctx.fillRect(-4, legY, 2, legH + legOffsets[0])
  ctx.fillRect(-1, legY, 2, legH + legOffsets[1])
  // Front legs
  ctx.fillRect(4, legY, 2, legH + legOffsets[2])
  ctx.fillRect(7, legY, 2, legH + legOffsets[3])

  // Hooves
  ctx.fillStyle = COLORS.DEER_DARK
  ctx.fillRect(-4, legY + legH + legOffsets[0] - 1, 2, 1)
  ctx.fillRect(-1, legY + legH + legOffsets[1] - 1, 2, 1)
  ctx.fillRect(4, legY + legH + legOffsets[2] - 1, 2, 1)
  ctx.fillRect(7, legY + legH + legOffsets[3] - 1, 2, 1)

  // Body (brown oval-ish rectangle)
  ctx.fillStyle = COLORS.DEER_BODY
  roundRect(ctx, -5, -2, 14, 8, 3)
  ctx.fill()

  // Belly highlight
  ctx.fillStyle = COLORS.DEER_LIGHT
  ctx.fillRect(-2, 2, 8, 3)

  // Neck
  ctx.fillStyle = COLORS.DEER_BODY
  ctx.fillRect(8, -4, 4, 6)

  // Head
  ctx.fillStyle = COLORS.DEER_BODY
  roundRect(ctx, 10, -6, 7, 5, 2)
  ctx.fill()

  // Ear
  ctx.fillStyle = COLORS.DEER_LIGHT
  ctx.fillRect(13, -8, 2, 3)

  // Eye
  ctx.fillStyle = '#000000'
  ctx.fillRect(15, -5, 2, 2)
  // Eye shine
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(15, -5, 1, 1)

  // Red nose (Rudolph!)
  ctx.fillStyle = COLORS.DEER_NOSE
  ctx.beginPath()
  ctx.arc(18, -3, 2, 0, Math.PI * 2)
  ctx.fill()
  // Nose glow
  const noseGlow = Math.sin(f * 0.08) * 0.2 + 0.3
  ctx.fillStyle = `rgba(255,80,60,${noseGlow})`
  ctx.beginPath()
  ctx.arc(18, -3, 4, 0, Math.PI * 2)
  ctx.fill()

  // Antlers — two small branching antlers
  ctx.strokeStyle = COLORS.DEER_ANTLER
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  // Left antler
  ctx.beginPath()
  ctx.moveTo(11, -7)
  ctx.lineTo(9, -13)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(9, -11)
  ctx.lineTo(7, -14)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(9, -11)
  ctx.lineTo(11, -14)
  ctx.stroke()
  // Right antler
  ctx.beginPath()
  ctx.moveTo(14, -7)
  ctx.lineTo(15, -13)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(15, -11)
  ctx.lineTo(13, -14)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(15, -11)
  ctx.lineTo(17, -14)
  ctx.stroke()

  // Tail (small puff at rear)
  ctx.fillStyle = COLORS.DEER_LIGHT
  ctx.beginPath()
  ctx.arc(-6, -1, 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()  // end deer flip
  ctx.restore()  // end paddle save

  // ── Wide powerup indicator — golden jingle bells glow ──
  if (state.activePowerups.WIDE > 0) {
    const flash = Math.sin(f * 0.15) * 0.3 + 0.4
    ctx.strokeStyle = `rgba(255,215,0,${flash})`
    ctx.lineWidth = 2
    roundRect(ctx, pad.x - 1, pad.y - 1, pad.w + 2, pad.h + 2, 4)
    ctx.stroke()

    // Tiny jingle bells on harness
    ctx.fillStyle = `rgba(255,215,0,${flash + 0.2})`
    const bellY = by + 4
    for (let i = 0; i < 3; i++) {
      const bx = harnessStartX + (deerCenterX - harnessStartX) * ((i + 1) / 4)
      ctx.beginPath()
      ctx.arc(bx, bellY, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Snow puff particles behind when moving fast
  if (moving && Math.abs(dx) > 1.5) {
    const puffX = paddleFacing > 0
      ? pad.x + pad.w - 2
      : pad.x + 2
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.1})`
    for (let i = 0; i < 2; i++) {
      const px = puffX + (Math.random() - 0.5) * 6
      const py = by + pad.h - 2 + Math.random() * 4
      ctx.beginPath()
      ctx.arc(px, py, 1 + Math.random() * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// ─── Snowflake Ball ───
function drawBalls(ctx, state) {
  for (const ball of state.balls) {
    const f = state.frameCount

    // Snowflake trail — small fading flakes
    if (!ball.stuck && state.phase === 'playing') {
      drawMiniSnowflake(ctx, ball.x - ball.vx * 2, ball.y - ball.vy * 2, 3, f * 0.8, 0.2)
      drawMiniSnowflake(ctx, ball.x - ball.vx * 4, ball.y - ball.vy * 4, 2, f * 0.5, 0.1)
    }

    // Main snowflake glow
    ctx.shadowColor = COLORS.BALL_GLOW
    ctx.shadowBlur = 14

    // Draw rotating snowflake
    drawSnowflake(ctx, ball.x, ball.y, BALL.RADIUS, f)

    ctx.shadowBlur = 0

    // Slow powerup indicator — icy ring
    if (state.activePowerups.SLOW > 0) {
      const a = Math.sin(f * 0.1) * 0.3 + 0.4
      ctx.strokeStyle = `rgba(136,187,255,${a})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL.RADIUS + 5, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

// Draw a 6-pointed snowflake
function drawSnowflake(ctx, x, y, radius, frame) {
  const rotation = frame * 0.03  // slow rotation
  const r = radius * 1.3

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'

  // 6 main arms
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const ax = Math.cos(angle) * r
    const ay = Math.sin(angle) * r

    // Main arm
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(ax, ay)
    ctx.stroke()

    // Small branches on each arm
    const bLen = r * 0.4
    const bPos = 0.6  // position along arm
    const bx = Math.cos(angle) * r * bPos
    const by = Math.sin(angle) * r * bPos

    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(bx, by)
    ctx.lineTo(bx + Math.cos(angle + 0.6) * bLen, by + Math.sin(angle + 0.6) * bLen)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(bx, by)
    ctx.lineTo(bx + Math.cos(angle - 0.6) * bLen, by + Math.sin(angle - 0.6) * bLen)
    ctx.stroke()
    ctx.lineWidth = 1.8
  }

  // Center dot
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(0, 0, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Small trail snowflake
function drawMiniSnowflake(ctx, x, y, radius, frame, alpha) {
  ctx.globalAlpha = alpha
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(frame * 0.05)
  ctx.strokeStyle = COLORS.SNOWFLAKE
  ctx.lineWidth = 0.8
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    ctx.stroke()
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

// ─── Powerup drops ───
function drawPowerups(ctx, state) {
  for (const pu of state.powerups) {
    const def = POWERUPS[pu.type]
    const bob = Math.sin(state.frameCount * 0.08 + pu.x) * 2

    ctx.shadowColor = def.color
    ctx.shadowBlur = 8

    ctx.fillStyle = def.color
    roundRect(ctx, pu.x - GAME.POWERUP_SIZE, pu.y + bob - GAME.POWERUP_SIZE / 2,
              GAME.POWERUP_SIZE * 2, GAME.POWERUP_SIZE, GAME.POWERUP_SIZE / 2)
    ctx.fill()

    ctx.fillStyle = '#000000'
    ctx.font = FONTS.TINY
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(def.label, pu.x, pu.y + bob)

    ctx.shadowBlur = 0
  }
}

// ─── Particles — snow dust when bricks break ───
function drawParticles(ctx, state) {
  for (const p of state.particles) {
    const alpha = p.life / 40
    ctx.globalAlpha = alpha

    // Snow-like particles — small circles instead of squares
    ctx.fillStyle = p.color || COLORS.PARTICLE
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.5 + Math.random() * 0.5, 0, Math.PI * 2)
    ctx.fill()

    // Tiny sparkle
    if (p.life > 15) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1)
    }
  }
  ctx.globalAlpha = 1
}

// ─── HUD ───
function drawHUD(ctx, state) {
  if (state.phase === 'ready') return

  // Score
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.HUD
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`SCORE ${String(state.score).padStart(6, '0')}`, 10, 10)

  // Level
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.TEXT_ICE
  ctx.fillText(`LVL ${state.level}`, CANVAS.WIDTH / 2, 10)

  // Lives — pixel snowflake icons
  ctx.textAlign = 'right'
  for (let i = 0; i < state.lives; i++) {
    drawLifeSnowflake(ctx, CANVAS.WIDTH - 16 - i * 22, 18)
  }

  // Combo indicator
  if (state.combo > 1) {
    const flash = Math.sin(state.frameCount * 0.12) * 0.3 + 0.7
    ctx.fillStyle = `rgba(255,221,0,${flash})`
    ctx.font = FONTS.SMALL
    ctx.textAlign = 'center'
    ctx.fillText(`${state.combo}x COMBO!`, CANVAS.WIDTH / 2, 36)
  }

  // Active powerup indicators
  let puY = 54
  ctx.font = FONTS.TINY
  ctx.textAlign = 'center'
  if (state.activePowerups.WIDE > 0) {
    ctx.fillStyle = POWERUPS.WIDE.color
    ctx.fillText(`WIDE ${Math.ceil(state.activePowerups.WIDE / 60)}s`, CANVAS.WIDTH / 2, puY)
    puY += 16
  }
  if (state.activePowerups.SLOW > 0) {
    ctx.fillStyle = POWERUPS.SLOW.color
    ctx.fillText(`FREEZE ${Math.ceil(state.activePowerups.SLOW / 60)}s`, CANVAS.WIDTH / 2, puY)
  }
}

// Life icon — tiny snowflake
function drawLifeSnowflake(ctx, x, y) {
  ctx.strokeStyle = COLORS.TEXT_ICE
  ctx.lineWidth = 1.5
  const r = 6
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
    ctx.stroke()
  }
  ctx.fillStyle = COLORS.TEXT_ICE
  ctx.beginPath()
  ctx.arc(x, y, 1.5, 0, Math.PI * 2)
  ctx.fill()
}

// ─── Overlays ───
function drawReadyOverlay(ctx, state) {
  // Dim background
  ctx.fillStyle = 'rgba(5,10,25,0.8)'
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  // Decorative snowflakes around title
  const f = state.frameCount
  drawMiniSnowflake(ctx, 80, CANVAS.HEIGHT * 0.25, 12, f * 0.3, 0.3)
  drawMiniSnowflake(ctx, CANVAS.WIDTH - 80, CANVAS.HEIGHT * 0.35, 10, f * 0.4, 0.25)
  drawMiniSnowflake(ctx, 60, CANVAS.HEIGHT * 0.5, 8, f * 0.5, 0.2)
  drawMiniSnowflake(ctx, CANVAS.WIDTH - 60, CANVAS.HEIGHT * 0.22, 9, f * 0.35, 0.22)

  // Title with icy glow
  ctx.shadowColor = COLORS.TEXT_ICE
  ctx.shadowBlur = 25
  ctx.fillStyle = '#FFFFFF'
  ctx.font = FONTS.TITLE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ICE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.28)
  ctx.fillText('BREAKER', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.38)
  ctx.shadowBlur = 0

  // Subtitle
  ctx.fillStyle = COLORS.TEXT_GOLD
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('SNOWPEAK ARCADE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.48)

  // Instructions box with icy border
  const bx = CANVAS.WIDTH / 2 - 160, by = CANVAS.HEIGHT * 0.56, bw = 320, bh = 130
  ctx.fillStyle = 'rgba(10,20,40,0.85)'
  ctx.strokeStyle = COLORS.TEXT_ICE
  ctx.lineWidth = 2
  roundRect(ctx, bx, by, bw, bh, 8)
  ctx.fill()
  roundRect(ctx, bx, by, bw, bh, 8)
  ctx.stroke()

  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.font = FONTS.SMALL
  if (hasTouch) {
    ctx.fillText('SLIDE to move paddle', CANVAS.WIDTH / 2, by + 28)
    ctx.fillText('TAP to serve the ball', CANVAS.WIDTH / 2, by + 52)
  } else {
    ctx.fillText('\u2190 \u2192 or MOUSE to move', CANVAS.WIDTH / 2, by + 28)
    ctx.fillText('SPACE to serve the ball', CANVAS.WIDTH / 2, by + 52)
  }
  ctx.fillText('Smash the snow bricks!', CANVAS.WIDTH / 2, by + 76)
  ctx.fillText(`${GAME.MAX_LEVELS} levels to conquer`, CANVAS.WIDTH / 2, by + 100)

  // Blink prompt
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.font = FONTS.OVERLAY
    ctx.fillText(hasTouch ? 'TAP TO START' : 'PRESS START', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.88)
  }
}

function drawServingOverlay(ctx, state) {
  const blink = Math.floor(Date.now() / 400) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_ICE
    ctx.font = FONTS.SMALL
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(hasTouch ? 'TAP TO SERVE' : 'PRESS SPACE TO SERVE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.7)
  }
}

function drawLevelUpOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(5,10,25,0.6)'
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  const flash = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7
  ctx.shadowColor = COLORS.TEXT_ICE
  ctx.shadowBlur = 15
  ctx.fillStyle = `rgba(170,221,255,${flash})`
  ctx.font = FONTS.BIG
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('LEVEL CLEAR!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.4)
  ctx.shadowBlur = 0

  ctx.fillStyle = COLORS.TEXT_GOLD
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`SCORE: ${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.52)
}

function drawGameOverOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(5,10,25,0.8)'
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  if (state.winner === 'player') {
    // Victory — golden snow
    ctx.shadowColor = COLORS.TEXT_GOLD
    ctx.shadowBlur = 20
    ctx.fillStyle = COLORS.TEXT_GOLD
    ctx.font = FONTS.TITLE
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('VICTORY!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.3)
    ctx.shadowBlur = 0

    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.font = FONTS.SUBTITLE
    ctx.fillText('ALL LEVELS CLEARED', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.42)

    ctx.fillStyle = COLORS.TEXT_ICE
    ctx.font = FONTS.OVERLAY
    ctx.fillText('FINAL SCORE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.54)
    ctx.fillStyle = COLORS.TEXT_GOLD
    ctx.font = FONTS.BIG
    ctx.fillText(`${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.62)
  } else {
    // Defeat — frozen
    ctx.shadowColor = '#4488BB'
    ctx.shadowBlur = 15
    ctx.fillStyle = COLORS.TEXT_ICE
    ctx.font = FONTS.TITLE
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('FROZEN OUT', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.3)
    ctx.shadowBlur = 0

    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.font = FONTS.SUBTITLE
    ctx.fillText(`REACHED LEVEL ${state.level}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.42)

    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.font = FONTS.OVERLAY
    ctx.fillText(`SCORE: ${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.54)
  }

  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.font = FONTS.SMALL
    ctx.fillText(hasTouch ? 'TAP TO CONTINUE' : 'PRESS SPACE TO CONTINUE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.8)
  }
}

// ─── Helper: rounded rect path ───
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
