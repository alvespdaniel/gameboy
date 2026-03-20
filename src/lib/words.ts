const WORDS = [
  "about","above","abuse","actor","acute","admit","adopt","adult","after","again",
  "agent","agree","ahead","alarm","album","alert","alien","align","alive","allow",
  "alone","along","alter","among","anger","angle","angry","apart","apple","apply",
  "arena","argue","arise","asset","avoid","awake","aware","badly","basic","basis",
  "beach","began","begin","being","below","bench","birth","black","blade","blame",
  "blank","blast","bleed","blend","blind","block","blood","blown","board","bonus",
  "boost","bound","brain","brand","brave","bread","break","breed","brick","brief",
  "bring","broad","broke","brown","brush","build","bunch","burst","buyer","cabin",
  "cable","carry","catch","cause","chain","chair","chaos","charm","chart","chase",
  "cheap","check","cheek","chess","chest","chief","child","chunk","claim","clash",
  "class","clean","clear","climb","cling","clock","clone","close","cloud","coach",
  "coast","count","court","cover","crack","craft","crash","crazy","cream","crime",
  "cross","crowd","crush","curve","cycle","daily","dance","delay","dense","depth",
  "dirty","doubt","draft","drain","drama","drawn","dream","dress","drift","drink",
  "drive","drove","dying","eager","early","earth","eight","elect","elite","email",
  "empty","enemy","enjoy","enter","entry","equal","error","event","every","exact",
  "exist","extra","faint","faith","false","fault","favor","feast","fiber","field",
  "fifty","fight","final","first","fixed","flame","flash","fleet","flesh","float",
  "flood","floor","fluid","flush","focus","force","forge","forth","found","frame",
  "frank","fraud","fresh","front","frost","fruit","fully","ghost","giant","given",
  "glass","globe","glory","going","grace","grade","grain","grand","grant","graph",
  "grasp","grass","grave","great","green","greet","grief","gross","group","grove",
  "grown","guard","guess","guest","guide","guilt","happy","harsh","heart","heavy",
  "hence","horse","hotel","house","human","humor","ideal","image","imply","index",
  "inner","input","issue","ivory","jewel","joint","judge","juice","knock","known",
  "label","large","laser","later","laugh","layer","learn","least","leave","legal",
  "level","light","limit","linen","local","logic","loose","lover","lower","lucky",
  "lunch","lying","magic","major","maker","manor","maple","march","match","maybe",
  "mayor","media","mercy","metal","might","minor","minus","model","money","month",
  "moral","mount","mouse","mouth","movie","music","nerve","never","night","noble",
  "noise","north","noted","novel","nurse","ocean","offer","often","olive","onset",
  "opera","orbit","order","other","outer","owner","paint","panel","panic","patch",
  "pause","peace","pearl","phase","phone","photo","piano","pilot","pitch","pixel",
  "place","plain","plane","plant","plate","plaza","plead","point","pound","power",
  "press","price","pride","prime","print","prior","prize","proof","proud","prove",
  "queen","quest","quick","quiet","quite","quota","quote","radar","radio","raise",
  "range","rapid","ratio","reach","react","realm","rebel","reign","relax","reply",
  "rider","rifle","right","rigid","risky","river","robot","rocky","rough","round",
  "route","royal","rural","sadly","saint","salad","sauce","scale","scene","scope",
  "score","sense","serve","setup","seven","shade","shall","shame","shape","share",
  "sharp","shelf","shell","shift","shine","shirt","shock","shoot","shore","short",
  "shout","sight","since","sixth","sixty","skill","skull","slave","sleep","slice",
  "slide","slope","smart","smell","smile","smoke","snake","solar","solid","solve",
  "sorry","sound","south","space","spare","speak","speed","spend","spent","spill",
  "spine","spoke","sport","spray","squad","stack","staff","stage","stake","stall",
  "stamp","stand","stare","start","state","steal","steam","steel","steep","stick",
  "stiff","still","stock","stone","stood","store","storm","story","stove","strip",
  "stuck","study","stuff","style","sugar","suite","sunny","super","surge","sweep",
  "sweet","swift","swing","sword","table","taste","teeth","thank","theme","thick",
  "thing","think","third","those","three","throw","thumb","tiger","tight","timer",
  "tired","title","toast","today","token","topic","total","touch","tough","tower",
  "toxic","trace","track","trade","trail","train","trait","trash","treat","trend",
  "trial","tribe","trick","tried","troop","truck","truly","trunk","trust","truth",
  "tumor","twice","twist","ultra","uncle","under","union","unite","unity","until",
  "upper","upset","urban","usage","usual","valid","value","video","vigor","vinyl",
  "viral","virus","visit","vital","vivid","vocal","voice","voter","waste","watch",
  "water","weave","weigh","weird","wheat","wheel","where","which","while","white",
  "whole","whose","width","woman","world","worry","worse","worst","worth","would",
  "wound","wrath","write","wrong","wrote","yacht","yield","young","youth",
];

const WORD_SET = new Set(WORDS);

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function isValidWord(word: string): boolean {
  return WORD_SET.has(word.toLowerCase());
}

export type TileState = "empty" | "active" | "correct" | "present" | "absent";

export function evaluateGuess(guess: string, target: string): TileState[] {
  const result: TileState[] = Array(5).fill("absent");
  const targetChars = target.split("");
  const guessChars = guess.split("");

  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = "correct";
      targetChars[i] = "#";
      guessChars[i] = "*";
    }
  }

  for (let i = 0; i < 5; i++) {
    if (guessChars[i] !== "*") {
      const idx = targetChars.indexOf(guessChars[i]);
      if (idx !== -1) {
        result[i] = "present";
        targetChars[idx] = "#";
      }
    }
  }

  return result;
}
