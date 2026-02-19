import {
  handleMove,
  handleLook,
  handleTake,
  handleDrop,
  handleInventory,
  handleTalk,
  handleGive,
  handleUse,
  handleRead,
  handleQuit,
} from './commands'
import { helpText } from '../data/story'
import { checkPuzzleTriggers } from '../data/puzzles'
import { getHighScores, formatScoreBoard, clearAllScores, formatTime } from './scores'
import { saveSlalomScore, resetSlalomScores } from '../slalom/slalomScores'

export function gameReducer(state, action) {
  if (state.gameOver && action.type !== 'ADD_OUTPUT') {
    return state
  }

  let newState

  switch (action.type) {
    case 'MOVE':
      newState = handleMove(state, action.payload)
      break
    case 'LOOK':
      newState = handleLook(state, action.payload)
      break
    case 'TAKE':
      newState = handleTake(state, action.payload)
      break
    case 'DROP':
      newState = handleDrop(state, action.payload)
      break
    case 'INVENTORY':
      newState = handleInventory(state)
      break
    case 'TALK':
      newState = handleTalk(state, action.payload)
      break
    case 'GIVE':
      newState = handleGive(state, action.payload)
      break
    case 'USE':
      newState = handleUse(state, action.payload)
      break
    case 'READ':
      newState = handleRead(state, action.payload)
      break
    case 'QUIT':
      newState = handleQuit(state)
      break
    case 'HELP': {
      const elapsed = formatTime(Date.now() - (state.startTime || Date.now()))
      const statsLine = { text: `Current stats:  ${state.turnCount} steps  |  ${elapsed} elapsed`, type: 'system' }
      const modeDisplay = state.mode === 'expert' ? 'Expert (BETA)' :
                          state.mode === 'easy' ? 'Easy' :
                          state.mode === 'standard' ? 'Standard' : state.mode || 'Standard'
      const modeLine = { text: `Current mode:   ${modeDisplay}`, type: 'system' }
      newState = {
        ...state,
        output: [...state.output, ...helpText, statsLine, modeLine],
      }
      break
    }
    case 'SCORES': {
      const scores = getHighScores()
      const showAll = action.payload?.showAll || false
      if (scores.length === 0) {
        newState = {
          ...state,
          output: [...state.output, { text: 'No high scores yet. Be the first to complete the adventure!', type: 'system' }],
        }
      } else {
        newState = {
          ...state,
          output: [...state.output, ...formatScoreBoard(scores, showAll)],
        }
      }
      break
    }
    case 'ERASE_SCORES':
      clearAllScores()
      resetSlalomScores()
      newState = {
        ...state,
        output: [
          ...state.output,
          { text: 'High score tables have been erased.', type: 'system' },
          { text: 'Adventure scores reset to defaults.', type: 'system' },
          { text: 'Slalom scores reset to Coach Joe (1000).', type: 'system' },
        ],
      }
      break
    case 'SLALOM_RESULT': {
      const { score, gatesPassed, difficulty } = action.payload

      // Save the score and get results
      const scoreResult = saveSlalomScore(state.playerName || 'Player', score)

      const lines = [
        { text: '', type: 'normal' },
        { text: 'The arcade screen fades and you step back from the machine.', type: 'normal' },
        { text: `Final Score: ${score}  |  Gates: ${gatesPassed}  |  Difficulty: ${difficulty}`, type: 'system' },
      ]

      // Show high score achievements
      if (scoreResult.newAllTimeRecord) {
        lines.push({ text: 'NEW ALL-TIME HIGH SCORE!', type: 'victory' })
      } else if (scoreResult.newDailyRecord) {
        lines.push({ text: 'NEW DAILY HIGH SCORE!', type: 'victory' })
      }

      if (scoreResult.beatCoachJoe) {
        lines.push({ text: "You beat Coach Joe's high score of 1000! You are the Slalom Champion!", type: 'victory' })
      } else {
        lines.push({ text: `Coach Joe's high score is 1000. Think you can beat it?`, type: 'normal' })
      }

      newState = {
        ...state,
        launchSlalom: false,
        output: [...state.output, ...lines],
        puzzles: scoreResult.beatCoachJoe
          ? { ...state.puzzles, slalom_champion: true }
          : state.puzzles,
      }
      break
    }
    case 'DEFEND_RESULT': {
      const { defeated, total, elapsedMs, won } = action.payload

      const lines = [
        { text: '', type: 'normal' },
        { text: 'The old CRT fades to black and you step back from the dusty cabinet, blinking in the dim basement light.', type: 'normal' },
      ]

      if (won) {
        lines.push({ text: `You defended the village! ${defeated} animals + BOSS defeated in ${Math.round(elapsedMs / 1000)}s!`, type: 'victory' })
        lines.push({ text: 'The ancient machine plays a triumphant 8-bit fanfare. "VILLAGE CHAMPION" flashes across the screen.', type: 'normal' })
      } else {
        lines.push({ text: `The village fell... You deterred ${defeated} of ${total} animals before being overrun.`, type: 'system' })
        lines.push({ text: 'The cabinet lets out a mournful beep. "GAME OVER - INSERT COIN" scrolls across the screen.', type: 'normal' })
      }

      let defendState = {
        ...state,
        launchDefend: false,
        output: [...state.output, ...lines],
        puzzles: won
          ? { ...state.puzzles, village_champion: true }
          : state.puzzles,
      }

      // Expert mode: the arcade cabinet shakes loose the fuse wedged behind it
      if (state.mode === 'expert' && !state.puzzles.fuse_dislodged) {
        const basementRoom = defendState.rooms.basement
        const fuseItem = defendState.items.fuse
        if (fuseItem && fuseItem.hidden && basementRoom) {
          const fuseLines = [
            { text: '', type: 'normal' },
            { text: 'As the ancient cabinet powers down, it shudders violently — decades of built-up static discharge and rickety wiring sending one final THUNK through its frame. The whole machine lurches sideways an inch on the stone floor.', type: 'normal' },
            { text: '', type: 'normal' },
            { text: 'CLANG!', type: 'title' },
            { text: '', type: 'normal' },
            { text: 'Something heavy and metallic tumbles out from behind the cabinet, bouncing across the basement floor with a ringing clatter. It spins to a stop at your feet — a heavy-duty electrical fuse! It must have been wedged between the cabinet and the wall for years, completely unreachable until the old machine shook it loose.', type: 'normal' },
            { text: '', type: 'normal' },
            { text: '[An electrical fuse has appeared on the floor!]', type: 'system' },
          ]

          defendState = {
            ...defendState,
            output: [...defendState.output, ...fuseLines],
            items: {
              ...defendState.items,
              fuse: { ...fuseItem, hidden: false },
            },
            puzzles: { ...defendState.puzzles, fuse_dislodged: true },
          }
        }
      }

      newState = defendState
      break
    }
    case 'SNOWBALL_RESULT': {
      const { playerHits, computerHits, won } = action.payload

      const lines = [
        { text: '', type: 'normal' },
        { text: 'The old screen flickers off and you step back, brushing pixelated snow from your imagination.', type: 'normal' },
      ]

      if (won) {
        lines.push({ text: `Snowball Champion! You landed ${playerHits} hits to their ${computerHits}!`, type: 'victory' })
        lines.push({ text: 'The ancient cabinet buzzes triumphantly. "SNOWBALL CHAMPION" scrolls across the screen in icy blue letters.', type: 'normal' })
      } else {
        lines.push({ text: `Defeated... You only landed ${playerHits} hits while taking ${computerHits} snowballs to the face.`, type: 'system' })
        lines.push({ text: 'The cabinet plays a sad little jingle. "BETTER LUCK NEXT TIME" blinks on screen.', type: 'normal' })
      }

      newState = {
        ...state,
        launchSnowball: false,
        output: [...state.output, ...lines],
        puzzles: won
          ? { ...state.puzzles, snowball_champion: true }
          : state.puzzles,
      }
      break
    }
    case 'WHITEOUT_RESULT': {
      const { score, level, won } = action.payload

      const lines = [
        { text: '', type: 'normal' },
        { text: 'The pixel bricks fade to black and you step back from the humming cabinet, eyes still adjusting to the dim shelter light.', type: 'normal' },
      ]

      if (won) {
        lines.push({ text: `White Out Champion! All ${level} levels cleared with a score of ${score}!`, type: 'victory' })
        lines.push({ text: 'The old cabinet erupts in a triumphant 8-bit fanfare. "WHITE OUT CHAMPION" blazes across the screen in neon letters.', type: 'normal' })
      } else {
        lines.push({ text: `Game Over... You reached level ${level} with a score of ${score}.`, type: 'system' })
        lines.push({ text: 'The cabinet plays a melancholy dirge. "INSERT TOKEN TO CONTINUE" scrolls across the dim screen.', type: 'normal' })
      }

      newState = {
        ...state,
        launchWhiteout: false,
        output: [...state.output, ...lines],
        puzzles: won
          ? { ...state.puzzles, whiteout_champion: true }
          : state.puzzles,
      }
      break
    }
    case 'ADD_OUTPUT':
      return {
        ...state,
        output: [...state.output, action.payload],
      }
    default:
      return state
  }

  newState = { ...newState, turnCount: state.turnCount + 1 }
  newState = checkPuzzleTriggers(newState)
  return newState
}
