import { isCaveDark } from './commands'

const MAX_CHOICES = 7

export function generateChoices(state) {
  const room = state.rooms[state.currentRoomId]
  const choices = []

  // Dark cave — limited choices
  if (isCaveDark(state)) {
    choices.push({ label: 'Go west (Frozen Waterfall)', command: 'west' })
    if (room.items.includes('torch')) {
      choices.push({ label: 'Take torch', command: 'take torch' })
    }
    choices.push({ label: 'Look around', command: 'look' })
    return choices
  }

  // 1. ALL movement options (prioritize unvisited rooms)
  const allExits = { ...room.exits, ...room.hiddenExits }
  const showLockedExits = state.currentRoomId !== 'hidden_cave'
  const lockedExitDirs = showLockedExits ? Object.keys(room.lockedExits || {}) : []
  const allDirs = [...Object.keys(allExits), ...lockedExitDirs]

  const dirLabels = {
    north: 'Go north',
    south: 'Go south',
    east: 'Go east',
    west: 'Go west',
    up: 'Go up',
    down: 'Go down',
  }

  const unvisitedDirs = allDirs.filter(d => {
    const targetId = allExits[d] || room.lockedExits?.[d]?.roomId
    return targetId && !state.rooms[targetId]?.visited
  })
  const visitedDirs = allDirs.filter(d => {
    const targetId = allExits[d] || room.lockedExits?.[d]?.roomId
    return !targetId || state.rooms[targetId]?.visited
  })

  const priorityDirs = [...unvisitedDirs, ...visitedDirs]

  function makeDirChoice(dir) {
    const targetId = allExits[dir] || room.lockedExits?.[dir]?.roomId
    const targetName = targetId ? state.rooms[targetId]?.name : null
    const label = targetName
      ? `${dirLabels[dir] || `Go ${dir}`} (${targetName})`
      : `${dirLabels[dir] || `Go ${dir}`}`
    return { label, command: dir }
  }

  // Show ALL directions
  for (const dir of priorityDirs) {
    if (choices.length >= MAX_CHOICES) break
    choices.push(makeDirChoice(dir))
  }

  // 2. NPC interaction - show "Give X to Y" if player has an item the NPC wants
  for (const npcId of room.npcs) {
    if (choices.length >= MAX_CHOICES) break
    const npc = state.npcs[npcId]
    const giveItem = getGiveableItem(state, npcId)
    if (giveItem) {
      const item = state.items[giveItem]
      choices.push({ label: `Give ${item.name} to ${npc.name}`, command: `give ${item.name} to ${npc.name.toLowerCase()}` })
    } else {
      choices.push({ label: `Talk to ${npc.name}`, command: `talk to ${npc.name.toLowerCase()}` })
    }
  }

  // 3. ALL visible room items (take or look at)
  const visibleItems = room.items.filter(id => {
    const item = state.items[id]
    return item && !item.hidden
  })

  for (const itemId of visibleItems) {
    if (choices.length >= MAX_CHOICES) break
    const item = state.items[itemId]
    if (item.takeable) {
      choices.push({ label: `Take ${item.name}`, command: `take ${item.name}` })
    } else {
      choices.push({ label: `Look at ${item.name}`, command: `look at ${item.name}` })
    }
  }

  // 4. Context-sensitive room feature examination
  const roomExamine = getRoomExamineAction(state)
  if (roomExamine && choices.length < MAX_CHOICES) {
    choices.push(roomExamine)
  }

  // 5. Use an inventory item (context-sensitive)
  const useableHere = getUsableItem(state)
  if (useableHere && choices.length < MAX_CHOICES) {
    const item = state.items[useableHere]
    choices.push({ label: `Use ${item.name}`, command: `use ${item.name}` })
  }

  // 5b. Play the arcade game (room item, not inventory)
  if (state.currentRoomId === 'game_room' && room.items.includes('arcade_machine') && choices.length < MAX_CHOICES) {
    choices.push({ label: 'Play the arcade game', command: 'play arcade game' })
  }

  // 5c. Play the basement defend game (room item, not inventory)
  if (state.currentRoomId === 'basement' && room.items.includes('basement_arcade') && choices.length < MAX_CHOICES) {
    choices.push({ label: 'Play the dusty arcade cabinet', command: 'play defend game' })
  }

  // 5d. Play the store snowball game (room item, not inventory)
  if (state.currentRoomId === 'general_store' && room.items.includes('store_arcade') && choices.length < MAX_CHOICES) {
    choices.push({ label: 'Play the snowball arcade game', command: 'play snowball game' })
  }

  // 5e. Play the shelter ice breaker game (room item, not inventory)
  if (state.currentRoomId === 'summit_shelter' && room.items.includes('shelter_arcade') && choices.length < MAX_CHOICES) {
    choices.push({ label: 'Play the ice breaker arcade game', command: 'play ice breaker' })
  }

  // 5f. Play the storage room polyp sniper game (room item, not inventory)
  if (state.currentRoomId === 'storage_room' && room.items.includes('clinic_arcade') && choices.length < MAX_CHOICES) {
    choices.push({ label: 'Play the medical arcade game', command: 'play polyp sniper' })
  }

  // 6. Read items in inventory or room (victory item prioritized)
  const readableItem = findReadableItem(state)
  if (readableItem && choices.length < MAX_CHOICES) {
    const item = state.items[readableItem]
    choices.push({ label: `Read ${item.name}`, command: `read ${item.name}` })
  }

  // Fill remaining slots
  if (choices.length < MAX_CHOICES && state.inventory.length > 0) {
    choices.push({ label: 'Check inventory', command: 'inventory' })
  }

  if (choices.length < MAX_CHOICES) {
    choices.push({ label: 'Look around', command: 'look' })
  }

  if (choices.length < MAX_CHOICES) {
    choices.push({ label: 'Help', command: 'help' })
  }

  return choices.slice(0, MAX_CHOICES)
}

function getGiveableItem(state, npcId) {
  const npc = state.npcs[npcId]
  if (!npc || npc.dialogueState === 0) return null

  const npcWants = {
    angry_boss: 'whiskey_bottle',
    mr_smiles: 'ski_poles',
    dill_pickle: 'broken_radio',
  }

  const wantedItem = npcWants[npcId]
  if (wantedItem && state.inventory.includes(wantedItem)) {
    return wantedItem
  }
  return null
}

function getRoomExamineAction(state) {
  const roomId = state.currentRoomId

  if (roomId === 'frozen_waterfall' && !state.rooms.frozen_waterfall.hiddenExits?.east) {
    if (!state.inventory.includes('binoculars')) {
      return { label: 'Examine the frozen waterfall closely', command: 'look at waterfall' }
    }
  }

  return null
}

function getUsableItem(state) {
  const roomId = state.currentRoomId

  for (const itemId of state.inventory) {
    if (itemId === 'fuse' && roomId === 'ski_lift_top') return itemId
    if (itemId === 'strange_medallion' && roomId === 'hidden_cave') return itemId
    if (itemId === 'binoculars' && roomId === 'lodge_balcony') return itemId
    if (itemId === 'binoculars' && roomId === 'frozen_waterfall' && !state.rooms.frozen_waterfall.hiddenExits?.east) return itemId

    const room = state.rooms[roomId]
    if (itemId === 'whiskey_bottle' && room.npcs.includes('angry_boss')) return null
    if (itemId === 'ski_poles' && room.npcs.includes('mr_smiles')) return null
    if (itemId === 'broken_radio' && room.npcs.includes('dill_pickle')) return null
  }

  for (const itemId of state.inventory) {
    if (itemId === 'torch' && roomId === 'hidden_cave') return itemId
  }

  return null
}

function findReadableItem(state) {
  // Only show "Read" for items in inventory (must take them first)

  // Victory item always takes top priority
  if (state.inventory.includes('founders_letter')) {
    return 'founders_letter'
  }

  for (const itemId of state.inventory) {
    if (['old_map', 'dusty_journal', 'note_from_founder'].includes(itemId)) {
      return itemId
    }
  }
  return null
}
