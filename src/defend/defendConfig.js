// Defend the Village — 80s Arcade Shooting Gallery
// All game constants

export const CANVAS = {
  WIDTH: 480,
  HEIGHT: 640,
}

// CGA-inspired retro palette
export const COLORS = {
  SKY_TOP: '#1a0a2e',
  SKY_BOTTOM: '#2d1b4e',
  GROUND: '#2a4a1a',
  GROUND_DARK: '#1e3a12',
  SNOW_CAPS: '#ccccdd',
  MOUNTAIN: '#3a3a5a',
  MOUNTAIN_DARK: '#2a2a4a',
  TREE_TRUNK: '#553311',
  TREE_LEAVES: '#1a5522',
  CABIN_WALL: '#885533',
  CABIN_ROOF: '#553322',
  CABIN_WINDOW: '#ffcc44',
  RETICLE: '#ff3333',
  RETICLE_GLOW: '#ff6666',
  MUZZLE_FLASH: '#ffff88',
  HUD_GREEN: '#33ff33',
  HUD_BG: 'rgba(0,0,0,0.6)',
  OVERLAY_BG: 'rgba(0,0,0,0.85)',
  TEXT_WHITE: '#ffffff',
  TEXT_DIM: '#88ff88',
  MISS_RED: '#ff4444',
  WOLF_BODY: '#777788',
  WOLF_DARK: '#555566',
  WOLF_EYE: '#ffcc00',
  BEAR_BODY: '#664422',
  BEAR_DARK: '#553311',
  BEAR_EYE: '#ff4444',
  HIT_FLASH: '#ffffff',
  HEALTH_GREEN: '#33ff33',
  HEALTH_YELLOW: '#ffcc00',
  HEALTH_RED: '#ff3333',
  BOSS_GLOW: '#ff2200',
}

export const FONTS = {
  HUD: '20px VT323, monospace',
  TITLE: '48px VT323, monospace',
  SUBTITLE: '24px VT323, monospace',
  OVERLAY: '28px VT323, monospace',
  SMALL: '18px VT323, monospace',
  TINY: '14px VT323, monospace',
}

export const RETICLE = {
  SIZE: 20,          // crosshair radius
  SPEED: 5,          // pixels per frame movement
  LINE_WIDTH: 2,
}

export const GAME = {
  TOTAL_ANIMALS: 20,
  // Spawn timing (frames between spawns, decreases over time)
  SPAWN_INTERVAL_START: 120,  // ~2 seconds at 60fps
  SPAWN_INTERVAL_MIN: 45,     // ~0.75 seconds at peak
  // Animal approach speed (pixels per frame toward player)
  WOLF_SPEED_MIN: 0.24,       // 20% slower than original 0.3
  WOLF_SPEED_MAX: 0.64,       // 20% slower than original 0.8
  BEAR_SPEED_MIN: 0.18,       // 40% slower than original 0.3
  BEAR_SPEED_MAX: 0.48,       // 40% slower than original 0.8
  // Animal scale range (far away → close up)
  SCALE_MIN: 0.12,     // tiny dot in distance
  SCALE_MAX: 2.5,      // huge and right on top of you (bigger for FPS feel)
  // Scale at which animal "reaches" the player (game over)
  REACH_SCALE: 2.2,
  // Hit detection radius multiplier (relative to animal drawn size)
  HIT_RADIUS_MULT: 0.5,
  // Wolf base size (before scaling)
  WOLF_WIDTH: 40,
  WOLF_HEIGHT: 28,
  // Bear base size (before scaling) — taller for upright stance
  BEAR_WIDTH: 36,
  BEAR_HEIGHT: 55,
  // Spawn chances
  BEAR_CHANCE: 0.25,   // 25% chance an animal is a bear
  // Retreat speed when hit/killed
  RETREAT_SPEED: 3,
  RETREAT_DURATION: 60, // frames to walk off screen
  // Muzzle flash duration
  FLASH_DURATION: 4,
  // Shot cooldown (frames)
  SHOT_COOLDOWN: 12,
  // Ammo / reload
  AMMO_MAX: 5,              // shots before auto-reload
  RELOAD_TIME: 90,          // frames to reload (~1.5s at 60fps)

  // === BOSS BEAR ===
  BOSS_HP: 20,
  BOSS_SIZE_MULT: 2.0,        // 2x the size of normal bears
  BOSS_SPEED_MIN: 0.144,      // 20% slower than normal bears (0.18 * 0.8)
  BOSS_SPEED_MAX: 0.384,      // 20% slower than normal bears (0.48 * 0.8)
  BOSS_SPAWN_DELAY: 90,       // frames to wait before boss appears (~1.5s)
}

// Horizon and perspective — strong first-person view
export const PERSPECTIVE = {
  HORIZON_Y: 280,       // horizon pushed down = more sky, stronger depth
  GROUND_TOP: 280,       // where ground begins
  PLAYER_Y: 620,         // player at very bottom edge
  // Animals spawn along the horizon and grow as they approach
  SPAWN_Y_MIN: 288,      // just below horizon
  SPAWN_Y_MAX: 310,      // slightly below
  SPAWN_X_MIN: 100,      // narrower spawn = more centered perspective
  SPAWN_X_MAX: 380,
  // Gun barrel position (first person)
  GUN_X: 240,            // center
  GUN_Y: 640,            // bottom of canvas
}
