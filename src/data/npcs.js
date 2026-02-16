export const npcs = {
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
        text: 'You offer the bottle of whiskey. Angry Boss\'s eyes widen. Her red face softens just slightly.\n\n"Well... maybe this trip isn\'t ALL bad." She takes a long swig and exhales. "You know what, kid? I\'ll tell you something. Yesterday I was stomping around the slopes in a rage -- don\'t judge me -- and I saw something STRANGE. Behind that frozen waterfall up north... there\'s a CAVE. I could see an opening in the ice. Looked like someone sealed it up years ago. Might be worth checking out."\n\nShe takes another swig and almost smiles. Almost.',
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
        text: '"MY SKI POLES! You FOUND them! Oh you are just the BEST PERSON I have ever met, and I have met a LOT of people!"\n\nMr Smiles does a little dance of joy.\n\n"Here, take this -- I found it rattling around in the ski lift machinery when I was, uh, definitely NOT trying to ride the broken lift. It looked important!" He hands you an electrical fuse. "Now if you\'ll excuse me, I\'m going to CONQUER that bunny slope! WISH ME LUCK!"\n\nMr Smiles practically skips toward the door.',
        effects: { removeItem: 'ski_poles', addItem: 'fuse', setFlag: ['mr_smiles', 'helped', true], moveNpc: ['mr_smiles', 'ski_slopes'] },
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
        text: '"Hmm, FASCINATING." Dill Pickle holds up a ski boot and peers inside it. "Did you know that ski boots were originally medieval torture devices repurposed for recreation? I read that on a bathroom wall once. Very reliable source."\n\nThey turn the boot upside down and shake it. A small brass key falls out and clatters to the floor.\n\n"Oh. That was in there. Huh. You know, I\'ve been shaking boots all morning hoping a sandwich would fall out, but a key is good too. Probably."',
        effects: { revealItem: ['basement_key', 'ski_rental'] },
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
    name: 'Dance Mom',
    description: 'A woman in a sequined ski jacket and full stage makeup, filming everything on her phone. She appears to be live-streaming her ski resort experience to an audience of possibly no one.',
    currentRoomId: 'village',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: '"And THIS, followers, is what we call RUSTIC CHARM!" Dance Mom pans her phone across the village. "My daughter Brittney would have DOMINATED this mountain if her jazz hands instructor hadn\'t scheduled a recital the same weekend. PRIORITIES, people!"',
      },
      {
        state: 1,
        text: '"Excuse me, can you hold this phone and film me doing a dramatic pose by that statue? No? FINE. I\'ll use the selfie stick. You know, in MY day, mountains were taller AND the hot chocolate was free. This resort is a THREE out of TEN. But the lighting is gorgeous."',
      },
      {
        state: 2,
        text: '"My livestream just hit FOUR viewers! That\'s double from last time! One of them might be my mom, but engagement is engagement, honey. If you find any secret treasure in this dump, tag me. I need CONTENT."',
      },
    ],
  },
  henrys_mom: {
    id: 'henrys_mom',
    name: "Henry's Mom",
    description: 'A glamorous woman bundled in seventeen layers of clothing, clutching a massive tote bag overflowing with snacks, hand warmers, and emergency supplies. She keeps calling out for someone named Henry, who is nowhere to be seen.',
    currentRoomId: 'main_street',
    dialogueState: 0,
    dialogue: [
      {
        state: 0,
        text: '"HENRY? HENRYYYY?!" She rummages through her tote bag. "That boy... I told him to stay by the lamp post. I SPECIFICALLY said the lamp post! Do you want a granola bar? I have fourteen. Also a first aid kit, three pairs of extra socks, and a whistle. HENRY!!!"',
      },
      {
        state: 1,
        text: '"Oh, you again! Still no sign of Henry. He\'s probably fine. He\'s twelve. Or thirteen? Somewhere in there. Want some hot cocoa? I brought a thermos. Actually I brought FOUR thermoses. One is soup. I forget which. HENRY, IF YOU CAN HEAR ME, YOUR SOUP IS GETTING COLD!"',
      },
      {
        state: 2,
        text: '"Henry just texted. He\'s been in the lodge bar this whole time. THE BAR! He\'s TEN YEARS OLD! He says he\'s been having a \'philosophical debate\' with some angry woman about resort management. I don\'t even... want a juice box? I have nine."',
      },
    ],
  },
}
