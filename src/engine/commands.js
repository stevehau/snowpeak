import { victoryText } from '../data/story'
import { saveHighScore, formatTime, formatScoreBoard } from './scores'

function addOutput(state, text, type = 'normal') {
  return {
    ...state,
    output: [...state.output, { text, type }],
  }
}

function addOutputLines(state, lines) {
  return {
    ...state,
    output: [...state.output, ...lines],
  }
}

export function isCaveDark(state) {
  return state.currentRoomId === 'hidden_cave' && !state.inventory.includes('torch')
}

function describeRoom(state, roomId) {
  const room = state.rooms[roomId]
  let s = state

  // Hidden cave is pitch black without the torch
  if (roomId === 'hidden_cave' && !s.inventory.includes('torch')) {
    s = addOutput(s, 'Hidden Cave', 'title')
    s = addOutput(s, 'You squeeze through the narrow opening into total darkness. The air is frigid and still. You can\'t see a thing, but you can feel the rough cave walls around you. Near the entrance, your hand brushes against something wooden mounted on the wall -- it feels like a torch.', 'normal')
    s = addOutput(s, '\nExits: west', 'system')
    return s
  }

  if (room.ascii) {
    s = addOutput(s, room.ascii, 'ascii')
  }
  s = addOutput(s, room.name, 'title')
  s = addOutput(s, room.description, 'normal')

  // List visible items
  const visibleItems = room.items.filter(id => {
    const item = s.items[id]
    return item && !item.hidden
  })
  if (visibleItems.length > 0) {
    const itemNames = visibleItems.map(id => s.items[id].name)
    s = addOutput(s, `\nYou can see: ${itemNames.join(', ')}.`, 'normal')
  }

  // List NPCs
  if (room.npcs.length > 0) {
    const npcNames = room.npcs.map(id => s.npcs[id].name)
    s = addOutput(s, `${npcNames.join(' and ')} ${room.npcs.length === 1 ? 'is' : 'are'} here.`, 'normal')
  }

  // List exits
  const allExits = { ...room.exits, ...room.hiddenExits }
  const lockedExitDirs = Object.keys(room.lockedExits || {})
  const exitDirs = [...Object.keys(allExits), ...lockedExitDirs]
  if (exitDirs.length > 0) {
    s = addOutput(s, `\nExits: ${exitDirs.join(', ')}`, 'system')
  }

  return s
}

export function handleMove(state, { direction }) {
  const room = state.rooms[state.currentRoomId]
  const allExits = { ...room.exits, ...room.hiddenExits }
  let targetRoomId = allExits[direction]

  // Check locked exits
  if (!targetRoomId && room.lockedExits && room.lockedExits[direction]) {
    const locked = room.lockedExits[direction]

    // Key-based lock
    if (locked.keyId && state.inventory.includes(locked.keyId)) {
      targetRoomId = locked.roomId
      // Unlock permanently by moving to regular exits
      const newRoom = {
        ...room,
        exits: { ...room.exits, [direction]: locked.roomId },
        lockedExits: { ...room.lockedExits },
      }
      delete newRoom.lockedExits[direction]
      let s = {
        ...state,
        rooms: { ...state.rooms, [state.currentRoomId]: newRoom },
      }
      s = addOutput(s, `You use the ${state.items[locked.keyId].name} to unlock the way ${direction}.`, 'normal')
      s = addOutput(s, '', 'normal')
      s = { ...s, currentRoomId: targetRoomId, previousRoomId: state.currentRoomId }
      s = describeRoom(s, targetRoomId)
      s = { ...s, rooms: { ...s.rooms, [targetRoomId]: { ...s.rooms[targetRoomId], visited: true } } }
      return s
    }

    // Item requirement lock (like warm coat for peak)
    if (locked.requireItem && state.inventory.includes(locked.requireItem)) {
      targetRoomId = locked.roomId
    } else {
      return addOutput(state, locked.message, 'error')
    }
  }

  if (!targetRoomId) {
    return addOutput(state, "You can't go that way.", 'error')
  }

  let s = { ...state, currentRoomId: targetRoomId, previousRoomId: state.currentRoomId }
  s = addOutput(s, '', 'normal')
  s = describeRoom(s, targetRoomId)
  s = { ...s, rooms: { ...s.rooms, [targetRoomId]: { ...s.rooms[targetRoomId], visited: true } } }
  return s
}

export function handleLook(state, payload = {}) {
  // Dark cave — can only look around (re-describe dark room)
  if (isCaveDark(state) && (payload.itemId || payload.npcId || payload.target)) {
    return addOutput(state, "It's pitch black! You can't see a thing.", 'error')
  }

  // Look at NPC
  if (payload.npcId) {
    const npc = state.npcs[payload.npcId]
    return addOutput(state, npc.description, 'normal')
  }

  // Look at specific item
  if (payload.itemId) {
    const item = state.items[payload.itemId]
    return addOutput(state, item.description, 'normal')
  }

  // Look at room feature (generic)
  if (payload.target) {
    // Special cases for room-specific descriptions
    const room = state.rooms[state.currentRoomId]
    if (state.currentRoomId === 'frozen_waterfall' &&
        (payload.target.includes('waterfall') || payload.target.includes('ice') || payload.target.includes('water'))) {
      const bossCalmed = state.npcs.angry_boss?.flags?.calmed
      const radioFixed = state.npcs.dill_pickle?.flags?.fixed_radio
      if (bossCalmed || radioFixed) {
        let s = addOutput(state, 'You examine the frozen waterfall closely. Now that you know what to look for, you can see it -- a narrow gap in the ice on the east side, just wide enough to squeeze through. It leads to a hidden cave!', 'normal')
        if (!room.hiddenExits.east) {
          s = {
            ...s,
            rooms: {
              ...s.rooms,
              frozen_waterfall: {
                ...room,
                hiddenExits: { ...room.hiddenExits, east: 'hidden_cave' },
              },
            },
          }
          s = addOutput(s, '\nA new exit has been revealed: east', 'system')
        }
        return s
      }
      return addOutput(state, 'The frozen waterfall is mesmerizing -- a wall of ice frozen in mid-flow. It\'s beautiful but you feel like there might be more to it than meets the eye. Maybe someone at the resort knows something...', 'normal')
    }
    return addOutput(state, `You don't see anything special about that.`, 'normal')
  }

  // Look at room
  return describeRoom(state, state.currentRoomId)
}

export function handleTake(state, { itemId }) {
  const room = state.rooms[state.currentRoomId]

  // In the dark cave, you can only take the torch
  if (isCaveDark(state) && itemId !== 'torch') {
    return addOutput(state, "It's pitch black! You can't see anything to take. You can feel something wooden on the wall near the entrance though...", 'error')
  }

  // Check item is in room
  if (!room.items.includes(itemId)) {
    if (state.inventory.includes(itemId)) {
      return addOutput(state, 'You already have that.', 'error')
    }
    return addOutput(state, "That's not here.", 'error')
  }

  const item = state.items[itemId]
  if (!item.takeable) {
    return addOutput(state, "You can't take that.", 'error')
  }

  // Remove from room, add to inventory
  const newRoom = {
    ...room,
    items: room.items.filter(id => id !== itemId),
  }
  let s = {
    ...state,
    rooms: { ...state.rooms, [state.currentRoomId]: newRoom },
    inventory: [...state.inventory, itemId],
  }
  s = addOutput(s, `You pick up the ${item.name}.`, 'normal')

  // Taking the torch in the cave lights it up — show the full room
  if (itemId === 'torch' && state.currentRoomId === 'hidden_cave') {
    s = addOutput(s, '\nThe torch sputters to life, casting a warm flickering glow across the cave walls!', 'normal')
    s = addOutput(s, '', 'normal')
    s = describeRoom(s, 'hidden_cave')
  }

  return s
}

export function handleDrop(state, { itemId }) {
  if (!state.inventory.includes(itemId)) {
    return addOutput(state, "You're not carrying that.", 'error')
  }

  const item = state.items[itemId]
  const room = state.rooms[state.currentRoomId]
  const newRoom = {
    ...room,
    items: [...room.items, itemId],
  }
  let s = {
    ...state,
    rooms: { ...state.rooms, [state.currentRoomId]: newRoom },
    inventory: state.inventory.filter(id => id !== itemId),
  }
  s = addOutput(s, `You drop the ${item.name}.`, 'normal')
  return s
}

export function handleInventory(state) {
  if (state.inventory.length === 0) {
    return addOutput(state, "You're not carrying anything.", 'normal')
  }

  const itemNames = state.inventory.map(id => `  - ${state.items[id].name}`)
  let s = addOutput(state, 'You are carrying:', 'normal')
  for (const name of itemNames) {
    s = addOutput(s, name, 'normal')
  }
  return s
}

export function handleTalk(state, { npcId }) {
  const npc = state.npcs[npcId]
  const room = state.rooms[state.currentRoomId]

  if (!room.npcs.includes(npcId)) {
    return addOutput(state, `${npc.name} isn't here.`, 'error')
  }

  // Find the right dialogue entry
  const dialogueEntries = npc.dialogue.filter(d => d.state === npc.dialogueState)

  let chosen = null
  // First check conditional entries
  for (const entry of dialogueEntries) {
    if (entry.condition) {
      if (entry.condition.hasItem && state.inventory.includes(entry.condition.hasItem)) {
        chosen = entry
        break
      }
    }
  }
  // Fallback to non-conditional entry
  if (!chosen) {
    chosen = dialogueEntries.find(d => !d.condition)
  }
  if (!chosen) {
    return addOutput(state, `${npc.name} has nothing to say.`, 'normal')
  }

  let s = addOutput(state, chosen.text, 'npc')

  // Apply effects
  if (chosen.effects) {
    const effects = chosen.effects

    if (effects.removeItem) {
      const removedItem = s.items[effects.removeItem]
      s = {
        ...s,
        inventory: s.inventory.filter(id => id !== effects.removeItem),
      }
      if (removedItem) {
        s = addOutput(s, `\n[${removedItem.name} removed from inventory]`, 'system')
      }
    }

    if (effects.addItem) {
      s = {
        ...s,
        inventory: [...s.inventory, effects.addItem],
      }
      s = addOutput(s, `\n[You received: ${s.items[effects.addItem].name}]`, 'system')
    }

    if (effects.revealItem) {
      const [itemId, targetRoomId] = effects.revealItem
      const item = s.items[itemId]
      if (item && item.hidden) {
        const targetRoom = s.rooms[targetRoomId]
        s = {
          ...s,
          items: {
            ...s.items,
            [itemId]: { ...item, hidden: false },
          },
          rooms: {
            ...s.rooms,
            [targetRoomId]: {
              ...targetRoom,
              items: targetRoom.items.includes(itemId)
                ? targetRoom.items
                : [...targetRoom.items, itemId],
            },
          },
        }
        s = addOutput(s, `\n[A ${item.name} has appeared on the floor!]`, 'system')
      }
    }

    if (effects.setFlag) {
      const [npcKey, flag, value] = effects.setFlag
      s = {
        ...s,
        npcs: {
          ...s.npcs,
          [npcKey]: {
            ...s.npcs[npcKey],
            flags: { ...s.npcs[npcKey].flags, [flag]: value },
          },
        },
      }
    }

    if (effects.moveNpc) {
      const [moveNpcId, targetRoom] = effects.moveNpc
      const oldRoom = s.npcs[moveNpcId].currentRoomId
      s = {
        ...s,
        npcs: {
          ...s.npcs,
          [moveNpcId]: { ...s.npcs[moveNpcId], currentRoomId: targetRoom },
        },
        rooms: {
          ...s.rooms,
          [oldRoom]: {
            ...s.rooms[oldRoom],
            npcs: s.rooms[oldRoom].npcs.filter(id => id !== moveNpcId),
          },
          [targetRoom]: {
            ...s.rooms[targetRoom],
            npcs: [...s.rooms[targetRoom].npcs, moveNpcId],
          },
        },
      }
    }
  }

  // Advance dialogue state:
  // - Always advance from state 0 (intro dialogue shows once)
  // - Advance when effects were applied (condition met)
  // - Don't advance if player hasn't met the condition yet
  const shouldAdvance = chosen.effects || npc.dialogueState === 0
  if (shouldAdvance) {
    s = {
      ...s,
      npcs: {
        ...s.npcs,
        [npcId]: {
          ...s.npcs[npcId],
          dialogueState: npc.dialogueState + 1,
        },
      },
    }
  }

  return s
}

export function handleUse(state, { itemId }) {
  if (!state.inventory.includes(itemId)) {
    return addOutput(state, "You're not carrying that.", 'error')
  }

  // Can't use items in the dark (except the torch would already light the cave via take)
  if (isCaveDark(state)) {
    return addOutput(state, "It's too dark to see what you're doing!", 'error')
  }

  const item = state.items[itemId]
  const roomId = state.currentRoomId

  // Fuse at ski lift
  if (itemId === 'fuse' && roomId === 'ski_lift_top') {
    let s = addOutput(state, 'You slot the electrical fuse into the empty socket on the control panel. There\'s a satisfying CLUNK, followed by a low hum. The ski lift machinery groans to life! The chairs begin moving along the cable. The lift is working! You can now ride it up to the mountain peak.', 'normal')
    const room = s.rooms.ski_lift_top
    s = {
      ...s,
      inventory: s.inventory.filter(id => id !== 'fuse'),
      puzzles: { ...s.puzzles, ski_lift_fixed: true },
      rooms: {
        ...s.rooms,
        ski_lift_top: {
          ...room,
          description: 'The upper ski lift station hums with power. The lift chairs glide smoothly along the cable, ready to carry riders to the peak. The electrical panel on the side of the station house is closed, the fuse securely in place.',
          exits: { ...room.exits, up: 'mountain_peak' },
        },
      },
    }
    s = addOutput(s, '\n[The ski lift is now operational! You can go up to the mountain peak.]', 'system')
    return s
  }

  // Medallion at cave vault door
  if (itemId === 'strange_medallion' && roomId === 'hidden_cave') {
    let s = addOutput(state, 'You press the strange medallion into the circular indentation beside the stone steps. It fits perfectly. There\'s a deep RUMBLE as ancient mechanisms engage. The heavy stone door at the bottom of the steps slowly grinds open, revealing a passage leading down into the mountain.', 'normal')
    // Unlock the vault
    const room = s.rooms.hidden_cave
    s = {
      ...s,
      inventory: s.inventory.filter(id => id !== 'strange_medallion'),
      rooms: {
        ...s.rooms,
        hidden_cave: {
          ...room,
          exits: { ...room.exits, down: 'underground_vault' },
          lockedExits: {},
        },
      },
    }
    s = addOutput(s, '\n[A new exit has been revealed: down]', 'system')
    return s
  }

  // Binoculars on balcony
  if (itemId === 'binoculars' && roomId === 'lodge_balcony') {
    return addOutput(state, 'You peer through the binoculars toward the mountain. The frozen waterfall comes into sharp focus. Behind the shimmering ice, you can make out what looks like... a cave entrance! The ice partially conceals a dark opening. Interesting.', 'normal')
  }

  // Binoculars at frozen waterfall - reveals hidden cave
  if (itemId === 'binoculars' && roomId === 'frozen_waterfall') {
    if (state.rooms.frozen_waterfall.hiddenExits?.east) {
      return addOutput(state, 'You peer through the binoculars at the ice wall up close. You can already see the cave entrance to the east.', 'normal')
    }
    let s = addOutput(state, 'You hold the binoculars up to the frozen waterfall and scan the ice closely. Through the lenses, a narrow crack in the ice comes into sharp focus -- it\'s not just a crack, it\'s an opening! A hidden passage leads east, into a cave behind the waterfall!', 'normal')
    s = {
      ...s,
      rooms: {
        ...s.rooms,
        frozen_waterfall: {
          ...s.rooms.frozen_waterfall,
          hiddenExits: { ...s.rooms.frozen_waterfall.hiddenExits, east: 'hidden_cave' },
        },
      },
    }
    s = addOutput(s, '\nA new exit has been revealed: east', 'system')
    return s
  }

  // Torch in the cave
  if (itemId === 'torch' && roomId === 'hidden_cave') {
    return addOutput(state, 'You hold the torch high. The flickering light reveals the cave walls in detail -- ancient markings, trail symbols, and an arrow pointing down toward the stone steps. The circular indentation beside the steps gleams in the torchlight.', 'normal')
  }

  return addOutput(state, `You're not sure how to use the ${item.name} here.`, 'error')
}

export function handleRead(state, { itemId }) {
  if (!state.inventory.includes(itemId)) {
    const room = state.rooms[state.currentRoomId]
    if (!room.items.includes(itemId)) {
      return addOutput(state, "You don't have that.", 'error')
    }
  }

  const item = state.items[itemId]

  // Founder's letter triggers victory
  if (itemId === 'founders_letter') {
    let s = addOutput(state, item.readText || item.description, 'npc')
    // Founder's photo enclosed with the letter
    s = addOutput(s, '', 'normal')
    s = addOutput(s, 'A faded photograph falls out of the envelope. It shows Tobias Snowpeak and friends on the slopes, grinning from ear to ear.', 'normal')
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}founderskids.jpg`, text: 'Tobias Snowpeak and friends on the slopes' }],
    }
    s = addOutputLines(s, victoryText)

    // Calculate and save score
    const elapsedMs = Date.now() - state.startTime
    const steps = state.turnCount + 1
    const { rank, scores } = saveHighScore(state.playerName, steps, elapsedMs, state.mode)

    s = addOutput(s, '', 'normal')
    s = addOutput(s, `${state.playerName}'s stats:  ${steps} steps  |  ${formatTime(elapsedMs)}`, 'victory')
    if (rank === 1) {
      s = addOutput(s, 'NEW #1 HIGH SCORE!', 'victory')
    } else {
      s = addOutput(s, `Ranked #${rank} on the leaderboard!`, 'victory')
    }
    s = addOutputLines(s, formatScoreBoard(scores))

    // Victory image
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}victory.svg`, text: 'The Golden Ski Trophy' }],
    }

    s = { ...s, gameOver: true, puzzles: { ...s.puzzles, victory: true } }
    return s
  }

  // For items with readText
  if (item.readText) {
    return addOutput(state, item.readText, 'normal')
  }

  // Default: show description
  return addOutput(state, item.description, 'normal')
}

