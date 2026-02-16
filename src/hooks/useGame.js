import { useReducer, useCallback, useRef } from 'react'
import { gameReducer } from '../engine/gameReducer'
import { parse } from '../engine/parser'
import { createInitialState } from '../engine/worldLoader'

export function useGame(playerName, mode) {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    { playerName, mode },
    ({ playerName, mode }) => createInitialState(playerName, mode)
  )

  // Use a ref so processCommand always has the latest state
  const stateRef = useRef(gameState)
  stateRef.current = gameState

  const processCommand = useCallback((rawInput) => {
    const currentState = stateRef.current

    // Echo the command
    dispatch({ type: 'ADD_OUTPUT', payload: { text: `> ${rawInput}`, type: 'command' } })

    // Parse and execute using latest state
    const parsed = parse(rawInput, currentState)
    if (parsed.error) {
      dispatch({ type: 'ADD_OUTPUT', payload: { text: parsed.error, type: 'error' } })
    } else {
      dispatch(parsed)
    }
  }, [])

  return { gameState, processCommand, dispatch }
}
