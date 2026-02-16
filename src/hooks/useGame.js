import { useReducer, useCallback } from 'react'
import { gameReducer } from '../engine/gameReducer'
import { parse } from '../engine/parser'
import { createInitialState } from '../engine/worldLoader'

export function useGame(playerName, mode) {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    { playerName, mode },
    ({ playerName, mode }) => createInitialState(playerName, mode)
  )

  const processCommand = useCallback((rawInput) => {
    // Echo the command
    dispatch({ type: 'ADD_OUTPUT', payload: { text: `> ${rawInput}`, type: 'command' } })

    // Parse and execute
    const parsed = parse(rawInput, gameState)
    if (parsed.error) {
      dispatch({ type: 'ADD_OUTPUT', payload: { text: parsed.error, type: 'error' } })
    } else {
      dispatch(parsed)
    }
  }, [gameState])

  return { gameState, processCommand }
}
