import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { generateChoices } from '../engine/choices'

function Terminal({ output, onCommand, gameOver, mode, gameState }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  const choices = useMemo(() => {
    if (mode !== 'easy' || gameOver || !gameState?.currentRoomId) return []
    return generateChoices(gameState)
  }, [mode, gameOver, gameState])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    setHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)
    setInput('')
    onCommand(trimmed)
  }, [input, onCommand])

  const handleChoiceClick = useCallback((command) => {
    onCommand(command)
  }, [onCommand])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistoryIndex(prev => {
        const next = prev === -1 ? history.length - 1 : Math.max(0, prev - 1)
        if (history[next] !== undefined) {
          setInput(history[next])
        }
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistoryIndex(prev => {
        const next = prev + 1
        if (next >= history.length) {
          setInput('')
          return -1
        }
        setInput(history[next])
        return next
      })
    }
  }, [history])

  const handleTerminalClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <>
      <div className="terminal-output" ref={outputRef} onClick={handleTerminalClick}>
        {output.map((line, i) => (
          line.type === 'sound' ? null :
          line.type === 'image' ? (
            <div key={i} className="output-line output-image">
              <img src={line.src} alt={line.text || 'image'} />
            </div>
          ) : (
            <div key={i} className={`output-line output-${line.type || 'normal'}`}>
              {line.text}
            </div>
          )
        ))}
      </div>
      {!gameOver && mode === 'easy' && choices.length > 0 && (
        <div className="choices-container">
          {choices.map((choice, i) => (
            <button
              key={`${choice.command}-${i}`}
              className="choice-button"
              onClick={() => handleChoiceClick(choice.command)}
            >
              [{i + 1}] {choice.label}
            </button>
          ))}
          <button
            className="choice-button choice-button-wildcard"
            onClick={() => inputRef.current?.focus()}
          >
            [*] Type a command...
          </button>
        </div>
      )}
      {!gameOver && (
        <form className="terminal-input-form" onSubmit={handleSubmit}>
          <span className="prompt-char">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      )}
    </>
  )
}

export default Terminal
