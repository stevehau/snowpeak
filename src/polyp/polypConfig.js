// Polyp Sniper — Configuration & Constants
// 80s retro arcade endoscopy game

export const CANVAS = {
  WIDTH: 480,
  HEIGHT: 640,
}

export const COLORS = {
  // Colon anatomy
  COLON_CENTER: '#e8b8b0',    // lighter pink center (lumen)
  COLON_WALL: '#c9907d',      // mid fleshy pink
  COLON_SHADOW: '#8a5a4a',    // darker recesses
  COLON_VEIN: 'rgba(160,70,70,0.25)', // subtle vein lines
  MUCOSA_HIGHLIGHT: 'rgba(255,200,180,0.4)',

  // Polyp types
  POLYP_SMALL: '#55bb55',     // green — benign
  POLYP_SMALL_HI: '#88dd88',
  POLYP_MEDIUM: '#ddaa22',    // yellow — adenoma
  POLYP_MEDIUM_HI: '#eedd55',
  POLYP_LARGE: '#cc3333',     // red — suspicious
  POLYP_LARGE_HI: '#ee6655',
  POLYP_BOSS: '#880022',      // dark red — the big one
  POLYP_BOSS_HI: '#bb3344',
  POLYP_BOSS_GLOW: 'rgba(200,0,40,0.4)',
  POLYP_OUTLINE: '#5a3030',

  // Scope / reticle
  SCOPE_RING: '#00ee00',
  SCOPE_DIM: '#009900',
  SCOPE_GLOW: 'rgba(0,255,0,0.15)',
  SCOPE_DOT: '#00ff00',

  // HUD
  HUD_GREEN: '#33ff33',
  HUD_BG: 'rgba(0,0,0,0.55)',
  HUD_TEXT: '#ffffff',
  HUD_GOLD: '#ffd700',
  HUD_RED: '#ff3333',
  HUD_DIM: '#88aa88',

  // Effects
  MISS_FLASH: 'rgba(255,50,50,0.3)',
  OUCH_TEXT: '#ff4444',
  BUBBLE: 'rgba(200,210,255,0.35)',
  SNIP_SPARK: '#ffffff',
  PARTICLE_PINK: 'rgba(200,100,100,0.6)',

  // Specimen jar
  JAR_GLASS: 'rgba(200,220,240,0.7)',
  JAR_LID: '#888899',
  JAR_LIQUID: 'rgba(240,240,200,0.4)',

  // Overlay text
  TEXT_WHITE: '#ffffff',
  TEXT_GOLD: '#ffd700',
  TEXT_ICE: '#aaddff',
  TEXT_DIM: '#889988',
  TEXT_RED: '#ff4444',
  OVERLAY_BG: 'rgba(5,10,15,0.85)',
}

export const FONTS = {
  HUD: '18px VT323, monospace',
  TITLE: '44px VT323, monospace',
  SUBTITLE: '22px VT323, monospace',
  OVERLAY: '28px VT323, monospace',
  BIG: '36px VT323, monospace',
  SMALL: '16px VT323, monospace',
  TINY: '13px VT323, monospace',
}

export const RETICLE = {
  RADIUS: 22,
  INNER: 3,
  CROSSHAIR_GAP: 6,
  CROSSHAIR_LEN: 10,
  LINE_WIDTH: 1.5,
  SPEED: 5,           // pixels per frame for arrow keys
}

export const TUNNEL = {
  CENTER_X: 240,
  CENTER_Y: 320,
  INNER_RADIUS: 60,   // dark center "depth"
  MID_RADIUS: 160,
  OUTER_RADIUS: 300,
  WAVE_SPEED: 0.015,
  WAVE_AMP: 12,
  FOLD_COUNT: 6,       // number of mucosal folds
  FOLD_DEPTH: 18,
}

export const GAME = {
  TOTAL_SECTIONS: 3,
  POLYPS_PER_SECTION: 8,     // regular polyps before boss
  BOSS_HP: 3,

  // Spawn timing (frames at 60fps)
  SPAWN_INTERVAL_START: 90,   // 1.5s
  SPAWN_INTERVAL_MIN: 35,     // ~0.6s
  SPAWN_INITIAL_DELAY: 60,    // 1s before first polyp

  // Polyp sizing
  SMALL_SIZE: 14,
  MEDIUM_SIZE: 20,
  LARGE_SIZE: 26,
  BOSS_SIZE: 42,

  // Scoring
  SMALL_PTS: 10,
  MEDIUM_PTS: 25,
  LARGE_PTS: 50,
  BOSS_PTS: 100,
  COMBO_BONUS: 0.15,         // 15% per combo level
  COMBO_WINDOW: 150,          // frames to maintain combo

  // Health
  MAX_MISSES: 5,

  // Hit detection
  HIT_RADIUS_MULT: 1.15,

  // Polyp movement (drift speed)
  SMALL_DRIFT: 0,
  MEDIUM_DRIFT: 0.008,
  LARGE_DRIFT: 0.015,
  BOSS_DRIFT: 0.005,

  // Section clear overlay
  SECTION_CLEAR_FRAMES: 150,  // 2.5s

  // Polyp lifetime (frames before it escapes — optional pressure)
  POLYP_LIFETIME: 600,        // 10s

  // Ambient particles
  MAX_BUBBLES: 8,
  BUBBLE_SPAWN_CHANCE: 0.03,
}

export const SECTIONS = [
  { name: 'ASCENDING COLON', tint: '#c9907d' },
  { name: 'TRANSVERSE COLON', tint: '#d4a090' },
  { name: 'DESCENDING COLON', tint: '#b9806d' },
]
