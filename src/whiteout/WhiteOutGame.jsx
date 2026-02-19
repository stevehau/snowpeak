// White Out — React component wrapper
// Canvas, game loop, keyboard + touch/mouse input, phase management
// Mobile-responsive with touch-first controls

import { useRef, useEffect, useCallback, useState } from 'react'
import { CANVAS, PADDLE } from './whiteoutConfig.js'
import { createWhiteoutState, tick, serveBall } from './whiteoutEngine.js'
import { render } from './whiteoutRenderer.js'
import { playWhiteoutSound } from './whiteoutSounds.js'

// Detect touch device
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function WhiteOutGame({ standalone = false, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(createWhiteoutState())
  const rafRef = useRef(null)
  const containerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(isTouchDevice)

  // Track real viewport height for mobile (handles address bar)
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--wo-vh', `${vh}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    window.addEventListener('orientationchange', () => {
      setTimeout(setVh, 150)
    })
    return () => {
      window.removeEventListener('resize', setVh)
    }
  }, [])

  // Re-detect on resize (tablet rotation etc)
  useEffect(() => {
    const check = () => setIsMobile(isTouchDevice())
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Helper: convert pointer/touch to canvas coords
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

  // Game loop
  const loop = useCallback(() => {
    const prev = stateRef.current

    // Play events from between frames
    if (prev.events.length > 0) {
      for (const event of prev.events) {
        playWhiteoutSound(event)
      }
    }

    const next = tick({ ...prev, events: [] })
    stateRef.current = next

    // Play sounds from tick
    for (const event of next.events) {
      playWhiteoutSound(event)
    }

    // Render
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      render(ctx, next)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // Start loop
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

  // Handle game end
  const endGame = useCallback((state) => {
    if (standalone) {
      stateRef.current = { ...createWhiteoutState(), phase: 'ready' }
    } else if (onGameOver) {
      onGameOver({
        score: state.score,
        level: state.level,
        won: state.winner === 'player',
      })
    }
  }, [standalone, onGameOver])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = stateRef.current

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        if (state.phase === 'ready') {
          stateRef.current = { ...state, phase: 'serving', startTime: Date.now() }
          return
        }
        if (state.phase === 'serving') {
          stateRef.current = serveBall(state)
          return
        }
        if (state.phase === 'gameover') {
          endGame(state)
          return
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (!standalone && onGameOver) {
          onGameOver({ score: state.score, level: state.level, won: false })
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, left: true } }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, right: true } }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') {
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, left: false } }
      }
      if (e.key === 'ArrowRight') {
        stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, right: false } }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [standalone, onGameOver, endGame])

  // Track whether current touch is a tap (no significant move) or a drag
  const touchStartRef = useRef(null)

  // Canvas tap/click — used for state transitions (start, serve, game over)
  const handleCanvasTap = useCallback((clientX, clientY) => {
    const state = stateRef.current

    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'serving', startTime: Date.now() }
      return
    }

    if (state.phase === 'serving') {
      stateRef.current = serveBall(state)
      return
    }

    if (state.phase === 'gameover') {
      endGame(state)
      return
    }
  }, [endGame])

  // Touch/mouse drag for paddle control — direct position mapping
  const handlePointerMove = useCallback((clientX) => {
    const state = stateRef.current
    if (state.phase !== 'playing' && state.phase !== 'serving') return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS.WIDTH / rect.width
    const canvasX = (clientX - rect.left) * scaleX

    const paddleX = Math.max(0, Math.min(CANVAS.WIDTH - state.paddle.w, canvasX - state.paddle.w / 2))
    stateRef.current = { ...state, paddle: { ...state.paddle, x: paddleX } }

    // Also move stuck ball
    if (state.phase === 'serving' && state.balls[0] && state.balls[0].stuck) {
      const ball = state.balls[0]
      stateRef.current = {
        ...stateRef.current,
        balls: [{ ...ball, x: paddleX + state.paddle.w / 2 }],
      }
    }
  }, [])

  const setInput = useCallback((dir, down) => {
    stateRef.current = {
      ...stateRef.current,
      input: { ...stateRef.current.input, [dir]: down },
    }
  }, [])

  const handleStart = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'serving', startTime: Date.now() }
    } else if (state.phase === 'serving') {
      stateRef.current = serveBall(state)
    } else if (state.phase === 'gameover') {
      endGame(state)
    }
  }, [endGame])

  // ── Touch event handlers (enhanced for mobile) ──

  const onTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return

    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }

    const state = stateRef.current
    // On non-playing phases, tap does actions
    if (state.phase === 'ready' || state.phase === 'gameover') {
      handleCanvasTap(touch.clientX, touch.clientY)
      return
    }

    // Move paddle immediately on touch
    handlePointerMove(touch.clientX)

    // If serving, also serve on tap
    if (state.phase === 'serving') {
      stateRef.current = serveBall(state)
    }
  }, [handleCanvasTap, handlePointerMove])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) handlePointerMove(touch.clientX)
  }, [handlePointerMove])

  // Prevent iOS rubber-banding / pull-to-refresh inside game
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const prevent = (e) => {
      // Only prevent default on the game container
      if (e.target.closest('.wo-game-container')) {
        e.preventDefault()
      }
    }
    container.addEventListener('touchmove', prevent, { passive: false })
    return () => container.removeEventListener('touchmove', prevent)
  }, [])

  return (
    <div className="slalom-container wo-game-container" ref={containerRef}>
      <div className="arcade-cabinet">
        <div className="arcade-top" />
        <div className="arcade-marquee wo-marquee">WHITE OUT</div>
        <div className="arcade-screen-bezel wo-screen-bezel">
          <canvas
            ref={canvasRef}
            width={CANVAS.WIDTH}
            height={CANVAS.HEIGHT}
            className="slalom-canvas"
            style={{ cursor: 'pointer', touchAction: 'none' }}
            onClick={(e) => handleCanvasTap(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          />
        </div>
        {isMobile ? (
          /* Mobile: simplified bottom bar — just START/SERVE since canvas handles paddle */
          <div className="arcade-controls wo-controls-mobile">
            <div className="arcade-controls-inner wo-controls-inner-mobile">
              <button
                className="arcade-touch-btn wo-mobile-btn"
                onTouchStart={(e) => { e.preventDefault(); setInput('left', true) }}
                onTouchEnd={(e) => { e.preventDefault(); setInput('left', false) }}
              >&#9664;</button>
              <button
                className="arcade-touch-btn arcade-touch-start wo-mobile-btn"
                onTouchStart={(e) => { e.preventDefault(); handleStart() }}
              >START</button>
              <button
                className="arcade-touch-btn arcade-touch-throw wo-mobile-btn"
                onTouchStart={(e) => { e.preventDefault(); handleStart() }}
              >SERVE</button>
              <button
                className="arcade-touch-btn wo-mobile-btn"
                onTouchStart={(e) => { e.preventDefault(); setInput('right', true) }}
                onTouchEnd={(e) => { e.preventDefault(); setInput('right', false) }}
              >&#9654;</button>
            </div>
          </div>
        ) : (
          /* Desktop: full arcade buttons */
          <div className="arcade-controls">
            <div className="arcade-controls-inner">
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
                onTouchStart={(e) => { e.preventDefault(); setInput('right', true) }}
                onTouchEnd={(e) => { e.preventDefault(); setInput('right', false) }}
                onMouseDown={() => setInput('right', true)}
                onMouseUp={() => setInput('right', false)}
                onMouseLeave={() => setInput('right', false)}
              >&#9654;</button>
              <button
                className="arcade-touch-btn arcade-touch-start"
                onTouchStart={(e) => { e.preventDefault(); handleStart() }}
                onMouseDown={handleStart}
              >START</button>
              <button
                className="arcade-touch-btn arcade-touch-throw"
                onTouchStart={(e) => { e.preventDefault(); handleStart() }}
                onMouseDown={handleStart}
              >SERVE</button>
            </div>
          </div>
        )}
        <div className="arcade-base" />
      </div>
    </div>
  )
}
