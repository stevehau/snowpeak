import { useState, useEffect, useRef, useCallback } from 'react'
import Terminal from './components/Terminal'
import NameEntry from './components/NameEntry'
import BonusContent from './components/BonusContent'
import { useGame } from './hooks/useGame'
import { playSound } from './engine/sounds'
import SlalomGame from './slalom/SlalomGame'
import { syncSlalomScoresFromCloud } from './slalom/slalomScores'

function Game({ playerInfo, onRestart }) {
  const { gameState, processCommand, dispatch } = useGame(playerInfo.name, playerInfo.mode)
  const lastOutputLen = useRef(0)

  // Sync slalom scores from Firebase on game load
  useEffect(() => {
    syncSlalomScoresFromCloud()
  }, [])

  useEffect(() => {
    const newEntries = gameState.output.slice(lastOutputLen.current)
    lastOutputLen.current = gameState.output.length
    for (const entry of newEntries) {
      if (entry.type === 'sound') {
        playSound(entry.sound)
      }
    }
  }, [gameState.output])

  const handleSlalomGameOver = useCallback((result) => {
    dispatch({ type: 'SLALOM_RESULT', payload: result })
  }, [dispatch])

  // Check for restart flag
  useEffect(() => {
    if (gameState.gameRestart) {
      // Small delay so user can see the restart message
      const timer = setTimeout(() => {
        onRestart()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState.gameRestart, onRestart])

  // Show slalom game when launched from arcade machine
  if (gameState.launchSlalom) {
    return (
      <SlalomGame
        standalone={false}
        onGameOver={handleSlalomGameOver}
      />
    )
  }

  return (
    <div className="terminal">
      <Terminal
        output={gameState.output}
        onCommand={processCommand}
        gameOver={gameState.gameOver}
        mode={playerInfo.mode}
        gameState={gameState}
      />
    </div>
  )
}

function App() {
  const [playerInfo, setPlayerInfo] = useState(null)
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Standalone slalom mode via #slalom hash
  if (hash === '#slalom') {
    return <SlalomGame standalone={true} />
  }

  if (!playerInfo) {
    return (
      <div className="terminal">
        <NameEntry onSubmit={setPlayerInfo} />
      </div>
    )
  }

  if (playerInfo.mode === 'bonus') {
    return <BonusContent onBack={() => setPlayerInfo(null)} />
  }

  return <Game playerInfo={playerInfo} onRestart={() => setPlayerInfo(null)} />
}

export default App
