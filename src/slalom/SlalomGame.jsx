// Slalom Challenge — React component wrapper
// Canvas, game loop, keyboard input, phase management

import { useRef, useEffect, useCallback, useState } from 'react'
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

    // Game over transition happens, but we wait for user input
    // (Space key or tap) before calling onGameOver callback

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
          } else if (onGameOver) {
            // In integrated mode, exit back to adventure game
            onGameOver({ score: state.score, gatesPassed: state.gatesPassed, difficulty: state.difficulty })
          }
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

  // Touch helpers
  const handleStart = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'playing' }
    } else if (state.phase === 'gameover') {
      if (standalone) {
        stateRef.current = { ...createSlalomState(), phase: 'ready' }
      } else if (onGameOver) {
        onGameOver({ score: state.score, gatesPassed: state.gatesPassed, difficulty: state.difficulty })
      }
    }
  }, [standalone, onGameOver])

  const setLeft = useCallback((down) => {
    stateRef.current = {
      ...stateRef.current,
      input: { ...stateRef.current.input, left: down },
    }
  }, [])

  const setRight = useCallback((down) => {
    stateRef.current = {
      ...stateRef.current,
      input: { ...stateRef.current.input, right: down },
    }
  }, [])

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
            <button
              className="arcade-touch-btn"
              onTouchStart={(e) => { e.preventDefault(); setLeft(true) }}
              onTouchEnd={(e) => { e.preventDefault(); setLeft(false) }}
              onMouseDown={() => setLeft(true)}
              onMouseUp={() => setLeft(false)}
              onMouseLeave={() => setLeft(false)}
            >&#9664;</button>
            <button
              className="arcade-touch-btn arcade-touch-start"
              onTouchStart={(e) => { e.preventDefault(); handleStart() }}
              onMouseDown={handleStart}
            >START</button>
            <button
              className="arcade-touch-btn"
              onTouchStart={(e) => { e.preventDefault(); setRight(true) }}
              onTouchEnd={(e) => { e.preventDefault(); setRight(false) }}
              onMouseDown={() => setRight(true)}
              onMouseUp={() => setRight(false)}
              onMouseLeave={() => setRight(false)}
            >&#9654;</button>
          </div>
        </div>
        <div className="arcade-base" />
      </div>
    </div>
  )
}
