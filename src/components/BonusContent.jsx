import { useState, useCallback } from 'react'
import SlalomGame from '../slalom/SlalomGame'

function BonusContent() {
  const [phase, setPhase] = useState('menu') // 'menu' | 'slalom' | 'notes'

  const handleSlalomGameOver = useCallback(() => {
    setPhase('menu')
  }, [])

  if (phase === 'slalom') {
    return (
      <SlalomGame
        standalone={true}
        onGameOver={handleSlalomGameOver}
      />
    )
  }

  if (phase === 'notes') {
    return (
      <div className="terminal">
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
          <div className="welcome-title">RELEASE NOTES</div>
          <div className="output-line output-normal">&nbsp;</div>
          <div className="output-line output-system">{'='.repeat(40)}</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.4 -- Game Room & Custom Arcade Game</div>
          <div className="output-line output-normal">  - Added a game room off the lodge bar</div>
          <div className="output-line output-normal">  - Custom-built slalom arcade mini-game with retro 80s graphics</div>
          <div className="output-line output-normal">  - NPC rival skiers and cheering spectator crowds</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.3 -- High Score Table</div>
          <div className="output-line output-normal">  - Leaderboard tracking for completed adventures</div>
          <div className="output-line output-normal">  - Player stats: steps taken, elapsed time, game mode</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.2 -- Images & Sound</div>
          <div className="output-line output-normal">  - Character portraits and location images</div>
          <div className="output-line output-normal">  - Web Audio API sound effects throughout the adventure</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.1 -- Easy Mode</div>
          <div className="output-line output-normal">  - Multiple choice option for beginner-friendly gameplay</div>
          <div className="output-line output-normal">  - Smart context-sensitive choice generation</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.0 -- First Playable Version</div>
          <div className="output-line output-normal">  - Complete Zork-style text adventure</div>
          <div className="output-line output-normal">  - 10+ rooms, NPCs, puzzles, and the Secret of Snowpeak Resort</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-system">{'='.repeat(40)}</div>
          <div className="output-line output-normal">&nbsp;</div>
        </div>
        <div className="mode-select">
          <button
            className="mode-button"
            onClick={() => setPhase('menu')}
            autoFocus
          >
            BACK
            <span className="mode-desc">Return to bonus content menu</span>
          </button>
        </div>
      </div>
    )
  }

  // Menu phase
  return (
    <div className="terminal">
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
        <div className="welcome-title">BONUS CONTENT</div>
        <div className="welcome-subtitle">Mini-games & extras</div>
        <div className="output-line output-normal">&nbsp;</div>
      </div>
      <div className="mode-select">
        <button
          className="mode-button"
          onClick={() => setPhase('slalom')}
          autoFocus
        >
          [1] PLAY SLALOM CHALLENGE
          <span className="mode-desc">Hit the slopes in the 80s arcade ski game</span>
        </button>
        <button
          className="mode-button"
          onClick={() => setPhase('notes')}
        >
          [2] RELEASE NOTES
          <span className="mode-desc">View version history and changelog</span>
        </button>
      </div>
    </div>
  )
}

export default BonusContent
