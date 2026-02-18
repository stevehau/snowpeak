// Snowball Showdown — 80s Arcade Snowball Fight
// All game constants

export const CANVAS = {
  WIDTH: 480,
  HEIGHT: 640,
}

// Retro winter palette
export const COLORS = {
  SKY_TOP: '#0a1a3e',
  SKY_BOTTOM: '#1a3a6e',
  GROUND: '#ddeeff',
  GROUND_DARK: '#bbccee',
  SNOW_LINE: '#ffffff',
  TREE_TRUNK: '#553311',
  TREE_LEAVES: '#1a5522',
  TREE_SNOW: '#ddeeff',
  MOUNTAIN: '#5566aa',
  MOUNTAIN_DARK: '#445588',
  SNOW_CAPS: '#eeeeff',
  FORT_WALL: '#8899bb',
  FORT_SHADOW: '#667799',
  SNOWBALL: '#ffffff',
  SNOWBALL_SHADOW: '#bbccdd',
  SPLAT_WHITE: '#ffffff',
  SPLAT_BLUE: '#aaccff',
  PLAYER_BODY: '#cc3333',     // red jacket
  PLAYER_DARK: '#991111',
  PLAYER_SKIN: '#ffcc99',
  PLAYER_HAT: '#cc3333',
  OPPONENT_BODY: '#3366cc',   // blue jacket
  OPPONENT_DARK: '#1144aa',
  OPPONENT_SKIN: '#ffcc99',
  OPPONENT_HAT: '#3366cc',
  HUD_BG: 'rgba(0,0,0,0.6)',
  HUD_GREEN: '#33ff33',
  HUD_YELLOW: '#ffcc00',
  HUD_RED: '#ff4444',
  OVERLAY_BG: 'rgba(0,0,0,0.85)',
  TEXT_WHITE: '#ffffff',
  TEXT_DIM: '#88ccff',
  MISS_PUFF: '#ddeeff',
}

export const FONTS = {
  HUD: '20px VT323, monospace',
  TITLE: '44px VT323, monospace',
  SUBTITLE: '24px VT323, monospace',
  OVERLAY: '28px VT323, monospace',
  SMALL: '18px VT323, monospace',
  TINY: '14px VT323, monospace',
  BIG: '36px VT323, monospace',
}

// Game rules
export const GAME = {
  THROWS_PER_TURN: 5,        // each side gets 5 throws per turn
  HITS_TO_WIN: 5,             // first to 5 hits wins
  THROW_DELAY: 60,            // frames between computer throws (~1s)
  TURN_SWITCH_DELAY: 90,      // frames pause between turns (~1.5s)
  SNOWBALL_SPEED: 6,          // pixels per frame
  SNOWBALL_ARC: 0.15,         // arc height factor
  SNOWBALL_SIZE: 8,           // radius
  SPLAT_DURATION: 40,         // frames splat stays visible
  HIT_STUN: 30,               // frames character is stunned after hit
  DOUBLE_THROW_CHANCE: 0.3,   // 30% chance computer throws 2 at once
  PLAYER_TURN_TIMEOUT: 600,   // ~10 seconds at 60fps — player forfeits turn if idle
}

// Character positions and movement
export const PLAYER = {
  X: 370,                     // right side
  Y_CENTER: 400,              // center vertical position
  WIDTH: 36,
  HEIGHT: 56,
  MOVE_SPEED: 4,              // pixels per frame
  Y_MIN: 280,                 // top movement bound
  Y_MAX: 520,                 // bottom movement bound
}

export const OPPONENT = {
  X: 110,                     // left side
  Y_CENTER: 400,
  WIDTH: 36,
  HEIGHT: 56,
  MOVE_SPEED: 3,              // slightly slower than player
  Y_MIN: 280,
  Y_MAX: 520,
  // AI dodge settings
  DODGE_REACTION: 20,         // frames before AI reacts to incoming snowball
  DODGE_CHANCE: 0.6,          // probability AI successfully dodges
  DODGE_MISS_CHANCE: 0.15,    // chance AI dodges INTO the snowball
}

// Field layout
export const FIELD = {
  HORIZON_Y: 200,             // where sky meets ground
  CENTER_LINE: 240,           // dividing line between sides
  FORT_HEIGHT: 40,            // snow fort height
}
