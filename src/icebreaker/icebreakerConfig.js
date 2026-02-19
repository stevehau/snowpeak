// Ice Breaker — Game constants and configuration (Winter/Snow theme)

export const CANVAS = {
  WIDTH: 480,
  HEIGHT: 640,
}

export const COLORS = {
  // Background — deep winter night sky
  SKY_TOP: '#0B1628',
  SKY_MID: '#152844',
  SKY_BOT: '#1A3355',
  STARS: '#ffffff',

  // Snow/ice brick rows (top to bottom, icy greys → blue-whites)
  BRICK_ROWS: [
    '#C8D0D8',  // dark snow grey
    '#D0D8E0',  // medium grey
    '#D8E0E8',  // light grey
    '#DDE5ED',  // pale grey-blue
    '#E2EAF2',  // lighter
    '#E8EFF5',  // near-white blue
    '#EDF3F8',  // pale ice
    '#F0F5FA',  // bright ice
    '#F5F9FC',  // almost white
    '#FAFCFE',  // purest snow
  ],
  BRICK_HIGHLIGHT: 'rgba(255,255,255,0.45)',
  BRICK_SHADOW: 'rgba(40,60,90,0.35)',
  BRICK_SILVER: '#A8B8CC',   // compacted ice (2-hit)
  BRICK_GOLD: '#88CCEE',     // glacier ice (3-hit)

  // Paddle — reindeer sleigh
  PADDLE: '#8B5E3C',
  PADDLE_HIGHLIGHT: '#B07848',
  PADDLE_SHADOW: '#5C3A20',
  PADDLE_GLOW: 'rgba(180,140,80,0.35)',
  PADDLE_METAL: '#C0C8D0',
  // Sleigh body
  SLEIGH_RED: '#CC2222',
  SLEIGH_DARK: '#881515',
  SLEIGH_TRIM: '#FFD700',
  SLEIGH_RUNNER: '#A0A8B0',
  // Reindeer
  DEER_BODY: '#8B6B42',
  DEER_LIGHT: '#A88050',
  DEER_DARK: '#5E4428',
  DEER_ANTLER: '#C4A060',
  DEER_NOSE: '#FF3333',
  HARNESS: '#CC8833',

  // Ball / snowflake
  BALL: '#FFFFFF',
  BALL_GLOW: 'rgba(180,220,255,0.4)',
  BALL_TRAIL: 'rgba(200,230,255,0.2)',
  SNOWFLAKE: '#E0F0FF',

  // HUD
  TEXT_WHITE: '#FFFFFF',
  TEXT_DIM: '#8899BB',
  TEXT_GOLD: '#FFD700',
  TEXT_RED: '#FF6666',
  TEXT_CYAN: '#88DDFF',
  TEXT_GREEN: '#88FFAA',
  TEXT_ICE: '#AADDFF',

  // Effects
  PARTICLE: '#E0EEFF',
  WALL_FLASH: 'rgba(180,220,255,0.15)',
  SNOW_PARTICLE: '#FFFFFF',
}

export const FONTS = {
  TITLE: '44px "Press Start 2P", "VT323", monospace',
  SUBTITLE: '22px "Press Start 2P", "VT323", monospace',
  OVERLAY: '28px "Press Start 2P", "VT323", monospace',
  HUD: '18px "Press Start 2P", "VT323", monospace',
  SMALL: '16px "Press Start 2P", "VT323", monospace',
  TINY: '12px "Press Start 2P", "VT323", monospace',
  BIG: '36px "Press Start 2P", "VT323", monospace',
}

export const PADDLE = {
  WIDTH: 72,
  HEIGHT: 14,
  Y: CANVAS.HEIGHT - 50,
  SPEED: 6,
  COLOR: COLORS.PADDLE,
}

export const BALL = {
  RADIUS: 8,
  BASE_SPEED: 5,
  MAX_SPEED: 9,
  SPEED_INCREMENT: 0.15,  // per level
}

export const BRICKS = {
  ROWS: 10,
  COLS: 10,
  WIDTH: 42,
  HEIGHT: 16,
  PADDING: 3,
  OFFSET_TOP: 80,
  OFFSET_LEFT: (CANVAS.WIDTH - (10 * 42 + 9 * 3)) / 2,
}

export const GAME = {
  LIVES: 3,
  POINTS_PER_BRICK: 10,
  POINTS_BONUS_ROW: 5,   // extra per row from top
  POWERUP_CHANCE: 0.08,  // chance a brick drops a powerup
  POWERUP_SPEED: 2,
  POWERUP_SIZE: 14,
  MAX_LEVELS: 5,
  // Timing
  SERVE_DELAY: 60,       // frames before auto-serve
  LEVEL_DELAY: 120,      // frames between levels
  GAMEOVER_DELAY: 90,
  // Snow
  SNOW_COUNT: 30,        // background snowflakes
}

// Powerup types — winter themed
export const POWERUPS = {
  WIDE: { color: '#66EEBB', label: 'W', duration: 600 },   // wider paddle (spring thaw)
  MULTI: { color: '#DD88FF', label: 'M', duration: 0 },    // multiball (blizzard)
  SLOW: { color: '#88BBFF', label: 'S', duration: 480 },   // slow ball (freeze)
}
