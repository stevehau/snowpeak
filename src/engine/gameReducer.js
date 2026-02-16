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
import { getHighScores, formatScoreBoard, clearAllScores } from './scores'

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
    case 'HELP':
      newState = {
        ...state,
        output: [...state.output, ...helpText],
      }
      break
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
