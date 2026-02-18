// Defend the Village — All canvas drawing (retro pixel style)
// Strong first-person perspective with gun barrel

import { CANVAS, COLORS, FONTS, GAME, RETICLE, PERSPECTIVE } from './defendConfig.js'

export function render(ctx, state) {
  // Sky gradient
  drawSky(ctx)

  // Mountains
  drawMountains(ctx)

  // Ground
  drawGround(ctx, state)

  // Village (cabins, trees)
  drawVillage(ctx)

  // Animals
  drawAnimals(ctx, state)

  // Muzzle flash
  if (state.muzzleFlash > 0) drawMuzzleFlash(ctx, state)

  // First-person gun barrel at bottom
  if (state.phase === 'playing') drawGunBarrel(ctx, state)

  // Reticle / crosshair
  if (state.phase === 'playing') drawReticle(ctx, state)

  // HUD
  if (state.phase === 'playing') drawHUD(ctx, state)

  // Ammo shells + reload indicator
  if (state.phase === 'playing') drawAmmoHUD(ctx, state)

  // Halfway banner
  if (state.phase === 'playing' && state.halfwayTimer > 0) drawHalfwayBanner(ctx, state)

  // Overlays
  if (state.phase === 'ready') drawReadyOverlay(ctx)
  if (state.phase === 'gameover') drawGameOverOverlay(ctx, state)
  if (state.phase === 'victory') drawVictoryOverlay(ctx, state)
}

function drawSky(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, PERSPECTIVE.HORIZON_Y)
  grad.addColorStop(0, COLORS.SKY_TOP)
  grad.addColorStop(1, COLORS.SKY_BOTTOM)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS.WIDTH, PERSPECTIVE.HORIZON_Y)

  // Stars — spread across larger sky area
  ctx.fillStyle = '#ffffff'
  const stars = [
    [45, 30], [120, 55], [200, 20], [280, 65], [350, 35],
    [410, 50], [70, 90], [160, 110], [300, 100], [440, 80],
    [30, 140], [240, 130], [380, 150], [90, 170], [460, 160],
    [55, 210], [180, 230], [320, 215], [420, 240], [140, 255],
    [260, 200], [400, 190], [75, 260], [350, 265], [460, 225],
  ]
  for (const [sx, sy] of stars) {
    if (sy < PERSPECTIVE.HORIZON_Y - 20) {
      const twinkle = Math.sin(Date.now() * 0.003 + sx) > 0.3 ? 2 : 1
      ctx.fillRect(sx, sy, twinkle, twinkle)
    }
  }
}

function drawMountains(ctx) {
  const hY = PERSPECTIVE.HORIZON_Y

  // Far mountains — peaks relative to horizon
  ctx.fillStyle = COLORS.MOUNTAIN_DARK
  ctx.beginPath()
  ctx.moveTo(0, hY)
  ctx.lineTo(60, hY - 130)
  ctx.lineTo(140, hY - 90)
  ctx.lineTo(200, hY - 155)
  ctx.lineTo(280, hY - 100)
  ctx.lineTo(360, hY - 165)
  ctx.lineTo(420, hY - 110)
  ctx.lineTo(CANVAS.WIDTH, hY - 120)
  ctx.lineTo(CANVAS.WIDTH, hY)
  ctx.closePath()
  ctx.fill()

  // Snow caps
  ctx.fillStyle = COLORS.SNOW_CAPS
  drawSnowCap(ctx, 200, hY - 155, 30)
  drawSnowCap(ctx, 360, hY - 165, 25)

  // Near mountains
  ctx.fillStyle = COLORS.MOUNTAIN
  ctx.beginPath()
  ctx.moveTo(0, hY)
  ctx.lineTo(30, hY - 85)
  ctx.lineTo(100, hY - 65)
  ctx.lineTo(170, hY - 95)
  ctx.lineTo(240, hY - 60)
  ctx.lineTo(310, hY - 80)
  ctx.lineTo(400, hY - 70)
  ctx.lineTo(CANVAS.WIDTH, hY - 75)
  ctx.lineTo(CANVAS.WIDTH, hY)
  ctx.closePath()
  ctx.fill()
}

function drawSnowCap(ctx, peakX, peakY, size) {
  ctx.beginPath()
  ctx.moveTo(peakX, peakY)
  ctx.lineTo(peakX - size * 0.6, peakY + size * 0.4)
  ctx.lineTo(peakX + size * 0.6, peakY + size * 0.4)
  ctx.closePath()
  ctx.fill()
}

function drawGround(ctx, state) {
  // Main ground
  ctx.fillStyle = COLORS.GROUND
  ctx.fillRect(0, PERSPECTIVE.GROUND_TOP, CANVAS.WIDTH, CANVAS.HEIGHT - PERSPECTIVE.GROUND_TOP)

  // Ground texture stripes (perspective lines converging toward center)
  ctx.fillStyle = COLORS.GROUND_DARK
  for (let y = PERSPECTIVE.GROUND_TOP + 15; y < CANVAS.HEIGHT; y += 30) {
    const progress = (y - PERSPECTIVE.GROUND_TOP) / (CANVAS.HEIGHT - PERSPECTIVE.GROUND_TOP)
    const height = 2 + progress * 6
    ctx.fillRect(0, y, CANVAS.WIDTH, height)
  }

  // Path/road from distance — wider for first-person feel
  ctx.fillStyle = '#3a3a2a'
  ctx.beginPath()
  ctx.moveTo(CANVAS.WIDTH / 2 - 4, PERSPECTIVE.HORIZON_Y)
  ctx.lineTo(CANVAS.WIDTH / 2 - 120, CANVAS.HEIGHT)
  ctx.lineTo(CANVAS.WIDTH / 2 + 120, CANVAS.HEIGHT)
  ctx.lineTo(CANVAS.WIDTH / 2 + 4, PERSPECTIVE.HORIZON_Y)
  ctx.closePath()
  ctx.fill()
}

function drawVillage(ctx) {
  // Village elements sit just below horizon — in the middle distance
  const baseY = PERSPECTIVE.HORIZON_Y + 30

  // Small cabins in the distance (near horizon)
  drawCabin(ctx, 60, baseY + 10, 0.5)
  drawCabin(ctx, 370, baseY + 15, 0.45)

  // Trees flanking the path
  drawPineTree(ctx, 30, baseY + 5, 0.55)
  drawPineTree(ctx, 440, baseY + 10, 0.6)
  drawPineTree(ctx, 130, baseY + 25, 0.45)
  drawPineTree(ctx, 340, baseY + 20, 0.5)

  // Closer trees (bigger, near sides)
  drawPineTree(ctx, 15, baseY + 80, 0.9)
  drawPineTree(ctx, 455, baseY + 70, 0.85)

  // Fence posts in middle distance
  ctx.fillStyle = '#886644'
  const fenceY = baseY + 50
  for (let x = 60; x < CANVAS.WIDTH - 60; x += 45) {
    ctx.fillRect(x, fenceY, 3, 14)
  }
  // Fence rails
  ctx.fillStyle = '#775533'
  ctx.fillRect(60, fenceY + 3, CANVAS.WIDTH - 120, 2)
  ctx.fillRect(60, fenceY + 9, CANVAS.WIDTH - 120, 2)
}

function drawCabin(ctx, x, y, scale) {
  const w = 60 * scale
  const h = 35 * scale
  const roofH = 20 * scale

  // Walls
  ctx.fillStyle = COLORS.CABIN_WALL
  ctx.fillRect(x, y, w, h)

  // Roof
  ctx.fillStyle = COLORS.CABIN_ROOF
  ctx.beginPath()
  ctx.moveTo(x - 5 * scale, y)
  ctx.lineTo(x + w / 2, y - roofH)
  ctx.lineTo(x + w + 5 * scale, y)
  ctx.closePath()
  ctx.fill()

  // Window
  ctx.fillStyle = COLORS.CABIN_WINDOW
  ctx.fillRect(x + w * 0.3, y + h * 0.25, w * 0.15, h * 0.3)
  ctx.fillRect(x + w * 0.55, y + h * 0.25, w * 0.15, h * 0.3)

  // Door
  ctx.fillStyle = '#442211'
  ctx.fillRect(x + w * 0.4, y + h * 0.5, w * 0.2, h * 0.5)
}

function drawPineTree(ctx, x, y, scale) {
  const trunkW = 6 * scale
  const trunkH = 20 * scale
  const foliageW = 24 * scale
  const foliageH = 30 * scale

  // Trunk
  ctx.fillStyle = COLORS.TREE_TRUNK
  ctx.fillRect(x - trunkW / 2, y, trunkW, trunkH)

  // Foliage layers
  ctx.fillStyle = COLORS.TREE_LEAVES
  for (let i = 0; i < 3; i++) {
    const layerW = foliageW * (1 - i * 0.25)
    const layerY = y - foliageH * 0.3 * i
    ctx.beginPath()
    ctx.moveTo(x, layerY - foliageH * 0.4)
    ctx.lineTo(x - layerW / 2, layerY + foliageH * 0.2)
    ctx.lineTo(x + layerW / 2, layerY + foliageH * 0.2)
    ctx.closePath()
    ctx.fill()
  }
}

function drawAnimals(ctx, state) {
  // Sort by scale so far animals draw behind close ones
  const sorted = [...state.animals].sort((a, b) => a.scale - b.scale)

  for (const animal of sorted) {
    if (animal.type === 'wolf') {
      drawWolf(ctx, animal)
    } else {
      // Both 'bear' and 'boss' use drawBear (boss is just bigger with glow)
      drawBear(ctx, animal)
    }
  }

  // Boss incoming warning text
  if (state.bossPhase && !state.bossSpawned) {
    const blink = Math.floor(Date.now() / 300) % 2
    if (blink) {
      ctx.save()
      ctx.fillStyle = COLORS.BOSS_GLOW
      ctx.font = FONTS.SUBTITLE
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('!! BOSS APPROACHING !!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2)
      ctx.restore()
    }
  }
}

function drawWolf(ctx, animal) {
  const { x, y, scale, hitFlash, state: animalState } = animal
  const w = GAME.WOLF_WIDTH * scale
  const h = GAME.WOLF_HEIGHT * scale

  ctx.save()
  if (hitFlash > 0 && hitFlash % 2 === 0) {
    ctx.globalAlpha = 0.5
  }

  const isFlash = hitFlash > 0
  const bodyCol = isFlash ? COLORS.HIT_FLASH : COLORS.WOLF_BODY
  const darkCol = isFlash ? COLORS.HIT_FLASH : COLORS.WOLF_DARK
  const headDir = animalState === 'retreating' ? animal.retreatDir * 0.35 : 0

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.45, w * 0.4, h * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()

  // Bushy tail — curved upward behind body
  const tailWag = Math.sin(Date.now() * 0.008 + animal.wobble) * w * 0.06
  ctx.fillStyle = darkCol
  ctx.beginPath()
  ctx.moveTo(x - w * 0.35, y - h * 0.15)
  ctx.quadraticCurveTo(x - w * 0.6 + tailWag, y - h * 0.7, x - w * 0.45 + tailWag, y - h * 0.55)
  ctx.lineTo(x - w * 0.35, y - h * 0.1)
  ctx.closePath()
  ctx.fill()

  // Body — lean and angular (tapered front, wider chest)
  ctx.fillStyle = bodyCol
  ctx.beginPath()
  ctx.moveTo(x - w * 0.35, y - h * 0.1)   // rear
  ctx.lineTo(x - w * 0.3, y - h * 0.35)    // rear top
  ctx.lineTo(x + w * 0.15, y - h * 0.4)    // chest top
  ctx.lineTo(x + w * 0.3, y - h * 0.2)     // front chest
  ctx.lineTo(x + w * 0.25, y + h * 0.15)   // front bottom
  ctx.lineTo(x - w * 0.3, y + h * 0.15)    // rear bottom
  ctx.closePath()
  ctx.fill()

  // Darker back ridge
  ctx.fillStyle = darkCol
  ctx.beginPath()
  ctx.moveTo(x - w * 0.3, y - h * 0.35)
  ctx.lineTo(x + w * 0.1, y - h * 0.4)
  ctx.lineTo(x + w * 0.1, y - h * 0.3)
  ctx.lineTo(x - w * 0.3, y - h * 0.25)
  ctx.closePath()
  ctx.fill()

  // Legs — thin, long, animated running gait
  ctx.fillStyle = darkCol
  const legAnim = Math.sin(Date.now() * 0.012 + animal.wobble) * w * 0.1
  // Front legs
  ctx.fillRect(x + w * 0.12 + legAnim, y + h * 0.05, w * 0.06, h * 0.42)
  ctx.fillRect(x + w * 0.22 - legAnim, y + h * 0.05, w * 0.06, h * 0.42)
  // Rear legs (slightly thicker)
  ctx.fillRect(x - w * 0.25 - legAnim, y + h * 0.05, w * 0.07, h * 0.42)
  ctx.fillRect(x - w * 0.12 + legAnim, y + h * 0.05, w * 0.07, h * 0.42)

  // Paws
  ctx.fillRect(x + w * 0.10 + legAnim, y + h * 0.42, w * 0.1, h * 0.06)
  ctx.fillRect(x + w * 0.20 - legAnim, y + h * 0.42, w * 0.1, h * 0.06)
  ctx.fillRect(x - w * 0.27 - legAnim, y + h * 0.42, w * 0.1, h * 0.06)
  ctx.fillRect(x - w * 0.14 + legAnim, y + h * 0.42, w * 0.1, h * 0.06)

  // Neck (angled up from body)
  const nx = x + w * (0.3 + headDir * 0.5)
  const ny = y - h * 0.25
  ctx.fillStyle = bodyCol
  ctx.beginPath()
  ctx.moveTo(x + w * 0.15, y - h * 0.4)
  ctx.lineTo(nx + w * 0.05, ny - h * 0.3)
  ctx.lineTo(nx + w * 0.12, ny - h * 0.15)
  ctx.lineTo(x + w * 0.3, y - h * 0.2)
  ctx.closePath()
  ctx.fill()

  // Head — angular, pointed snout
  const hx = nx + w * 0.05 + headDir * w * 0.1
  const hy = ny - h * 0.35
  ctx.fillStyle = darkCol
  // Skull
  ctx.beginPath()
  ctx.moveTo(hx - w * 0.12, hy)
  ctx.lineTo(hx + w * 0.12, hy)
  ctx.lineTo(hx + w * 0.1, hy + h * 0.25)
  ctx.lineTo(hx - w * 0.1, hy + h * 0.25)
  ctx.closePath()
  ctx.fill()

  // Pointed snout extending forward
  ctx.fillStyle = bodyCol
  ctx.beginPath()
  ctx.moveTo(hx + w * 0.12, hy + h * 0.08)
  ctx.lineTo(hx + w * 0.3, hy + h * 0.18)
  ctx.lineTo(hx + w * 0.12, hy + h * 0.22)
  ctx.closePath()
  ctx.fill()

  // Nose
  ctx.fillStyle = '#111111'
  ctx.beginPath()
  ctx.arc(hx + w * 0.28, hy + h * 0.18, Math.max(1.5, w * 0.03), 0, Math.PI * 2)
  ctx.fill()

  // Triangular pointy ears
  ctx.fillStyle = darkCol
  // Left ear
  ctx.beginPath()
  ctx.moveTo(hx - w * 0.08, hy)
  ctx.lineTo(hx - w * 0.14, hy - h * 0.25)
  ctx.lineTo(hx - w * 0.01, hy + h * 0.02)
  ctx.closePath()
  ctx.fill()
  // Right ear
  ctx.beginPath()
  ctx.moveTo(hx + w * 0.05, hy)
  ctx.lineTo(hx + w * 0.1, hy - h * 0.25)
  ctx.lineTo(hx + w * 0.14, hy + h * 0.02)
  ctx.closePath()
  ctx.fill()

  // Inner ears (lighter)
  ctx.fillStyle = '#998877'
  ctx.beginPath()
  ctx.moveTo(hx - w * 0.07, hy + h * 0.01)
  ctx.lineTo(hx - w * 0.12, hy - h * 0.18)
  ctx.lineTo(hx - w * 0.02, hy + h * 0.02)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(hx + w * 0.06, hy + h * 0.01)
  ctx.lineTo(hx + w * 0.09, hy - h * 0.18)
  ctx.lineTo(hx + w * 0.13, hy + h * 0.02)
  ctx.closePath()
  ctx.fill()

  // Eye — yellow, menacing
  if (scale > 0.25) {
    ctx.fillStyle = COLORS.WOLF_EYE
    const eyeSize = Math.max(2, w * 0.06)
    ctx.fillRect(hx + w * 0.02, hy + h * 0.06, eyeSize, eyeSize)
    // Pupil
    ctx.fillStyle = '#111111'
    ctx.fillRect(hx + w * 0.03, hy + h * 0.07, Math.max(1, eyeSize * 0.5), Math.max(1, eyeSize * 0.5))
  }

  // Open jaw when close
  if (scale > 0.6) {
    ctx.fillStyle = '#331111'
    ctx.beginPath()
    ctx.moveTo(hx + w * 0.12, hy + h * 0.22)
    ctx.lineTo(hx + w * 0.28, hy + h * 0.24)
    ctx.lineTo(hx + w * 0.12, hy + h * 0.3)
    ctx.closePath()
    ctx.fill()
    // Teeth
    ctx.fillStyle = '#eeeeee'
    for (let t = 0; t < 3; t++) {
      ctx.fillRect(hx + w * 0.14 + t * w * 0.04, hy + h * 0.22, w * 0.015, h * 0.04)
    }
  }

  ctx.restore()
}

function drawBear(ctx, animal) {
  const { x, y, scale, hitFlash, state: animalState, hp, maxHp } = animal
  const sizeMult = animal.sizeMult || 1
  const isBoss = animal.type === 'boss'
  const w = GAME.BEAR_WIDTH * scale * sizeMult
  const h = GAME.BEAR_HEIGHT * scale * sizeMult

  ctx.save()
  if (hitFlash > 0 && hitFlash % 2 === 0) {
    ctx.globalAlpha = 0.5
  }

  const isFlash = hitFlash > 0
  const bodyColor = isFlash ? COLORS.HIT_FLASH : COLORS.BEAR_BODY
  const darkColor = isFlash ? COLORS.HIT_FLASH : COLORS.BEAR_DARK

  // Boss red glow aura
  if (isBoss && animalState === 'approaching') {
    ctx.save()
    const glowPulse = 0.15 + Math.sin(Date.now() * 0.005) * 0.1
    ctx.globalAlpha = glowPulse
    ctx.fillStyle = COLORS.BOSS_GLOW
    ctx.beginPath()
    ctx.ellipse(x, y - h * 0.1, w * 0.6, h * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.45, w * 0.35, h * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()

  // === UPRIGHT BEAR (walking on hind legs) ===

  // Hind legs (two thick legs at bottom, slight walk animation)
  const legAnim = Math.sin(Date.now() * 0.008 + animal.wobble) * w * 0.06
  ctx.fillStyle = darkColor
  // Left leg
  ctx.fillRect(x - w * 0.22 + legAnim, y + h * 0.15, w * 0.18, h * 0.3)
  // Right leg
  ctx.fillRect(x + w * 0.04 - legAnim, y + h * 0.15, w * 0.18, h * 0.3)

  // Feet
  ctx.fillStyle = darkColor
  ctx.fillRect(x - w * 0.25 + legAnim, y + h * 0.42, w * 0.22, h * 0.06)
  ctx.fillRect(x + w * 0.02 - legAnim, y + h * 0.42, w * 0.22, h * 0.06)

  // Torso (upright, taller than wide)
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.ellipse(x, y - h * 0.05, w * 0.35, h * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly patch (lighter)
  ctx.fillStyle = isFlash ? COLORS.HIT_FLASH : '#886644'
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.02, w * 0.2, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()

  // === RAISED ARMS with claws ===
  const armSwing = Math.sin(Date.now() * 0.006 + animal.wobble) * 0.15

  // Left arm — raised up and out
  ctx.fillStyle = bodyColor
  ctx.save()
  ctx.translate(x - w * 0.3, y - h * 0.2)
  ctx.rotate(-0.8 + armSwing)  // angled up-left
  ctx.fillRect(0, 0, w * 0.12, h * 0.3)
  // Left paw
  ctx.fillStyle = darkColor
  ctx.fillRect(-w * 0.03, -h * 0.05, w * 0.18, h * 0.08)
  // Left claws (3 lines)
  ctx.fillStyle = '#ccccaa'
  for (let c = 0; c < 3; c++) {
    ctx.fillRect(w * 0.01 + c * w * 0.05, -h * 0.1, w * 0.02, h * 0.06)
  }
  ctx.restore()

  // Right arm — raised up and out
  ctx.fillStyle = bodyColor
  ctx.save()
  ctx.translate(x + w * 0.3, y - h * 0.2)
  ctx.rotate(0.8 - armSwing)  // angled up-right
  ctx.fillRect(-w * 0.12, 0, w * 0.12, h * 0.3)
  // Right paw
  ctx.fillStyle = darkColor
  ctx.fillRect(-w * 0.15, -h * 0.05, w * 0.18, h * 0.08)
  // Right claws
  ctx.fillStyle = '#ccccaa'
  for (let c = 0; c < 3; c++) {
    ctx.fillRect(-w * 0.1 + c * w * 0.05, -h * 0.1, w * 0.02, h * 0.06)
  }
  ctx.restore()

  // Head (on top)
  const headDir = animalState === 'retreating' ? animal.retreatDir * w * 0.1 : 0
  ctx.fillStyle = darkColor
  ctx.beginPath()
  ctx.ellipse(x + headDir, y - h * 0.35, w * 0.22, h * 0.13, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ears (round, on top of head)
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.arc(x - w * 0.16 + headDir, y - h * 0.45, w * 0.08, 0, Math.PI * 2)
  ctx.arc(x + w * 0.16 + headDir, y - h * 0.45, w * 0.08, 0, Math.PI * 2)
  ctx.fill()

  // Inner ears
  ctx.fillStyle = '#996655'
  ctx.beginPath()
  ctx.arc(x - w * 0.16 + headDir, y - h * 0.45, w * 0.04, 0, Math.PI * 2)
  ctx.arc(x + w * 0.16 + headDir, y - h * 0.45, w * 0.04, 0, Math.PI * 2)
  ctx.fill()

  // Snout / muzzle
  ctx.fillStyle = '#886644'
  ctx.beginPath()
  ctx.ellipse(x + headDir, y - h * 0.31, w * 0.1, h * 0.05, 0, 0, Math.PI * 2)
  ctx.fill()

  // Nose
  ctx.fillStyle = '#222222'
  ctx.fillRect(x - w * 0.03 + headDir, y - h * 0.33, w * 0.06, h * 0.03)

  // Eyes (angry red)
  if (scale > 0.25) {
    ctx.fillStyle = COLORS.BEAR_EYE
    const eyeSize = Math.max(2, w * 0.06)
    ctx.fillRect(x - w * 0.12 + headDir, y - h * 0.38, eyeSize, eyeSize)
    ctx.fillRect(x + w * 0.06 + headDir, y - h * 0.38, eyeSize, eyeSize)
  }

  // Open mouth (when close, showing teeth)
  if (scale > 0.6) {
    ctx.fillStyle = '#441111'
    ctx.fillRect(x - w * 0.06 + headDir, y - h * 0.28, w * 0.12, h * 0.04)
    // Teeth
    ctx.fillStyle = '#eeeeee'
    for (let t = 0; t < 3; t++) {
      ctx.fillRect(x - w * 0.04 + t * w * 0.04 + headDir, y - h * 0.28, w * 0.02, h * 0.02)
    }
  }

  ctx.restore()

  // Health bar for bears (always show for boss, show for regular bears when damaged)
  const showBar = isBoss
    ? animalState === 'approaching' && scale > 0.2
    : animalState === 'approaching' && hp < maxHp && scale > 0.25
  if (showBar) {
    const barW = w * 0.6
    const barH = Math.max(3, 5 * scale * sizeMult)
    const barX = x - barW / 2
    const barY = y - h * 0.55

    // Boss label
    if (isBoss && scale > 0.3) {
      ctx.fillStyle = COLORS.BOSS_GLOW
      ctx.font = FONTS.SMALL
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('BOSS', x, barY - 2)
    }

    ctx.fillStyle = '#333333'
    ctx.fillRect(barX, barY, barW, barH)

    const hpFrac = hp / maxHp
    ctx.fillStyle = hpFrac > 0.5 ? COLORS.HEALTH_GREEN :
                    hpFrac > 0.25 ? COLORS.HEALTH_YELLOW : COLORS.HEALTH_RED
    ctx.fillRect(barX, barY, barW * hpFrac, barH)
  }
}

function drawGunBarrel(ctx, state) {
  // First-person gun barrel at the bottom of screen
  const cx = PERSPECTIVE.GUN_X
  const by = CANVAS.HEIGHT

  // Gun sway based on reticle position
  const swayX = (state.reticle.x - CANVAS.WIDTH / 2) * 0.15
  const swayY = (state.reticle.y - CANVAS.HEIGHT / 2) * 0.05

  ctx.save()
  ctx.translate(swayX, swayY)

  // Gun barrel (dark metal)
  ctx.fillStyle = '#333344'
  ctx.beginPath()
  ctx.moveTo(cx - 8, by)
  ctx.lineTo(cx - 6, by - 80)
  ctx.lineTo(cx + 6, by - 80)
  ctx.lineTo(cx + 8, by)
  ctx.closePath()
  ctx.fill()

  // Barrel highlight
  ctx.fillStyle = '#444466'
  ctx.fillRect(cx - 2, by - 80, 4, 80)

  // Barrel tip / muzzle
  ctx.fillStyle = '#222233'
  ctx.beginPath()
  ctx.ellipse(cx, by - 80, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Stock / grip at bottom
  ctx.fillStyle = '#664422'
  ctx.beginPath()
  ctx.moveTo(cx - 8, by)
  ctx.lineTo(cx - 20, by)
  ctx.lineTo(cx - 14, by - 30)
  ctx.lineTo(cx - 8, by - 20)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#664422'
  ctx.beginPath()
  ctx.moveTo(cx + 8, by)
  ctx.lineTo(cx + 20, by)
  ctx.lineTo(cx + 14, by - 30)
  ctx.lineTo(cx + 8, by - 20)
  ctx.closePath()
  ctx.fill()

  // Hands holding the gun
  ctx.fillStyle = '#cc9966'
  // Left hand
  ctx.beginPath()
  ctx.ellipse(cx - 12, by - 35, 8, 6, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // Right hand (on trigger area)
  ctx.beginPath()
  ctx.ellipse(cx + 10, by - 20, 7, 6, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Muzzle flash from gun tip when shooting
  if (state.muzzleFlash > 0) {
    const flashAlpha = state.muzzleFlash / GAME.FLASH_DURATION
    ctx.globalAlpha = flashAlpha * 0.6
    ctx.fillStyle = COLORS.MUZZLE_FLASH
    ctx.beginPath()
    ctx.arc(cx, by - 85, 12 + (GAME.FLASH_DURATION - state.muzzleFlash) * 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function drawMuzzleFlash(ctx, state) {
  ctx.save()
  ctx.globalAlpha = state.muzzleFlash / GAME.FLASH_DURATION
  ctx.fillStyle = COLORS.MUZZLE_FLASH
  ctx.beginPath()
  ctx.arc(state.lastShotX, state.lastShotY, 8 + (GAME.FLASH_DURATION - state.muzzleFlash) * 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawReticle(ctx, state) {
  const { x, y } = state.reticle
  const r = RETICLE.SIZE

  ctx.strokeStyle = COLORS.RETICLE
  ctx.lineWidth = RETICLE.LINE_WIDTH

  // Outer circle
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()

  // Crosshair lines
  ctx.beginPath()
  ctx.moveTo(x - r - 6, y)
  ctx.lineTo(x - r * 0.4, y)
  ctx.moveTo(x + r * 0.4, y)
  ctx.lineTo(x + r + 6, y)
  ctx.moveTo(x, y - r - 6)
  ctx.lineTo(x, y - r * 0.4)
  ctx.moveTo(x, y + r * 0.4)
  ctx.lineTo(x, y + r + 6)
  ctx.stroke()

  // Center dot
  ctx.fillStyle = COLORS.RETICLE
  ctx.fillRect(x - 1, y - 1, 3, 3)
}

function drawHUD(ctx, state) {
  // Top bar
  ctx.fillStyle = COLORS.HUD_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, 36)

  ctx.font = FONTS.HUD
  ctx.textBaseline = 'top'

  // Animals remaining (left) — show boss status during boss phase
  ctx.fillStyle = state.bossPhase ? COLORS.BOSS_GLOW : COLORS.HUD_GREEN
  ctx.textAlign = 'left'
  if (state.bossPhase) {
    const bossHp = state.animals.find(a => a.type === 'boss')
    if (bossHp && bossHp.state === 'approaching') {
      ctx.fillText(`BOSS HP: ${bossHp.hp}/${bossHp.maxHp}`, 10, 8)
    } else if (!state.bossSpawned) {
      ctx.fillText('BOSS INCOMING...', 10, 8)
    } else {
      ctx.fillText('BOSS DEFEATED!', 10, 8)
    }
  } else {
    const remaining = state.totalAnimals - state.animalsDefeated
    ctx.fillText(`HOSTILES: ${remaining}`, 10, 8)
  }

  // Timer (center)
  ctx.textAlign = 'center'
  ctx.fillText(formatTime(state.elapsedMs), CANVAS.WIDTH / 2, 8)

  // Defeated count (right)
  ctx.textAlign = 'right'
  ctx.fillText(`DEFEATED: ${state.animalsDefeated}/${state.totalAnimals}`, CANVAS.WIDTH - 10, 8)

  ctx.textBaseline = 'alphabetic'
}

function drawAmmoHUD(ctx, state) {
  // Shell icons — bottom right corner
  const shellW = 8
  const shellH = 22
  const gap = 5
  const startX = CANVAS.WIDTH - 20 - (GAME.AMMO_MAX * (shellW + gap))
  const shellY = CANVAS.HEIGHT - 45

  for (let i = 0; i < GAME.AMMO_MAX; i++) {
    const sx = startX + i * (shellW + gap)
    const loaded = i < state.ammo

    if (loaded) {
      // Brass casing
      ctx.fillStyle = '#cc9933'
      ctx.fillRect(sx, shellY + 6, shellW, shellH - 6)
      // Bullet tip (pointed)
      ctx.fillStyle = '#aa7722'
      ctx.beginPath()
      ctx.moveTo(sx, shellY + 6)
      ctx.lineTo(sx + shellW / 2, shellY)
      ctx.lineTo(sx + shellW, shellY + 6)
      ctx.closePath()
      ctx.fill()
      // Primer circle at base
      ctx.fillStyle = '#886622'
      ctx.fillRect(sx + 1, shellY + shellH - 3, shellW - 2, 3)
    } else {
      // Empty slot — dark outline
      ctx.strokeStyle = '#555555'
      ctx.lineWidth = 1
      ctx.strokeRect(sx, shellY, shellW, shellH)
    }
  }

  // "RELOAD" flash when reloading
  if (state.reloading) {
    const blink = Math.floor(Date.now() / 200) % 2
    if (blink) {
      ctx.fillStyle = COLORS.MISS_RED
      ctx.font = FONTS.SUBTITLE
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('RELOAD', CANVAS.WIDTH - 15, shellY - 5)
    }
  }
}

function drawHalfwayBanner(ctx, state) {
  // "HALF WAY DONE!" banner — fades out
  const alpha = Math.min(1, state.halfwayTimer / 30) // fade over last 0.5s
  ctx.save()
  ctx.globalAlpha = alpha

  // Background bar
  ctx.fillStyle = 'rgba(0, 80, 0, 0.7)'
  ctx.fillRect(0, CANVAS.HEIGHT / 2 - 25, CANVAS.WIDTH, 50)

  // Text
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.TITLE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HALF WAY DONE!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2)

  ctx.restore()
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function drawReadyOverlay(ctx) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Title
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.TITLE
  ctx.fillText('DEFEND', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 150)
  ctx.fillText('THE VILLAGE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 100)

  // Subtitle
  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('A SNOWPEAK RESORT PRODUCTION', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 55)

  // Instructions
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.OVERLAY
  const instructions = [
    'Tap or click to aim & shoot!',
    'Or: Arrow keys + SPACE',
    '5 shots per clip — auto-reloads!',
    'Wolves: 1 hit  |  Bears: 3 hits',
    "Don't let them reach the village!",
  ]
  instructions.forEach((line, i) => {
    ctx.fillText(line, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + i * 34)
  })

  // Start prompt
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillText('TAP or PRESS SPACE TO START', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 220)
  }

  ctx.textBaseline = 'alphabetic'
}

function drawGameOverOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = COLORS.MISS_RED
  ctx.font = FONTS.TITLE
  ctx.fillText('GAME OVER', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 100)

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.OVERLAY
  ctx.fillText('A wild animal reached the village!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 40)

  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`Animals Defeated: ${state.animalsDefeated}/${state.totalAnimals}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 10)
  ctx.fillText(`Time: ${formatTime(state.elapsedMs)}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 40)

  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillText('TAP or PRESS SPACE TO CONTINUE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 120)
  }

  ctx.textBaseline = 'alphabetic'
}

function drawVictoryOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#ffcc00'
  ctx.font = FONTS.TITLE
  ctx.fillText('VICTORY!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 100)

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.OVERLAY
  ctx.fillText('The village is safe!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 40)

  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`${state.totalAnimals} animals + BOSS defeated!`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 10)
  ctx.fillText(`Time: ${formatTime(state.elapsedMs)}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 40)

  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillText('TAP or PRESS SPACE TO CONTINUE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 120)
  }

  ctx.textBaseline = 'alphabetic'
}
