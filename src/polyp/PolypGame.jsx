// Polyp Sniper — React component wrapper
// Canvas game loop, keyboard + mouse/touch input, arcade cabinet UI

import { useRef, useEffect, useCallback } from 'react'
import { CANVAS } from './polypConfig.js'
import { createPolypState, tick, handleSnip } from './polypEngine.js'
import { render } from './polypRenderer.js'
import { playPolypSound } from './polypSounds.js'

export default function PolypGame({ standalone = false, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(createPolypState())
  const rafRef = useRef(null)

  // Convert client coords to canvas coords
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

  // End game callback
  const endGame = useCallback((state) => {
    if (standalone) {
      stateRef.current = { ...createPolypState(), phase: 'ready' }
    } else if (onGameOver) {
      onGameOver({
        score: state.score,
        polypHits: state.polypHits,
        accuracy: state.totalClicks > 0 ? Math.round((state.polypHits / state.totalClicks) * 100) : 0,
        elapsedMs: state.elapsedMs,
        won: state.phase === 'victory',
      })
    }
  }, [standalone, onGameOver])

  // Game loop
  const loop = useCallback(() => {
    const prev = stateRef.current

    // Play queued events from prior frame
    if (prev.events.length > 0) {
      for (const ev of prev.events) playPolypSound(ev)
    }

    const next = tick({ ...prev, events: [] })
    stateRef.current = next

    // Play events from this tick
    for (const ev of next.events) playPolypSound(ev)

    // Render
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      render(ctx, next)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // Start loop on mount
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
        if (state.phase === 'gameover' || state.phase === 'victory') {
          endGame(state)
          return
        }
        // During play, space also snips
        if (state.phase === 'playing') {
          stateRef.current = handleSnip(state)
          return
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (!standalone && onGameOver) {
          onGameOver({
            score: state.score,
            polypHits: state.polypHits,
            accuracy: 0,
            elapsedMs: state.elapsedMs,
            won: false,
          })
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
      if (e.key === 'ArrowLeft') stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, left: false } }
      if (e.key === 'ArrowRight') stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, right: false } }
      if (e.key === 'ArrowUp') stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, up: false } }
      if (e.key === 'ArrowDown') stateRef.current = { ...stateRef.current, input: { ...stateRef.current.input, down: false } }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [standalone, onGameOver, endGame])

  // Canvas click handler
  const handleCanvasTap = useCallback((clientX, clientY) => {
    const pos = getCanvasPos(clientX, clientY)
    if (!pos) return
    const state = stateRef.current

    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
      return
    }

    if (state.phase === 'playing') {
      // Move reticle to click position, then snip
      const aimed = { ...state, reticle: { x: pos.x, y: pos.y } }
      stateRef.current = handleSnip(aimed)
      return
    }

    if (state.phase === 'gameover' || state.phase === 'victory') {
      endGame(state)
    }
  }, [getCanvasPos, endGame])

  // Mouse move for reticle tracking
  const handleMouseMove = useCallback((e) => {
    const state = stateRef.current
    if (state.phase !== 'playing') return
    const pos = getCanvasPos(e.clientX, e.clientY)
    if (!pos) return
    stateRef.current = { ...state, reticle: { x: pos.x, y: pos.y } }
  }, [getCanvasPos])

  // Input helpers for arcade buttons
  const setInput = useCallback((dir, down) => {
    stateRef.current = {
      ...stateRef.current,
      input: { ...stateRef.current.input, [dir]: down },
    }
  }, [])

  const handleStart = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
    } else if (state.phase === 'gameover' || state.phase === 'victory') {
      endGame(state)
    }
  }, [endGame])

  const handleSnipBtn = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'playing') {
      stateRef.current = handleSnip(state)
    }
  }, [])

  return (
    <div className="slalom-container">
      <div className="arcade-cabinet">
        <div className="arcade-top" />
        <div className="arcade-marquee">POLYP SNIPER</div>
        <div className="arcade-screen-bezel">
          <canvas
            ref={canvasRef}
            width={CANVAS.WIDTH}
            height={CANVAS.HEIGHT}
            className="slalom-canvas"
            style={{ cursor: 'crosshair', touchAction: 'none' }}
            onClick={(e) => handleCanvasTap(e.clientX, e.clientY)}
            onMouseMove={handleMouseMove}
            onTouchStart={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              if (touch) handleCanvasTap(touch.clientX, touch.clientY)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              if (!touch) return
              const pos = getCanvasPos(touch.clientX, touch.clientY)
              if (pos) stateRef.current = { ...stateRef.current, reticle: { x: pos.x, y: pos.y } }
            }}
          />
        </div>
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
              onTouchStart={(e) => { e.preventDefault(); setInput('up', true) }}
              onTouchEnd={(e) => { e.preventDefault(); setInput('up', false) }}
              onMouseDown={() => setInput('up', true)}
              onMouseUp={() => setInput('up', false)}
              onMouseLeave={() => setInput('up', false)}
            >&#9650;</button>
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
            <button
              className="arcade-touch-btn arcade-touch-start"
              onTouchStart={(e) => { e.preventDefault(); handleStart() }}
              onMouseDown={handleStart}
            >START</button>
            <button
              className="arcade-touch-btn arcade-touch-throw"
              onTouchStart={(e) => { e.preventDefault(); handleSnipBtn() }}
              onMouseDown={handleSnipBtn}
            >SNIP</button>
          </div>
        </div>
        <div className="arcade-base" />
      </div>
    </div>
  )
}
