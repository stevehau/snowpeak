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

      newState = {
        ...state,
        launchDefend: false,
        output: [...state.output, ...lines],
        puzzles: won
          ? { ...state.puzzles, village_champion: true }
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
