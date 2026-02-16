export const introText = [
  { text: '', type: 'normal' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'title' },
  { text: '|       THE SECRET OF SNOWPEAK RESORT:       |', type: 'title' },
  { text: '|       A Zork-Style Text Adventure.         |', type: 'title' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'title' },
  { text: '', type: 'normal' },
  { text: 'You arrive at Snowpeak Resort on a cold winter morning, ready for your first ski vacation. The brochure promised "world-class slopes and luxury accommodations." The reality... is somewhat different.', type: 'normal' },
  { text: '', type: 'normal' },
  { text: 'The resort is nearly abandoned. The ski lift is broken. Most of the shops are boarded up. But three fellow beginner skiers are here with you, each as bewildered as the last. And there are whispers of a secret hidden somewhere on this mountain -- a treasure left behind by the resort\'s eccentric founder, Tobias Snowpeak.', type: 'normal' },
  { text: '', type: 'normal' },
  { text: 'Maybe this trip won\'t be so boring after all...', type: 'normal' },
  { text: '', type: 'normal' },
  { text: 'Type "help" for a list of commands, or "look" to examine your surroundings.', type: 'system' },
  { text: '', type: 'normal' },
]

export const victoryText = [
  { text: '', type: 'normal' },
  { text: '★ ★ ★  CONGRATULATIONS!  ★ ★ ★', type: 'victory' },
  { text: '', type: 'normal' },
  { text: 'You have discovered THE SECRET OF SNOWPEAK RESORT!', type: 'victory' },
  { text: '', type: 'normal' },
  { text: 'With the help of your fellow beginner skiers -- even the angry one -- you uncovered the hidden treasure of Tobias Snowpeak. The Golden Ski Trophy is yours!', type: 'victory' },
  { text: '', type: 'normal' },
  { text: 'Thank you for playing!', type: 'victory' },
]

export const GAME_VERSION = '1.4.1'

export const helpText = [
  { text: '--- AVAILABLE COMMANDS ---', type: 'system' },
  { text: '', type: 'normal' },
  { text: 'Movement:    north (n), south (s), east (e), west (w), up (u), down (d)', type: 'system' },
  { text: 'Look:        look / look at <thing> -- examine your surroundings or an object', type: 'system' },
  { text: 'Take:        take <item> -- pick up an item', type: 'system' },
  { text: 'Drop:        drop <item> -- drop an item from your inventory', type: 'system' },
  { text: 'Use:         use <item> -- use an item (context-sensitive)', type: 'system' },
  { text: 'Talk:        talk to <character> -- speak with someone', type: 'system' },
  { text: 'Give:        give <item> to <character> -- offer an item to someone', type: 'system' },
  { text: 'Inventory:   inventory (i) -- check what you\'re carrying', type: 'system' },
  { text: 'Read:        read <item> -- read a readable item', type: 'system' },
  { text: 'Scores:      scores -- view the high score leaderboard', type: 'system' },
  { text: 'Help:        help -- show this message', type: 'system' },
  { text: '', type: 'normal' },
  { text: `The Secret of Snowpeak Resort v${GAME_VERSION}`, type: 'system' },
  { text: '', type: 'normal' },
]
