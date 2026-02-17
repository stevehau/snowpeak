// Slalom Challenge — All canvas drawing (retro pixel style)

import {
  CANVAS, COLORS, SKIER, GATE, OBSTACLE, FONTS, GAME, CROWD, RIVAL,
} from './slalomConfig.js'
import { worldToScreen } from './slalomEngine.js'
import { getSlalomScores } from './slalomScores.js'

export function render(ctx, state) {
  // Clear
  ctx.fillStyle = COLORS.SNOW_LIGHT
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  // Scrolling snow bands
  drawSnowBands(ctx, state)

  // Trees (behind everything)
  drawTrees(ctx, state)

  // Spectator crowds
  drawCrowds(ctx, state)

  // Gates
  drawGates(ctx, state)

  // Obstacles
  drawObstacles(ctx, state)

  // Rival NPC skiers
  drawRivals(ctx, state)

  // Skier
  drawSkier(ctx, state)

  // HUD
  drawHUD(ctx, state)

  // Phase overlays
  if (state.phase === 'ready') drawReadyOverlay(ctx)
  if (state.phase === 'gameover') drawGameOverOverlay(ctx, state)
}

function drawSnowBands(ctx, state) {
  const bandHeight = 40
  const patternHeight = bandHeight * 4 // 3 white + 1 grey = 4 bands total
  const offset = (state.worldY * 0.5) % patternHeight

  ctx.fillStyle = COLORS.SNOW_DARK
  // Draw 1 grey band for every 3 white bands (pattern: white, white, white, grey)
  for (let y = -patternHeight + offset; y < CANVAS.HEIGHT; y += patternHeight) {
    // Grey band appears on the 4th position (after 3 white bands)
    ctx.fillRect(0, y + bandHeight * 3, CANVAS.WIDTH, bandHeight)
  }
}

function drawTrees(ctx, state) {
  for (const tree of state.trees) {
    const screenY = worldToScreen(tree.y, state.worldY)
    const { x, size } = tree

    // Trunk
    ctx.fillStyle = COLORS.TREE_TRUNK
    ctx.fillRect(x + size / 2 - 3, screenY, 6, size * 0.4)

    // Foliage (triangle)
    ctx.fillStyle = COLORS.TREE_LEAVES
    ctx.beginPath()
    ctx.moveTo(x + size / 2, screenY - size * 0.6)
    ctx.lineTo(x, screenY + 2)
    ctx.lineTo(x + size, screenY + 2)
    ctx.closePath()
    ctx.fill()
  }
}

function drawCrowds(ctx, state) {
  const now = Date.now() / 150  // animation timer for arm waving

  for (const crowd of state.crowds) {
    const baseScreenY = worldToScreen(crowd.y, state.worldY)

    for (const p of crowd.people) {
      const sy = baseScreenY + p.offsetY
      const px = p.x
      const pw = CROWD.PERSON_WIDTH
      const ph = CROWD.PERSON_HEIGHT

      // Legs
      ctx.fillStyle = '#334'
      ctx.fillRect(px, sy + ph * 0.6, pw * 0.35, ph * 0.4)
      ctx.fillRect(px + pw * 0.65, sy + ph * 0.6, pw * 0.35, ph * 0.4)

      // Body (colored jacket)
      ctx.fillStyle = p.color
      ctx.fillRect(px, sy + ph * 0.2, pw, ph * 0.45)

      // Head
      ctx.fillStyle = '#ffcc88'
      ctx.fillRect(px + pw * 0.15, sy, pw * 0.7, ph * 0.25)

      // Arms waving — simple lines that oscillate
      const armAngle = Math.sin(now + p.armPhase) * 0.6
      const armLen = ph * 0.35
      const shoulderY = sy + ph * 0.25
      const shoulderX = px + pw / 2

      ctx.strokeStyle = p.color
      ctx.lineWidth = 2
      // Left arm
      ctx.beginPath()
      ctx.moveTo(shoulderX - pw * 0.4, shoulderY)
      ctx.lineTo(shoulderX - pw * 0.4 - Math.cos(armAngle + 0.5) * armLen,
                 shoulderY - Math.sin(armAngle + 0.5) * armLen)
      ctx.stroke()
      // Right arm
      ctx.beginPath()
      ctx.moveTo(shoulderX + pw * 0.4, shoulderY)
      ctx.lineTo(shoulderX + pw * 0.4 + Math.cos(-armAngle + 0.5) * armLen,
                 shoulderY - Math.sin(-armAngle + 0.5) * armLen)
      ctx.stroke()
    }

    // "GO!" text above crowd
    const textScreenY = baseScreenY - 20
    ctx.fillStyle = '#ffcc00'
    ctx.font = FONTS.SMALL
    ctx.textAlign = 'center'
    ctx.fillText('GO!', 38, textScreenY)
    ctx.fillText('GO!', CANVAS.WIDTH - 38, textScreenY)
  }
}

function drawGates(ctx, state) {
  for (const gate of state.gates) {
    const screenY = worldToScreen(gate.y, state.worldY)

    // Left pole + flag
    ctx.fillStyle = COLORS.GATE_POLE
    ctx.fillRect(gate.leftX - GATE.POLE_WIDTH / 2, screenY - GATE.POLE_HEIGHT, GATE.POLE_WIDTH, GATE.POLE_HEIGHT)
    ctx.fillStyle = gate.missed ? COLORS.MISS_RED : COLORS.GATE_LEFT
    ctx.fillRect(gate.leftX - GATE.POLE_WIDTH / 2, screenY - GATE.POLE_HEIGHT, GATE.FLAG_WIDTH, GATE.FLAG_HEIGHT)

    // Right pole + flag
    ctx.fillStyle = COLORS.GATE_POLE
    ctx.fillRect(gate.rightX - GATE.POLE_WIDTH / 2, screenY - GATE.POLE_HEIGHT, GATE.POLE_WIDTH, GATE.POLE_HEIGHT)
    ctx.fillStyle = gate.missed ? COLORS.MISS_RED : COLORS.GATE_RIGHT
    ctx.fillRect(gate.rightX - GATE.FLAG_WIDTH + GATE.POLE_WIDTH / 2, screenY - GATE.POLE_HEIGHT, GATE.FLAG_WIDTH, GATE.FLAG_HEIGHT)

    // Passed indicator
    if (gate.passed) {
      ctx.fillStyle = COLORS.HUD_GREEN
      ctx.font = FONTS.SMALL
      ctx.textAlign = 'center'
      ctx.fillText('+' + GAME.SCORE_PER_GATE, (gate.leftX + gate.rightX) / 2, screenY - GATE.POLE_HEIGHT - 4)
    }
  }
}

function drawObstacles(ctx, state) {
  for (const obs of state.obstacles) {
    const screenY = worldToScreen(obs.y, state.worldY)

    if (obs.type === 'rock') {
      // Gray rock (rectangle with slight shape)
      ctx.fillStyle = COLORS.OBSTACLE_ROCK
      ctx.fillRect(obs.x, screenY - obs.height / 2, obs.width, obs.height)
      ctx.fillStyle = '#666666'
      ctx.fillRect(obs.x + 2, screenY - obs.height / 2 + 2, obs.width - 4, 4)
    } else if (obs.type === 'bear') {
      // White bear body
      ctx.fillStyle = COLORS.OBSTACLE_BEAR
      ctx.fillRect(obs.x + 4, screenY - obs.height / 2 + 4, obs.width - 8, obs.height - 4)
      // Head
      ctx.fillRect(obs.x + 8, screenY - obs.height / 2, obs.width - 16, 10)
      // Eyes
      ctx.fillStyle = '#000000'
      ctx.fillRect(obs.x + 10, screenY - obs.height / 2 + 2, 3, 3)
      ctx.fillRect(obs.x + obs.width - 13, screenY - obs.height / 2 + 2, 3, 3)
    } else if (obs.type === 'skier') {
      // Orange skier
      ctx.fillStyle = COLORS.OBSTACLE_SKIER
      ctx.fillRect(obs.x, screenY - obs.height / 2 + 6, obs.width, obs.height - 6)
      // Head
      ctx.fillStyle = '#ffcc88'
      ctx.fillRect(obs.x + 4, screenY - obs.height / 2, 8, 8)
      // Skis
      ctx.fillStyle = '#333333'
      ctx.fillRect(obs.x - 2, screenY + obs.height / 2 - 3, obs.width + 4, 3)
    }
  }
}

function drawRivals(ctx, state) {
  for (const rival of state.rivals) {
    const screenY = worldToScreen(rival.y, state.worldY)
    const x = rival.x
    const w = SKIER.WIDTH
    const h = SKIER.HEIGHT

    // Body (green jersey)
    ctx.fillStyle = RIVAL.BODY_COLOR
    ctx.fillRect(x - w / 2, screenY - h / 2 + 6, w, h - 10)

    // Head
    ctx.fillStyle = '#ffcc88'
    ctx.fillRect(x - 4, screenY - h / 2, 8, 8)

    // Gold helmet
    ctx.fillStyle = RIVAL.HELMET_COLOR
    ctx.fillRect(x - 5, screenY - h / 2 - 1, 10, 5)

    // Skis
    ctx.fillStyle = COLORS.SKI_SKIS
    ctx.fillRect(x - w / 2 - 2, screenY + h / 2 - 4, w + 4, 3)

    // NPC label above head
    ctx.fillStyle = RIVAL.HELMET_COLOR
    ctx.font = FONTS.SMALL
    ctx.textAlign = 'center'
    ctx.fillText(RIVAL.LABEL, x, screenY - h / 2 - 6)
  }
}

function drawSkier(ctx, state) {
  const { x, y, width, height, vx } = state.skier

  // Body (red jacket)
  ctx.fillStyle = COLORS.SKI_BODY
  ctx.fillRect(x - width / 2, y - height / 2 + 6, width, height - 10)

  // Head
  ctx.fillStyle = '#ffcc88'
  ctx.fillRect(x - 4, y - height / 2, 8, 8)

  // Helmet
  ctx.fillStyle = '#4444ff'
  ctx.fillRect(x - 5, y - height / 2 - 1, 10, 5)

  // Skis (angled based on velocity)
  ctx.fillStyle = COLORS.SKI_SKIS
  const skiOffset = Math.min(3, Math.abs(vx)) * Math.sign(vx)
  ctx.fillRect(x - width / 2 - 2 + skiOffset, y + height / 2 - 4, width + 4, 3)
}

function drawHUD(ctx, state) {
  // Top bar background
  ctx.fillStyle = COLORS.HUD_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, 36)

  ctx.font = FONTS.HUD
  ctx.textBaseline = 'top'

  // Score (left side)
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.textAlign = 'left'
  ctx.fillText(`SCORE: ${state.score}`, 10, 8)

  // Level (left side, below score)
  ctx.font = FONTS.SMALL
  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.fillText(`LVL ${state.difficulty}`, 10, 22)

  // Gates (center)
  ctx.font = FONTS.HUD
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.textAlign = 'center'
  ctx.fillText(`GATES: ${state.gatesPassed}`, CANVAS.WIDTH / 2, 8)

  // Miss indicators (X marks, right side)
  ctx.textAlign = 'right'
  let missText = ''
  for (let i = 0; i < state.maxMisses; i++) {
    if (i < state.gatesMissed) {
      missText += 'X '
    } else {
      missText += '- '
    }
  }
  ctx.fillStyle = state.gatesMissed > 0 ? COLORS.MISS_RED : COLORS.HUD_GREEN
  ctx.fillText(missText.trim(), CANVAS.WIDTH - 10, 8)

  ctx.textBaseline = 'alphabetic'
}

function drawReadyOverlay(ctx) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Title
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.TITLE
  ctx.fillText('MR. CRAWFORD', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 140)
  ctx.fillText('SLALOM', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 90)
  ctx.fillText('CHALLENGE', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 40)

  // Subtitle
  ctx.fillStyle = COLORS.TEXT_DIM
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('A SNOWPEAK RESORT PRODUCTION', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 4)

  // Instructions
  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.OVERLAY
  const instructions = [
    'LEFT/RIGHT arrows to steer',
    'Ski between the gates to score',
    'Miss 5 gates = Game Over',
    'Avoid rocks, bears & skiers!',
  ]
  instructions.forEach((line, i) => {
    ctx.fillText(line, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 50 + i * 32)
  })

  // Start prompt
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillText('PRESS SPACE TO START', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 220)
  }

  ctx.textBaseline = 'alphabetic'
}

function drawGameOverOverlay(ctx, state) {
  ctx.fillStyle = COLORS.OVERLAY_BG
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Game Over title
  ctx.fillStyle = COLORS.MISS_RED
  ctx.font = FONTS.TITLE
  ctx.fillText('GAME OVER', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 140)

  // Score summary
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.OVERLAY
  ctx.fillText(`FINAL SCORE: ${state.score}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 80)

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.SUBTITLE
  ctx.fillText(`Gates Passed: ${state.gatesPassed}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 50)
  ctx.fillText(`Difficulty Reached: ${state.difficulty}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 20)

  // High Scores Section
  const scores = getSlalomScores()

  ctx.fillStyle = '#ffcc00'
  ctx.font = FONTS.SUBTITLE
  ctx.fillText('--- HIGH SCORES ---', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 20)

  ctx.fillStyle = COLORS.TEXT_WHITE
  ctx.font = FONTS.SMALL
  ctx.fillText(`TODAY: ${scores.daily.record.score} by ${scores.daily.record.name}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 50)
  ctx.fillText(`ALL-TIME: ${scores.allTime.score} by ${scores.allTime.name}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 75)

  // Champion message
  if (state.score >= GAME.CHAMPION_SCORE) {
    ctx.fillStyle = '#ffcc00'
    ctx.font = FONTS.OVERLAY
    ctx.fillText('CHAMPION RUN!', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 110)
  }

  // Restart prompt
  ctx.fillStyle = COLORS.HUD_GREEN
  ctx.font = FONTS.SUBTITLE
  const blink = Math.floor(Date.now() / 500) % 2
  if (blink) {
    ctx.fillText('PRESS SPACE TO PLAY AGAIN', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 170)
  }

  ctx.textBaseline = 'alphabetic'
}
