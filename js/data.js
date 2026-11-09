// All the game's content: letters, words with pictures, places in the city, rewards.
// To add a word: copy a line in WORDS and change it.
//   w = the word without vowel marks, n = with vowel marks (ניקוד), e = picture (emoji),
//   lvl = 1 short and easy, 2 medium, 3 long,
//   s = how many claps (syllables); 0 = don't use this word for clapping,
//   a = true for animals (used in the zoo).

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

// Letters that sound alike: never offered together in sound questions.
const SOUND_ALIKE = [["א", "ע", "ה"], ["כ", "ק", "ח"], ["ת", "ט"], ["ס", "ש"], ["ב", "ו"]];
// Letters that look alike: kept apart in the easiest level.
const LOOK_ALIKE = [["ד", "ר", "ך"], ["ה", "ח", "ת"], ["ב", "כ"], ["ו", "ז", "ן"], ["ג", "נ"], ["ס", "ם"], ["ע", "צ"]];

const FINAL_TO_NORMAL = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

const WORDS = [
  { w: "צב", n: "צָב", e: "🐢", lvl: 1, s: 1, a: true },
  { w: "דג", n: "דָּג", e: "🐟", lvl: 1, s: 1, a: true },
  { w: "דב", n: "דֹּב", e: "🐻", lvl: 1, s: 1, a: true },
  { w: "יד", n: "יָד", e: "✋", lvl: 1, s: 1 },
  { w: "לב", n: "לֵב", e: "❤️", lvl: 1, s: 1 },
  { w: "סוס", n: "סוּס", e: "🐴", lvl: 1, s: 1, a: true },
  { w: "פיל", n: "פִּיל", e: "🐘", lvl: 1, s: 1, a: true },
  { w: "בית", n: "בַּיִת", e: "🏠", lvl: 1, s: 2 },
  { w: "תות", n: "תּוּת", e: "🍓", lvl: 1, s: 1 },
  { w: "עז", n: "עֵז", e: "🐐", lvl: 1, s: 1, a: true },
  { w: "עץ", n: "עֵץ", e: "🌳", lvl: 1, s: 1 },
  { w: "קוף", n: "קוֹף", e: "🐒", lvl: 1, s: 1, a: true },
  { w: "כלב", n: "כֶּלֶב", e: "🐶", lvl: 1, s: 2, a: true },
  { w: "פרה", n: "פָּרָה", e: "🐄", lvl: 1, s: 2, a: true },
  { w: "גזר", n: "גֶּזֶר", e: "🥕", lvl: 1, s: 2 },
  { w: "חלב", n: "חָלָב", e: "🥛", lvl: 1, s: 2 },
  { w: "ספר", n: "סֵפֶר", e: "📖", lvl: 1, s: 2 },
  { w: "פרח", n: "פֶּרַח", e: "🌸", lvl: 1, s: 2 },
  { w: "נעל", n: "נַעַל", e: "👟", lvl: 1, s: 2 },
  { w: "נחש", n: "נָחָשׁ", e: "🐍", lvl: 1, s: 2, a: true },
  { w: "שמש", n: "שֶׁמֶשׁ", e: "☀️", lvl: 1, s: 2 },
  { w: "ירח", n: "יָרֵחַ", e: "🌙", lvl: 1, s: 0 },
  { w: "גמל", n: "גָּמָל", e: "🐫", lvl: 1, s: 2, a: true },
  { w: "נמר", n: "נָמֵר", e: "🐯", lvl: 1, s: 2, a: true },
  { w: "ענן", n: "עָנָן", e: "☁️", lvl: 1, s: 2 },
  { w: "זאב", n: "זְאֵב", e: "🐺", lvl: 2, s: 2, a: true },
  { w: "עוגה", n: "עוּגָה", e: "🎂", lvl: 2, s: 2 },
  { w: "כדור", n: "כַּדּוּר", e: "⚽", lvl: 2, s: 2 },
  { w: "חתול", n: "חָתוּל", e: "🐱", lvl: 2, s: 2, a: true },
  { w: "כובע", n: "כּוֹבַע", e: "🧢", lvl: 2, s: 2 },
  { w: "כוכב", n: "כּוֹכָב", e: "⭐", lvl: 2, s: 2 },
  { w: "תפוח", n: "תַּפּוּחַ", e: "🍎", lvl: 2, s: 0 },
  { w: "בננה", n: "בָּנָנָה", e: "🍌", lvl: 2, s: 3 },
  { w: "ארנב", n: "אַרְנָב", e: "🐰", lvl: 2, s: 2, a: true },
  { w: "אריה", n: "אַרְיֵה", e: "🦁", lvl: 2, s: 2, a: true },
  { w: "זברה", n: "זֶבְּרָה", e: "🦓", lvl: 2, s: 2, a: true },
  { w: "מטוס", n: "מָטוֹס", e: "✈️", lvl: 2, s: 2 },
  { w: "רכבת", n: "רַכֶּבֶת", e: "🚂", lvl: 2, s: 3 },
  { w: "מפתח", n: "מַפְתֵּחַ", e: "🔑", lvl: 2, s: 0 },
  { w: "גשם", n: "גֶּשֶׁם", e: "🌧️", lvl: 2, s: 2 },
  { w: "שעון", n: "שָׁעוֹן", e: "⏰", lvl: 2, s: 2 },
  { w: "תנין", n: "תַּנִּין", e: "🐊", lvl: 2, s: 2, a: true },
  { w: "פרפר", n: "פַּרְפַּר", e: "🦋", lvl: 2, s: 2, a: true },
  { w: "עכבר", n: "עַכְבָּר", e: "🐭", lvl: 2, s: 2, a: true },
  { w: "כבשה", n: "כִּבְשָׂה", e: "🐑", lvl: 2, s: 2, a: true },
  { w: "תוכי", n: "תּוּכִּי", e: "🦜", lvl: 2, s: 2, a: true },
  { w: "כריש", n: "כָּרִישׁ", e: "🦈", lvl: 2, s: 2, a: true },
  { w: "שועל", n: "שׁוּעָל", e: "🦊", lvl: 2, s: 2, a: true },
  { w: "ברווז", n: "בַּרְוָז", e: "🦆", lvl: 2, s: 2, a: true },
  { w: "ינשוף", n: "יַנְשׁוּף", e: "🦉", lvl: 2, s: 2, a: true },
  { w: "מסוק", n: "מַסּוֹק", e: "🚁", lvl: 2, s: 2 },
  { w: "פיצה", n: "פִּיצָה", e: "🍕", lvl: 2, s: 2 },
  { w: "גלידה", n: "גְּלִידָה", e: "🍦", lvl: 3, s: 3 },
  { w: "דבורה", n: "דְּבוֹרָה", e: "🐝", lvl: 3, s: 3, a: true },
  { w: "מכונית", n: "מְכוֹנִית", e: "🚗", lvl: 3, s: 3 },
  { w: "רובוט", n: "רוֹבּוֹט", e: "🤖", lvl: 3, s: 2 },
  { w: "אוטובוס", n: "אוֹטוֹבּוּס", e: "🚌", lvl: 3, s: 3 },
  { w: "אבטיח", n: "אֲבַטִּיחַ", e: "🍉", lvl: 3, s: 0 },
  { w: "מטריה", n: "מִטְרִיָּה", e: "☂️", lvl: 3, s: 3 },
  { w: "תרנגול", n: "תַּרְנְגוֹל", e: "🐓", lvl: 3, s: 3, a: true },
  { w: "לוויתן", n: "לִוְיָתָן", e: "🐋", lvl: 3, s: 3, a: true },
  { w: "דינוזאור", n: "דִּינוֹזָאוּר", e: "🦖", lvl: 3, s: 4, a: true },
  { w: "צפרדע", n: "צְפַרְדֵּעַ", e: "🐸", lvl: 3, s: 0, a: true },
  { w: "טלפון", n: "טֶלֶפוֹן", e: "📱", lvl: 3, s: 3 },
];

// Things to count in the numbers missions.
const COUNT_THINGS = ["🍎", "⭐", "🎈", "🐟", "🚗", "🍪", "🦆", "⚽", "🌸", "🧁"];
const FRUITS = ["🍎", "🍌", "🍓", "🍊", "🍐", "🍇", "🍉", "🥕"];

// The villain of the city (an original character).
const VILLAIN = { name: "ד״ר בלגן", spoken: "דּוֹקְטוֹר בַּלָּגָן" };

// The places in the city, in the order of the road on the map.
// boss: "robot" or "villain" shows a bad guy who falls asleep as you answer.
const ZONES = [
  {
    id: "letters", title: "ספריית האותיות", icon: "📚", color: "#f59e0b", skill: "אותיות",
    story: "דּוֹקְטוֹר בַּלָּגָן פִּזֵּר אֶת כׇּל הָאוֹתִיּוֹת שֶׁל הַסִּפְרִיָּה! בּוֹא נַחְזִיר אוֹתָן.",
    storyText: "ד״ר בלגן פיזר את כל האותיות של הספרייה! בוא נחזיר אותן.",
  },
  {
    id: "reading", title: "פארק השלטים", icon: "🪧", color: "#22c55e", skill: "קריאה",
    story: "דּוֹקְטוֹר בַּלָּגָן בִּלְבֵּל אֶת הַשְּׁלָטִים בַּפַּארְק! קְרָא אֶת הַמִּלִּים וְתַקֵּן אוֹתָם.",
    storyText: "ד״ר בלגן בלבל את השלטים בפארק! קרא את המילים ותקן אותם.",
  },
  {
    id: "writing", title: "סדנת הכתיבה", icon: "✏️", color: "#3b82f6", skill: "כתיבה",
    story: "דּוֹקְטוֹר בַּלָּגָן מָחַק אֶת הַמִּכְתָּב לְרֹאשׁ הָעִיר! עֲזֹר לִכְתֹּב אוֹתוֹ מֵחָדָשׁ.",
    storyText: "ד״ר בלגן מחק את המכתב לראש העיר! עזור לכתוב אותו מחדש.",
  },
  {
    id: "zoo", title: "גן החיות", icon: "🦁", color: "#ea580c", skill: "צלילים ואותיות",
    story: "דּוֹקְטוֹר בַּלָּגָן פָּתַח אֶת הַכְּלוּבִים! הַחֲזֵר כׇּל חַיָּה לַבַּיִת שֶׁלָּהּ לְפִי הָאוֹתִיּוֹת.",
    storyText: "ד״ר בלגן פתח את הכלובים! החזר כל חיה לבית שלה לפי האותיות.",
  },
  {
    id: "numbers", title: "גשר הרובוטים", icon: "🤖", color: "#a855f7", skill: "חשבון", boss: "robot",
    story: "הָרוֹבּוֹט שֶׁל דּוֹקְטוֹר בַּלָּגָן חוֹסֵם אֶת הַגֶּשֶׁר! פְּתֹר תַּרְגִּילִים כְּדֵי לְהַרְדִּים אוֹתוֹ.",
    storyText: "הרובוט של ד״ר בלגן חוסם את הגשר! פתור תרגילים כדי להרדים אותו.",
  },
  {
    id: "market", title: "שוק הפירות", icon: "🍉", color: "#e11d48", skill: "כמה ועוד כמה",
    story: "דּוֹקְטוֹר בַּלָּגָן עִרְבֵּב אֶת הַפֵּרוֹת בַּשּׁוּק! עֲזֹר לַמּוֹכְרִים לִסְפֹּר וּלְשַׁלֵּם.",
    storyText: "ד״ר בלגן ערבב את הפירות בשוק! עזור למוכרים לספור ולשלם.",
  },
  {
    id: "train", title: "תחנת הרכבת", icon: "🚂", color: "#0891b2", skill: "הברות ומילים",
    story: "הָרַכֶּבֶת לֹא זָזָה! דּוֹקְטוֹר בַּלָּגָן נָעַל אוֹתָהּ. מְחָא כַּפַּיִם וּקְרָא מִלִּים כְּדֵי לְהַתְנִיעַ אוֹתָהּ.",
    storyText: "הרכבת לא זזה! ד״ר בלגן נעל אותה. מחא כפיים וקרא מילים כדי להתניע אותה.",
  },
  {
    id: "space", title: "נמל החלליות", icon: "🚀", color: "#4f46e5", skill: "מספרים",
    story: "דּוֹקְטוֹר בַּלָּגָן בִּלְבֵּל אֶת הַמִּסְפָּרִים שֶׁל הַחֲלָלִית! עֲזֹר לָהּ לְהַמְרִיא.",
    storyText: "ד״ר בלגן בלבל את המספרים של החללית! עזור לה להמריא.",
  },
  {
    id: "fortress", title: "המבצר של ד״ר בלגן", icon: "🏰", color: "#7c3aed", skill: "קרב הסיום: הכול ביחד", boss: "villain",
    story: "הִגַּעְתָּ לַמִּבְצָר שֶׁל דּוֹקְטוֹר בַּלָּגָן! כׇּל תְּשׁוּבָה נְכוֹנָה מַרְדִּימָה אוֹתוֹ קְצָת. בּוֹא נַצִּיל אֶת הָעִיר!",
    storyText: "הגעת למבצר של ד״ר בלגן! כל תשובה נכונה מרדימה אותו קצת. בוא נציל את העיר!",
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
  bar: { name: "בר", suit: "#2563eb", dark: "#1e3a8a", cape: "#dc2626", accent: "#facc15", emblem: "ב", title: "בר הבזק" },
  yarden: { name: "ירדן", suit: "#16a34a", dark: "#14532d", cape: "#ea580c", accent: "#facc15", emblem: "י", title: "ירדן הסופה" },
};

const PRAISE = ["יוֹפִי!", "מְעֻלֶּה!", "כׇּל הַכָּבוֹד!", "אַלּוּף!", "מְצֻיָּן!", "וָאוּ!", "גִּבּוֹר!"];
const BURSTS = ["בּוּם!", "יֶשׁ!", "וָאוּ!", "אַלּוּף!", "פָּאוּ!", "מְעֻלֶּה!"];
const TRY_AGAIN = ["נַסֵּה שׁוּב", "כִּמְעַט! עוֹד פַּעַם", "לֹא נוֹרָא, נַסֵּה שׁוּב"];
