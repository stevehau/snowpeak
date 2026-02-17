// Expert Mode - Expanded Map (24 rooms - double the standard 12)
// Includes all original rooms plus 12 new rooms for increased challenge

export const roomsExpert = {
  // ===== ORIGINAL ROOMS (with expanded connections) =====
  lodge_lobby: {
    id: 'lodge_lobby',
    name: 'Resort Lodge Lobby',
    ascii: `
        ___________________________
       |  SNOWPEAK RESORT - 1976  |
       |__________________________|
       |    |              |    |
       | [] |  ___    ___  | [] |
       |    | |   |  |   | |    |
       |    | | ~ |  | ~ | |    |
   ____|____|_|___|__|___|_|____|____
  |  _____                  _____  |
  | |     | /\\  ~~flames~~ |     | |
  | |     |/  \\  /\\ /\\ /\\  |     | |
  | |_____| __ \\/__\\/__\\/__\\|_____| |
  |________|____|__________|________|`,
    description: 'You stand in the grand lobby of Snowpeak Resort. Once magnificent, the place has seen better days. A massive stone fireplace dominates one wall, though only embers glow within it. Dusty chandeliers hang overhead, and faded ski posters line the walls. A moth-eaten welcome banner reads "SNOWPEAK RESORT - EST. 1976." To the south, a narrow hallway leads to the staff quarters.',
    exits: { north: 'main_street', east: 'lodge_bar', west: 'lodge_balcony', south: 'staff_hallway' },
    hiddenExits: {},
    lockedExits: { down: { roomId: 'basement', keyId: 'basement_key', message: 'A heavy wooden door leads downward, but it\'s locked tight. You\'d need a key.' } },
    items: ['old_map'],
    npcs: ['mr_smiles'],
  },
  lodge_bar: {
    id: 'lodge_bar',
    name: 'Lodge Bar',
    ascii: `
     _________________________________
    |  _   _   _                     |
    | (o) (o) (o)  <-- ski goggles!  |
    |  |   |   |                     |
    |  ~~  ~~  ~~   taxidermy heads  |
    |________________________________|
    |          ____                  |
    |   ___   |    |  _  _  _        |
    |  |   |  |    | |_||_||_|       |
    |  | ~ |  |    | |  |  |         |
    |  |/\\.| |____|_|__|__|__        |
    |__|____|_|_______________|____ _|
    |====BAR COUNTER=================|
    |________________________________|`,
    description: 'A dimly lit bar with a crackling fireplace that provides the only warmth in the whole resort. Taxidermied animal heads line the walls, all wearing tiny ski goggles. The shelves behind the bar are mostly empty, save for a few dusty bottles. The air smells of old wood and stale pretzels. To the east, a doorway leads to a game room. A swinging door to the south leads to the kitchen.',
    exits: { west: 'lodge_lobby', east: 'game_room', south: 'kitchen' },
    hiddenExits: {},
    lockedExits: {},
    items: ['broken_radio', 'whiskey_bottle'],
    npcs: ['angry_boss'],
  },
  game_room: {
    id: 'game_room',
    name: 'Game Room',
    ascii: `
     _________________________________
    |  ___   GAME ROOM          ___  |
    | |   |                    |   | |
    | | S |   ___________      | D | |
    | | L |  |           |     | A | |
    | | A |  | POOL TABLE|     | R | |
    | | L |  |    (o)    |     | T | |
    | | O |  |___________|     | S | |
    | | M |                    |   | |
    | |___|  [FREE PLAY]       |___| |
    |________________________________|`,
    description: 'A recreation room off the bar, filled with old entertainment. A battered arcade cabinet dominates one corner, its screen glowing with green pixels. A pool table with faded felt sits in the center, and a dartboard hangs on the far wall. The room smells of old carpet and nostalgia.',
    exits: { west: 'lodge_bar' },
    hiddenExits: {},
    lockedExits: {},
    items: ['arcade_machine'],
    npcs: [],
  },
  lodge_balcony: {
    id: 'lodge_balcony',
    name: 'Lodge Balcony',
    ascii: `
               /\\
              /  \\        *
             /    \\      *
            //\\/\\\\    *  <-- glint!
           //    \\ \\
          / \\    /  \\
         /___\\  /____\\
        /   MOUNTAIN   \\
    ~~~~/~~~~~~~~~~~~~~~\\~~~~
       |                  |
    ===|====BALCONY=======|===
    |  |  []          []  |  |
    |  |__________________|  |
    |________________________|`,
    description: 'A wide wooden balcony overlooking the resort grounds. The mountain rises dramatically to the north, its peak shrouded in mist. From here you can see the main street below and the ski slopes winding up the mountainside. The railing is icy to the touch. Something glints far up on the mountain, near the frozen waterfall.',
    exits: { east: 'lodge_lobby' },
    hiddenExits: {},
    lockedExits: {},
    items: ['binoculars'],
    npcs: [],
  },
  basement: {
    id: 'basement',
    name: 'Mysterious Basement',
    ascii: `
     ___________________________________
    |  ~  ~  ~  COBWEBS  ~  ~  ~       |
    |    _______                       |
    |   |       |   ____  ____         |
    |   | TOBIAS|  |    ||    |        |
    |   | SNOW- |  | __ || __ |        |
    |   | PEAK  |  ||__|||__| |        |
    |   | /__\\ |  |WORKBENCH |        |
    |   |_______|  |__________|        |
    |                                  |
    |  ///  ///   old ski equipment    |
    |  ///  ///                        |
    |__________________________________|`,
    description: 'A damp stone basement beneath the lodge. Old ski equipment rusts in the corners. Cobwebs hang from exposed wooden beams. Against the far wall, a workbench is covered in old papers and tools. A portrait of a distinguished-looking man in vintage ski attire hangs crooked on the wall -- the resort\'s founder, Tobias Snowpeak. A dark tunnel entrance is barely visible in the corner.',
    exits: { up: 'lodge_lobby', north: 'underground_tunnel' },
    hiddenExits: {},
    lockedExits: {},
    items: ['dusty_journal'],
    npcs: [],
  },
  main_street: {
    id: 'main_street',
    name: 'Main Street',
    ascii: `
            *  *  *  *  *
         *  snowflakes   *
           *  *  *  *
     _____    (  )    _____
    |SHOP |   |  |   |SHOP |
    |_____|   |  |   |CLOSE|
    |XXXXX|   |  |   |XXXXX|
    |XXXXX|   |  |   |XXXXX|
    |_____|   |  |   |_____|
       |      |  |      |
    ---+------+--+------+---
    ~~~~ MAIN STREET ~~~~~~~~
    ---+------+--+------+---
       |  <- SKI    VILLAGE
       | RENTAL       -> |`,
    description: 'The resort\'s main thoroughfare is covered in packed snow. Quaint shops line both sides, though most are boarded up for the season -- or perhaps permanently. Old-fashioned lamp posts flicker with weak electric light. To the north, the ski slopes begin their gentle ascent. A cheerful sign pointing east reads "Mountain Village" and another pointing west reads "Ski Rental."',
    exits: { south: 'lodge_lobby', north: 'ski_slopes', east: 'village', west: 'ski_rental' },
    hiddenExits: {},
    lockedExits: {},
    items: [],
    npcs: ['henrys_mom'],
  },
  ski_rental: {
    id: 'ski_rental',
    name: 'Ski Rental Shop',
    ascii: `
     _________________________________
    | "HELP YOURSELF" - Management   |
    |________________________________|
    |   /|  /|  /|     __|__         |
    |  / | / | / |    |BOOTS|        |
    | /  |/  |/  |    |pile |        |
    | SKIS SKIS  |    |o]_[o|        |
    |            |    |o]_[o|        |
    |  __|  __|  |    |_____|        |
    | |  | |  |  |                   |
    | |--| |--|  |  _O_  goggles     |
    | |__| |__|  | (___) basket      |
    |____________|___________________|`,
    description: 'A chaotic shop overflowing with mismatched ski equipment. Skis of every era lean against the walls -- from modern carbon fiber to what appear to be actual wooden planks with leather straps. Boots are piled in heaps, helmets dangle from hooks, and a basket of goggles sits on the counter. A hand-written sign says "HELP YOURSELF - Management." A dusty storage room is visible through a back door.',
    exits: { east: 'main_street', north: 'storage_room' },
    hiddenExits: {},
    lockedExits: {},
    items: ['ski_poles'],
    npcs: ['dill_pickle'],
  },
  village: {
    id: 'village',
    name: 'Mountain Village',
    ascii: `
          /\\           /\\
         /  \\   ^^^   /  \\
        / /\\ \\ ^^^  //\\ \\
       / /  \\ \\    //  \\ \\
      /  \\  /  \\  / \\  /  \\
     /____\\/____\\/___\\/____\\
      A-FRAMES     VILLAGE
            ______
           | /_\\ |
           ||   ||    TOBIAS
           || O ||    SNOWPEAK
           ||/\\||    statue
           |_____|
        "He who seeks the
       still water finds
           the path"`,
    description: 'A picturesque alpine village with A-frame buildings covered in snow. Smoke rises from a few chimneys, but the streets are eerily quiet. In the center of the village square stands a bronze statue of a man on skis, one arm raised triumphantly. The plaque reads: "TOBIAS SNOWPEAK - He who seeks the still water finds the path." A small general store appears to be the only open business. To the north, an old chapel stands on a hill. To the south, a weathered cabin sits among the trees.',
    exits: { west: 'main_street', north: 'chapel', south: 'old_cabin', east: 'general_store' },
    hiddenExits: {},
    lockedExits: {},
    items: ['warm_coat', 'note_from_founder'],
    npcs: ['dance_mom'],
  },
  ski_slopes: {
    id: 'ski_slopes',
    name: 'Ski Slopes',
    ascii: `
                           /\\
                          /  \\
                   /\\   / -- \\  lift
                  /  \\ /______\\ station
                 /    \\\\
                / ---- \\\\   ___
               / SLOPES \\\\  |:|
              /  ~~~~~~~~ \\  |:| <--lift
             / ~~~~~~~~~~~~\\ |:|
    ______  / ~~~~~~~~~~~~~~\\
   | :)  :)|~~~~~~~~~~~~~~~~|
   |BEGINR |~~~~~~~~~~~~~~~~|
   |_ZONE__|~~~~~~~~~~~~~~~~|`,
    description: 'The bunny slope -- a comically gentle incline that wouldn\'t challenge a toddler on a sled. A faded sign reads "BEGINNER ZONE" with encouraging smiley faces. The snow is well-packed but the slope is deserted. To the north, the terrain rises more steeply toward a frozen waterfall. A rickety ski lift station is visible further up the mountain. To the east, a narrow trail marked "DANGER: AVALANCHE ZONE" leads into treacherous terrain.',
    exits: { south: 'main_street', north: 'frozen_waterfall', up: 'ski_lift_top', east: 'avalanche_zone' },
    hiddenExits: {},
    lockedExits: {},
    items: [],
    npcs: ['coach_joe'],
  },
  ski_lift_top: {
    id: 'ski_lift_top',
    name: 'Ski Lift Top Station',
    ascii: `
     >>>>  FIERCE WIND  >>>>
         ________________
        |  SKI LIFT TOP |
        |    STATION    |
        |_______________|
        |  ___          |
        | | ! | FUSE    |
        | | ! | PANEL   |
        | |___| [EMPTY] |
        |_______________|
            |  |
    ~~~~~~~~|  |~~~~~~~~
      ___/  |  |  \\___
     |__|   |__|   |__|
     chairs  on  cable`,
    description: 'The upper ski lift station sits on a windswept platform. The lift chairs hang motionless on the cable -- the machinery is dead. An electrical panel on the side of the station house hangs open, revealing a conspicuously empty fuse socket. If the lift were working, it could carry you up to the mountain peak. A treacherous ridge trail leads west along the mountain face.',
    exits: { down: 'ski_slopes', east: 'frozen_waterfall', west: 'ridge_trail' },
    hiddenExits: {},
    lockedExits: {},
    items: [],
    npcs: [],
  },
  frozen_waterfall: {
    id: 'frozen_waterfall',
    name: 'Frozen Waterfall',
    ascii: `
        .  *  .  *  .  *  .
      *    icicles    *
        . \\ | / . \\ | / .
         \\\\|//   \\\\|//
    ______\\|/______\\|/____
    |  ~~~ FROZEN ~~~      |
    | |  WATERFALL  |      |
    | | icicicicic | ????  |
    | | icicicicic |       |
    | | icicicicic | crack |
    | | icicicicic |  in   |
    | | icicicicic |  ice  |
    |_|____________|_______|
    ~~~~~~~~~~~~~~~~~~~~~~~~
     water stands still...`,
    description: 'A spectacular wall of ice rises before you -- a waterfall frozen mid-cascade. The ice is crystal blue and translucent, with strange shapes visible deep within. Icicles the size of swords hang from rocky outcrops above. The whole scene is eerily beautiful and perfectly, impossibly still. Water that stands still... To the north, you can see an opening that leads down into treacherous ice caves.',
    exits: { south: 'ski_slopes', west: 'ski_lift_top' },
    hiddenExits: {},
    lockedExits: {
      north: {
        roomId: 'ice_caves',
        requireItem: 'rope',
        message: 'The entrance to the ice caves drops steeply down a slick, frozen slope. Without climbing rope, you\'d never make it down safely -- or more importantly, back up. You need proper climbing equipment to explore the ice caves.',
      },
    },
    items: ['chewed_gum'],
    npcs: [],
  },
  hidden_cave: {
    id: 'hidden_cave',
    name: 'Hidden Cave',
    ascii: `
    _/\\_/\\___/\\_____/\\_/\\_
   /                       \\
  /  /\\/\\   strange  /\\  \\
 |  /  Y  \\  markings /  \\ |
 | |  ~~~  | on walls |****| |
 | | ~~~ ~ |  <> <>   |****| |
 | |  ~~~  |  <> <>   |****| |
 |  \\ ~~~ /   _____  | ** | |
 |   \\   /   |     | |    | |
 |    \\ /    | (O) | steps| |
  \\    V     |medal| down /
   \\_______ _|_____|_____/`,
    description: 'A narrow cave behind the waterfall, its walls glistening with frost. The passage winds deeper into the mountain. Strange markings are scratched into the stone walls -- they look like a mix of ski trail markers and something much older. The air is cold and still. At the back of the cave, rough stone steps lead downward into darkness. A circular indentation in the wall beside the steps looks like something should fit into it.',
    exits: { west: 'frozen_waterfall' },
    hiddenExits: {},
    lockedExits: { down: { roomId: 'underground_vault', keyId: 'strange_medallion', message: 'Stone steps lead down to a heavy door with a circular indentation. It looks like a medallion-shaped key is needed.' } },
    items: ['torch'],
    npcs: [],
  },
  underground_vault: {
    id: 'underground_vault',
    name: 'Underground Vault',
    ascii: `
    .  *  .  *  .  *  .  *  .
   _____________________________
  |  *   THE UNDERGROUND   *   |
  |      ~~~~VAULT~~~~         |
  | *     ___________      *   |
  |      |           |         |
  |  /-\\|  __/\\__  |/-\\     |
  | |SKI||  \\    /  ||SKI|    |
  | |___|   \\\\  // ||___|    |
  |      |  TROPHY   |         |
  |      |___________|         |
  |  *     [======]        *   |
  |        [letter]            |
  |____________________________|`,
    description: 'You descend into a hidden chamber carved from the living rock of the mountain. Torchlight dances across the walls, revealing intricate carvings of skiers, mountains, and snowflakes. In the center of the vault, on a pedestal of polished stone, sits a magnificent golden trophy shaped like a ski. Beside it lies a sealed envelope. This is it -- the legendary secret of Snowpeak Resort.',
    exits: { up: 'hidden_cave' },
    hiddenExits: {},
    lockedExits: {},
    items: ['golden_ski_trophy', 'founders_letter'],
    npcs: [],
  },
  mountain_peak: {
    id: 'mountain_peak',
    name: 'Mountain Peak',
    ascii: `
              YOU
             \\o/
              |         * . * . *
         ____/\\______  .  *  .  *  .
        /     SUMMIT  \\   *  .  *
       / ~~~~~~~~~~~~~ \\
      / /\\  /\\  /\\  /\\ \\
     / /  \\/  \\/  \\/  \\ \\
    / /    \\   \\   \\   \\ \\
   /_/______\\_  \\_  \\_  \\_\\
  /     SNOWPEAK     MOUNTAIN  \\
 /  PANORAMIC VIEW OF WORLD     \\
/________________________________\\`,
    description: 'You stand at the summit of Snowpeak Mountain. The wind howls around you but the view is breathtaking -- an endless panorama of snow-covered peaks stretching to the horizon. Far below, the resort looks like a toy village. You can see everything from here: the frozen waterfall, the village, the winding slopes. Half-buried in the snow near a cairn of stacked rocks, something glints in the sunlight. A small stone shelter provides protection from the wind. The ski lift can carry you back down.',
    exits: { down: 'ski_lift_top', east: 'summit_shelter' },
    hiddenExits: {},
    lockedExits: {},
    items: ['strange_medallion'],
    npcs: [],
  },

  // ===== NEW EXPERT MODE ROOMS (12 additional rooms) =====

  staff_hallway: {
    id: 'staff_hallway',
    name: 'Staff Hallway',
    ascii: `
     _________________________________
    | ===== STAFF ONLY =====         |
    | ________________  ____________ |
    ||                ||            ||
    ||   STAFF        ||  KITCHEN   ||
    ||   QUARTERS     ||            ||
    ||    [locked]    ||    [open]  ||
    ||________________||____________||
    |                                |
    |  ~~~  ~~~  worn carpet  ~~~    |
    |________________________________|`,
    description: 'A narrow hallway with faded wallpaper and worn carpet. Flickering fluorescent lights cast an institutional glow. Two doors line the hallway: one marked "STAFF QUARTERS" (locked), and another leading to the kitchen. Framed photos of smiling resort staff from decades past hang on the walls, their faces cheerful but somehow unsettling in the dim light.',
    exits: { north: 'lodge_lobby', east: 'kitchen' },
    hiddenExits: {},
    lockedExits: { west: { roomId: 'staff_quarters', keyId: 'staff_key', message: 'The staff quarters door is locked. You need a staff key.' } },
    items: [],
    npcs: [],
  },

  staff_quarters: {
    id: 'staff_quarters',
    name: 'Staff Quarters',
    ascii: `
     _________________________________
    |  STAFF    SLEEPING    QUARTERS |
    | ____  ____  ____  ____  ____   |
    ||    ||    ||    ||    ||    |  |
    || [] || [] || [] || [] || [] |  |
    ||____||____||____||____||____|  |
    | beds  beds  beds  beds  beds   |
    |   _______________              |
    |  |   FOOTLOCKER  |             |
    |  |   [unlocked]  |             |
    |  |_______________|             |
    |________________________________|`,
    description: 'A cramped dormitory-style room with rows of narrow beds and metal lockers. The air smells of mothballs and old linens. Personal effects suggest the staff left in a hurry -- uniforms draped over chairs, magazines open on nightstands. An unlocked footlocker at the end of one bed contains various items left behind.',
    exits: { east: 'staff_hallway' },
    hiddenExits: {},
    lockedExits: {},
    items: ['staff_uniform', 'old_photograph'],
    npcs: [],
  },

  kitchen: {
    id: 'kitchen',
    name: 'Lodge Kitchen',
    ascii: `
     _________________________________
    |  KITCHEN - SNOWPEAK RESORT     |
    |   ___   ___   ___              |
    |  |   | |   | |   |  PANTRY     |
    |  |___| |___| |___|  DOOR       |
    |   OVENS (COLD)      [north]    |
    |                                |
    |  ######################        |
    |  ####  PREP TABLE  ####        |
    |  ######################        |
    |   pots    pans    knives       |
    |________________________________|`,
    description: 'An industrial kitchen that once served hundreds of guests daily. Now it sits silent and cold. Stainless steel counters and hanging pots catch what little light filters through grimy windows. The ovens are cold, but a walk-in pantry to the north might still hold supplies. A calendar on the wall is frozen at February 1976.',
    exits: { north: 'pantry', west: 'staff_hallway', east: 'lodge_bar' },
    hiddenExits: {},
    lockedExits: {},
    items: ['rusty_knife', 'old_recipe'],
    npcs: [],
  },

  pantry: {
    id: 'pantry',
    name: 'Walk-in Pantry',
    ascii: `
     _________________________________
    |  [] [] [] [] [] [] [] [] []    |
    |  [] [] [] [] [] [] [] [] []    |
    |  SHELVES OF CANNED GOODS       |
    |  (most expired since 1976)     |
    |                                |
    |    _______________             |
    |   |  FREEZER      |            |
    |   |  [broken]     |            |
    |   |_______________|            |
    |                                |
    |   Something glints behind      |
    |   fallen crates...             |
    |________________________________|`,
    description: 'A cold storage room lined with metal shelving. Hundreds of cans and jars sit gathering dust -- most decades past their expiration date. A broken freezer in the corner is frosted over. Behind some fallen crates in the corner, you notice something metallic gleaming in the shadows.',
    exits: { south: 'kitchen' },
    hiddenExits: {},
    lockedExits: {},
    items: ['canned_beans', 'fuse'],
    npcs: [],
  },

  storage_room: {
    id: 'storage_room',
    name: 'Equipment Storage',
    ascii: `
     _________________________________
    |  STORAGE - SKI RENTAL SHOP     |
    |  /|  /|  /|  /|  /|  /|  /|    |
    | / | / | / | / | / | / | / |    |
    |/  |/  |/  |/  |/  |/  |/  |    |
    | MORE SKIS AND POLES            |
    |                                |
    |   _______________              |
    |  | =-=-=-=-=-=- |  TOOLBOX     |
    |  | =-=-=-=-=-=- |              |
    |  |_____________|               |
    |________________________________|`,
    description: 'A cluttered storage room packed with even more ski equipment. Skis are stacked floor to ceiling, and poles lean in every corner. A heavy toolbox sits on a workbench, filled with wrenches, screwdrivers, and other maintenance tools. The dust is thick enough to write in.',
    exits: { south: 'ski_rental' },
    hiddenExits: {},
    lockedExits: {},
    items: ['screwdriver', 'rope'],
    npcs: [],
  },

  general_store: {
    id: 'general_store',
    name: 'Village General Store',
    ascii: `
     _________________________________
    |  SNOWPEAK GENERAL STORE        |
    |  ____  ____  ____  ____        |
    | |    ||    ||    ||    |       |
    | |FOOD||MAPS||GEAR||MISC|       |
    | |____||____||____||____|       |
    |   SHELVES  (mostly empty)      |
    |                                |
    |  #########################     |
    |  #####  COUNTER  ########     |
    |  #########################     |
    |    [bell]  [register]          |
    |________________________________|`,
    description: 'A quaint general store with wooden shelves and a friendly bell above the door. Most of the shelves are bare, but a few items remain: emergency supplies and old postcards. Behind the counter, an ancient cash register sits closed. A brass service bell sits on the counter with a small sign: "RING FOR SERVICE."',
    exits: { west: 'village' },
    hiddenExits: {},
    lockedExits: {},
    items: ['store_bell', 'matches', 'postcard'],
    npcs: [],
  },

  chapel: {
    id: 'chapel',
    name: 'Mountain Chapel',
    ascii: `
     _________________________________
    |           ___                  |
    |          /   \\                 |
    |         / === \\                |
    |        / ===== \\   STEEPLE     |
    |       /_________\\              |
    |      |  []   []  |             |
    |      |           |             |
    |   ___|___________|___          |
    |  |  _______________  |         |
    |  | |     ALTAR     | |         |
    |  | |_______________| |         |
    |  |  === === === ===  | PEWS   |
    |__|__________________|_|________|`,
    description: 'A small wooden chapel perched on a hillside overlooking the village. Simple wooden pews face a modest altar. Stained glass windows depict mountains and snowflakes instead of religious scenes. A guest book sits open on a podium, its last entry dated February 12, 1976: "May the mountain protect all who ski here. - T.S."',
    exits: { south: 'village' },
    hiddenExits: {},
    lockedExits: {},
    items: ['candles', 'guest_book'],
    npcs: [],
  },

  old_cabin: {
    id: 'old_cabin',
    name: 'Abandoned Cabin',
    ascii: `
     _________________________________
    |        ____/\\____              |
    |       |          |             |
    |       |  []  []  |  LOG        |
    |       |          |  CABIN      |
    |    ___|__________|___          |
    |   |                   |        |
    |   |  ___          ___ |        |
    |   | |   |        |   ||        |
    |   | | O |  FIRE  | X ||        |
    |   | |___|  PLACE |___||        |
    |   |___________________|        |
    |________________________________|`,
    description: 'An old log cabin hidden among snow-covered pines. The roof sags in places, and the windows are clouded with frost. Inside, a stone fireplace dominates one wall (cold and dark). Furniture is covered with dusty sheets. An old writing desk by the window holds yellowed papers and what looks like a personal journal.',
    exits: { north: 'village' },
    hiddenExits: {},
    lockedExits: {},
    items: ['cabin_journal', 'basement_key'],
    npcs: [],
  },

  underground_tunnel: {
    id: 'underground_tunnel',
    name: 'Underground Tunnel',
    ascii: `
     _________________________________
    | ~~~~ DARK TUNNEL ~~~~          |
    |  /\\ /\\ /\\ /\\ /\\ /\\ /\\ /\\       |
    | /  V  V  V  V  V  V  V  \\      |
    ||  rock walls     lichen   |    |
    ||  dripping water          |    |
    ||   ________________       |    |
    ||  |                |      |    |
    | \\ |  LADDER (up)   | ____/     |
    |  \\|________________|/           |
    |     narrow passage              |
    |________________________________|`,
    description: 'A narrow stone tunnel carved through the mountain. The walls are damp and covered with pale green lichen. Water drips from the ceiling, creating small puddles on the uneven floor. The tunnel extends both north and south. A rusty ladder leads upward to what might be an old observatory. Your footsteps echo strangely here.',
    exits: { south: 'basement', up: 'hidden_observatory' },
    hiddenExits: {},
    lockedExits: {},
    items: ['pickaxe'],
    npcs: [],
  },

  hidden_observatory: {
    id: 'hidden_observatory',
    name: 'Hidden Observatory',
    ascii: `
     _________________________________
    |  *  .  *  .  *  .  *  .  *  .  |
    |    ____________________        |
    |   /  dome (cracked)     \\      |
    |  |  ==================  |      |
    |  |  ==   TELESCOPE  =  |       |
    |  |  =  (still works!) =  |     |
    |  |  ==================  |      |
    |  |     ____   ____      |      |
    |  |    |    | |    |     |      |
    |   \\   | [] | | [] |    /       |
    |    \\__|____|_|____|___/        |
    |       STAR    CHARTS           |
    |________________________________|`,
    description: 'A secret observatory hidden within the mountain itself. The domed ceiling has a large crack letting in starlight and snow. An old brass telescope still stands on its mount, pointed toward the peak. Star charts and astronomical notes cover the walls. One note reads: "The summit aligns with Polaris on the winter solstice. The medallion is the key."',
    exits: { down: 'underground_tunnel' },
    hiddenExits: {},
    lockedExits: {},
    items: ['telescope', 'star_chart', 'astronomers_note'],
    npcs: [],
  },

  ice_caves: {
    id: 'ice_caves',
    name: 'Ice Caves',
    ascii: `
     _________________________________
    |  *  *  GLITTERING ICE  *  *    |
    | \\\\//  \\\\//  \\\\//  \\\\//  \\\\//   |
    |  \\\\ICICLES EVERYWHERE//        |
    |   \\\\//  \\\\//  \\\\//  \\\\//        |
    |    ===  ===  ===  ===          |
    |  CRYSTAL BLUE WALLS             |
    |   _______________               |
    |  /   FROZEN      \\              |
    | /   UNDERGROUND   \\             |
    ||   LAKE (solid)    |            |
    | \\                 /             |
    |  \\_____________/                |
    |________________________________|`,
    description: 'A vast network of caves carved from solid ice. The walls shimmer with blue and white crystalline formations. Icicles hang from the ceiling like chandeliers, and your breath forms clouds in the frigid air. A frozen underground lake dominates the cavern floor -- perfectly smooth and glassy. Mysterious ice formations create natural sculptures. The acoustics are strange here; sounds echo in unusual ways.',
    exits: { south: 'frozen_waterfall' },
    hiddenExits: {},
    lockedExits: {},
    items: ['ice_crystal', 'frozen_flower'],
    npcs: [],
  },

  avalanche_zone: {
    id: 'avalanche_zone',
    name: 'Avalanche Zone',
    ascii: `
     _________________________________
    |  !!!  DANGER  !!!  WARNING !!! |
    |                                |
    |   /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\     |
    |  /  UNSTABLE  SNOW     \\       |
    | /   PRECARIOUS  SLOPE   \\      |
    |/  ~~~~~~~~~~~~~~~~~~~~   \\     |
    |  ~~~~  DEEP  SNOW  ~~~~  |     |
    | \\  ~~~~~~~~~~~~~~~~~~~~  /     |
    |  \\   fallen trees       /      |
    |   \\  broken skis       /       |
    |    \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/       |
    |  This area is TREACHEROUS!     |
    |________________________________|`,
    description: 'A dangerously steep slope where avalanches are common. The snow here is deep and unstable, marked by old debris flows. Broken trees and abandoned equipment poke through the snow -- remnants of past disasters. Warning signs are posted everywhere, though most are half-buried. To the north, you can see a precarious ridge trail. This is not a place to linger.',
    exits: { west: 'ski_slopes', north: 'ridge_trail' },
    hiddenExits: {},
    lockedExits: {},
    items: ['avalanche_beacon', 'broken_ski'],
    npcs: [],
  },

  ridge_trail: {
    id: 'ridge_trail',
    name: 'Mountain Ridge Trail',
    ascii: `
     _________________________________
    |  >>>>  HOWLING WIND  >>>>      |
    |                                |
    |     /\\                         |
    |    /  \\    you are HERE       |
    |   /    \\   on a narrow         |
    |  /  /\\  \\  ridge trail         |
    | |  /  \\  |                     |
    | | /    \\ |  CLIFF  CLIFF       |
    | |/      \\|  DROP   DROP        |
    | |        |  (!)    (!)         |
    |  \\_____/                       |
    |    path continues              |
    |________________________________|`,
    description: 'A narrow trail carved into the mountainside, with sheer drops on either side. The wind howls fiercely here, and the path is barely wider than your shoulders. Ice makes the footing treacherous. Far below, you can see the village and ski slopes looking impossibly small. To the east, the lift station is visible. To the south, the avalanche zone awaits. One wrong step here would be your last.',
    exits: { east: 'ski_lift_top', south: 'avalanche_zone' },
    hiddenExits: {},
    lockedExits: {},
    items: ['climbing_gear'],
    npcs: [],
  },

  summit_shelter: {
    id: 'summit_shelter',
    name: 'Summit Shelter',
    ascii: `
     _________________________________
    |  ____/\\____                    |
    | |          |  EMERGENCY        |
    | |  []  []  |  SHELTER          |
    | |          |                   |
    | |__________|                   |
    |  STONE HUT                     |
    |   _______________              |
    |  |               |  SUPPLY     |
    |  |   EMERGENCY   |  CACHE      |
    |  |    SUPPLIES   |             |
    |  |_______________|             |
    |   firewood, blankets, rations  |
    |________________________________|`,
    description: 'A small stone shelter built at the summit for emergencies. The walls provide blessed protection from the wind. Inside, emergency supplies are neatly organized: firewood, blankets, rations, first aid. A logbook records summit visitors dating back to the 1950s. The last entry is from February 1976, written in an elegant hand: "The secret lies beneath the still water. The mountain holds its treasures close. - T.S."',
    exits: { west: 'mountain_peak' },
    hiddenExits: {},
    lockedExits: {},
    items: ['emergency_kit', 'summit_logbook', 'staff_key'],
    npcs: [],
  },
}
