const DIRECTION_MAP = {
  north: 'north', n: 'north',
  south: 'south', s: 'south',
  east: 'east', e: 'east',
  west: 'west', w: 'west',
  up: 'up', u: 'up',
  down: 'down', d: 'down',
}

const VERB_PATTERNS = [
  { verbs: ['go', 'walk', 'move', 'head', 'travel'], action: 'MOVE' },
  { verbs: ['look', 'l', 'examine', 'inspect', 'describe'], action: 'LOOK' },
  { verbs: ['take', 'get', 'grab', 'pickup'], action: 'TAKE' },
  { verbs: ['drop', 'put', 'discard', 'leave'], action: 'DROP' },
  { verbs: ['use', 'apply', 'play'], action: 'USE' },
  { verbs: ['give', 'offer', 'hand', 'show'], action: 'GIVE' },
  { verbs: ['talk', 'speak', 'ask', 'chat'], action: 'TALK' },
  { verbs: ['read'], action: 'READ' },
  { verbs: ['inventory', 'inv', 'i'], action: 'INVENTORY' },
  { verbs: ['help', 'h', '?', 'commands'], action: 'HELP' },
  { verbs: ['scores', 'score', 'highscores', 'leaderboard'], action: 'SCORES' },
  { verbs: ['quit', 'exit', 'restart', 'reset'], action: 'QUIT' },
]

function stripArticles(words) {
  return words.filter(w => !['the', 'a', 'an', 'at', 'to', 'with', 'on', 'in'].includes(w))
}

function matchNpc(noun, state) {
  const room = state.rooms[state.currentRoomId]
  for (const npcId of room.npcs) {
    const npc = state.npcs[npcId]
    const npcWords = npc.name.toLowerCase().split(/\s+/)
    if (npcWords.some(w => noun.includes(w)) || noun.includes(npc.name.toLowerCase())) {
      return npcId
    }
  }
  // Also check by partial match on id
  for (const npcId of room.npcs) {
    if (noun.some(w => npcId.includes(w))) {
      return npcId
    }
  }
  return null
}

// Aliases that map alternative phrases to canonical item IDs
const ITEM_ALIASES = {
  'arcade game': 'arcade_machine',
  'defend game': 'basement_arcade',
  'defend the village': 'basement_arcade',
  'defend village': 'basement_arcade',
  'dusty arcade': 'basement_arcade',
  'old arcade': 'basement_arcade',
  'basement arcade': 'basement_arcade',
  'snowball game': 'store_arcade',
  'snowball fight': 'store_arcade',
  'snowball showdown': 'store_arcade',
  'store arcade': 'store_arcade',
  'store cabinet': 'store_arcade',
  'ice breaker': 'shelter_arcade',
  'icebreaker': 'shelter_arcade',
  'icebreaker game': 'shelter_arcade',
  'shelter arcade': 'shelter_arcade',
  'shelter cabinet': 'shelter_arcade',
  'tokens': 'game_tokens',
  'game tokens': 'game_tokens',
  'bag of tokens': 'game_tokens',
  'token bag': 'game_tokens',
}

function matchItem(noun, state) {
  const room = state.rooms[state.currentRoomId]
  const allItems = [...room.items, ...state.inventory]

  // Check aliases first
  const nounPhrase = noun.join(' ')
  for (const [alias, itemId] of Object.entries(ITEM_ALIASES)) {
    if (nounPhrase.includes(alias) && allItems.includes(itemId)) {
      return itemId
    }
  }

  for (const itemId of allItems) {
    const item = state.items[itemId]
    if (!item) continue
    // Skip hidden items
    if (item.hidden && room.items.includes(itemId)) continue
    const itemWords = item.name.toLowerCase().split(/\s+/)
    if (itemWords.some(w => noun.includes(w)) || noun.includes(item.name.toLowerCase())) {
      return itemId
    }
  }
  // Partial match on id
  for (const itemId of allItems) {
    const item = state.items[itemId]
    if (!item) continue
    if (item.hidden && room.items.includes(itemId)) continue
    if (noun.some(w => itemId.includes(w))) {
      return itemId
    }
  }
  return null
}

export function parse(input, state) {
  const raw = input.toLowerCase().trim()
  if (!raw) return { error: 'Say something!' }

  const tokens = raw.split(/\s+/)

  // Hidden admin command
  if (raw === 'erase table') {
    return { type: 'ERASE_SCORES' }
  }

  // Check for bare direction input
  if (tokens.length === 1 && DIRECTION_MAP[tokens[0]]) {
    return { type: 'MOVE', payload: { direction: DIRECTION_MAP[tokens[0]] } }
  }

  // Check for "pick up" as a two-word verb
  let verb = tokens[0]
  let nounTokens = tokens.slice(1)
  if (verb === 'pick' && tokens[1] === 'up') {
    verb = 'pickup'
    nounTokens = tokens.slice(2)
  }

  // Match verb
  const pattern = VERB_PATTERNS.find(p => p.verbs.includes(verb))
  if (!pattern) {
    // Maybe they typed a direction with extra words
    const dir = DIRECTION_MAP[tokens[tokens.length - 1]]
    if (dir) {
      return { type: 'MOVE', payload: { direction: dir } }
    }
    return { error: `I don't understand "${raw}". Type "help" for a list of commands.` }
  }

  const action = pattern.action

  // No-argument commands
  if (action === 'INVENTORY' || action === 'HELP' || action === 'QUIT') {
    return { type: action }
  }

  // Scores with optional "all" argument
  if (action === 'SCORES') {
    const showAll = nounTokens.some(t => ['all', 'more', 'full', 'expand'].includes(t))
    return { type: 'SCORES', payload: { showAll } }
  }

  // Look with no target = look at room
  if (action === 'LOOK' && nounTokens.length === 0) {
    return { type: 'LOOK', payload: {} }
  }

  const noun = stripArticles(nounTokens)

  // Movement with verb: "go north"
  if (action === 'MOVE') {
    const dirWord = noun[0]
    const direction = DIRECTION_MAP[dirWord]
    if (!direction) {
      return { error: `Go where? Try a direction: north, south, east, west, up, down.` }
    }
    return { type: 'MOVE', payload: { direction } }
  }

  // Give command - tries to match both item and NPC
  if (action === 'GIVE') {
    if (noun.length === 0) {
      return { error: 'Give what to whom? Try "give <item> to <character>".' }
    }
    const room = state.rooms[state.currentRoomId]
    const itemId = matchItem(noun, state)
    const npcId = matchNpc(noun, state)
    if (itemId && npcId) {
      return { type: 'GIVE', payload: { itemId, npcId } }
    }
    if (itemId && !npcId) {
      if (room.npcs.length === 1) {
        return { type: 'GIVE', payload: { itemId, npcId: room.npcs[0] } }
      }
      if (room.npcs.length > 1) {
        return { error: 'Give it to whom? There are multiple people here.' }
      }
      return { error: "There's nobody here to give that to." }
    }
    // No item matched - fall back to TALK (for dialogue-based giving like whiskey)
    if (npcId) {
      return { type: 'TALK', payload: { npcId } }
    }
    if (room.npcs.length > 0) {
      return { type: 'TALK', payload: { npcId: room.npcs[0] } }
    }
    return { error: "There's nobody here to give that to." }
  }

  // Talk command - resolve NPC
  if (action === 'TALK') {
    if (noun.length === 0) {
      return { error: 'Talk to whom? Try "talk to <character name>".' }
    }
    const npcId = matchNpc(noun, state)
    if (!npcId) {
      return { error: `There's nobody called "${nounTokens.join(' ')}" here.` }
    }
    return { type: 'TALK', payload: { npcId } }
  }

  // Item commands - resolve item
  if (['TAKE', 'DROP', 'USE', 'LOOK', 'READ'].includes(action)) {
    if (noun.length === 0) {
      const verb = action === 'LOOK' ? 'Look at' : action.charAt(0) + action.slice(1).toLowerCase()
      return { error: `${verb} what?` }
    }

    // For LOOK, also try to match NPC
    if (action === 'LOOK') {
      const npcId = matchNpc(noun, state)
      if (npcId) {
        return { type: 'LOOK', payload: { npcId } }
      }
    }

    const itemId = matchItem(noun, state)
    if (!itemId) {
      // For LOOK, check room features
      if (action === 'LOOK') {
        return { type: 'LOOK', payload: { target: nounTokens.join(' ') } }
      }
      return { error: `I don't see "${nounTokens.join(' ')}" here.` }
    }
    return { type: action, payload: { itemId } }
  }

  return { error: `I don't understand "${raw}". Type "help" for a list of commands.` }
}
