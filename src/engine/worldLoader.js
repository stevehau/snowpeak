import { rooms } from '../data/rooms'
import { roomsExpert } from '../data/roomsExpert'
import { items } from '../data/items'
import { itemsExpert } from '../data/itemsExpert'
import { npcs } from '../data/npcs'
import { npcsExpert } from '../data/npcsExpert'
import { introText } from '../data/story'

export function createInitialState(playerName, mode) {
  // Choose room, item, and NPC sets based on mode
  const roomData = mode === 'expert' ? roomsExpert : rooms
  const itemData = mode === 'expert' ? itemsExpert : items
  const npcData = mode === 'expert' ? npcsExpert : npcs

  // Deep clone the data so we don't mutate the originals
  const roomsCopy = {}
  for (const [id, room] of Object.entries(roomData)) {
    roomsCopy[id] = {
      ...room,
      items: [...room.items],
      npcs: [...room.npcs],
      hiddenExits: { ...room.hiddenExits },
      lockedExits: room.lockedExits ? { ...room.lockedExits } : {},
      visited: false,
    }
  }

  const itemsCopy = {}
  for (const [id, item] of Object.entries(itemData)) {
    itemsCopy[id] = { ...item }
  }

  const npcsCopy = {}
  for (const [id, npc] of Object.entries(npcData)) {
    npcsCopy[id] = {
      ...npc,
      dialogue: [...npc.dialogue],
      flags: {},
    }
  }

  // Build the initial output with intro text and starting room description
  const startRoomId = 'lodge_lobby'
  const startRoom = roomsCopy[startRoomId]

  const initialOutput = [
    ...introText,
    { text: `Good luck, ${playerName}!`, type: 'system' },
    { text: '', type: 'normal' },
  ]

  if (startRoom.ascii) {
    initialOutput.push({ text: startRoom.ascii, type: 'ascii' })
  }
  initialOutput.push({ text: startRoom.name, type: 'title' })
  initialOutput.push({ text: startRoom.description, type: 'normal' })

  // Add visible items
  const visibleItems = startRoom.items.filter(id => !itemsCopy[id]?.hidden)
  if (visibleItems.length > 0) {
    const itemNames = visibleItems.map(id => itemsCopy[id].name)
    initialOutput.push({ text: `\nYou can see: ${itemNames.join(', ')}.`, type: 'normal' })
  }

  // Add NPCs
  if (startRoom.npcs.length > 0) {
    const npcNames = startRoom.npcs.map(id => npcsCopy[id].name)
    initialOutput.push({ text: `${npcNames.join(' and ')} ${startRoom.npcs.length === 1 ? 'is' : 'are'} here.`, type: 'normal' })
  }

  // Add exits with room names: "direction (Room Name)"
  const allExits = { ...startRoom.exits, ...startRoom.hiddenExits }
  const lockedExitsObj = startRoom.lockedExits || {}
  const exitList = []
  for (const dir of Object.keys(allExits)) {
    const targetRoom = roomsCopy[allExits[dir]]
    if (targetRoom) {
      exitList.push(`${dir} (${targetRoom.name})`)
    } else {
      exitList.push(dir)
    }
  }
  for (const dir of Object.keys(lockedExitsObj)) {
    // lockedExits values are objects: { roomId, keyId, message }
    const targetRoom = roomsCopy[lockedExitsObj[dir].roomId]
    if (targetRoom) {
      exitList.push(`${dir} (${targetRoom.name})`)
    } else {
      exitList.push(dir)
    }
  }
  if (exitList.length > 0) {
    initialOutput.push({ text: `\nExits: ${exitList.join(', ')}`, type: 'system' })
  }

  return {
    currentRoomId: startRoomId,
    previousRoomId: null,
    inventory: [],
    rooms: roomsCopy,
    items: itemsCopy,
    npcs: npcsCopy,
    puzzles: {},
    output: initialOutput,
    gameOver: false,
    turnCount: 0,
    playerName: playerName || 'Adventurer',
    mode: mode || 'standard',
    startTime: Date.now(),
  }
}
