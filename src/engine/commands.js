import { victoryText } from '../data/story'
import { saveHighScore, formatTime, formatScoreBoard } from './scores'

const huskyEncounters = [
  'A friendly Siberian Husky bounds out of nowhere, tail wagging furiously! It drops a snow-covered stick at your feet, barks once, then zooms away in a blur of fluff.',
  'You hear excited panting behind you. A Siberian Husky with bright blue eyes nudges your hand with its cold nose, demands exactly three pets, then trots off looking very satisfied.',
  'A Husky appears, spins in three tight circles chasing its own tail, stops to give you a goofy tongue-out grin, then disappears around the corner at full speed.',
  'A fluffy Siberian Husky slides across the icy ground on its belly like a furry toboggan, bumps gently into your leg, looks up at you with zero shame, and scrambles off.',
  'A Husky pops its head out from behind a snowdrift, lets out a dramatic "AWOOOO!", then army-crawls toward you for belly rubs before bounding away happily.',
  'A snow-dusted Husky trots up carrying something in its mouth. It drops a frozen finger at your feet, wags its tail proudly, and prances away before you can react. That\'s... unsettling.',
  'You spot a Husky rolling ecstatically in a fresh patch of snow, all four paws in the air. It notices you watching, freezes mid-roll, then bolts off as if nothing happened.',
  'A Siberian Husky zooms past at incredible speed, loops back, sniffs your boots thoroughly, sneezes directly on your shoes, and gallops away looking enormously pleased.',
  'A Husky appears with snow on its nose and what appears to be a tiny snowball balanced on its head. It sits perfectly still for two seconds, shakes everything off, and dashes into the distance.',
  'A playful Husky rushes up and play-bows in front of you, butt wiggling in the air. It lets out a series of excited yips, does a victory lap around you, and vanishes into the snow.',
]

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

function addSound(state, sound) {
  return {
    ...state,
    output: [...state.output, { type: 'sound', sound }],
  }
}

function getRoomSound(targetRoomId, fromRoomId) {
  if (targetRoomId === 'basement') return 'creak_door'
  if (targetRoomId === 'mountain_peak' && fromRoomId === 'ski_lift_top') return 'lift_motor'
  if (targetRoomId === 'hidden_cave') return 'cave_echo'
  if (targetRoomId === 'underground_vault') return 'vault_rumble'
  if (['frozen_waterfall', 'mountain_peak', 'ski_lift_top'].includes(targetRoomId)) return 'wind'
  return 'footstep'
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

  // List exits (hide locked exits in hidden_cave until medallion unlocks them)
  const allExits = { ...room.exits, ...room.hiddenExits }
  const showLockedExits = roomId !== 'hidden_cave'
  const lockedExits = showLockedExits ? (room.lockedExits || {}) : {}

  // Format exits with room names: "direction (Room Name)"
  const exitList = []
  for (const dir of Object.keys(allExits)) {
    const targetRoomId = allExits[dir]
    const targetRoom = s.rooms[targetRoomId]
    if (targetRoom) {
      exitList.push(`${dir} (${targetRoom.name})`)
    } else {
      exitList.push(dir)
    }
  }
  for (const dir of Object.keys(lockedExits)) {
    // lockedExits values are objects: { roomId, keyId, message }
    const lockedExit = lockedExits[dir]
    const targetRoomId = lockedExit.roomId
    const targetRoom = s.rooms[targetRoomId]
    if (targetRoom) {
      exitList.push(`${dir} (${targetRoom.name})`)
    } else {
      exitList.push(dir)
    }
  }

  if (exitList.length > 0) {
    s = addOutput(s, `\nExits: ${exitList.join(', ')}`, 'system')
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
      if (locked.roomId === 'basement') {
        s = addOutput(s, `The old basement key fits perfectly in the lock. With a satisfying click, the heavy wooden door creaks open, revealing stone steps leading down into darkness.`, 'normal')
      } else if (locked.roomId === 'staff_quarters') {
        s = addOutput(s, `You slide the staff key into the lock. The mechanism turns with a heavy *CLUNK* and the door to the staff quarters swings open, revealing a dimly lit corridor beyond.`, 'normal')
        s = addSound(s, 'unlock')
      } else {
        s = addOutput(s, `You use the ${state.items[locked.keyId].name} to unlock the way ${direction}.`, 'normal')
      }
      s = addOutput(s, '', 'normal')
      s = addSound(s, getRoomSound(targetRoomId, state.currentRoomId))
      s = { ...s, currentRoomId: targetRoomId, previousRoomId: state.currentRoomId }
      s = describeRoom(s, targetRoomId)
      s = { ...s, rooms: { ...s.rooms, [targetRoomId]: { ...s.rooms[targetRoomId], visited: true } } }
      return s
    }

    // Multiple item requirement lock (like rope + pickaxe for ice caves)
    if (locked.requireItems) {
      const hasAll = locked.requireItems.every(id => state.inventory.includes(id))
      if (hasAll) {
        targetRoomId = locked.roomId
        // Unlock permanently
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
        if (locked.roomId === 'ice_caves') {
          s = addOutput(s, 'You hammer the pickaxe into the ice wall and secure the climbing rope to a rock anchor. Carefully rappelling down the frozen passage, you descend into the mountain. The ice groans and cracks around you as you go deeper. Finally, you reach the bottom -- a vast cavern of glittering ice!', 'normal')
          s = addSound(s, 'wind')
        } else {
          s = addOutput(s, `You use your equipment to unlock the way ${direction}.`, 'normal')
        }
        s = addOutput(s, '', 'normal')
        s = addSound(s, getRoomSound(targetRoomId, state.currentRoomId))
        s = { ...s, currentRoomId: targetRoomId, previousRoomId: state.currentRoomId }
        s = describeRoom(s, targetRoomId)
        s = { ...s, rooms: { ...s.rooms, [targetRoomId]: { ...s.rooms[targetRoomId], visited: true } } }
        return s
      } else {
        return addOutput(state, locked.message, 'error')
      }
    }

    // Single item requirement lock (like warm coat for peak)
    if (locked.requireItem && state.inventory.includes(locked.requireItem)) {
      targetRoomId = locked.roomId
    } else {
      return addOutput(state, locked.message, 'error')
    }
  }

  if (!targetRoomId) {
    return addOutput(state, "You can't go that way.", 'error')
  }

  // Warm coat required for cold areas
  const coldRooms = ['ski_slopes', 'frozen_waterfall', 'ski_lift_top', 'mountain_peak']
  if (coldRooms.includes(targetRoomId) && !state.inventory.includes('warm_coat')) {
    return addOutput(state, "The bitter mountain wind cuts right through you! It's far too cold to continue without a warm coat. You turn back, shivering.", 'error')
  }

  let s = addSound(state, getRoomSound(targetRoomId, state.currentRoomId))
  s = { ...s, currentRoomId: targetRoomId, previousRoomId: state.currentRoomId }
  s = addOutput(s, '', 'normal')
  s = describeRoom(s, targetRoomId)
  s = { ...s, rooms: { ...s.rooms, [targetRoomId]: { ...s.rooms[targetRoomId], visited: true } } }

  // 10% chance a friendly Husky appears (not in cave/vault)
  const noHuskyRooms = ['hidden_cave', 'underground_vault']
  if (!noHuskyRooms.includes(targetRoomId) && Math.random() < 0.2) {
    const FINGER_ENCOUNTER = 5
    const fingerGiven = s.puzzles.finger_given
    let idx = Math.floor(Math.random() * huskyEncounters.length)
    // If finger was already given, pick a different encounter
    if (idx === FINGER_ENCOUNTER && fingerGiven) {
      idx = (idx + 1) % huskyEncounters.length
    }
    s = addOutput(s, '', 'normal')
    s = addOutput(s, huskyEncounters[idx], 'npc')
    // Give the frozen finger item (once only)
    if (idx === FINGER_ENCOUNTER && !fingerGiven) {
      s = {
        ...s,
        inventory: [...s.inventory, 'frozen_finger'],
        puzzles: { ...s.puzzles, finger_given: true },
      }
      s = addOutput(s, '\n[Frozen finger added to inventory]', 'system')
    }
  }

  // Candle blows out in windy outdoor areas (expert mode only)
  if (s.mode === 'expert' && s.puzzles.candle_lit) {
    const windyRooms = [
      'ski_slopes', 'frozen_waterfall', 'ski_lift_top', 'mountain_peak',
      'ridge_trail', 'avalanche_zone', 'summit_shelter', 'ice_caves'
    ]
    if (windyRooms.includes(targetRoomId)) {
      s = addOutput(s, '', 'normal')
      s = addOutput(s, 'The fierce mountain wind blows out your candle! The flame flickers and dies, leaving you in darkness once more.', 'normal')
      s = {
        ...s,
        puzzles: { ...s.puzzles, candle_lit: false },
      }
    }
  }

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
      if (entry.condition.hasFlag && state.puzzles[entry.condition.hasFlag]) {
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

  // Show Angry Boss image on first interaction
  if (npcId === 'angry_boss' && !state.puzzles.angry_boss_image_shown) {
    s = addSound(s, 'angry_grunt')
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}boss.jpg`, text: 'Angry Boss' }],
      puzzles: { ...s.puzzles, angry_boss_image_shown: true },
    }
  }

  // Show Mr Smiles image on first interaction
  if (npcId === 'mr_smiles' && !state.puzzles.mr_smiles_image_shown) {
    s = addSound(s, 'kid_laugh')
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}mistersmiles.jpg`, text: 'Mr Smiles' }],
      puzzles: { ...s.puzzles, mr_smiles_image_shown: true },
    }
  }

  // Show Mr Smiles with poles when he gets them back
  if (npcId === 'mr_smiles' && chosen.effects?.removeItem === 'ski_poles') {
    s = addSound(s, 'kid_laugh')
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}smilespoles.jpg`, text: 'Mr Smiles with his ski poles' }],
    }
  }

  // Show Dill Pickle's image on first interaction only
  if (npcId === 'dill_pickle' && !state.puzzles.dill_pickle_image_shown) {
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}skishop.jpg`, text: 'Dill Pickle in the ski shop' }],
      puzzles: { ...s.puzzles, dill_pickle_image_shown: true },
    }
  }

  // Show Coach Joe's image and play whistle on first interaction only
  if (npcId === 'coach_joe' && !state.puzzles.coach_joe_image_shown) {
    s = addSound(s, 'whistle')
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}coach.jpg`, text: 'Coach Joe' }],
      puzzles: { ...s.puzzles, coach_joe_image_shown: true },
    }
  }

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
  // Arcade machine is a room item, not an inventory item
  if (itemId === 'arcade_machine') {
    const room = state.rooms[state.currentRoomId]
    if (!room.items.includes('arcade_machine')) {
      return addOutput(state, "There's no arcade machine here.", 'error')
    }
    let s = addOutput(state, 'You step up to the arcade machine and press START. The screen flickers to life...', 'normal')
    s = addOutput(s, '', 'normal')
    s = addOutput(s, '* SLALOM CHALLENGE *', 'title')
    s = addOutput(s, 'The cabinet hums and the screen fills with green pixels. Time to hit the slopes!', 'normal')
    s = addSound(s, 'arcade_start')
    s = { ...s, launchSlalom: true }
    return s
  }

  // Store bell is a room item in general_store (expert mode only)
  if (itemId === 'store_bell') {
    const room = state.rooms[state.currentRoomId]
    if (!room.items.includes('store_bell')) {
      return addOutput(state, "There's no bell here.", 'error')
    }
    let s = addOutput(state, 'You ring the brass bell. *DING!* The sound echoes through the empty store.', 'normal')
    s = addSound(s, 'bell')

    // 50% chance of Husky encounter
    if (Math.random() < 0.5) {
      const huskyText = huskyEncounters[Math.floor(Math.random() * huskyEncounters.length)]
      s = addOutput(s, '', 'normal')
      s = addOutput(s, huskyText, 'normal')

      // Check if it's the frozen finger encounter
      if (huskyText.includes('frozen finger')) {
        s = {
          ...s,
          inventory: [...s.inventory, 'frozen_finger'],
        }
      }
    } else {
      s = addOutput(s, '', 'normal')
      s = addOutput(s, 'Nobody comes. The store remains silent and empty.', 'normal')
    }

    return s
  }

  if (!state.inventory.includes(itemId)) {
    return addOutput(state, "You're not carrying that.", 'error')
  }

  // Can't use items in the dark (except the torch would already light the cave via take)
  if (isCaveDark(state)) {
    return addOutput(state, "It's too dark to see what you're doing!", 'error')
  }

  const item = state.items[itemId]
  const roomId = state.currentRoomId

  // Frozen finger - comical use
  if (itemId === 'frozen_finger') {
    return addOutput(state, "You use the frozen finger to pick your nose. It's a strangely refreshing feeling.", 'normal')
  }

  // Binoculars at frozen waterfall - reveals hidden cave (must be checked BEFORE scenic views)
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
    s = addOutput(s, '\nA new exit has been revealed: east (Hidden Cave)', 'system')
    return s
  }

  // Binoculars - scenic views from mountain/outdoor locations
  if (itemId === 'binoculars') {
    const binocularViews = {
      ridge_trail: [
        'You peer through the binoculars along the ridge. The trail winds like a white ribbon between jagged peaks. Far below, the resort looks like a toy village. You can see tiny figures on the slopes, carving turns through fresh powder.',
        'Through the lenses, you spot a family of mountain goats picking their way along a rocky outcrop across the valley. They move with impossible grace on the near-vertical cliff face.',
        'The binoculars reveal an endless panorama of snow-capped peaks stretching to the horizon. The late afternoon sun paints them in shades of gold and pink. This is why people climb mountains.',
      ],
      mountain_peak: [
        'From the summit, the binoculars reveal the entire valley spread out below like a living map. You can trace every trail, every road, every frozen stream. The world feels impossibly vast and quiet up here.',
        'You scan the horizon through the binoculars. Peak after peak stretches into the distance, each one catching the light differently. You can see three other ski resorts, tiny and distant, nestled in neighboring valleys.',
        'Peering straight down with the binoculars is dizzying -- the slopes fall away dramatically. You can see the ski lift chairs swaying gently in the wind, and far below, the warm glow of the lodge windows.',
      ],
      ski_lift_top: [
        'You train the binoculars on the lift line stretching down the mountain. The cables hum in the wind. Below, you can see the full run of the ski slopes -- every mogul, every turn, every tree line.',
        'Through the binoculars, you spot a hawk circling on the thermals above the valley. It dips and soars effortlessly, riding invisible currents of air. You feel a pang of envy.',
        'The binoculars reveal details on the distant frozen waterfall -- layers of blue and white ice, frozen in mid-cascade. It looks like time itself stopped flowing there.',
      ],
      ice_caves: [
        'You raise the binoculars inside the ice cave and peer through a gap in the frozen wall. The ice acts like a lens, refracting the light into shimmering rainbows that dance across the ceiling.',
        'Through the binoculars, you study the ice formations up close. The crystalline structures are breathtaking -- delicate spires and curtains of ice that look like they were sculpted by an artist.',
      ],
      avalanche_zone: [
        'You nervously scan the slopes above with the binoculars. Fresh snow sits heavy on the ridgeline -- it could slide at any moment. You can see where previous avalanches have carved paths through the trees, snapping trunks like matchsticks.',
        'The binoculars reveal cracks in the snowpack above. This area is genuinely dangerous. Through the lenses, you spot what looks like an old warning sign half-buried in snow.',
        'Scanning the debris field with binoculars, you notice strange shapes under the snow. Could be buried trees... or something else entirely. Best not to linger here.',
      ],
      ski_slopes: [
        'You watch the empty slopes through the binoculars. Without any skiers, the mountain feels hauntingly peaceful. Fresh tracks from some animal -- maybe a fox -- zigzag across the pristine powder.',
        'Through the binoculars, you can see all the way up to the ski lift station at the top. The slope looks steeper from down here than it does up close. No wonder they call it a black diamond run.',
        'Scanning the tree line with binoculars, you catch a flash of movement -- a deer bounding through the deep snow at the edge of the forest, kicking up little clouds of white behind it.',
      ],
      frozen_waterfall: [
        'The binoculars bring the frozen waterfall into sharp detail. Thousands of icicles hang like crystal chandeliers, some as thick as your arm. Behind the curtain of ice, you can just make out a dark opening...',
        'You study the ice formations through the binoculars. The waterfall froze in layers -- you can see bands of clear blue ice alternating with milky white. It must have frozen over the course of several cold nights.',
      ],
    }

    const views = binocularViews[roomId]
    if (views) {
      const view = views[Math.floor(Math.random() * views.length)]
      return addOutput(state, view, 'normal')
    }
    return addOutput(state, 'You peer through the binoculars, but there\'s nothing particularly interesting to see from here. Try using them somewhere with a view -- the mountain trails or slopes might be more rewarding.', 'normal')
  }

  // Fuse at ski lift
  if (itemId === 'fuse' && roomId === 'ski_lift_top') {
    const hasFuse = state.inventory.includes('fuse')
    const hasScrewdriver = state.inventory.includes('screwdriver')

    // In expert mode, both fuse and screwdriver are required
    if (state.mode === 'expert') {
      if (!hasScrewdriver) {
        return addOutput(state, 'You try to install the fuse in the electrical panel. The fuse looks like it would fit perfectly, but you can\'t open the panel cover -- it\'s held shut by several screws. You need a tool... maybe a screwdriver to complete the job.', 'error')
      }
      // Has both - proceed with fix
      let s = addOutput(state, 'You use the screwdriver to open the electrical panel cover, then carefully slot the fuse into the empty socket. There\'s a satisfying CLUNK, followed by a low hum. The ski lift machinery groans to life! The chairs begin moving along the cable. The lift is working! You can now ride it up to the mountain peak.', 'normal')
      const room = s.rooms.ski_lift_top
      s = {
        ...s,
        inventory: s.inventory.filter(id => id !== 'fuse' && id !== 'screwdriver'),
        puzzles: { ...s.puzzles, ski_lift_fixed: true },
        rooms: {
          ...s.rooms,
          ski_lift_top: {
            ...room,
            description: 'The upper ski lift station hums with power. The lift chairs glide smoothly along the cable, ready to carry riders to the peak. The electrical panel on the side of the station house is closed, the fuse and screwdriver both used in the repair.',
            exits: { ...room.exits, up: 'mountain_peak' },
          },
        },
      }
      s = addOutput(s, '\n[The ski lift is now operational! You can go up to the mountain peak.]', 'system')
      return s
    } else {
      // Standard/Easy mode - only fuse required (original behavior)
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
  }

  // Screwdriver alone at ski lift - hint about needing fuse
  if (itemId === 'screwdriver' && roomId === 'ski_lift_top' && state.mode === 'expert') {
    return addOutput(state, 'You use the screwdriver to open the electrical panel. Inside you can see an empty fuse socket -- the lift won\'t work without a fuse. You close the panel back up.', 'normal')
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

  // Torch in the cave
  if (itemId === 'torch' && roomId === 'hidden_cave') {
    return addOutput(state, 'You hold the torch high. The flickering light reveals the cave walls in detail -- ancient markings, trail symbols, and an arrow pointing down toward the stone steps. The circular indentation beside the steps gleams in the torchlight.', 'normal')
  }

  // Matches (expert mode only) - light briefly then blow out
  if (itemId === 'matches' && state.mode === 'expert') {
    return addOutput(state, 'You strike a match. It flares to life with a warm, flickering glow... but the mountain wind quickly snuffs it out. The brief light was comforting, but not very useful. Perhaps a candle would hold a flame longer.', 'normal')
  }

  // Light candles with matches (expert mode only)
  if (itemId === 'candles' && state.mode === 'expert') {
    if (!state.inventory.includes('matches')) {
      return addOutput(state, 'You hold the prayer candles, but you have no way to light them. You need matches or some other source of fire.', 'error')
    }

    // Light the candle
    let s = addOutput(state, 'You strike a match and carefully light one of the prayer candles. The warm glow pushes back the shadows around you. The flame flickers but holds steady -- a comforting light in the cold mountain air.', 'normal')
    s = {
      ...s,
      puzzles: { ...s.puzzles, candle_lit: true },
    }
    s = addOutput(s, '\n[The candle provides dim light, but beware of the wind!]', 'system')
    return s
  }

  // Avalanche beacon - scold player for false alarm (expert mode only)
  if (itemId === 'avalanche_beacon' && state.mode === 'expert') {
    let s = addOutput(state, 'You press the activation button on the avalanche beacon. Nothing happens -- the battery is long dead.', 'normal')
    s = addOutput(s, '', 'normal')
    s = addOutput(s, 'Even if it worked, activating a beacon when there\'s no actual avalanche emergency is incredibly dangerous and irresponsible. False alarms put rescue teams at risk and waste critical resources.', 'normal')
    s = addOutput(s, '', 'normal')
    s = addOutput(s, 'Have you heard the story of "The Boy Who Cried Wolf"? When a real emergency happens, nobody will believe you if you\'ve raised false alarms. Out here in the mountains, that kind of mistake can cost lives.', 'normal')
    return s
  }

  return addOutput(state, `You're not sure how to use the ${item.name} here.`, 'error')
}

export function handleGive(state, { itemId, npcId }) {
  if (!state.inventory.includes(itemId)) {
    return addOutput(state, "You're not carrying that.", 'error')
  }

  const room = state.rooms[state.currentRoomId]
  if (!room.npcs.includes(npcId)) {
    return addOutput(state, `They're not here.`, 'error')
  }

  const item = state.items[itemId]
  const npc = state.npcs[npcId]

  // Frozen flower gift - one-time only, special responses per NPC
  if (itemId === 'frozen_flower') {
    if (state.puzzles.frozen_flower_given) {
      return addOutput(state, "You've already given the frozen flower away.", 'error')
    }

    let s = state

    if (npcId === 'angry_boss') {
      s = addOutput(s, `You hold out the frozen flower to ${npc.name}.`, 'normal')
      s = addOutput(s, '', 'normal')
      s = addOutput(s, '"What is THIS?!" Angry Boss snatches the flower and holds it up to the light. Her scowl flickers for just a moment. "A frozen flower. Great. Just GREAT. You know what this reminds me of? My FEELINGS on this vacation -- FROZEN and DEAD."\n\nShe pauses, turning the delicate petals in her fingers.\n\n"...It\'s actually kind of beautiful though. Fine. FINE! I\'ll keep it. But DON\'T tell anyone I said that. My reputation as the angriest person in this resort is ALL I have left."', 'npc')
    } else if (npcId === 'dance_mom') {
      s = addOutput(s, `You hold out the frozen flower to ${npc.name}.`, 'normal')
      s = addOutput(s, '', 'normal')
      s = addOutput(s, '"Oh. My. GOD!" Dance Mom nearly drops her phone. "Is that a FROZEN FLOWER?! This is going STRAIGHT on my livestream! Hold on -- let me get the angle right --"\n\nShe grabs the flower and poses with it for approximately forty-seven selfies.\n\n"This is CONTENT GOLD, honey! \'Mountain adventurer gifts rare frozen botanical specimen to influencer\' -- my followers are going to LOSE IT! All four of them! You are now officially my favorite person at this resort. Don\'t let it go to your head."', 'npc')
    } else if (npcId === 'henrys_mom') {
      s = addOutput(s, `You hold out the frozen flower to ${npc.name}.`, 'normal')
      s = addOutput(s, '', 'normal')
      s = addOutput(s, '"Oh... oh my." Henry\'s Mom takes the frozen flower with trembling hands, her eyes glistening. "This is the most thoughtful thing anyone has done for me since... well, since Henry made me a macaroni necklace in kindergarten. That was five thermoses ago."\n\nShe carefully tucks the flower into her massive tote bag, between the granola bars and the emergency socks.\n\n"I\'m going to press this in a book and keep it FOREVER. You are such a sweet person. Do you want a juice box? A granola bar? I have fourteen. HENRY! HENRY, COME SEE WHAT THIS NICE PERSON GAVE ME! ...He\'s still in the bar, isn\'t he."', 'npc')
    } else {
      s = addOutput(s, `You offer the frozen flower to ${npc.name}, but they don't seem interested.`, 'normal')
      return s
    }

    // Remove from inventory and mark as given
    s = {
      ...s,
      inventory: s.inventory.filter(id => id !== 'frozen_flower'),
      puzzles: { ...s.puzzles, frozen_flower_given: true },
    }
    s = addOutput(s, '\n[Frozen flower removed from inventory]', 'system')
    return s
  }

  // For other items, fall back to talking (the dialogue system handles item-based interactions)
  return handleTalk(state, { npcId })
}

export function handleRead(state, { itemId }) {
  if (!state.inventory.includes(itemId)) {
    return addOutput(state, "You need to pick that up first before you can read it.", 'error')
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
    try {
      const elapsedMs = Date.now() - (state.startTime || Date.now())
      const steps = state.turnCount + 1
      const result = saveHighScore(state.playerName || 'Adventurer', steps, elapsedMs, state.mode || 'standard')
      const { rank, scores, keptPrevious, previousMode, previousSteps } = result

      s = addOutput(s, '', 'normal')
      s = addOutput(s, `${state.playerName}'s stats:  ${steps} steps  |  ${formatTime(elapsedMs)}`, 'victory')
      if (keptPrevious) {
        s = addOutput(s, `Your earlier score remains (#${rank}) — ${previousSteps} steps in ${previousMode} mode was a better run!`, 'system')
      } else if (rank === 1) {
        s = addOutput(s, 'NEW #1 HIGH SCORE!', 'victory')
      } else {
        s = addOutput(s, `Ranked #${rank} on the leaderboard!`, 'victory')
      }
      s = addOutputLines(s, formatScoreBoard(scores))
    } catch (e) {
      s = addOutput(s, '', 'normal')
      s = addOutput(s, 'Congratulations on completing the adventure!', 'victory')
    }

    // Victory image
    s = {
      ...s,
      output: [...s.output, { type: 'image', src: `${import.meta.env.BASE_URL}victory.svg`, text: 'The Golden Ski Trophy' }],
    }

    s = addSound(s, 'victory')
    s = { ...s, gameOver: true, puzzles: { ...s.puzzles, victory: true } }
    return s
  }

  // Special handling for old_map - color-code rooms on the map
  if (itemId === 'old_map' && item.readText) {
    // Map room IDs to their display names on the map
    // Map display names that appear in [brackets] on the map → room IDs
    // Some rooms have different names on standard vs expert maps
    const nameToRoomId = {
      'Lodge Lobby': 'lodge_lobby',
      'Lodge Bar': 'lodge_bar',
      'Bar': 'lodge_bar',
      'Balcony': 'lodge_balcony',
      'Game Room': 'game_room',
      'Basement': 'basement',
      'Main Street': 'main_street',
      'Ski Rental': 'ski_rental',
      'Village': 'village',
      'Ski Slopes': 'ski_slopes',
      'Frozen Waterfall': 'frozen_waterfall',
      'Ski Lift Top': 'ski_lift_top',
      'Mountain Peak': 'mountain_peak',
      // Expert mode rooms
      'Staff': 'staff_hallway',
      'Staff Quarters': 'staff_quarters',
      'Kitchen': 'kitchen',
      'Pantry': 'pantry',
      'Storage': 'storage_room',
      'General Store': 'general_store',
      'Chapel': 'chapel',
      'Old Cabin': 'old_cabin',
      'Underground Tunnel': 'underground_tunnel',
      'Observatory': 'hidden_observatory',
      'Ice Caves': 'ice_caves',
      'Avalanche Zone': 'avalanche_zone',
      'Ridge Trail': 'ridge_trail',
      'Summit Shelter': 'summit_shelter',
    }

    const lines = item.readText.split('\n')
    let s = state

    for (const line of lines) {
      // Find all [Room Name] patterns in this line
      const bracketPattern = /\[([^\]]+)\]/g
      const matches = []
      let match
      while ((match = bracketPattern.exec(line)) !== null) {
        const displayName = match[1]
        const roomId = nameToRoomId[displayName]
        if (roomId) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            displayName,
            roomId,
          })
        }
      }

      if (matches.length === 0) {
        // No room names on this line - render as normal green
        s = addOutput(s, line, 'normal')
      } else {
        // Build segments with color-coded room names
        const segments = []
        let pos = 0
        for (const m of matches) {
          // Add text before this match (green)
          if (m.start > pos) {
            segments.push({ text: line.slice(pos, m.start) })
          }
          // Add the room name with appropriate color
          if (m.roomId === state.currentRoomId) {
            segments.push({ text: m.text, type: 'current' })
          } else if (state.rooms[m.roomId]?.visited) {
            segments.push({ text: m.text, type: 'visited' })
          } else {
            segments.push({ text: m.text })
          }
          pos = m.end
        }
        // Add remaining text after last match
        if (pos < line.length) {
          segments.push({ text: line.slice(pos) })
        }
        // Add as segmented output line
        s = {
          ...s,
          output: [...s.output, { text: '', type: 'normal', segments }],
        }
      }
    }

    return s
  }

  // For items with readText
  if (item.readText) {
    return addOutput(state, item.readText, 'normal')
  }

  // Default: show description
  return addOutput(state, item.description, 'normal')
}

export function handleQuit(state) {
  return {
    ...state,
    gameRestart: true,
    output: [
      ...state.output,
      { text: '', type: 'normal' },
      { text: 'Restarting game...', type: 'system' },
      { text: 'Returning to mode selection...', type: 'system' },
    ]
  }
}

