import {
  handleMove,
  handleLook,
  handleTake,
  handleDrop,
  handleInventory,
  handleTalk,
  handleUse,
  handleRead,
} from './commands'
import { helpText } from '../data/story'
import { checkPuzzleTriggers } from '../data/puzzles'
import { getHighScores, formatScoreBoard, clearAllScores, formatTime } from './scores'

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
    case 'USE':
      newState = handleUse(state, action.payload)
      break
    case 'READ':
      newState = handleRead(state, action.payload)
      break
    case 'HELP': {
      const elapsed = formatTime(Date.now() - (state.startTime || Date.now()))
      const statsLine = { text: `Current stats:  ${state.turnCount} steps  |  ${elapsed} elapsed`, type: 'system' }
      newState = {
        ...state,
        output: [...state.output, ...helpText, statsLine],
      }
      break
    }
    case 'SCORES': {
      const scores = getHighScores()
      if (scores.length === 0) {
        newState = {
          ...state,
          output: [...state.output, { text: 'No high scores yet. Be the first to complete the adventure!', type: 'system' }],
        }
      } else {
        newState = {
          ...state,
          output: [...state.output, ...formatScoreBoard(scores)],
        }
      }
      break
    }
    case 'ERASE_SCORES':
      clearAllScores()
      newState = {
        ...state,
        output: [...state.output, { text: 'High score table has been erased.', type: 'system' }],
      }
      break
    case 'SLALOM_RESULT': {
      const { score, gatesPassed, difficulty } = action.payload
      const lines = [
        { text: '', type: 'normal' },
        { text: 'The arcade screen fades and you step back from the machine.', type: 'normal' },
        { text: `Final Score: ${score}  |  Gates: ${gatesPassed}  |  Difficulty: ${difficulty}`, type: 'system' },
      ]
      if (score >= 2000) {
        lines.push({ text: "You beat Coach Joe's high score! You are the Slalom Champion!", type: 'victory' })
      } else {
        lines.push({ text: 'Not bad! Coach Joe\'s high score is 2000. Think you can beat it?', type: 'normal' })
      }
      newState = {
        ...state,
        launchSlalom: false,
        output: [...state.output, ...lines],
        puzzles: score >= 2000
          ? { ...state.puzzles, slalom_champion: true }
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
