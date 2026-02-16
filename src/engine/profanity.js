// Common profanity word list for handle validation
// Checks for exact matches and substring matches against known bad words
const BLOCKED_WORDS = [
  'ass','asses','asshole','assholes',
  'bastard','bastards','bitch','bitches','bitchy',
  'bullshit','cock','cocks','crap','cum',
  'damn','damned','dammit','dick','dicks','dickhead',
  'douche','douchebag',
  'fag','fags','faggot','faggots',
  'fuck','fucker','fuckers','fuckin','fucking','fucks','fuckoff',
  'goddamn','goddamnit',
  'hell','ho','hoe','hoes',
  'jackass','jerkoff',
  'kike','kikes',
  'milf',
  'nazi','nazis','nigga','niggas','nigger','niggers',
  'piss','pissed','prick','pricks','pussy','pussies',
  'retard','retarded','retards',
  'shit','shits','shitty','shithead',
  'slut','sluts','slutty',
  'tit','tits','titty',
  'twat','twats',
  'wank','wanker','wankers','whore','whores',
]

export function containsProfanity(input) {
  const lower = input.toLowerCase().replace(/[^a-z]/g, '')
  return BLOCKED_WORDS.some(word => lower.includes(word))
}
