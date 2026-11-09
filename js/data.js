// All the game's content: letters, words with pictures, rewards.
// To add a word: copy a line in WORDS and change it.
//   w = the word without vowel marks, n = with vowel marks (ניקוד), e = picture (emoji),
//   lvl = 1 short and easy, 2 medium, 3 long.

const LETTERS = [
  { l: "א", name: "אָלֶף" }, { l: "ב", name: "בֵּית" }, { l: "ג", name: "גִּימֶל" },
  { l: "ד", name: "דָּלֶת" }, { l: "ה", name: "הֵא" }, { l: "ו", name: "וָו" },
  { l: "ז", name: "זַיִן" }, { l: "ח", name: "חֵית" }, { l: "ט", name: "טֵית" },
  { l: "י", name: "יוּד" }, { l: "כ", name: "כַּף" }, { l: "ל", name: "לָמֶד" },
  { l: "מ", name: "מֵם" }, { l: "נ", name: "נוּן" }, { l: "ס", name: "סָמֶךְ" },
  { l: "ע", name: "עַיִן" }, { l: "פ", name: "פֵּא" }, { l: "צ", name: "צָדִי" },
  { l: "ק", name: "קוּף" }, { l: "ר", name: "רֵישׁ" }, { l: "ש", name: "שִׁין" },
  { l: "ת", name: "תָּו" },
];

// Letters that sound alike: never offered together in "which letter does it start with".
const SOUND_ALIKE = [["א", "ע", "ה"], ["כ", "ק", "ח"], ["ת", "ט"], ["ס", "ש"], ["ב", "ו"]];
// Letters that look alike: kept apart in the easiest level.
const LOOK_ALIKE = [["ד", "ר", "ך"], ["ה", "ח", "ת"], ["ב", "כ"], ["ו", "ז", "ן"], ["ג", "נ"], ["ס", "ם"], ["ע", "צ"]];

const FINAL_TO_NORMAL = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

const WORDS = [
  { w: "צב", n: "צָב", e: "🐢", lvl: 1 },
  { w: "דג", n: "דָּג", e: "🐟", lvl: 1 },
  { w: "דב", n: "דֹּב", e: "🐻", lvl: 1 },
  { w: "יד", n: "יָד", e: "✋", lvl: 1 },
  { w: "לב", n: "לֵב", e: "❤️", lvl: 1 },
  { w: "סוס", n: "סוּס", e: "🐴", lvl: 1 },
  { w: "פיל", n: "פִּיל", e: "🐘", lvl: 1 },
  { w: "בית", n: "בַּיִת", e: "🏠", lvl: 1 },
  { w: "תות", n: "תּוּת", e: "🍓", lvl: 1 },
  { w: "עוגה", n: "עוּגָה", e: "🎂", lvl: 2 },
  { w: "כדור", n: "כַּדּוּר", e: "⚽", lvl: 2 },
  { w: "כלב", n: "כֶּלֶב", e: "🐶", lvl: 1 },
  { w: "חתול", n: "חָתוּל", e: "🐱", lvl: 2 },
  { w: "פרה", n: "פָּרָה", e: "🐄", lvl: 1 },
  { w: "גזר", n: "גֶּזֶר", e: "🥕", lvl: 1 },
  { w: "חלב", n: "חָלָב", e: "🥛", lvl: 1 },
  { w: "ספר", n: "סֵפֶר", e: "📖", lvl: 1 },
  { w: "פרח", n: "פֶּרַח", e: "🌸", lvl: 1 },
  { w: "נעל", n: "נַעַל", e: "👟", lvl: 1 },
  { w: "כובע", n: "כּוֹבַע", e: "🧢", lvl: 2 },
  { w: "כוכב", n: "כּוֹכָב", e: "⭐", lvl: 2 },
  { w: "ירח", n: "יָרֵחַ", e: "🌙", lvl: 1 },
  { w: "שמש", n: "שֶׁמֶשׁ", e: "☀️", lvl: 1 },
  { w: "תפוח", n: "תַּפּוּחַ", e: "🍎", lvl: 2 },
  { w: "בננה", n: "בָּנָנָה", e: "🍌", lvl: 2 },
  { w: "ארנב", n: "אַרְנָב", e: "🐰", lvl: 2 },
  { w: "נחש", n: "נָחָשׁ", e: "🐍", lvl: 1 },
  { w: "אריה", n: "אַרְיֵה", e: "🦁", lvl: 2 },
  { w: "זברה", n: "זֶבְּרָה", e: "🦓", lvl: 2 },
  { w: "מטוס", n: "מָטוֹס", e: "✈️", lvl: 2 },
  { w: "גלידה", n: "גְּלִידָה", e: "🍦", lvl: 3 },
  { w: "דבורה", n: "דְּבוֹרָה", e: "🐝", lvl: 3 },
  { w: "מכונית", n: "מְכוֹנִית", e: "🚗", lvl: 3 },
  { w: "רכבת", n: "רַכֶּבֶת", e: "🚂", lvl: 2 },
  { w: "רובוט", n: "רוֹבּוֹט", e: "🤖", lvl: 3 },
  { w: "מפתח", n: "מַפְתֵּחַ", e: "🔑", lvl: 2 },
  { w: "אוטובוס", n: "אוֹטוֹבּוּס", e: "🚌", lvl: 3 },
  { w: "אבטיח", n: "אֲבַטִּיחַ", e: "🍉", lvl: 3 },
  { w: "עץ", n: "עֵץ", e: "🌳", lvl: 1 },
  { w: "קוף", n: "קוֹף", e: "🐒", lvl: 1 },
  { w: "גשם", n: "גֶּשֶׁם", e: "🌧️", lvl: 2 },
  { w: "שעון", n: "שָׁעוֹן", e: "⏰", lvl: 2 },
];

// Things to count in the numbers missions.
const COUNT_THINGS = ["🍎", "⭐", "🎈", "🐟", "🚗", "🍪", "🦆", "⚽", "🌸", "🧁"];

// The four city zones (missions).
const ZONES = [
  {
    id: "letters", title: "ספריית האותיות", icon: "📚", color: "#f59e0b",
    story: "הַמְּכַשֵּׁף הַשּׁוֹבָב פִּזֵּר אֶת הָאוֹתִיּוֹת שֶׁל הָעִיר! בּוֹא נַחְזִיר אוֹתָן.",
    storyText: "המכשף השובב פיזר את האותיות של העיר! בוא נחזיר אותן.",
    skill: "אותיות",
  },
  {
    id: "reading", title: "פארק השלטים", icon: "🪧", color: "#22c55e",
    story: "הַשְּׁלָטִים בַּפַּארְק הִתְבַּלְבְּלוּ! קְרָא אֶת הַמִּלִּים וְתַקֵּן אוֹתָם.",
    storyText: "השלטים בפארק התבלבלו! קרא את המילים ותקן אותם.",
    skill: "קריאה",
  },
  {
    id: "writing", title: "סדנת הכתיבה", icon: "✏️", color: "#3b82f6",
    story: "הַמִּכְתָּב לְרֹאשׁ הָעִיר נִמְחַק! עֲזֹר לִכְתֹּב אוֹתוֹ מֵחָדָשׁ.",
    storyText: "המכתב לראש העיר נמחק! עזור לכתוב אותו מחדש.",
    skill: "כתיבה",
  },
  {
    id: "numbers", title: "גשר הרובוטים", icon: "🤖", color: "#a855f7",
    story: "רוֹבּוֹט שׁוֹבָב חוֹסֵם אֶת הַגֶּשֶׁר! פְּתֹר אֶת הַתַּרְגִּילִים כְּדֵי לְהַרְדִּים אוֹתוֹ.",
    storyText: "רובוט שובב חוסם את הגשר! פתור את התרגילים כדי להרדים אותו.",
    skill: "מספרים וחשבון",
  },
];

// Rewards, in the order they're earned: two parts of the hero base, then a superpower.
const BASE_PARTS = [
  { id: "floor", name: "רצפה לבסיס", icon: "🏗️" },
  { id: "walls", name: "קירות", icon: "🧱" },
  { id: "door", name: "דלת סודית", icon: "🚪" },
  { id: "windows", name: "חלונות", icon: "🪟" },
  { id: "roof", name: "גג", icon: "🔺" },
  { id: "flag", name: "דגל גיבורים", icon: "🚩" },
  { id: "tower", name: "מגדל תצפית", icon: "🗼" },
  { id: "antenna", name: "אנטנת קשר", icon: "📡" },
  { id: "garden", name: "גינה", icon: "🌻" },
  { id: "lamp", name: "פנס גיבורים", icon: "🔦" },
  { id: "pad", name: "מנחת", icon: "🛬" },
  { id: "rocket", name: "חללית", icon: "🚀" },
];

const POWERS = [
  { id: "speed", name: "מגפי מהירות", icon: "⚡" },
  { id: "fly", name: "גלימה מעופפת", icon: "🦸" },
  { id: "shield", name: "מגן כוח", icon: "🛡️" },
  { id: "jump", name: "קפיצת ענק", icon: "🦘" },
  { id: "night", name: "ראיית לילה", icon: "🌙" },
  { id: "magic", name: "קרן קסם", icon: "✨" },
];

// The hero kids. Colors are easy to change here.
const HEROES = {
  bar: { name: "בר", cape: "#2563eb", suit: "#60a5fa", emblem: "ב", accent: "#facc15" },
  yarden: { name: "ירדן", cape: "#16a34a", suit: "#4ade80", emblem: "י", accent: "#fb923c" },
};

const PRAISE = ["יוֹפִי!", "מְעֻלֶּה!", "כׇּל הַכָּבוֹד!", "אַלּוּף!", "מְצֻיָּן!", "וָאוּ!", "גִּבּוֹר!"];
const TRY_AGAIN = ["נַסֵּה שׁוּב", "כִּמְעַט! עוֹד פַּעַם", "לֹא נוֹרָא, נַסֵּה שׁוּב"];
