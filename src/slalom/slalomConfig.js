// Slalom Challenge — 80s Arcade Ski Mini-Game
// All game constants and difficulty curve

export const CANVAS = {
  WIDTH: 480,
  HEIGHT: 640,
}

// CGA-inspired retro palette
export const COLORS = {
  SNOW_LIGHT: '#e8e8f0',
  SNOW_DARK: '#d0d0e0',
  SKI_BODY: '#ff5555',
  SKI_SKIS: '#333333',
  GATE_LEFT: '#ff4444',   // red flag
  GATE_RIGHT: '#4488ff',  // blue flag
  GATE_POLE: '#886644',
  OBSTACLE_ROCK: '#888888',
  OBSTACLE_BEAR: '#dddddd',
  OBSTACLE_SKIER: '#ff8800',
  TREE_TRUNK: '#664422',
  TREE_LEAVES: '#227744',
  HUD_GREEN: '#33ff33',
  HUD_BG: 'rgba(0,0,0,0.6)',
  OVERLAY_BG: 'rgba(0,0,0,0.85)',
  MISS_RED: '#ff4444',
  TEXT_WHITE: '#ffffff',
  TEXT_DIM: '#88ff88',
}

export const SKIER = {
  WIDTH: 16,
  HEIGHT: 24,
  START_Y: 100,         // fixed near top of screen
  ACCEL: 0.6,           // acceleration per frame when key held
  FRICTION: 0.88,       // velocity multiplier per frame (deceleration)
  MAX_VX: 6,            // max horizontal speed
}

export const GATE = {
  MIN_GAP: 60,          // narrowest gate gap (difficulty 10)
  MAX_GAP: 120,         // widest gate gap (difficulty 1)
  FLAG_WIDTH: 8,
  FLAG_HEIGHT: 20,
  POLE_WIDTH: 3,
  POLE_HEIGHT: 28,
  SPAWN_SPACING_MIN: 150,  // world-Y distance between gates at high difficulty
  SPAWN_SPACING_MAX: 200,  // at low difficulty
}

// Warmup: first N gates are gentler to ease the player in
export const WARMUP = {
  GATE_COUNT: 10,          // how many gates before full difficulty kicks in
  GAP: 160,                // wide gate opening during warmup
  SPACING: 180,            // comfortable vertical distance between warmup gates
  MAX_DRIFT: 100,          // max horizontal shift between consecutive warmup gates
  OBSTACLE_CHANCE: 0,      // no obstacles during warmup
}

export const OBSTACLE = {
  ROCK: { width: 24, height: 20 },
  BEAR: { width: 28, height: 28 },
  SKIER: { width: 16, height: 24 },
  TYPES: ['rock', 'bear', 'skier'],
  // Moving skier obstacles in mid-late game
  SKIER_MOVE_MIN_DIFFICULTY: 4,  // difficulty level where skiers start moving
  SKIER_VX_MIN: 0.3,             // min horizontal speed
  SKIER_VX_MAX: 1.2,             // max horizontal speed at difficulty 10
}

export const TREE = {
  MIN_SIZE: 20,
  MAX_SIZE: 40,
  EDGE_MARGIN: 60,      // trees only spawn in edge zones
}

export const DIFFICULTY = {
  LEVELS: 10,
  DISTANCE_PER_LEVEL: 750,
  SPEED_MIN: 2.0,       // px/frame at level 1
  SPEED_MAX: 6.0,       // px/frame at level 10
  OBSTACLE_CHANCE_MIN: 0.003, // per frame at level 1
  OBSTACLE_CHANCE_MAX: 0.015, // per frame at level 10
}

export const GAME = {
  MAX_MISSES: 5,
  SPAWN_AHEAD: 300,       // spawn entities this far below canvas bottom
  DESPAWN_BEHIND: -50,    // remove entities this far above canvas top
  TREE_SPAWN_CHANCE: 0.08, // much higher for dense tree-lined feel
  SCORE_PER_GATE: 100,
  CHAMPION_SCORE: 2000,   // score needed for quest flag
  // Max horizontal drift between consecutive gates (fraction of theoretical max)
  GATE_DRIFT_FACTOR: 0.55,
}

export const RIVAL = {
  GATE_INTERVAL: 5,           // spawn rival every N gates passed
  SPEED_MULT_START: 1.5,      // initial speed = 1.5x player speed
  SPEED_MULT_MAX: 4,          // accelerates to 4x player speed
  ACCEL_FRAMES: 120,          // frames to reach max speed (~2 seconds)
  BODY_COLOR: '#33ff33',      // bright green jersey
  HELMET_COLOR: '#ffcc00',    // gold helmet to stand out
  LABEL: 'NPC',
}

export const CROWD = {
  GATE_INTERVAL: 10,        // spectators appear every N gates passed
  PEOPLE_PER_SIDE: 5,       // number of spectators per side
  PERSON_WIDTH: 8,
  PERSON_HEIGHT: 16,
  SPACING: 14,              // horizontal spacing between spectators
  SIDE_MARGIN: 10,          // distance from canvas edge
  // Bright retro jacket colors for the crowd
  JACKET_COLORS: ['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff', '#ff8800', '#ff44aa'],
}

export const FONTS = {
  HUD: '20px VT323, monospace',
  TITLE: '48px VT323, monospace',
  SUBTITLE: '24px VT323, monospace',
  OVERLAY: '28px VT323, monospace',
  SMALL: '18px VT323, monospace',
}
