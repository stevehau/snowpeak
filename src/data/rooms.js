export const rooms = {
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
    description: 'You stand in the grand lobby of Snowpeak Resort. Once magnificent, the place has seen better days. A massive stone fireplace dominates one wall, though only embers glow within it. Dusty chandeliers hang overhead, and faded ski posters line the walls. A moth-eaten welcome banner reads "SNOWPEAK RESORT - EST. 1976."',
    exits: { north: 'main_street', east: 'lodge_bar', west: 'lodge_balcony' },
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
    description: 'A dimly lit bar with a crackling fireplace that provides the only warmth in the whole resort. Taxidermied animal heads line the walls, all wearing tiny ski goggles. The shelves behind the bar are mostly empty, save for a few dusty bottles. The air smells of old wood and stale pretzels.',
    exits: { west: 'lodge_lobby' },
    hiddenExits: {},
    lockedExits: {},
    items: ['broken_radio', 'whiskey_bottle'],
    npcs: ['angry_boss'],
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
    description: 'A damp stone basement beneath the lodge. Old ski equipment rusts in the corners. Cobwebs hang from exposed wooden beams. Against the far wall, a workbench is covered in old papers and tools. A portrait of a distinguished-looking man in vintage ski attire hangs crooked on the wall -- the resort\'s founder, Tobias Snowpeak.',
    exits: { up: 'lodge_lobby' },
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
    description: 'A chaotic shop overflowing with mismatched ski equipment. Skis of every era lean against the walls -- from modern carbon fiber to what appear to be actual wooden planks with leather straps. Boots are piled in heaps, helmets dangle from hooks, and a basket of goggles sits on the counter. A hand-written sign says "HELP YOURSELF - Management."',
    exits: { east: 'main_street' },
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
    description: 'A picturesque alpine village with A-frame buildings covered in snow. Smoke rises from a few chimneys, but the streets are eerily quiet. In the center of the village square stands a bronze statue of a man on skis, one arm raised triumphantly. The plaque reads: "TOBIAS SNOWPEAK - He who seeks the still water finds the path." A small general store appears to be the only open business.',
    exits: { west: 'main_street' },
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
    description: 'The bunny slope -- a comically gentle incline that wouldn\'t challenge a toddler on a sled. A faded sign reads "BEGINNER ZONE" with encouraging smiley faces. The snow is well-packed but the slope is deserted. To the north, the terrain rises more steeply toward a frozen waterfall. A rickety ski lift station is visible further up the mountain.',
    exits: { south: 'main_street', north: 'frozen_waterfall', up: 'ski_lift_top' },
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
    description: 'The upper ski lift station sits on a windswept platform. The lift chairs hang motionless on the cable -- the machinery is dead. An electrical panel on the side of the station house hangs open, revealing a conspicuously empty fuse socket. If the lift were working, it could carry you up to the mountain peak.',
    exits: { down: 'ski_slopes', east: 'frozen_waterfall' },
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
    description: 'A spectacular wall of ice rises before you -- a waterfall frozen mid-cascade. The ice is crystal blue and translucent, with strange shapes visible deep within. Icicles the size of swords hang from rocky outcrops above. The whole scene is eerily beautiful and perfectly, impossibly still. Water that stands still...',
    exits: { south: 'ski_slopes', west: 'ski_lift_top' },
    hiddenExits: {},
    lockedExits: {},
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
    description: 'You stand at the summit of Snowpeak Mountain. The wind howls around you but the view is breathtaking -- an endless panorama of snow-covered peaks stretching to the horizon. Far below, the resort looks like a toy village. You can see everything from here: the frozen waterfall, the village, the winding slopes. Half-buried in the snow near a cairn of stacked rocks, something glints in the sunlight. The ski lift can carry you back down.',
    exits: { down: 'ski_lift_top' },
    hiddenExits: {},
    lockedExits: {},
    items: ['strange_medallion'],
    npcs: [],
  },
}
