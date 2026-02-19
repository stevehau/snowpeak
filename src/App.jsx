import { useState, useEffect, useRef, useCallback } from 'react'
import Terminal from './components/Terminal'
import NameEntry from './components/NameEntry'
import BonusContent from './components/BonusContent'
import { useGame } from './hooks/useGame'
import { playSound } from './engine/sounds'
import SlalomGame from './slalom/SlalomGame'
import DefendGame from './defend/DefendGame'
import SnowballGame from './snowball/SnowballGame'
import { syncSlalomScoresFromCloud } from './slalom/slalomScores'
import DriveInTrailer from './components/DriveInTrailer'

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

  const handleDefendGameOver = useCallback((result) => {
    dispatch({ type: 'DEFEND_RESULT', payload: result })
  }, [dispatch])

  const handleSnowballGameOver = useCallback((result) => {
    dispatch({ type: 'SNOWBALL_RESULT', payload: result })
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

  // Show defend game when launched from basement arcade
  if (gameState.launchDefend) {
    return (
      <DefendGame
        standalone={false}
        onGameOver={handleDefendGameOver}
      />
    )
  }

  // Show snowball game when launched from store arcade
  if (gameState.launchSnowball) {
    return (
      <SnowballGame
        standalone={false}
        onGameOver={handleSnowballGameOver}
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

  // Standalone defend mode via #defend hash
  if (hash === '#defend') {
    return <DefendGame standalone={true} />
  }

  // Standalone snowball mode via #snowball hash
  if (hash === '#snowball') {
    return <SnowballGame standalone={true} />
  }

  // Standalone trailer via #trailer hash (shareable link)
  if (hash === '#trailer') {
    return <DriveInTrailer standalone={true} onBack={() => { window.location.hash = ''; setHash('') }} />
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
