import { useState } from 'react'
import Terminal from './components/Terminal'
import NameEntry from './components/NameEntry'
import { useGame } from './hooks/useGame'

function Game({ playerInfo }) {
  const { gameState, processCommand } = useGame(playerInfo.name, playerInfo.mode)

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
