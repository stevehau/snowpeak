// Expert Mode NPCs - Modified behavior for expert difficulty
// Main changes: Mr. Smiles no longer gives the fuse (must be found in basement)
// Old Dad added as exclusive expert mode NPC in the abandoned cabin

export const npcsExpert = {
  angry_boss: {
    id: 'angry_boss',
    name: 'Angry Boss',
    description: 'A young woman with a permanently mad face, squeezed into a ski suit two sizes too big. She\'s gripping the bar counter like she\'s trying to strangle it, muttering furiously about "incompetent resort staff."',
    currentRoomId: 'lodge_bar',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: '"WHAT DO YOU WANT?!" Angry Boss slams her fist on the bar. "This whole resort is a DISASTER! The ski lift is broken, my room smells like mildew, the hot tub is frozen solid, and NOW the radio is dead! I came here to RELAX and instead I\'m having the WORST vacation of my LIFE!"',
      },
      {
        state: 1,
        condition: { hasItem: 'whiskey_bottle' },
        text: 'You offer the bottle of juice. Angry Boss\'s eyes widen. Her red face softens just slightly.\n\n"Well... maybe this trip isn\'t ALL bad." She takes a long swig and exhales. "You know what, kid? I\'ll tell you something. Yesterday I was stomping around the slopes in a rage -- don\'t judge me -- and I saw something STRANGE. Behind that frozen waterfall up north... there\'s a CAVE. I could see an opening in the ice. Looked like someone sealed it up years ago. Might be worth checking out."\n\nShe takes another swig and almost smiles. Almost.',
        effects: { removeItem: 'whiskey_bottle', setFlag: ['angry_boss', 'calmed', true] },
      },
      {
        state: 1,
        text: '"I TOLD you, leave me ALONE! Can\'t a woman be furious in peace?! Unless you\'ve got something to improve my day -- and I mean SIGNIFICANTLY -- then GET LOST!"',
      },
      {
        state: 2,
        text: '"What, you want MORE from me? I told you about the cave behind the waterfall. Now let me enjoy my whiskey in peace. This is the first thing that\'s gone RIGHT all week."',
      },
    ],
  },
  mr_smiles: {
    id: 'mr_smiles',
    name: 'Mr Smiles',
    description: 'A happy boy with an impossibly wide grin, wearing a neon yellow ski jacket so bright it practically glows. Despite looking like he\'s never seen snow before, his enthusiasm is absolutely unshakeable.',
    currentRoomId: 'lodge_lobby',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: '"Oh HELLO there, friend! Isn\'t this resort just WONDERFUL?" Mr Smiles gestures enthusiastically at a boarded-up window. "I mean, sure, the ski lift is broken and I lost my ski poles somewhere, and I fell down seventeen times on the bunny slope, but WHAT. A. VIEW! I just know today is going to be AMAZING!"',
      },
      {
        state: 1,
        condition: { hasItem: 'ski_poles' },
        // EXPERT MODE CHANGE: Mr. Smiles no longer gives the fuse
        // Players must find it in the pantry instead
        text: '"MY SKI POLES! You FOUND them! Oh you are just the BEST PERSON I have ever met, and I have met a LOT of people!"\n\nMr Smiles does a little dance of joy.\n\n"Thank you SO MUCH! Now if you\'ll excuse me, I\'m going to CONQUER that bunny slope! WISH ME LUCK!"\n\nMr Smiles practically skips toward the door.',
        effects: { removeItem: 'ski_poles', setFlag: ['mr_smiles', 'helped', true], moveNpc: ['mr_smiles', 'ski_slopes'] },
      },
      {
        state: 1,
        text: '"I\'d LOVE to hit the slopes but I seem to have misplaced my ski poles! I had them in the rental shop, I\'m SURE of it. Without them I just flop around like a happy noodle! Not that there\'s anything WRONG with being a happy noodle!"',
      },
      {
        state: 2,
        text: '"HELLO AGAIN, best friend! I\'m having the TIME OF MY LIFE on this slope! I\'ve only fallen down six times! That\'s a PERSONAL BEST!"',
      },
    ],
  },
  dill_pickle: {
    id: 'dill_pickle',
    name: 'Dill Pickle',
    description: 'A cute boy with mischevious smile and wearing completely mismatched ski gear -- one red boot, one blue boot, goggles on their forehead, and a ski jacket worn inside-out. They\'re examining a ski boot with the intensity of an archaeologist studying an ancient artifact.',
    currentRoomId: 'ski_rental',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        // EXPERT MODE CHANGE: No longer reveals basement_key
        // Players must find it in the old_cabin instead
        text: '"Hmm, FASCINATING." Dill Pickle holds up a ski boot and peers inside it. "Did you know that ski boots were originally medieval torture devices repurposed for recreation? I read that on a bathroom wall once. Very reliable source."\n\nThey turn the boot upside down and shake it vigorously.\n\n"Nothing. Not even a sandwich. Disappointing, but I respect the boot\'s commitment to being empty. Very zen."',
        effects: {},
      },
      {
        state: 1,
        condition: { hasItem: 'broken_radio' },
        text: '"Ooh, a BROKEN RADIO! Give it here!" Dill Pickle\'s eyes light up. "I once repaired a submarine\'s sonar system with a paperclip, a wad of gum, and an overwhelming sense of optimism. A radio should be easy."\n\nThey tinker with it for about ten seconds, somehow using a ski pole as a soldering iron. The radio crackles to life:\n\n"...the founder hid his greatest treasure where water stands still... the medallion is the key to the vault below... seek the cave behind the ice..."\n\nDill Pickle nods sagely. "Sounds legit. Water standing still... like a frozen waterfall, maybe? I\'m just spitballing here. I\'m mostly thinking about sandwiches."',
        effects: { removeItem: 'broken_radio', setFlag: ['dill_pickle', 'fixed_radio', true] },
      },
      {
        state: 1,
        text: '"Still trying to figure out which foot is the ski foot. Is it the left foot? The right foot? The THIRD foot? I feel like if I had a broken radio I could do something really useful. Don\'t ask me why. It\'s a FEELING."',
      },
      {
        state: 2,
        text: '"That radio keeps repeating something about water standing still and a vault. Very mysterious. You know what ELSE is mysterious? Why they don\'t sell sandwiches at a ski resort. Criminal, really."',
      },
    ],
  },
  coach_joe: {
    id: 'coach_joe',
    name: 'Coach Joe',
    description: 'A muscular man in a whistle and tracksuit, somehow wearing sneakers in the snow. He keeps blowing his whistle at nobody in particular and shouting motivational phrases at the mountain.',
    currentRoomId: 'ski_slopes',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        condition: { hasFlag: 'slalom_champion' },
        text: '"Good job, kid. I heard you beat my high score in Slalom Challenge." He gives you a respectful nod. "That\'s real talent right there. I\'ve been holding that record since \'82. You earned it, CHAMP!"',
      },
      {
        state: 0,
        text: '"HUSTLE HUSTLE HUSTLE!" Coach Joe blows his whistle at a nearby tree. "You think this mountain is gonna ski ITSELF? Give me twenty push-ups! Actually, don\'t. The snow is cold. Give me twenty MENTAL push-ups. Think really hard about push-ups. GREAT WORK, CHAMP!"',
      },
      {
        state: 1,
        text: '"You know what separates a WINNER from a LOSER on the slopes? NOTHING! They both fall down! But the WINNER falls down with CONFIDENCE!" He blows his whistle triumphantly. "That\'s free advice. Normally I charge for that."',
      },
      {
        state: 2,
        text: '"I\'ve been coaching ski beginners for thirty years and I\'ve never actually been on skis myself. You know why? Because a true coach leads from the SIDELINES! Also I\'m terrified of heights. DON\'T TELL ANYONE!"',
      },
    ],
  },
  dance_mom: {
    id: 'dance_mom',
    name: 'Social Media Influencer',
    description: 'A woman in a sequined ski jacket and full stage makeup, filming everything on her phone with a ring light clipped to the top. She appears to be live-streaming her ski resort experience to an audience of possibly no one.',
    currentRoomId: 'village',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: '"And THIS, followers, is what we call RUSTIC CHARM!" She pans her phone across the village with practiced flair. "My daughter Samantha would have LOVED this mountain — she\'s got the best ski aesthetic of anyone I know. But her dance recital is this weekend so she couldn\'t make it. Her loss is YOUR gain, followers. CONTENT waits for no one!"',
      },
      {
        state: 1,
        text: '"Excuse me, can you hold this phone and film me doing a dramatic pose by that statue? No? FINE. I\'ll use the selfie stick. You know, in MY day, mountains were taller AND the hot chocolate was free. This resort is a THREE out of TEN. But the lighting is GORGEOUS. Samantha is going to be SO jealous when she sees these stories."',
      },
      {
        state: 2,
        text: '"My livestream just hit FOUR viewers! That\'s double from last time! One of them might be my mom, but engagement is engagement, honey. Samantha says I should try TikTok but I told her — mommy is a MULTI-PLATFORM creator. If you find any secret treasure in this dump, tag me. I need CONTENT."',
      },
    ],
  },
  henrys_mom: {
    id: 'henrys_mom',
    name: "Henry's Mom",
    description: 'A warm, cheerful woman bundled in a cozy puffer jacket, surrounded by an impressive array of tote bags overflowing with snacks of every variety. Granola bars, fruit snacks, trail mix, string cheese, juice boxes — it\'s like a mobile convenience store. She has the kind smile of someone who\'s never met a stranger, though right now she keeps glancing around nervously for her son.',
    currentRoomId: 'main_street',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: '"Oh, hello sweetie!" She beams at you and immediately starts rummaging through one of her tote bags. "Have you seen my Henry? That boy took off to \'explore the mountain\' about an hour ago and I just KNOW he didn\'t pack enough snacks. I gave him two granola bars but that\'s barely a warmup!"\n\nShe pulls out a fruit snack pouch and offers it to you. "Here, take this. You look like you could use a snack. I always say — you can never have too many snacks on an adventure. Do you want trail mix too? I have seven bags. SEVEN."',
      },
      {
        state: 1,
        text: '"Still no Henry!" She shakes her head but manages a warm laugh. "That kid — he\'s got his father\'s sense of adventure and absolutely NONE of his common sense about packing food. I bet he\'s out there right now, climbing something he shouldn\'t be, with nothing but an empty granola bar wrapper in his pocket."\n\nShe holds up a thermos. "Hot cocoa? I made it from scratch this morning. I also have chicken soup, apple cider, and something that might be tea? Oh, and string cheese! The good kind, not the weird rubbery kind. Please, take something. I brought enough snacks for the entire resort and it would make me feel SO much better knowing at least someone out there is well-fed."',
      },
      {
        state: 2,
        text: '"Henry just texted! He says he\'s been having the BEST time exploring the lodge. The LODGE! He was right here the whole time!" She laughs and wipes her eyes. "He says he made friends with some angry lady at the bar and they\'ve been debating whether this resort needs better snack machines. That\'s my boy."\n\nShe starts reorganizing her tote bags with visible relief. "I swear, being a mom is 10% parenting and 90% making sure everyone has enough to eat. Are you SURE you don\'t want a juice box? I have a whole case. Take two. Take three! You\'re an adventurer — you need your energy!"',
      },
    ],
  },
  old_dad: {
    id: 'old_dad',
    name: 'Old Dad',
    description: 'A weathered, silver-haired man sitting in a creaky rocking chair by the cold fireplace. He\'s wrapped in a wool blanket with a thermos of coffee and a battered paperback novel. His eyes have the contented squint of someone who came here specifically to get away from everyone — and succeeded.',
    currentRoomId: 'old_cabin',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: 'The old man looks up from his book with mild surprise — the kind that suggests he hasn\'t seen another human being in quite some time, and was perfectly fine with that.\n\n"Well, well. A visitor." He takes a long sip of coffee. "Name\'s Dad. Well — Old Dad, if you ask the kids. Been holed up in this cabin since... what month is it? Doesn\'t matter. Came up here for some peace and quiet after thirty years of youth hockey tournaments, school drop-offs, and assembling furniture with missing screws."\n\nHe gestures at the cozy mess around him. "Found this place abandoned. Moved right in. Best decision I ever made. Nobody asking me to fix the WiFi out here."',
      },
      {
        state: 1,
        text: '"Still here? Most people take the hint when a man\'s reading in an abandoned cabin in the middle of nowhere." He chuckles warmly. "I\'m kidding. It\'s nice to have company. For exactly five minutes."\n\nHe leans forward conspiratorially. "You know, I\'ve been hearing strange noises from under the lodge at night. Thumping. Buzzing. Like old machinery trying to wake up. The basement, I reckon. I tried the door once but it was locked tight. Found the key in that desk over there, but my knees aren\'t what they used to be. Too many stairs."\n\nHe glances at the leather pouch on the desk. "Oh, and take those game tokens while you\'re at it. Found \'em in a drawer. There\'s an old arcade cabinet in the general store over in the village — might still work if you feed it a token. Lord knows I have no use for \'em. Go play a game, stretch your legs, and let an old man read in peace."',
      },
      {
        state: 2,
        text: '"You\'re back AGAIN? What is this, a social club?" He pretends to be annoyed but can\'t hide a grin. "Fine, fine. Sit down. Want some coffee? It\'s three days old but it builds character."\n\nHe stares out the frosty window. "This mountain has secrets, you know. Old Tobias Snowpeak — the founder — he was a peculiar fellow. Built this whole resort and then just... vanished. Left behind riddles and locked doors everywhere. Like a man who couldn\'t stop playing games even after he was gone."\n\nHe picks his book back up. "Now shoo. This chapter isn\'t going to read itself. And if you haven\'t tried that arcade in the general store yet, you should. Might find more than you expect over there."',
      },
    ],
  },
}
