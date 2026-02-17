import { useState, useRef, useEffect, useCallback } from 'react'
import { getHighScores, loadScoresFromCloud, formatDate } from '../engine/scores'
import { containsProfanity } from '../engine/profanity'

function NameEntry({ onSubmit }) {
  const [name, setName] = useState('')
  const [phase, setPhase] = useState('name') // 'name' -> 'mode'
  const [nameError, setNameError] = useState('')
  const [scores, setScores] = useState(getHighScores())
  const inputRef = useRef(null)

  useEffect(() => {
    loadScoresFromCloud().then(setScores)
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [phase])

  const handleNameSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (containsProfanity(trimmed)) {
      setNameError('Please choose a more appropriate handle.')
      return
    }
    setNameError('')
    setPhase('mode')
  }, [name])

  const handleModeSelect = useCallback((mode) => {
    onSubmit({ name: name.trim(), mode })
  }, [name, onSubmit])

  // Handle keyboard shortcuts for mode selection
  useEffect(() => {
    if (phase !== 'mode') return

    const handleKeyPress = (e) => {
      const key = e.key
      if (key === '1') handleModeSelect('standard')
      else if (key === '2') handleModeSelect('easy')
      else if (key === '3') handleModeSelect('expert')
      else if (key === '4') handleModeSelect('bonus')
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [phase, handleModeSelect])

  return (
    <>
      <div className="terminal-output">
        <div className="output-line output-normal">&nbsp;</div>
        <div className="output-line output-ascii welcome-art">
{`         *  .  *  .  *  .  *  .  *
      .     *     .     *     .
            .  *  .  *  .  *
               *  .  *
                 /\\
                /  \\         *  .  *
               / /\\ \\       .  *  .
              / /  \\ \\        *  .
             / /    \\ \\      .  *
            /  \\    /  \\
           /____\\  /____\\
          / ~~~~ SNOWPEAK ~~~~ \\
         / ~~~~~ RESORT  ~~~~~ \\
        /________________________\\
       /     est. 1976            \\
      /____________________________\\`}
        </div>
        <div className="output-line output-normal">&nbsp;</div>
        <div className="welcome-title">THE SECRET OF SNOWPEAK RESORT</div>
        <div className="welcome-subtitle">A Zork-Style Text Adventure</div>
        <div className="output-line output-normal">&nbsp;</div>
        <div className="output-line output-system">
          Welcome, adventurer! Before we begin...
        </div>
        <div className="output-line output-normal">&nbsp;</div>

        {scores.length > 0 && (
          <>
            <div className="output-line output-system">
              --- TOP ADVENTURERS WHO UNLOCKED THE SECRET ---
            </div>
            <div className="output-line output-system">
              {'  #   PLAYER           STEPS  ELAPSED TIME  MODE       DATE'}
            </div>
            <div className="output-line output-system">
              {'  -   ------           -----  ------------  ----       ----'}
            </div>
            {scores.map((s, i) => (
              <div key={i} className="output-line output-system">
                {'  '}
                {String(i + 1).padEnd(4)}
                {s.name.slice(0, 15).padEnd(18)}
                {String(s.steps).padEnd(7)}
                {(s.time || '').padEnd(14)}
                {(s.mode || 'standard').padEnd(11)}
                {formatDate(s.date)}
              </div>
            ))}
            <div className="output-line output-normal">&nbsp;</div>
          </>
        )}

        {phase === 'mode' && (
          <>
            <div className="output-line output-normal">
              Welcome, {name.trim()}! Choose a mode:
            </div>
            <div className="output-line output-normal">&nbsp;</div>
          </>
        )}
      </div>

      {phase === 'name' && (
        <>
          {nameError && (
            <div className="output-line output-error" style={{ padding: '0 20px 6px' }}>
              {nameError}
            </div>
          )}
          <form className="terminal-input-form name-entry-form" onSubmit={handleNameSubmit}>
            <label className="prompt-label">What name should I call you?</label>
            <div className="name-input-row">
              <span className="prompt-char">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError('') }}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                maxLength={15}
                placeholder=""
              />
            </div>
          </form>
        </>
      )}

      {phase === 'mode' && (
        <div className="mode-select">
          <button
            className="mode-button"
            onClick={() => handleModeSelect('standard')}
            autoFocus
            ref={inputRef}
          >
            [1] STANDARD MODE
            <span className="mode-desc">Type commands freely, classic Zork style</span>
          </button>
          <button
            className="mode-button"
            onClick={() => handleModeSelect('easy')}
          >
            [2] EASY (CHEAT) MODE
            <span className="mode-desc">Choose from multiple choice options each turn, beginner friendly</span>
          </button>
          <button
            className="mode-button"
            onClick={() => handleModeSelect('expert')}
          >
            [3] EXPERT MODE (BETA)
            <span className="mode-desc">Double-size map with more locations to explore, for experienced adventurers</span>
          </button>
          <button
            className="mode-button"
            onClick={() => handleModeSelect('bonus')}
          >
            [4] BONUS CONTENT
            <span className="mode-desc">Play mini-games and view release notes</span>
          </button>
        </div>
      )}
    </>
  )
}

export default NameEntry
