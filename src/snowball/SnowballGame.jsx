// Snowball Showdown — React component wrapper
// Canvas, game loop, keyboard + touch/mouse input, phase management

import { useRef, useEffect, useCallback } from 'react'
import { CANVAS, PLAYER, OPPONENT } from './snowballConfig.js'
import { createSnowballState, tick, handlePlayerThrow } from './snowballEngine.js'
import { render } from './snowballRenderer.js'
import { playSnowballSound } from './snowballSounds.js'

export default function SnowballGame({ standalone = false, onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(createSnowballState())
  const rafRef = useRef(null)

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

    // Play events from between frames (e.g. handlePlayerThrow)
    if (prev.events.length > 0) {
      for (const event of prev.events) {
        playSnowballSound(event)
      }
    }

    const next = tick({ ...prev, events: [] })
    stateRef.current = next

    // Play sounds from tick
    for (const event of next.events) {
      playSnowballSound(event)
    }

    // Render
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      render(ctx, next)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [standalone, onGameOver])

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
      stateRef.current = { ...createSnowballState(), phase: 'ready' }
    } else if (onGameOver) {
      onGameOver({
        playerHits: state.player.hits,
        computerHits: state.opponent.hits,
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
          stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
          return
        }
        if (state.phase === 'playing' && state.turn === 'player' && state.turnPhase === 'throwing') {
          stateRef.current = handlePlayerThrow(state)
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
          onGameOver({
            playerHits: state.player.hits,
            computerHits: state.opponent.hits,
            won: false,
          })
        }
        return
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
  }, [standalone, onGameOver, endGame])

  // Canvas tap/click — throw or start
  const handleCanvasTap = useCallback((clientX, clientY) => {
    const pos = getCanvasPos(clientX, clientY)
    if (!pos) return

    const state = stateRef.current

    if (state.phase === 'ready') {
      stateRef.current = { ...state, phase: 'playing', startTime: Date.now() }
      return
    }

    if (state.phase === 'playing') {
      if (state.turn === 'player' && state.turnPhase === 'throwing') {
        // Tap to aim and throw
        const aimY = Math.max(OPPONENT.Y_MIN, Math.min(OPPONENT.Y_MAX, pos.y))
        const aimed = { ...state, aimY }
        stateRef.current = handlePlayerThrow(aimed)
      } else if (state.turn === 'computer') {
        // Tap to dodge (move player toward tap Y)
        const targetY = Math.max(PLAYER.Y_MIN, Math.min(PLAYER.Y_MAX, pos.y))
        stateRef.current = { ...state, player: { ...state.player, y: targetY } }
      }
      return
    }

    if (state.phase === 'gameover') {
      endGame(state)
    }
  }, [getCanvasPos, endGame])

  // Touch drag for dodging
  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return
    const state = stateRef.current
    if (state.phase !== 'playing') return

    const pos = getCanvasPos(touch.clientX, touch.clientY)
    if (!pos) return

    if (state.turn === 'computer') {
      // Dodge by dragging
      const targetY = Math.max(PLAYER.Y_MIN, Math.min(PLAYER.Y_MAX, pos.y))
      stateRef.current = { ...state, player: { ...state.player, y: targetY } }
    } else if (state.turn === 'player') {
      // Aim by dragging
      const aimY = Math.max(OPPONENT.Y_MIN, Math.min(OPPONENT.Y_MAX, pos.y))
      stateRef.current = { ...state, aimY }
    }
  }, [getCanvasPos])

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
    } else if (state.phase === 'gameover') {
      endGame(state)
    }
  }, [endGame])

  const handleThrow = useCallback(() => {
    const state = stateRef.current
    if (state.phase === 'playing' && state.turn === 'player' && state.turnPhase === 'throwing') {
      stateRef.current = handlePlayerThrow(state)
    }
  }, [])

  return (
    <div className="slalom-container">
      <div className="arcade-cabinet">
        <div className="arcade-top" />
        <div className="arcade-marquee">SNOWBALL SHOWDOWN</div>
        <div className="arcade-screen-bezel">
          <canvas
            ref={canvasRef}
            width={CANVAS.WIDTH}
            height={CANVAS.HEIGHT}
            className="slalom-canvas"
            style={{ cursor: 'crosshair', touchAction: 'none' }}
            onClick={(e) => handleCanvasTap(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              if (touch) handleCanvasTap(touch.clientX, touch.clientY)
            }}
            onTouchMove={handleTouchMove}
          />
        </div>
        <div className="arcade-controls">
          <div className="arcade-controls-inner">
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
              className="arcade-touch-btn arcade-touch-start"
              onTouchStart={(e) => { e.preventDefault(); handleStart() }}
              onMouseDown={handleStart}
            >START</button>
            <button
              className="arcade-touch-btn arcade-touch-throw"
              onTouchStart={(e) => { e.preventDefault(); handleThrow() }}
              onMouseDown={handleThrow}
            >THROW</button>
          </div>
        </div>
        <div className="arcade-base" />
      </div>
    </div>
  )
}
