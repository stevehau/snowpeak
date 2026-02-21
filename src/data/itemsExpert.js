// Expert Mode Items - Updated map showing expanded 24-room layout
export const itemsExpert = {
  old_map: {
    id: 'old_map',
    name: 'old map',
    description: 'A faded resort map printed on yellowed paper, heavily marked with additions and notes. Parts of the map are worn and illegible -- some areas may be missing entirely. Someone has drawn a large red X near the north peak, right where the frozen waterfall would be. In the margin, hasty handwriting reads: "T.S. hid it where water stands still." Try "read old map" to study it.',
    takeable: true,
    readable: true,
    readText: `You unfold the old map and study it carefully:

        [Summit Shelter]---[Mountain Peak]
                                  |
           [Ridge Trail]---[Ski Lift Top]---[Ice Caves]
                 |                |
         [Avalanche Zone]---[Ski Slopes]---[Frozen Waterfall]
                                  |
 [Storage]---[Ski Rental]---[Main Street]---[Village]---[General Store]
                                  |             |
                                  |         [Chapel]
                                  |             |
                                  |        [Old Cabin]
                                  |
                [Balcony]---[Lodge Lobby]---[Bar]---[Game Room]
                                  |           |
                               [Staff]    [Kitchen]
                                  |           |
                              [Staff Q]   [Pantry]
                                  |
                             [Basement]

   --- = paths     | = trails
   [Basement] requires a key to access

   ADDITIONAL NOTES (in red ink):
   - Staff areas require special key
   - Ridge trail is DANGEROUS - proceed with caution
   - Map is faded and incomplete -- some areas not shown

In the margin, hasty handwriting reads:
"The path begins where water stands still.
Explore thoroughly - all areas matter now." -- T.S.`,
  },
  binoculars: {
    id: 'binoculars',
    name: 'binoculars',
    description: 'A pair of heavy brass binoculars, scratched but functional. Looking through them toward the mountain, you can make out a strange glint of metal behind the frozen waterfall -- as if there\'s an opening in the ice.',
    takeable: true,
  },
  broken_radio: {
    id: 'broken_radio',
    name: 'broken radio',
    description: 'An old transistor radio with a cracked case. It crackles with static when you shake it. The tuning dial is stuck. Someone who knows electronics might be able to fix it.',
    takeable: true,
  },
  whiskey_bottle: {
    id: 'whiskey_bottle',
    name: 'bottle of juice',
    description: 'A half-full bottle of "Mountain Bear" juice. The label features a bear on skis. It looks like decent stuff -- aged 12 years, according to the label.',
    takeable: true,
  },
  basement_key: {
    id: 'basement_key',
    name: 'old basement key',
    description: 'An old brass key with an ornate handle shaped like a snowflake. A faded tag attached to the ring reads "BASEMENT" in block letters. It looks like it fits a heavy door.',
    takeable: true,
  },
  dusty_journal: {
    id: 'dusty_journal',
    name: 'dusty journal',
    description: 'A leather-bound journal belonging to Tobias Snowpeak, dated 1978. The entries describe his grand vision for the resort and his obsession with creating the "perfect ski trophy." The final entry reads: "I\'ve hidden my greatest creation in the vault beneath the mountain. The medallion is the key. Only those worthy -- who help others and seek the truth -- will find it. The path begins where water stands still."',
    takeable: true,
  },
  ski_poles: {
    id: 'ski_poles',
    name: 'ski poles',
    description: 'A pair of sturdy aluminum ski poles with rubber grips. They\'re in good condition -- much better than most of the equipment in this shop.',
    takeable: true,
  },
  warm_coat: {
    id: 'warm_coat',
    name: 'warm coat',
    description: 'A heavy-duty mountaineering coat lined with down filling. It\'s bright orange with reflective strips. Toasty warm -- perfect for braving the mountain peak.',
    takeable: true,
  },
  note_from_founder: {
    id: 'note_from_founder',
    name: 'welcome note',
    description: 'A weathered note pinned to the base of the statue. It reads: "To future adventurers: The greatest treasures are found not alone, but with the help of friends -- even the grumpy ones. Seek the still water, and bring light to the darkness below. -- T. Snowpeak"',
    takeable: true,
  },
  fuse: {
    id: 'fuse',
    name: 'electrical fuse',
    description: 'A heavy-duty electrical fuse, the kind used in industrial machinery. It\'s rated for high amperage -- exactly what a ski lift motor would need. It must have been wedged behind that old arcade cabinet for decades.',
    takeable: true,
    hidden: true,
  },
  chewed_gum: {
    id: 'chewed_gum',
    name: 'chewed gum',
    description: 'A wad of already-chewed bubblegum stuck to a rock. It\'s bright pink and still slightly warm. Gross. Someone was here recently.',
    takeable: true,
  },
  torch: {
    id: 'torch',
    name: 'torch',
    description: 'A wooden torch mounted on the cave wall. It still has oil-soaked rags wrapped around the top. Surprisingly, it lights easily and burns with a warm, steady flame.',
    takeable: true,
  },
  strange_medallion: {
    id: 'strange_medallion',
    name: 'strange medallion',
    description: 'A heavy bronze medallion half-buried in the snow near the summit cairn. It\'s about the size of your palm, shaped like a snowflake with a ski carved in the center. The craftsmanship is extraordinary. It feels important -- like a key to something ancient.',
    takeable: true,
  },
  golden_ski_trophy: {
    id: 'golden_ski_trophy',
    name: 'golden ski trophy',
    description: 'A magnificent trophy crafted from solid gold, shaped like a miniature ski balanced on a crystal mountain. It gleams with an inner light. An engraving on the base reads: "To the worthy adventurer who found their way -- may you always have beginner\'s luck." This is the legendary treasure of Snowpeak Resort!',
    takeable: true,
  },
  founders_letter: {
    id: 'founders_letter',
    name: "founder's letter",
    description: 'A sealed envelope with "To the Finder" written in elegant script.',
    takeable: true,
    readable: true,
    readText: `You break the seal and unfold the letter inside:

"Dear Adventurer,

If you are reading this, you have proven yourself worthy. You helped others along the way, you followed the clues, and you braved the mountain's secrets.

I built Snowpeak Resort as a place where beginners could find magic in the mountains. The Golden Ski Trophy was never about gold -- it was about the journey. The friends you made. The puzzles you solved. The courage to explore the unknown.

Keep the trophy as a reminder: every expert was once a beginner, and every mountain is climbed one step at a time.

With warm regards and fresh powder,
Tobias Snowpeak
Founder, Snowpeak Resort
1978"

THE END

Congratulations! You have completed THE SECRET OF SNOWPEAK RESORT!`,
  },
  frozen_finger: {
    id: 'frozen_finger',
    name: 'frozen finger',
    description: 'A stiff, frozen finger of mysterious origin, delivered to you by an enthusiastic Husky. It\'s ice-cold and slightly blue. You have no idea whose it is or why a dog had it. Probably best not to think about it too hard.',
    takeable: true,
  },
  arcade_machine: {
    id: 'arcade_machine',
    name: 'arcade machine',
    description: 'A battered arcade cabinet in the game room. The side art shows a pixelated skier racing downhill through slalom gates. The screen glows with green text: "SLALOM CHALLENGE - INSERT COIN". A hand-written note taped to the coin slot reads "FREE PLAY." Try "play arcade game" to play!',
    takeable: false,
  },
  basement_arcade: {
    id: 'basement_arcade',
    name: 'dusty arcade cabinet',
    description: 'An ancient arcade cabinet hidden under a tarp in the basement corner. Years of dust and cobwebs cover it, but when you wipe the grime away, the side art reveals a dramatic scene: wolves and bears charging through a moonlit forest toward a tiny village. The marquee reads "DEFEND THE VILLAGE" in faded red letters. Amazingly, a dim green power light still glows on the back panel. Someone must have left it plugged in decades ago. Try "play defend game" to play!',
    takeable: false,
  },
  store_arcade: {
    id: 'store_arcade',
    name: 'snowball arcade cabinet',
    description: 'A beat-up arcade cabinet wedged into the corner of the general store. The side art shows two pixelated kids in winter gear hurling snowballs at each other across a snowy field. The marquee reads "SNOWBALL SHOWDOWN" in icy blue letters. A brass token slot on the front panel reads "INSERT TOKEN." Try "play snowball game" to play!',
    takeable: false,
  },
  shelter_arcade: {
    id: 'shelter_arcade',
    name: 'frost-covered arcade cabinet',
    description: 'An old arcade cabinet sits in the corner of the summit shelter, half-buried under frost and a dusty emergency blanket. The side art, barely visible under a layer of ice crystals, shows neon-colored bricks shattering as a glowing ball ricochets between walls. The marquee reads "ICE BREAKER" in electric cyan letters. A brass token slot on the front panel is nearly frozen shut. Try "play ice breaker" to play!',
    takeable: false,
  },

  clinic_arcade: {
    id: 'clinic_arcade',
    name: 'medical arcade cabinet',
    description: 'A bizarre arcade cabinet shoved behind stacks of old crates in the storage room. The side art, barely visible under decades of grime, depicts a cartoonish endoscope navigating through what can only be described as... the human colon. The marquee reads "POLYP SNIPER" in lurid pink letters. A brass token slot on the front reads "INSERT TOKEN — STEADY HANDS REQUIRED." How this ended up in a ski resort is anyone\'s guess. Try "play polyp sniper" to play!',
    takeable: false,
  },

  // ===== EXPERT MODE ITEMS =====
  staff_uniform: {
    id: 'staff_uniform',
    name: 'staff uniform',
    description: 'A faded Snowpeak Resort staff uniform -- red polo shirt and khaki pants. A name tag still pinned to the shirt reads "SARAH." The uniform looks like it hasn\'t been worn in decades.',
    takeable: true,
  },
  old_photograph: {
    id: 'old_photograph',
    name: 'old photograph',
    description: 'A black and white photograph of the resort staff from 1976. Everyone is smiling in their uniforms. The photo is dated February 10, 1976 -- just two days before the resort mysteriously closed.',
    takeable: true,
  },
  rusty_knife: {
    id: 'rusty_knife',
    name: 'rusty knife',
    description: 'A chef\'s knife, heavily rusted but still sharp. The handle is worn from years of use. It\'s seen better days but could still be useful.',
    takeable: true,
  },
  old_recipe: {
    id: 'old_recipe',
    name: 'old recipe',
    description: 'A recipe card for "Snowpeak Hot Chocolate" -- the resort\'s signature drink. The ingredients include cocoa, milk, vanilla, and "a pinch of mountain magic." Someone has written in the margin: "The key is in the pantry."',
    takeable: true,
    readable: true,
    readText: 'SNOWPEAK HOT CHOCOLATE: Heat milk, add cocoa and vanilla, stir with love. "The warmth of the mountain in every cup!" Note in margin: "The key is in the pantry."',
  },
  canned_beans: {
    id: 'canned_beans',
    name: 'canned beans',
    description: 'A can of beans with a faded label. Expired in 1977, but canned goods last forever, right? ...Right?',
    takeable: true,
  },
  screwdriver: {
    id: 'screwdriver',
    name: 'screwdriver',
    description: 'A well-used flathead screwdriver with a wooden handle. Perfect for repairs or prying open stubborn panels.',
    takeable: true,
  },
  rope: {
    id: 'rope',
    name: 'climbing rope',
    description: 'A coil of sturdy climbing rope, about 50 feet long. It looks trustworthy enough for serious mountaineering.',
    takeable: true,
  },
  trail_map: {
    id: 'trail_map',
    name: 'trail guide',
    description: 'A detailed trail guide of the entire mountain, showing expert slopes, ridge trails, and danger zones marked in red. Much more comprehensive than the old map from the lobby.',
    takeable: true,
  },
  matches: {
    id: 'matches',
    name: 'waterproof matches',
    description: 'A box of waterproof matches -- essential for mountain survival. The box is nearly full. Perfect for lighting candles or creating temporary light, though a single match won\'t last long in the mountain wind.',
    takeable: true,
  },
  postcard: {
    id: 'postcard',
    name: 'vintage postcard',
    description: 'A vintage postcard showing Snowpeak Resort in its heyday -- crowded slopes, happy skiers, the lodge lit up at night. On the back, an unsent message reads: "Having a wonderful time! This place is magical. - T."',
    takeable: true,
  },
  candles: {
    id: 'candles',
    name: 'prayer candles',
    description: 'Several tall white candles used for prayer or meditation. They smell faintly of beeswax. Unlit, but they could provide a comforting light if you had matches. The wax is thick and sturdy -- they might hold a flame better than matches alone, though strong winds would still snuff them out.',
    takeable: true,
  },
  guest_book: {
    id: 'guest_book',
    name: 'chapel guest book',
    description: 'A leather-bound guest book from the chapel, filled with entries from visitors over the years. The last entry is from T.S. on February 12, 1976.',
    takeable: true,
    readable: true,
    readText: 'You flip through the guest book. Most entries are standard tourist fare. The last entry, in elegant script, reads: "May the mountain protect all who ski here. The greatest treasure is not gold, but the journey we share. - T.S., February 12, 1976"',
  },
  game_tokens: {
    id: 'game_tokens',
    name: 'bag of game tokens',
    description: 'A small drawstring pouch made of worn leather, jingling with brass tokens. Each token is stamped with the Snowpeak Resort logo — a tiny ski crossed with a snowflake. These must be for the old arcade machines around the resort.',
    takeable: true,
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'pickaxe',
    description: 'A sturdy mining pickaxe with a wooden handle. The metal head is still sharp. It could be useful for breaking through ice or rock.',
    takeable: true,
  },
  telescope: {
    id: 'telescope',
    name: 'brass telescope',
    description: 'An antique brass telescope mounted on a stand. Despite the cracked observatory dome, it still functions perfectly. When pointed at the peak, you can see the summit in remarkable detail.',
    takeable: false,
  },
  star_chart: {
    id: 'star_chart',
    name: 'star chart',
    description: 'An astronomical chart showing the winter night sky. Someone has circled Polaris (the North Star) and drawn lines connecting it to the mountain peak. A note reads: "Winter solstice alignment."',
    takeable: true,
  },
  astronomers_note: {
    id: 'astronomers_note',
    name: "astronomer's note",
    description: 'A yellowed note pinned to the observatory wall.',
    takeable: true,
    readable: true,
    readText: 'The note reads: "The summit aligns with Polaris on the winter solstice. T.S. was obsessed with this alignment. He believed the mountain held ancient secrets. The medallion at the summit is more than decoration -- it\'s the KEY to the vault beneath the frozen waterfall."',
  },
  ice_crystal: {
    id: 'ice_crystal',
    name: 'ice crystal',
    description: 'A perfectly formed ice crystal, about the size of your hand. It refracts light into beautiful rainbow patterns. Remarkably, it doesn\'t melt.',
    takeable: true,
  },
  frozen_flower: {
    id: 'frozen_flower',
    name: 'frozen flower',
    description: 'A delicate alpine flower, perfectly preserved in clear ice. It must have been frozen instantly -- every petal is intact.',
    takeable: true,
  },
  avalanche_beacon: {
    id: 'avalanche_beacon',
    name: 'avalanche beacon',
    description: 'An electronic avalanche beacon, partially buried in the snow. Its battery is dead, but it\'s still a somber reminder of the dangers here.',
    takeable: true,
  },
  broken_ski: {
    id: 'broken_ski',
    name: 'broken ski',
    description: 'Half of a wooden ski, snapped in two. The wood is weathered and old -- from an avalanche years ago.',
    takeable: true,
  },
  climbing_gear: {
    id: 'climbing_gear',
    name: 'climbing gear',
    description: 'Professional mountaineering equipment: carabiners, pitons, and anchors. Left here by previous climbers, perhaps for emergencies.',
    takeable: true,
  },
  emergency_kit: {
    id: 'emergency_kit',
    name: 'emergency kit',
    description: 'A weatherproof emergency survival kit containing first aid supplies, emergency blankets, signal flares, and energy bars. All in good condition.',
    takeable: true,
  },
  summit_logbook: {
    id: 'summit_logbook',
    name: 'summit logbook',
    description: 'A logbook recording everyone who reached the summit, dating back to 1950. The final entry is from February 1976.',
    takeable: true,
    readable: true,
    readText: 'You flip through decades of summit entries. The last one, in elegant handwriting, reads: "February 12, 1976 - My final ascent. The secret lies beneath the still water. The mountain holds its treasures close to those who earn them. May future adventurers find what I have hidden. - Tobias Snowpeak"',
  },
  staff_key: {
    id: 'staff_key',
    name: 'staff key',
    description: 'A brass key labeled "STAFF QUARTERS." It looks like it opens the locked staff area in the lodge.',
    takeable: true,
    hidden: false,
  },
  store_bell: {
    id: 'store_bell',
    name: 'bell',
    description: 'A brass service bell sitting on the counter. A small sign next to it reads "RING FOR SERVICE" though there\'s clearly nobody here to answer.',
    takeable: false,
  },
}
