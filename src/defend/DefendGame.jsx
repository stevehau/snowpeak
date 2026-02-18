// Defend the Village — React component wrapper
// Canvas, game loop, keyboard + touch/mouse input, phase management

import { useRef, useEffect, useCallback } from 'react'
import { CANVAS, PERSPECTIVE } from './defendConfig.js'
import { createDefendState, tick, handleShoot } from './defendEngine.js'
import { render } from './defendRenderer.js'
import { playDefendSound } from './defendSounds.js'

export default function DefendGame({ standalone = false, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(createDefendState())
  const rafRef = useRef(null)

  // Helper: convert a pointer/touch event to canvas-relative coords
  const getCanvasPos = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS.WIDTH / rect.width
    const scaleY = CANVAS.HEIGHT / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  // Helper: play and clear events from state
  const playEvents = useCallback((state) => {
    for (const event of state.events) {
      playDefendSound(event)
    }
    // Clear events so they don't replay
    if (state.events.length > 0) {
      stateRef.current = { ...stateRef.current, events: [] }
    }
  }, [])

  // Game loop
  const loop = useCallback(() => {
    // Play any events from handleShoot (set between frames)
    const prev = stateRef.current
    if (prev.events.length > 0) {
      for (const event of prev.events) {
        playDefendSound(event)
      }
    }

    const next = tick({ ...prev, events: [] })
    stateRef.current = next

    // Play sounds from tick
    for (const event of next.events) {
      playDefendSound(event)
    }

    // Render
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      render(ctx, next)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [standalone, onGameOver])

  // Start the loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      render(ctx, stateRef.current)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [loop])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = stateRef.current

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        if (state.phase === 'ready') {
          stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
          return
        }
        if (state.phase === 'playing') {
          stateRef.current = handleShoot(state)
          return
        }
        if (state.phase === 'gameover' || state.phase === 'victory') {
          if (standalone) {
            stateRef.current = { ...createDefendState(), phase: 'ready' }
          } else if (onGameOver) {
            onGameOver({
              defeated: state.animalsDefeated,
              total: state.totalAnimals,
              elapsedMs: state.elapsedMs,
              won: state.phase === 'victory',
            })
          }
          return
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (!standalone && onGameOver) {
          const s = stateRef.current
          onGameOver({
            defeated: s.animalsDefeated,
            total: s.totalAnimals,
            elapsedMs: s.elapsedMs,
            won: false,
          })
        }
        return
      }

      // Arrow keys for aiming
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, left: true } }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, right: true } }
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, up: true } }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, down: true } }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') {
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, left: false } }
      }
      if (e.key === 'ArrowRight') {
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, right: false } }
      }
      if (e.key === 'ArrowUp') {
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, up: false } }
      }
      if (e.key === 'ArrowDown') {
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, down: false } }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [standalone, onGameOver])

  // ---- Canvas pointer / touch controls ----
  // Tap/click on canvas: aim reticle there + fire (during play)
  // During ready/gameover/victory: act as start/restart

  const handleCanvasTap = useCallback((clientX, clientY) => {
    const pos = getCanvasPos(clientX, clientY)
    if (!pos) return

    const state = stateRef.current

    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
      return
    }

    if (state.phase === 'playing') {
      // Clamp Y so reticle stays in playable area
      const clampedY = Math.max(PERSPECTIVE.HORIZON_Y, Math.min(CANVAS.HEIGHT - 30, pos.y))
      const clampedX = Math.max(10, Math.min(CANVAS.WIDTH - 10, pos.x))
      // Move reticle to tap position and fire
      const aimed = { ...state, reticle: { x: clampedX, y: clampedY } }
      stateRef.current = handleShoot(aimed)
      return
    }

    if (state.phase === 'gameover' || state.phase === 'victory') {
      if (standalone) {
        stateRef.current = { ...createDefendState(), phase: 'ready' }
      } else if (onGameOver) {
        onGameOver({
          defeated: state.animalsDefeated,
          total: state.totalAnimals,
          elapsedMs: state.elapsedMs,
          won: state.phase === 'victory',
        })
      }
    }
  }, [getCanvasPos, standalone, onGameOver])

  // Mouse move on canvas: track reticle position (desktop hover aim)
  const handleCanvasMouseMove = useCallback((e) => {
    const state = stateRef.current
    if (state.phase !== 'playing') return
    const pos = getCanvasPos(e.clientX, e.clientY)
    if (!pos) return
    const clampedY = Math.max(PERSPECTIVE.HORIZON_Y, Math.min(CANVAS.HEIGHT - 30, pos.y))
    const clampedX = Math.max(10, Math.min(CANVAS.WIDTH - 10, pos.x))
    stateRef.current = { ...state, reticle: { x: clampedX, y: clampedY } }
  }, [getCanvasPos])

  // Touch/mouse controls for arcade buttons (fallback)
  const handleStart = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
    } else if (state.phase === 'gameover' || state.phase === 'victory') {
      if (standalone) {
        stateRef.current = { ...createDefendState(), phase: 'ready' }
      } else if (onGameOver) {
        onGameOver({
          defeated: state.animalsDefeated,
          total: state.totalAnimals,
          elapsedMs: state.elapsedMs,
          won: state.phase === 'victory',
        })
      }
    }
  }, [standalone, onGameOver])

  const setInput = useCallback((dir, down) => {
    stateRef.current = {
      ...stateRef.current,
      input: { ...stateRef.current.input, [dir]: down },
    }
  }, [])

  const handleFire = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'playing') {
      stateRef.current = handleShoot(state)
    }
  }, [])

  return (
    <div className="slalom-container">
      <div className="arcade-cabinet">
        <div className="arcade-top" />
        <div className="arcade-marquee">DEFEND THE VILLAGE</div>
        <div className="arcade-screen-bezel">
          <canvas
            ref={canvasRef}
            width={CANVAS.WIDTH}
            height={CANVAS.HEIGHT}
            className="slalom-canvas"
            style={{ cursor: 'crosshair', touchAction: 'none' }}
            onClick={(e) => handleCanvasTap(e.clientX, e.clientY)}
            onMouseMove={handleCanvasMouseMove}
            onTouchStart={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              if (touch) handleCanvasTap(touch.clientX, touch.clientY)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              if (!touch) return
              const state = stateRef.current
              if (state.phase !== 'playing') return
              const pos = getCanvasPos(touch.clientX, touch.clientY)
              if (!pos) return
              const clampedY = Math.max(PERSPECTIVE.HORIZON_Y, Math.min(CANVAS.HEIGHT - 30, pos.y))
              const clampedX = Math.max(10, Math.min(CANVAS.WIDTH - 10, pos.x))
              stateRef.current = { ...state, reticle: { x: clampedX, y: clampedY } }
            }}
          />
        </div>
        <div className="arcade-controls">
          <div className="arcade-controls-inner">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <button
                className="arcade-touch-btn"
                onTouchStart={(e) => { e.preventDefault(); setInput('up', true) }}
                onTouchEnd={(e) => { e.preventDefault(); setInput('up', false) }}
                onMouseDown={() => setInput('up', true)}
                onMouseUp={() => setInput('up', false)}
                onMouseLeave={() => setInput('up', false)}
              >&#9650;</button>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  className="arcade-touch-btn"
                  onTouchStart={(e) => { e.preventDefault(); setInput('left', true) }}
                  onTouchEnd={(e) => { e.preventDefault(); setInput('left', false) }}
                  onMouseDown={() => setInput('left', true)}
                  onMouseUp={() => setInput('left', false)}
                  onMouseLeave={() => setInput('left', false)}
                >&#9664;</button>
                <button
                  className="arcade-touch-btn"
                  onTouchStart={(e) => { e.preventDefault(); setInput('down', true) }}
                  onTouchEnd={(e) => { e.preventDefault(); setInput('down', false) }}
                  onMouseDown={() => setInput('down', true)}
                  onMouseUp={() => setInput('down', false)}
                  onMouseLeave={() => setInput('down', false)}
                >&#9660;</button>
                <button
                  className="arcade-touch-btn"
                  onTouchStart={(e) => { e.preventDefault(); setInput('right', true) }}
                  onTouchEnd={(e) => { e.preventDefault(); setInput('right', false) }}
                  onMouseDown={() => setInput('right', true)}
                  onMouseUp={() => setInput('right', false)}
                  onMouseLeave={() => setInput('right', false)}
                >&#9654;</button>
              </div>
            </div>
            <button
              className="arcade-touch-btn arcade-touch-start"
              onTouchStart={(e) => { e.preventDefault(); handleStart() }}
              onMouseDown={handleStart}
            >START</button>
            <button
              className="arcade-touch-btn"
              style={{ backgroundColor: '#cc2222', fontSize: '14px', padding: '8px 16px' }}
              onTouchStart={(e) => { e.preventDefault(); handleFire() }}
              onMouseDown={handleFire}
            >FIRE</button>
          </div>
        </div>
        <div className="arcade-base" />
      </div>
    </div>
  )
}
