import { useState, useCallback, useEffect } from 'react'
import SlalomGame from '../slalom/SlalomGame'
import DefendGame from '../defend/DefendGame'
import SnowballGame from '../snowball/SnowballGame'
import DriveInTrailer from './DriveInTrailer'
import WhiteOutGame from '../whiteout/WhiteOutGame'

function BonusContent({ onBack }) {
  const [phase, setPhase] = useState('menu') // 'menu' | 'slalom' | 'defend' | 'snowball' | 'whiteout' | 'notes' | 'trailer'

  const handleSlalomGameOver = useCallback(() => {
    setPhase('menu')
  }, [])

  const handleDefendGameOver = useCallback(() => {
    setPhase('menu')
  }, [])

  const handleSnowballGameOver = useCallback(() => {
    setPhase('menu')
  }, [])

  const handleWhiteoutGameOver = useCallback(() => {
    setPhase('menu')
  }, [])

  // Handle keyboard shortcuts for menu navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key

      if (phase === 'menu') {
        if (key === '1') setPhase('slalom')
        else if (key === '2') setPhase('defend')
        else if (key === '3') setPhase('snowball')
        else if (key === '4') setPhase('whiteout')
        else if (key === '5') setPhase('trailer')
        else if (key === '6') setPhase('notes')
        else if (key === '7') onBack()
      } else if (phase === 'notes') {
        // Any key or Escape to go back from notes
        if (key === 'Escape' || key === 'b' || key === 'B') {
          setPhase('menu')
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [phase, onBack])

  if (phase === 'slalom') {
    return (
      <SlalomGame
        standalone={false}
        onGameOver={handleSlalomGameOver}
      />
    )
  }

  if (phase === 'defend') {
    return (
      <DefendGame
        standalone={false}
        onGameOver={handleDefendGameOver}
      />
    )
  }

  if (phase === 'snowball') {
    return (
      <SnowballGame
        standalone={false}
        onGameOver={handleSnowballGameOver}
      />
    )
  }

  if (phase === 'whiteout') {
    return (
      <WhiteOutGame
        standalone={false}
        onGameOver={handleWhiteoutGameOver}
      />
    )
  }

  if (phase === 'trailer') {
    return <DriveInTrailer onBack={() => setPhase('menu')} />
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

          <div className="output-line output-title">v1.9 -- White Out</div>
          <div className="output-line output-normal">  - New arcade mini-game: White Out!</div>
          <div className="output-line output-normal">  - Classic brick-breaking action with 5 levels</div>
          <div className="output-line output-normal">  - Powerups: wide paddle, multiball, slow motion</div>
          <div className="output-line output-normal">  - Hidden arcade cabinet in the Summit Shelter (expert mode)</div>
          <div className="output-line output-normal">  - Requires bag of tokens to play</div>
          <div className="output-line output-normal">  - Combo scoring system for consecutive hits</div>
          <div className="output-line output-normal">  - Touch/click and keyboard controls</div>
          <div className="output-line output-normal">  - Available in Bonus Content menu and in-game</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.8 -- Snowball Showdown</div>
          <div className="output-line output-normal">  - New arcade mini-game: Snowball Showdown!</div>
          <div className="output-line output-normal">  - Turn-based snowball fight with AI opponent</div>
          <div className="output-line output-normal">  - Hidden arcade cabinet in the general store (expert mode)</div>
          <div className="output-line output-normal">  - Requires game tokens from the abandoned cabin to play</div>
          <div className="output-line output-normal">  - Old Dad NPC hints at tokens and the arcade</div>
          <div className="output-line output-normal">  - Touch/click controls for mobile play</div>
          <div className="output-line output-normal">  - Available in Bonus Content menu and in-game</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.7 -- Defend the Village</div>
          <div className="output-line output-normal">  - New arcade mini-game: Defend the Village from wolves and bears!</div>
          <div className="output-line output-normal">  - Hidden dusty arcade cabinet in the locked basement</div>
          <div className="output-line output-normal">  - Boss bear finale after 20 animals defeated</div>
          <div className="output-line output-normal">  - Ammo/reload system with 5-shot clips</div>
          <div className="output-line output-normal">  - Available in Bonus Content menu and in-game</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.6 -- Expert Mode (BETA)</div>
          <div className="output-line output-normal">  - New Expert Mode with double-size map (24 rooms vs 12)</div>
          <div className="output-line output-normal">  - 12 new locations: Staff areas, village expansion, mountain zones</div>
          <div className="output-line output-normal">  - Modified item discovery: explore to find critical items</div>
          <div className="output-line output-normal">  - Expert mode winners prioritized on leaderboard</div>
          <div className="output-line output-normal">  - Quit/restart command added to all modes</div>
          <div className="output-line output-normal">&nbsp;</div>

          <div className="output-line output-title">v1.5 -- Mobile & Responsive</div>
          <div className="output-line output-normal">  - Fully responsive layout for phones and tablets</div>
          <div className="output-line output-normal">  - Touch controls for the slalom arcade game</div>
          <div className="output-line output-normal">  - Smarter obstacle placement for fairer gameplay</div>
          <div className="output-line output-normal">  - NPC portraits for all characters</div>
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
          onClick={() => setPhase('defend')}
        >
          [2] PLAY DEFEND THE VILLAGE
          <span className="mode-desc">Protect the village from wolves and bears!</span>
        </button>
        <button
          className="mode-button"
          onClick={() => setPhase('snowball')}
        >
          [3] PLAY SNOWBALL SHOWDOWN
          <span className="mode-desc">Turn-based snowball fight — dodge and throw!</span>
        </button>
        <button
          className="mode-button"
          onClick={() => setPhase('whiteout')}
        >
          [4] PLAY WHITE OUT
          <span className="mode-desc">Classic brick-breaking arcade action!</span>
        </button>
        <button
          className="mode-button"
          onClick={() => setPhase('trailer')}
        >
          [5] WATCH TRAILER
          <span className="mode-desc">Drive-in movie theater experience</span>
        </button>
        <button
          className="mode-button"
          onClick={() => setPhase('notes')}
        >
          [6] RELEASE NOTES
          <span className="mode-desc">View version history and changelog</span>
        </button>
        <button
          className="mode-button"
          onClick={onBack}
        >
          [7] BACK
          <span className="mode-desc">Return to the start screen</span>
        </button>
      </div>
    </div>
  )
}

export default BonusContent
