import { useState, useEffect, useRef } from 'react'
import Terminal from './components/Terminal'
import NameEntry from './components/NameEntry'
import { useGame } from './hooks/useGame'
import { playVictoryFanfare } from './engine/sounds'

function Game({ playerInfo }) {
  const { gameState, processCommand } = useGame(playerInfo.name, playerInfo.mode)
  const fanfarePlayed = useRef(false)

  useEffect(() => {
    if (gameState.gameOver && !fanfarePlayed.current) {
      fanfarePlayed.current = true
      playVictoryFanfare()
    }
  }, [gameState.gameOver])

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

  if (!playerInfo) {
    return (
      <div className="terminal">
        <NameEntry onSubmit={setPlayerInfo} />
      </div>
    )
  }

  return <Game playerInfo={playerInfo} />
}

export default App
