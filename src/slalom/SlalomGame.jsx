// Slalom Challenge — React component wrapper
// Canvas, game loop, keyboard input, phase management

import { useRef, useEffect, useCallback } from 'react'
import { CANVAS } from './slalomConfig.js'
import { createSlalomState, tick } from './slalomEngine.js'
import { render } from './slalomRenderer.js'
import { playSlalomSound } from './slalomSounds.js'

export default function SlalomGame({ standalone = false, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(createSlalomState())
  const rafRef = useRef(null)

  // Game loop
  const loop = useCallback(() => {
    const prev = stateRef.current
    const next = tick(prev)
    stateRef.current = next

    // Play sounds by comparing events
    for (const event of next.events) {
      playSlalomSound(event)
    }

    // Render
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      render(ctx, next)
    }

    // Check for game over transition
    if (prev.phase === 'playing' && next.phase === 'gameover') {
      // In integrated mode, notify parent after a delay
      if (!standalone && onGameOver) {
        setTimeout(() => {
          onGameOver({ score: next.score, gatesPassed: next.gatesPassed, difficulty: next.difficulty })
        }, 3000)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [standalone, onGameOver])

  // Start the loop
  useEffect(() => {
    // Render the initial ready screen
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
          stateRef.current = { ...state, phase: 'playing' }
        } else if (state.phase === 'gameover') {
          if (standalone) {
            // Restart in standalone mode
            stateRef.current = { ...createSlalomState(), phase: 'ready' }
          }
          // In integrated mode, Space does nothing (parent handles exit)
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (!standalone && onGameOver) {
          // Allow escape to quit back to terminal
          const s = stateRef.current
          onGameOver({ score: s.score, gatesPassed: s.gatesPassed, difficulty: s.difficulty })
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stateRef.current = {
          ...stateRef.current,
          input: { ...stateRef.current.input, left: true },
        }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        stateRef.current = {
          ...stateRef.current,
          input: { ...stateRef.current.input, right: true },
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') {
        stateRef.current = {
          ...stateRef.current,
          input: { ...stateRef.current.input, left: false },
        }
      }
      if (e.key === 'ArrowRight') {
        stateRef.current = {
          ...stateRef.current,
          input: { ...stateRef.current.input, right: false },
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [standalone, onGameOver])

  return (
    <div className="slalom-container">
      <div className="arcade-cabinet">
        <div className="arcade-top" />
        <div className="arcade-marquee">MR. CRAWFORD SLALOM CHALLENGE</div>
        <div className="arcade-screen-bezel">
          <canvas
            ref={canvasRef}
            width={CANVAS.WIDTH}
            height={CANVAS.HEIGHT}
            className="slalom-canvas"
          />
        </div>
        <div className="arcade-controls">
          <div className="arcade-controls-inner">
            <div className="arcade-stick" />
            <div className="arcade-buttons">
              <div className="arcade-btn" />
              <div className="arcade-btn" />
            </div>
          </div>
        </div>
        <div className="arcade-base" />
      </div>
    </div>
  )
}
