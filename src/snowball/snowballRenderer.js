// Snowball Showdown — Canvas rendering
// render(ctx, state) — pure function, no side effects

import { CANVAS, COLORS, FONTS, GAME, PLAYER, OPPONENT, FIELD } from './snowballConfig.js'

export function render(ctx, state) {
  ctx.imageSmoothingEnabled = false

  drawSky(ctx)
  drawMountains(ctx)
  drawGround(ctx)
  drawTrees(ctx)
  drawSnowForts(ctx)
  drawSnowballPiles(ctx, state)
  drawGroundSplats(ctx, state)
  drawCharacter(ctx, OPPONENT.X, state.opponent.y, 'opponent', state.opponent, state)
  drawCharacter(ctx, PLAYER.X, state.player.y, 'player', state.player, state)
  drawSnowballs(ctx, state)
  drawCharacterSplats(ctx, state)

  if (state.phase === 'playing') {
    drawHUD(ctx, state)
    if (state.turn === 'player' && state.turnPhase === 'throwing') {
      drawAimIndicator(ctx, state)
    }
    if (state.announcement) {
      drawAnnouncement(ctx, state)
    }
  }

  if (state.phase === 'ready') drawReadyOverlay(ctx)
  if (state.phase === 'gameover') drawGameOverOverlay(ctx, state)
}

// === Background ===

function drawSky(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, FIELD.HORIZON_Y)
  grad.addColorStop(0, COLORS.SKY_TOP)
  grad.addColorStop(1, COLORS.SKY_BOTTOM)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS.WIDTH, FIELD.HORIZON_Y)

  // Stars
  ctx.fillStyle = '#ffffff'
  const stars = [
    [50, 30], [120, 60], [200, 20], [280, 50], [350, 35],
    [420, 55], [80, 90], [300, 80], [450, 25], [160, 45],
  ]
  for (const [x, y] of stars) {
    ctx.fillRect(x, y, 2, 2)
  }
}

function drawMountains(ctx) {
  // Back mountains
  ctx.fillStyle = COLORS.MOUNTAIN_DARK
  ctx.beginPath()
  ctx.moveTo(0, FIELD.HORIZON_Y)
  ctx.lineTo(60, FIELD.HORIZON_Y - 80)
  ctx.lineTo(130, FIELD.HORIZON_Y - 40)
  ctx.lineTo(200, FIELD.HORIZON_Y - 100)
  ctx.lineTo(270, FIELD.HORIZON_Y - 50)
  ctx.lineTo(340, FIELD.HORIZON_Y - 90)
  ctx.lineTo(400, FIELD.HORIZON_Y - 60)
  ctx.lineTo(CANVAS.WIDTH, FIELD.HORIZON_Y - 70)
  ctx.lineTo(CANVAS.WIDTH, FIELD.HORIZON_Y)
  ctx.fill()

  // Snow caps
  ctx.fillStyle = COLORS.SNOW_CAPS
  ctx.beginPath()
  ctx.moveTo(190, FIELD.HORIZON_Y - 100)
  ctx.lineTo(200, FIELD.HORIZON_Y - 100)
  ctx.lineTo(210, FIELD.HORIZON_Y - 90)
  ctx.lineTo(195, FIELD.HORIZON_Y - 85)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(330, FIELD.HORIZON_Y - 90)
  ctx.lineTo(340, FIELD.HORIZON_Y - 90)
  ctx.lineTo(350, FIELD.HORIZON_Y - 80)
  ctx.lineTo(335, FIELD.HORIZON_Y - 78)
  ctx.fill()
}

function drawGround(ctx) {
  // Snowy ground
  const grad = ctx.createLinearGradient(0, FIELD.HORIZON_Y, 0, CANVAS.HEIGHT)
  grad.addColorStop(0, COLORS.GROUND)
  grad.addColorStop(1, COLORS.GROUND_DARK)
  ctx.fillStyle = grad
  ctx.fillRect(0, FIELD.HORIZON_Y, CANVAS.WIDTH, CANVAS.HEIGHT - FIELD.HORIZON_Y)

  // Center line (dashed)
  ctx.strokeStyle = '#aabbcc'
  ctx.lineWidth = 1
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.moveTo(FIELD.CENTER_LINE, FIELD.HORIZON_Y + 20)
  ctx.lineTo(FIELD.CENTER_LINE, CANVAS.HEIGHT)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawTrees(ctx) {
  const treePositions = [
    { x: 20, y: FIELD.HORIZON_Y + 5, s: 0.6 },
    { x: 460, y: FIELD.HORIZON_Y + 8, s: 0.7 },
    { x: 100, y: FIELD.HORIZON_Y + 3, s: 0.5 },
    { x: 380, y: FIELD.HORIZON_Y + 6, s: 0.55 },
    { x: 240, y: FIELD.HORIZON_Y + 2, s: 0.4 },
  ]

  for (const t of treePositions) {
    drawTree(ctx, t.x, t.y, t.s)
  }
}

function drawTree(ctx, x, y, scale) {
  const s = scale
  // Trunk
  ctx.fillStyle = COLORS.TREE_TRUNK
  ctx.fillRect(x - 3 * s, y, 6 * s, 20 * s)
  // Layers
  ctx.fillStyle = COLORS.TREE_LEAVES
  for (let i = 0; i < 3; i++) {
    const w = (24 - i * 6) * s
    const h = 14 * s
    const ty = y - (i * 12 * s)
    ctx.beginPath()
    ctx.moveTo(x, ty - h)
    ctx.lineTo(x - w / 2, ty)
    ctx.lineTo(x + w / 2, ty)
    ctx.fill()
  }
  // Snow on top
  ctx.fillStyle = COLORS.TREE_SNOW
  for (let i = 0; i < 3; i++) {
    const w = (16 - i * 4) * s
    const ty = y - (i * 12 * s)
    ctx.fillRect(x - w / 2, ty - 14 * s, w, 4 * s)
  }
}

function drawSnowForts(ctx) {
  // Left fort (opponent)
  drawFort(ctx, OPPONENT.X - 25, 460)
  // Right fort (player)
  drawFort(ctx, PLAYER.X - 25, 460)
}

function drawFort(ctx, x, y) {
  ctx.fillStyle = COLORS.FORT_WALL
  // Main wall
  ctx.fillRect(x, y, 50, FIELD.FORT_HEIGHT)
  // Battlements
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 5 + i * 16, y - 10, 12, 10)
  }
  // Shadow
  ctx.fillStyle = COLORS.FORT_SHADOW
  ctx.fillRect(x, y + FIELD.FORT_HEIGHT - 6, 50, 6)
  // Snow on top
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 5 + i * 16, y - 12, 12, 3)
  }
}

// === Snowball Piles (3-2-1 pyramid, depletes as throws are used) ===

function drawSnowballPiles(ctx, state) {
  if (state.phase !== 'playing') return

  // Determine which side's pile to show (the thrower's pile)
  const isPlayerTurn = state.turn === 'player'
  const throwsLeft = state.throwsRemaining

  if (state.turnPhase !== 'throwing' && state.turnPhase !== 'switching') return

  // Position pile near the current thrower's fort
  const pileX = isPlayerTurn ? PLAYER.X + 30 : OPPONENT.X - 30
  const pileY = 480

  drawPile(ctx, pileX, pileY, throwsLeft)
}

function drawPile(ctx, x, y, count) {
  // Pyramid layout: row 0 (bottom) = 3, row 1 = 2, row 2 (top) = 1
  // Total = 6 slots, but we only show up to 5
  // Layout: bottom row positions 0,1,2; middle row 3,4; top row 5
  const ballRadius = 7
  const spacing = ballRadius * 2.2
  const positions = [
    // Bottom row (3)
    { x: x - spacing, y: y },
    { x: x, y: y },
    { x: x + spacing, y: y },
    // Middle row (2)
    { x: x - spacing * 0.5, y: y - spacing * 0.85 },
    { x: x + spacing * 0.5, y: y - spacing * 0.85 },
  ]

  // Draw from bottom up, only show 'count' snowballs
  for (let i = 0; i < Math.min(count, 5); i++) {
    const pos = positions[i]
    // Shadow
    ctx.fillStyle = COLORS.SNOWBALL_SHADOW
    ctx.beginPath()
    ctx.arc(pos.x + 1, pos.y + 1, ballRadius, 0, Math.PI * 2)
    ctx.fill()
    // Ball
    ctx.fillStyle = COLORS.SNOWBALL
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, ballRadius, 0, Math.PI * 2)
    ctx.fill()
    // Highlight
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(pos.x - 2, pos.y - 2, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Label
  if (count > 0) {
    ctx.font = FONTS.TINY
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.textAlign = 'center'
    ctx.fillText(`${count}`, x, y + ballRadius + 12)
  }
}

// === Characters ===

function drawCharacter(ctx, x, y, type, charState, gameState) {
  const bodyColor = type === 'player' ? COLORS.PLAYER_BODY : COLORS.OPPONENT_BODY
  const darkColor = type === 'player' ? COLORS.PLAYER_DARK : COLORS.OPPONENT_DARK
  const hatColor = type === 'player' ? COLORS.PLAYER_HAT : COLORS.OPPONENT_HAT

  // Wobble if stunned
  const wobble = charState.stunTimer > 0 ? Math.sin(charState.stunTimer * 0.8) * 3 : 0
  const cx = x + wobble

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(cx, y + 28, 18, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = bodyColor
  ctx.fillRect(cx - 12, y - 16, 24, 32)

  // Darker trim
  ctx.fillStyle = darkColor
  ctx.fillRect(cx - 12, y - 16, 24, 4)
  ctx.fillRect(cx - 12, y + 12, 24, 4)

  // Head
  ctx.fillStyle = COLORS.PLAYER_SKIN
  ctx.beginPath()
  ctx.arc(cx, y - 24, 10, 0, Math.PI * 2)
  ctx.fill()

  // Hat (beanie)
  ctx.fillStyle = hatColor
  ctx.beginPath()
  ctx.arc(cx, y - 28, 10, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(cx - 10, y - 28, 20, 4)
  // Pom-pom
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, y - 36, 4, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = '#000000'
  const eyeDir = type === 'player' ? -1 : 1
  ctx.fillRect(cx + eyeDir * 3 - 1, y - 26, 3, 3)
  ctx.fillRect(cx + eyeDir * -5, y - 26, 3, 3)

  // Arm — throwing animation
  const armDir = type === 'player' ? -1 : 1 // direction character faces
  const isMyTurn = (type === 'player' && gameState.turn === 'player') ||
                   (type !== 'player' && gameState.turn === 'computer')
  const throwAnim = charState.throwAnim || 0

  ctx.fillStyle = bodyColor
  if (throwAnim > 0) {
    // Active throw animation — arm swings forward
    const swingProgress = 1 - (throwAnim / 15) // 0 → 1 over 15 frames
    const throwArmAngle = -Math.PI * 0.4 + swingProgress * Math.PI * 0.8 // wind-up to release

    // Throwing arm (front arm toward opponent)
    ctx.save()
    ctx.translate(cx + armDir * 8, y - 10)
    ctx.rotate(throwArmAngle * armDir)
    ctx.fillRect(0, -3, 18, 6)
    ctx.restore()

    // Back arm stays at side
    ctx.fillRect(cx - armDir * 16, y - 10, 5, 18)
  } else if (isMyTurn && gameState.turnPhase === 'throwing') {
    // Ready to throw — arm raised with snowball
    ctx.fillRect(cx + armDir * 12, y - 16, 8 * armDir, -16)
    // Snowball in hand
    ctx.fillStyle = COLORS.SNOWBALL
    ctx.beginPath()
    ctx.arc(cx + armDir * 18, y - 30, 5, 0, Math.PI * 2)
    ctx.fill()
    // Back arm at side
    ctx.fillStyle = bodyColor
    ctx.fillRect(cx - armDir * 16, y - 10, 5, 18)
  } else {
    // Idle — both arms at side
    ctx.fillRect(cx - 16, y - 10, 5, 18)
    ctx.fillRect(cx + 11, y - 10, 5, 18)
  }

  // Legs
  ctx.fillStyle = '#444466'
  ctx.fillRect(cx - 8, y + 16, 7, 12)
  ctx.fillRect(cx + 1, y + 16, 7, 12)

  // Boots
  ctx.fillStyle = '#332211'
  ctx.fillRect(cx - 9, y + 26, 9, 4)
  ctx.fillRect(cx, y + 26, 9, 4)
}

function drawCharacterSplats(ctx, state) {
  // Splat on player
  if (state.player.splatTimer > 0) {
    drawSplatEffect(ctx, PLAYER.X, state.player.splatY, state.player.splatTimer)
  }
  // Splat on opponent
  if (state.opponent.splatTimer > 0) {
    drawSplatEffect(ctx, OPPONENT.X, state.opponent.splatY, state.opponent.splatTimer)
  }
}

function drawSplatEffect(ctx, x, y, timer) {
  const progress = 1 - timer / GAME.SPLAT_DURATION
  const alpha = Math.max(0, 1 - progress)

  // Central splat
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.beginPath()
  ctx.arc(x, y - 10, 14 + progress * 8, 0, Math.PI * 2)
  ctx.fill()

  // Flying particles
  ctx.fillStyle = `rgba(220, 235, 255, ${alpha * 0.8})`
  const particles = 8
  for (let i = 0; i < particles; i++) {
    const angle = (i / particles) * Math.PI * 2
    const dist = 10 + progress * 30
    const px = x + Math.cos(angle) * dist
    const py = (y - 10) + Math.sin(angle) * dist * 0.6
    const size = 4 * (1 - progress)
    ctx.beginPath()
    ctx.arc(px, py, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// === Snowballs ===

function drawSnowballs(ctx, state) {
  for (const ball of state.snowballs) {
    const displayY = ball.y + (ball.arcOffset || 0)

    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.beginPath()
    ctx.ellipse(ball.x, ball.y + 2, 6, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Snowball
    ctx.fillStyle = COLORS.SNOWBALL
    ctx.beginPath()
    ctx.arc(ball.x, displayY, GAME.SNOWBALL_SIZE, 0, Math.PI * 2)
    ctx.fill()

    // Highlight
    ctx.fillStyle = COLORS.SNOWBALL_SHADOW
    ctx.beginPath()
    ctx.arc(ball.x + 2, displayY + 2, GAME.SNOWBALL_SIZE * 0.6, 0, Math.PI * 2)
    ctx.fill()

    // Bright spot
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(ball.x - 2, displayY - 2, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawGroundSplats(ctx, state) {
  for (const sp of state.splats) {
    const alpha = sp.timer / 60
    ctx.fillStyle = `rgba(200, 220, 240, ${alpha * 0.5})`
    ctx.beginPath()
    ctx.ellipse(sp.x, sp.y, 12, 5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

// === Aim indicator ===

function drawAimIndicator(ctx, state) {
  const x = OPPONENT.X
  const y = state.aimY

  // Dotted arc trajectory preview — only to mid-screen, ends with arrow
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  const startX = PLAYER.X
  const startY = state.player.y
  const midT = 0.5 // only draw to halfway (mid-screen)
  for (let t = 0; t <= midT; t += 0.05) {
    const px = startX + (x - startX) * t
    const py = startY + (y - startY) * t - Math.sin(t * Math.PI) * 40
    if (t === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // Arrow at the end of the trajectory line
  const endT = midT
  const prevT = midT - 0.05
  const endPx = startX + (x - startX) * endT
  const endPy = startY + (y - startY) * endT - Math.sin(endT * Math.PI) * 40
  const prevPx = startX + (x - startX) * prevT
  const prevPy = startY + (y - startY) * prevT - Math.sin(prevT * Math.PI) * 40
  const angle = Math.atan2(endPy - prevPy, endPx - prevPx)
  const arrowLen = 10

  ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(endPx, endPy)
  ctx.lineTo(endPx - arrowLen * Math.cos(angle - 0.5), endPy - arrowLen * Math.sin(angle - 0.5))
  ctx.moveTo(endPx, endPy)
  ctx.lineTo(endPx - arrowLen * Math.cos(angle + 0.5), endPy - arrowLen * Math.sin(angle + 0.5))
  ctx.stroke()
}

// === HUD ===

function drawHUD(ctx, state) {
  // Background bar
  ctx.fillStyle = COLORS.HUD_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, 50)

  // Score display — CPU on left (matches screen position), Player on right
  ctx.font = FONTS.HUD
  ctx.textAlign = 'left'

  // CPU score (left side — opponent is on the left)
  ctx.fillStyle = COLORS.OPPONENT_BODY
  ctx.fillText(`CPU: ${state.opponent.hits}/${GAME.HITS_TO_WIN}`, 20, 20)
  drawHitDots(ctx, 20, 28, state.opponent.hits, COLORS.OPPONENT_BODY)

  // Player score (right-aligned to right edge)
  ctx.fillStyle = COLORS.PLAYER_BODY
  ctx.textAlign = 'right'
  ctx.fillText(`YOU: ${state.player.hits}/${GAME.HITS_TO_WIN}`, CANVAS.WIDTH - 20, 20)
  // Right-align hit dots too
  const dotsWidth = GAME.HITS_TO_WIN * 16
  drawHitDots(ctx, CANVAS.WIDTH - 20 - dotsWidth, 28, state.player.hits, COLORS.PLAYER_BODY)
  ctx.textAlign = 'left'

  // Turn indicator
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.textAlign = 'center'
  ctx.font = FONTS.SMALL
  if (state.turn === 'player' && state.turnPhase === 'throwing') {
    // Show countdown timer — turns red in final 3 seconds
    const secsLeft = Math.ceil((GAME.PLAYER_TURN_TIMEOUT - (state.turnTimer || 0)) / 60)
    const timerColor = secsLeft <= 3 ? COLORS.HUD_RED : COLORS.HUD_GREEN
    ctx.fillStyle = timerColor
    ctx.fillText(`YOUR THROW  [${state.throwsRemaining} left]  ${secsLeft}s`, CANVAS.WIDTH / 2, 20)
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.font = FONTS.TINY
    ctx.fillText('↑↓ AIM  •  SPACE/TAP THROW', CANVAS.WIDTH / 2, 38)
  } else if (state.turn === 'computer' && state.turnPhase === 'throwing') {
    ctx.fillStyle = COLORS.HUD_YELLOW
    ctx.fillText(`DODGE!  [${state.throwsRemaining} incoming]`, CANVAS.WIDTH / 2, 20)
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.font = FONTS.TINY
    ctx.fillText('↑↓ DODGE', CANVAS.WIDTH / 2, 38)
  } else {
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.fillText('SWITCHING...', CANVAS.WIDTH / 2, 28)
  }
}

function drawHitDots(ctx, x, y, hits, color) {
  for (let i = 0; i < GAME.HITS_TO_WIN; i++) {
    ctx.fillStyle = i < hits ? color : 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.arc(x + i * 16 + 6, y + 8, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

// === Announcements ===

function drawAnnouncement(ctx, state) {
  const alpha = Math.min(1, state.announcementTimer / 20)
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.6})`
  ctx.fillRect(0, CANVAS.HEIGHT / 2 - 30, CANVAS.WIDTH, 60)

  ctx.font = FONTS.BIG
  ctx.textAlign = 'center'
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.fillText(state.announcement, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 10)
}

// === Overlays ===

function drawReadyOverlay(ctx) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'

  // Title
  ctx.font = FONTS.TITLE
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.fillText('SNOWBALL', CANVAS.WIDTH / 2, 200)
  ctx.fillText('SHOWDOWN', CANVAS.WIDTH / 2, 250)

  // Snowball ASCII art
  ctx.font = FONTS.SUBTITLE
  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.fillText('* * *', CANVAS.WIDTH / 2, 300)

  // Instructions
  ctx.font = FONTS.OVERLAY
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.fillText('Dodge snowballs!', CANVAS.WIDTH / 2, 360)
  ctx.fillText('Aim & throw back!', CANVAS.WIDTH / 2, 395)

  ctx.font = FONTS.SMALL
  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.fillText('↑↓  Move / Aim', CANVAS.WIDTH / 2, 440)
  ctx.fillText('SPACE or TAP  Throw', CANVAS.WIDTH / 2, 465)
  ctx.fillText(`First to ${GAME.HITS_TO_WIN} hits wins!`, CANVAS.WIDTH / 2, 500)

  // Start prompt
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.HUD_GREEN
    ctx.fillText('TAP or PRESS SPACE TO START', CANVAS.WIDTH / 2, 560)
  }
}

function drawGameOverOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'

  if (state.winner === 'player') {
    ctx.font = FONTS.TITLE
    ctx.fillStyle = COLORS.HUD_GREEN
    ctx.fillText('YOU WIN!', CANVAS.WIDTH / 2, 220)

    ctx.font = FONTS.OVERLAY
    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.fillText('Snowball Champion!', CANVAS.WIDTH / 2, 280)
  } else {
    ctx.font = FONTS.TITLE
    ctx.fillStyle = COLORS.HUD_RED
    ctx.fillText('YOU LOSE!', CANVAS.WIDTH / 2, 220)

    ctx.font = FONTS.OVERLAY
    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.fillText('Better luck next time!', CANVAS.WIDTH / 2, 280)
  }

  // Final score
  ctx.font = FONTS.SUBTITLE
  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.fillText(`CPU: ${state.opponent.hits}  —  YOU: ${state.player.hits}`, CANVAS.WIDTH / 2, 340)

  // Continue prompt
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.fillText('TAP or PRESS SPACE TO CONTINUE', CANVAS.WIDTH / 2, 420)
  }
}
