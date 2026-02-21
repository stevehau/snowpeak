// Polyp Sniper — Canvas 2D Renderer
// Draws the colon tunnel, polyps, reticle, HUD, and overlays

import { CANVAS, COLORS, FONTS, RETICLE, TUNNEL, GAME, SECTIONS } from './polypConfig.js'

const hasTouch = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

// ─── Main render ───

export function render(ctx, state) {
  ctx.save()

  // Screen shake offset
  if (state.shakeTimer > 0) {
    ctx.translate(state.shakeX, state.shakeY)
  }

  drawColonTunnel(ctx, state)
  drawMucosalFolds(ctx, state)
  drawBubbles(ctx, state)
  drawPolyps(ctx, state)
  drawSnipParticles(ctx, state)
  drawMissFlash(ctx, state)

  ctx.restore() // end shake

  // HUD & overlays drawn without shake
  if (state.phase === 'playing') {
    drawReticle(ctx, state)
    drawHUD(ctx, state)
    drawSpecimenJar(ctx, state)
    drawOuchText(ctx, state)
    drawComboPopup(ctx, state)
    drawDamageMeter(ctx, state)
  }

  if (state.phase === 'ready') drawReadyOverlay(ctx, state)
  if (state.phase === 'sectionclear') drawSectionClearOverlay(ctx, state)
  if (state.phase === 'gameover') drawGameOverOverlay(ctx, state)
  if (state.phase === 'victory') drawVictoryOverlay(ctx, state)
}

// ─── Colon tunnel background ───

function drawColonTunnel(ctx, state) {
  const tint = SECTIONS[state.currentSection]?.tint || COLORS.COLON_WALL

  // Base fill
  ctx.fillStyle = tint
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  // Radial gradient for tunnel depth
  const grad = ctx.createRadialGradient(
    TUNNEL.CENTER_X, TUNNEL.CENTER_Y, TUNNEL.INNER_RADIUS,
    TUNNEL.CENTER_X, TUNNEL.CENTER_Y, TUNNEL.OUTER_RADIUS
  )
  grad.addColorStop(0, COLORS.COLON_SHADOW)
  grad.addColorStop(0.3, tint)
  grad.addColorStop(0.7, COLORS.COLON_CENTER)
  grad.addColorStop(1, COLORS.COLON_WALL)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  // Subtle mucosa highlights (radial spots)
  const t = state.frameCount * 0.008
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + t * 0.3
    const dist = TUNNEL.MID_RADIUS * 0.8
    const hx = TUNNEL.CENTER_X + Math.cos(angle) * dist
    const hy = TUNNEL.CENTER_Y + Math.sin(angle) * dist
    const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, 60)
    hGrad.addColorStop(0, COLORS.MUCOSA_HIGHLIGHT)
    hGrad.addColorStop(1, 'rgba(255,200,180,0)')
    ctx.fillStyle = hGrad
    ctx.fillRect(hx - 60, hy - 60, 120, 120)
  }
}

// ─── Mucosal folds (undulating wall texture) ───

function drawMucosalFolds(ctx, state) {
  const t = state.frameCount * TUNNEL.WAVE_SPEED
  const cx = TUNNEL.CENTER_X
  const cy = TUNNEL.CENTER_Y

  ctx.strokeStyle = COLORS.COLON_VEIN
  ctx.lineWidth = 3

  for (let i = 0; i < TUNNEL.FOLD_COUNT; i++) {
    const baseAngle = (i / TUNNEL.FOLD_COUNT) * Math.PI * 2
    ctx.beginPath()
    for (let j = 0; j <= 40; j++) {
      const frac = j / 40
      const r = TUNNEL.INNER_RADIUS + frac * (TUNNEL.OUTER_RADIUS - TUNNEL.INNER_RADIUS)
      const wave = Math.sin(frac * 4 + t + i * 1.3) * TUNNEL.FOLD_DEPTH * frac
      const angle = baseAngle + wave * 0.005
      const px = cx + Math.cos(angle) * r
      const py = cy + Math.sin(angle) * r
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // Additional subtle vein lines
  ctx.strokeStyle = COLORS.COLON_VEIN
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.5
    ctx.beginPath()
    for (let j = 0; j <= 20; j++) {
      const frac = j / 20
      const r = TUNNEL.MID_RADIUS * (0.4 + frac * 0.6)
      const wobble = Math.sin(frac * 6 + t * 1.2 + i * 2) * 8
      const px = cx + Math.cos(angle + wobble * 0.01) * r
      const py = cy + Math.sin(angle + wobble * 0.01) * r
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
}

// ─── Ambient bubbles ───

function drawBubbles(ctx, state) {
  for (const b of state.bubbles) {
    const alpha = Math.min(1, b.life / 60) * 0.35
    ctx.fillStyle = `rgba(200,210,255,${alpha})`
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
    ctx.fill()

    // Highlight
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`
    ctx.beginPath()
    ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Polyps ───

function drawPolyps(ctx, state) {
  for (const p of state.polyps) {
    if (p.state === 'escaped') continue

    const growing = p.state === 'growing'
    const scaleFactor = growing ? 1 - (p.growTimer / 30) : 1
    const drawSize = p.size * scaleFactor

    if (drawSize <= 0) continue

    // Hit flash
    if (p.hitFlash > 0) {
      ctx.fillStyle = '#ffffff'
    } else {
      ctx.fillStyle = COLORS[p.colorKey]
    }

    // Boss glow aura
    if (p.type === 'boss' && p.state === 'active') {
      const pulse = 0.6 + Math.sin(state.frameCount * 0.08) * 0.4
      const gGrad = ctx.createRadialGradient(p.x, p.y, drawSize, p.x, p.y, drawSize * 2)
      gGrad.addColorStop(0, `rgba(200,0,40,${0.3 * pulse})`)
      gGrad.addColorStop(1, 'rgba(200,0,40,0)')
      ctx.fillStyle = gGrad
      ctx.beginPath()
      ctx.arc(p.x, p.y, drawSize * 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = p.hitFlash > 0 ? '#ffffff' : COLORS[p.colorKey]
    }

    // Main blob body
    drawBlob(ctx, p.x, p.y, drawSize, state.frameCount + p.id * 100)
    ctx.fill()

    // Outline
    ctx.strokeStyle = COLORS.POLYP_OUTLINE
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Highlight spot
    ctx.fillStyle = COLORS[p.hiKey] || '#ffffff'
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(p.x - drawSize * 0.25, p.y - drawSize * 0.25, drawSize * 0.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Boss health bar
    if (p.type === 'boss' && p.state === 'active') {
      const barW = drawSize * 2
      const barH = 6
      const barX = p.x - barW / 2
      const barY = p.y - drawSize - 14

      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barW, barH)
      const hpFrac = p.hp / p.maxHp
      ctx.fillStyle = hpFrac > 0.5 ? '#33cc33' : hpFrac > 0.25 ? '#cccc33' : '#cc3333'
      ctx.fillRect(barX, barY, barW * hpFrac, barH)
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barW, barH)

      // BOSS label
      ctx.font = FONTS.TINY
      ctx.fillStyle = COLORS.HUD_RED
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('BOSS', p.x, barY - 2)
    }

    // Snipped animation — shrinking
    if (p.state === 'snipped') {
      ctx.globalAlpha = p.size / GAME.BOSS_SIZE
    }
  }
  ctx.globalAlpha = 1
}

// Organic blob shape
function drawBlob(ctx, x, y, size, seed) {
  ctx.beginPath()
  const points = 10
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    const bump = 1 + Math.sin(seed * 0.01 + angle * 3) * 0.15
    const px = x + Math.cos(angle) * size * bump
    const py = y + Math.sin(angle) * size * bump
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

// ─── Snip particles ───

function drawSnipParticles(ctx, state) {
  for (const p of state.particles) {
    const alpha = Math.min(1, p.life / 15)
    const color = COLORS[p.colorKey] || COLORS.PARTICLE_PINK
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2 + (1 - alpha) * 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // White spark at center of recent snips
  for (const p of state.particles) {
    if (p.life > 20) {
      ctx.fillStyle = COLORS.SNIP_SPARK
      ctx.globalAlpha = (p.life - 20) / 25
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}

// ─── Miss flash ───

function drawMissFlash(ctx, state) {
  if (state.missFlashTimer > 0) {
    const alpha = state.missFlashTimer / 15 * 0.3
    ctx.fillStyle = `rgba(255,50,50,${alpha})`
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

    // Small wound mark
    ctx.strokeStyle = `rgba(180,40,40,${alpha * 2})`
    ctx.lineWidth = 2
    const mx = state.lastMissX
    const my = state.lastMissY
    ctx.beginPath()
    ctx.moveTo(mx - 6, my - 6)
    ctx.lineTo(mx + 6, my + 6)
    ctx.moveTo(mx + 6, my - 6)
    ctx.lineTo(mx - 6, my + 6)
    ctx.stroke()
  }
}

// ─── Ouch text ───

function drawOuchText(ctx, state) {
  if (state.ouchTimer > 0) {
    const alpha = Math.min(1, state.ouchTimer / 20)
    const rise = (40 - state.ouchTimer) * 0.8
    ctx.font = FONTS.OVERLAY
    ctx.fillStyle = COLORS.OUCH_TEXT
    ctx.globalAlpha = alpha
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('OUCH!', state.lastMissX, state.lastMissY - 30 - rise)
    ctx.globalAlpha = 1
  }
}

// ─── Combo popup ───

function drawComboPopup(ctx, state) {
  if (state.combo > 1) {
    const flash = Math.sin(state.frameCount * 0.15) * 0.3 + 0.7
    ctx.font = FONTS.SUBTITLE
    ctx.fillStyle = COLORS.HUD_GOLD
    ctx.globalAlpha = flash
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${state.combo}x COMBO!`, CANVAS.WIDTH / 2, CANVAS.HEIGHT - 60)
    ctx.globalAlpha = 1
  }
}

// ─── Reticle (endoscope scope) ───

function drawReticle(ctx, state) {
  const { x, y } = state.reticle
  const r = RETICLE.RADIUS

  // Outer glow
  ctx.strokeStyle = COLORS.SCOPE_GLOW
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, r + 3, 0, Math.PI * 2)
  ctx.stroke()

  // Main ring
  ctx.strokeStyle = COLORS.SCOPE_RING
  ctx.lineWidth = RETICLE.LINE_WIDTH
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()

  // Crosshair lines (with gap)
  const gap = RETICLE.CROSSHAIR_GAP
  const len = RETICLE.CROSSHAIR_LEN
  ctx.strokeStyle = COLORS.SCOPE_DIM
  ctx.lineWidth = 1
  ctx.beginPath()
  // Left
  ctx.moveTo(x - r - len, y); ctx.lineTo(x - gap, y)
  // Right
  ctx.moveTo(x + gap, y); ctx.lineTo(x + r + len, y)
  // Top
  ctx.moveTo(x, y - r - len); ctx.lineTo(x, y - gap)
  // Bottom
  ctx.moveTo(x, y + gap); ctx.lineTo(x, y + r + len)
  ctx.stroke()

  // Center dot
  ctx.fillStyle = COLORS.SCOPE_DOT
  ctx.beginPath()
  ctx.arc(x, y, RETICLE.INNER, 0, Math.PI * 2)
  ctx.fill()
}

// ─── HUD ───

function drawHUD(ctx, state) {
  // Top bar background
  ctx.fillStyle = COLORS.HUD_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, 32)

  ctx.font = FONTS.HUD
  ctx.textBaseline = 'middle'

  // Section name (left)
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.textAlign = 'left'
  ctx.fillText(SECTIONS[state.currentSection].name, 8, 16)

  // Score (right)
  ctx.fillStyle = COLORS.HUD_GOLD
  ctx.textAlign = 'right'
  ctx.fillText(`SCORE: ${state.score}`, CANVAS.WIDTH - 8, 16)

  // Polyp count (center)
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.textAlign = 'center'
  ctx.fillText(`${state.sectionPolypsKilled}/${state.sectionTarget}`, CANVAS.WIDTH / 2, 16)

  // Accuracy (bottom-left, small)
  const acc = state.totalClicks > 0 ? Math.round((state.polypHits / state.totalClicks) * 100) : 100
  ctx.font = FONTS.SMALL
  ctx.fillStyle = COLORS.HUD_DIM
  ctx.textAlign = 'left'
  ctx.fillText(`ACC: ${acc}%`, 8, CANVAS.HEIGHT - 12)
}

// ─── Damage meter ───

function drawDamageMeter(ctx, state) {
  const x = 8
  const y = 40
  const w = 100
  const h = 8

  ctx.fillStyle = COLORS.HUD_BG
  ctx.fillRect(x - 2, y - 2, w + 4, h + 14)

  ctx.font = FONTS.TINY
  ctx.fillStyle = state.damageCount >= 3 ? COLORS.HUD_RED : COLORS.HUD_DIM
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('TISSUE DAMAGE', x, y)

  // Bar
  ctx.fillStyle = '#333'
  ctx.fillRect(x, y + 12, w, h)

  const frac = state.damageCount / GAME.MAX_MISSES
  ctx.fillStyle = frac > 0.6 ? COLORS.HUD_RED : frac > 0.3 ? '#cccc33' : COLORS.HUD_GREEN
  ctx.fillRect(x, y + 12, w * frac, h)

  ctx.strokeStyle = '#555'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y + 12, w, h)

  // Ticks for each miss
  for (let i = 1; i < GAME.MAX_MISSES; i++) {
    const tx = x + (w / GAME.MAX_MISSES) * i
    ctx.strokeStyle = '#555'
    ctx.beginPath()
    ctx.moveTo(tx, y + 12)
    ctx.lineTo(tx, y + 12 + h)
    ctx.stroke()
  }
}

// ─── Specimen jar ───

function drawSpecimenJar(ctx, state) {
  const jx = CANVAS.WIDTH - 36
  const jy = CANVAS.HEIGHT - 90
  const jw = 28
  const jh = 45

  // Jar body
  ctx.fillStyle = COLORS.JAR_LIQUID
  ctx.fillRect(jx - jw / 2, jy, jw, jh)

  // Glass outline
  ctx.strokeStyle = COLORS.JAR_GLASS
  ctx.lineWidth = 2
  ctx.strokeRect(jx - jw / 2, jy, jw, jh)

  // Lid
  ctx.fillStyle = COLORS.JAR_LID
  ctx.fillRect(jx - jw / 2 - 2, jy - 5, jw + 4, 6)

  // Specimens (colored dots)
  const specimens = state.collectedSpecimens.slice(-8)
  for (let i = 0; i < specimens.length; i++) {
    const sx = jx - 8 + (i % 2) * 14
    const sy = jy + jh - 8 - Math.floor(i / 2) * 10
    ctx.fillStyle = COLORS[specimens[i].colorKey]
    ctx.beginPath()
    ctx.arc(sx, sy, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = COLORS.POLYP_OUTLINE
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // Count label
  ctx.font = FONTS.SMALL
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`${state.collectedSpecimens.length}`, jx, jy + jh + 4)

  // Label
  ctx.font = FONTS.TINY
  ctx.fillStyle = COLORS.HUD_DIM
  ctx.fillText('JAR', jx, jy + jh + 20)
}

// ─── Ready overlay ───

function drawReadyOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  // Title with green glow
  ctx.shadowColor = COLORS.SCOPE_RING
  ctx.shadowBlur = 20
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.TITLE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('POLYP', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.22)
  ctx.fillText('SNIPER', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.32)
  ctx.shadowBlur = 0

  // Subtitle
  ctx.fillStyle = COLORS.HUD_GOLD
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('Precision Endoscopy Arcade', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.42)

  // Instructions box
  const bx = CANVAS.WIDTH / 2 - 170, by = CANVAS.HEIGHT * 0.50, bw = 340, bh = 150
  ctx.fillStyle = 'rgba(10,20,10,0.8)'
  ctx.strokeStyle = COLORS.SCOPE_DIM
  ctx.lineWidth = 2
  roundRect(ctx, bx, by, bw, bh, 8)
  ctx.fill()
  roundRect(ctx, bx, by, bw, bh, 8)
  ctx.stroke()

  ctx.fillStyle = COLORS.HUD_DIM
  ctx.font = FONTS.SMALL
  if (hasTouch) {
    ctx.fillText('TAP to aim & snip polyps', CANVAS.WIDTH / 2, by + 25)
    ctx.fillText('Drag to move scope', CANVAS.WIDTH / 2, by + 48)
  } else {
    ctx.fillText('MOUSE or ARROWS to aim scope', CANVAS.WIDTH / 2, by + 25)
    ctx.fillText('CLICK to snip polyps', CANVAS.WIDTH / 2, by + 48)
  }
  ctx.fillText('Remove all polyps in 3 sections', CANVAS.WIDTH / 2, by + 78)
  ctx.fillStyle = COLORS.HUD_RED
  ctx.fillText(`${GAME.MAX_MISSES} misses on tissue = LICENSE REVOKED!`, CANVAS.WIDTH / 2, by + 105)
  ctx.fillStyle = COLORS.HUD_DIM
  ctx.fillText('Precision is everything, Doctor.', CANVAS.WIDTH / 2, by + 132)

  // Blink prompt
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_WHITE
    ctx.font = FONTS.OVERLAY
    ctx.fillText(hasTouch ? 'TAP TO BEGIN' : 'PRESS START', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.88)
  }
}

// ─── Section clear overlay ───

function drawSectionClearOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(5,15,5,0.6)'
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  const flash = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7
  ctx.shadowColor = COLORS.HUD_GREEN
  ctx.shadowBlur = 15
  ctx.fillStyle = `rgba(50,255,50,${flash})`
  ctx.font = FONTS.BIG
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SECTION CLEAR!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.35)
  ctx.shadowBlur = 0

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`${SECTIONS[state.currentSection].name}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.45)

  ctx.fillStyle = COLORS.HUD_GOLD
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`SCORE: ${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.55)

  const acc = state.totalClicks > 0 ? Math.round((state.polypHits / state.totalClicks) * 100) : 100
  ctx.fillStyle = acc >= 80 ? COLORS.HUD_GREEN : COLORS.HUD_DIM
  ctx.fillText(`ACCURACY: ${acc}%`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.63)

  if (state.currentSection < GAME.TOTAL_SECTIONS - 1) {
    ctx.fillStyle = COLORS.HUD_DIM
    ctx.font = FONTS.SMALL
    ctx.fillText(`Next: ${SECTIONS[state.currentSection + 1].name}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.73)
  }
}

// ─── Game over overlay ───

function drawGameOverOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.shadowColor = COLORS.HUD_RED
  ctx.shadowBlur = 20
  ctx.fillStyle = COLORS.HUD_RED
  ctx.font = FONTS.TITLE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('LICENSE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.25)
  ctx.fillText('REVOKED!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.35)
  ctx.shadowBlur = 0

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('Too much tissue damage!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.47)

  ctx.fillStyle = COLORS.HUD_DIM
  ctx.font = FONTS.OVERLAY
  ctx.fillText(`Polyps removed: ${state.polypHits}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.58)

  ctx.fillStyle = COLORS.HUD_GOLD
  ctx.font = FONTS.BIG
  ctx.fillText(`SCORE: ${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.67)

  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.font = FONTS.SMALL
    ctx.fillText(hasTouch ? 'TAP TO CONTINUE' : 'PRESS SPACE TO CONTINUE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.82)
  }
}

// ─── Victory overlay ───

function drawVictoryOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.shadowColor = COLORS.HUD_GOLD
  ctx.shadowBlur = 25
  ctx.fillStyle = COLORS.HUD_GOLD
  ctx.font = FONTS.TITLE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CLEAN', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.20)
  ctx.fillText('COLON!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.30)
  ctx.shadowBlur = 0

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('All sections cleared!', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.42)

  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.OVERLAY
  ctx.fillText(`Polyps removed: ${state.polypHits}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.52)

  const acc = state.totalClicks > 0 ? Math.round((state.polypHits / state.totalClicks) * 100) : 100
  ctx.fillStyle = acc >= 80 ? COLORS.HUD_GREEN : COLORS.HUD_DIM
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`Accuracy: ${acc}%`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.60)

  if (state.bestCombo > 1) {
    ctx.fillStyle = COLORS.HUD_DIM
    ctx.fillText(`Best combo: ${state.bestCombo}x`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.67)
  }

  ctx.fillStyle = COLORS.HUD_GOLD
  ctx.font = FONTS.BIG
  ctx.fillText(`FINAL SCORE: ${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.76)

  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillStyle = COLORS.TEXT_DIM
    ctx.font = FONTS.SMALL
    ctx.fillText(hasTouch ? 'TAP TO CONTINUE' : 'PRESS SPACE TO CONTINUE', CANVAS.WIDTH / 2, CANVAS.HEIGHT * 0.88)
  }
}

// ─── Helper: rounded rect ───

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
