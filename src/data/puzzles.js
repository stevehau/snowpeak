export function checkPuzzleTriggers(state) {
  let newState = { ...state }

  // Check for game victory -- reading the founder's letter
  if (newState.puzzles.victory) {
    newState = { ...newState, gameOver: true }
  }

  return newState
}
