// Each hero's power decides how his rewards look and are called (2026-11-16):
// Bar (fire) builds a lava fortress and gets flame powers, Yarden (lightning) a storm tower
// and electric powers, Guy (smash) a stone fortress and rock powers. Added heroes pick one of
// the powers below.

const POWER_TYPES = {
  fire: { title: "האש", spoken: "הָאֵשׁ", icon: "🔥", color: "#dc2626", lining: "#f97316", noun: "אש" },
  bolt: { title: "הברק", spoken: "הַבָּרָק", icon: "⚡", color: "#2563eb", lining: "#facc15", noun: "ברק" },
  smash: { title: "המחץ", spoken: "הַמַּחַץ", icon: "💥", color: "#16a34a", lining: "#fb923c", noun: "סלע" },
  ice: { title: "הקרח", spoken: "הַקֶּרַח", icon: "❄️", color: "#0891b2", lining: "#e0f2fe", noun: "קרח" },
  nature: { title: "הטבע", spoken: "הַטֶּבַע", icon: "🌿", color: "#65a30d", lining: "#facc15", noun: "עלים" },
  water: { title: "המים", spoken: "הַמַּיִם", icon: "💧", color: "#0284c7", lining: "#67e8f9", noun: "מים" },
  wind: { title: "הרוח", spoken: "הָרוּחַ", icon: "🌪️", color: "#64748b", lining: "#e2e8f0", noun: "רוח" },
  magic: { title: "הקסם", spoken: "הַקֶּסֶם", icon: "✨", color: "#9333ea", lining: "#f0abfc", noun: "קסם" },
};

// Names and icons of the base parts and powers, per power. Missing ones follow a pattern.
const REWARD_THEMES = {
  fire: {
    parts: { floor: ["רצפת לבה", "🌋"], walls: ["קירות לבנים אדומות", "🧱"], door: ["דלת הלהבה", "🚪"], windows: ["חלונות זוהרים", "🪟"], roof: ["כיפת אש", "🔥"], flag: ["דגל הלהבה", "🚩"], tower: ["מגדל הר הגעש", "🌋"], antenna: ["ארובת עשן", "💨"], garden: ["גינת פרחי אש", "🌺"], lamp: ["לפידים בוערים", "🔥"], pad: ["מנחת לבה", "🛬"], rocket: ["חללית אש", "🚀"] },
    powers: { speed: ["מגפי להבה", "🔥"], fly: ["גלימת אש מעופפת", "🦸"], shield: ["מגן להבות", "🛡️"], jump: ["קפיצת הר געש", "🌋"], night: ["עיני גחלים", "👀"], magic: ["כדור אש ענק", "☄️"] },
  },
  bolt: {
    parts: { floor: ["רצפת ענן", "☁️"], walls: ["קירות פלדה", "🧱"], door: ["דלת חשמלית", "🚪"], windows: ["חלונות ברק", "🪟"], roof: ["כיפת סערה", "⛈️"], flag: ["דגל הברק", "🚩"], tower: ["מגדל טסלה", "🗼"], antenna: ["כליא ברקים", "⚡"], garden: ["גינת פטריות זוהרות", "🍄"], lamp: ["פנסי חשמל", "💡"], pad: ["מנחת סערה", "🛬"], rocket: ["חללית ברק", "🚀"] },
    powers: { speed: ["מגפי ברק", "⚡"], fly: ["גלימת סערה", "🌩️"], shield: ["מגן חשמל", "🛡️"], jump: ["קפיצת רעם", "💥"], night: ["ראיית ברק", "👀"], magic: ["כדור חשמל", "🔮"] },
  },
  smash: {
    parts: { floor: ["רצפת סלע", "🪨"], walls: ["קירות אבן", "🧱"], door: ["דלת ענק", "🚪"], windows: ["חלונות קריסטל", "💎"], roof: ["כיפת סלע", "⛰️"], flag: ["דגל המחץ", "🚩"], tower: ["מגדל האגרוף", "✊"], antenna: ["אנטנת סלע", "📡"], garden: ["גינת סלעים", "🌵"], lamp: ["קריסטלים זוהרים", "💎"], pad: ["מנחת אבן", "🛬"], rocket: ["חללית סלע", "🚀"] },
    powers: { speed: ["מגפי רעידת אדמה", "🥾"], fly: ["גלימת סלע", "🦸"], shield: ["מגן אבן", "🛡️"], jump: ["קפיצת ענק", "🦘"], night: ["ראיית רנטגן", "👀"], magic: ["אגרוף ענק", "👊"] },
  },
};
const PART_PATTERN = { floor: "רצפת", walls: "קירות", door: "דלת", windows: "חלונות", roof: "כיפת", flag: "דגל", tower: "מגדל", antenna: "אנטנת", garden: "גינת", lamp: "פנסי", pad: "מנחת", rocket: "חללית" };
const POWER_PATTERN = { speed: "מגפי", fly: "גלימת", shield: "מגן", jump: "קפיצת", night: "עיני", magic: "כדור" };

function themedReward(power, kind, id) {
  const t = REWARD_THEMES[power];
  const own = t && t[kind] && t[kind][id];
  if (own) return { name: own[0], icon: own[1] };
  const base = (kind === "parts" ? BASE_PARTS : POWERS).find((x) => x.id === id);
  const p = POWER_TYPES[power];
  if (!p) return { name: base.name, icon: base.icon };
  const word = (kind === "parts" ? PART_PATTERN : POWER_PATTERN)[id];
  return { name: `${word} ${p.noun}`, icon: base.icon };
}
const partFor = (heroId, id) => ({ id, ...themedReward(HEROES[heroId].power, "parts", id) });
const powerFor = (heroId, id) => ({ id, ...themedReward(HEROES[heroId].power, "powers", id) });

// ---------- heroes added by the family ----------
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, "0")).join("");
}
function makeHero(c) {
  const p = POWER_TYPES[c.power] || POWER_TYPES.magic;
  const girl = c.gender === "girl";
  const color = c.color || p.color;
  return {
    name: c.name, title: `${c.name} ${girl ? "אשת" : "איש"} ${p.title}`,
    spokenTitle: `${c.name} ${girl ? "אֵשֶׁת" : "אִישׁ"} ${p.spoken}`, spokenName: c.name, spokenAnd: "ו" + c.name,
    power: c.power, emblem: c.name[0], suit: color, light: shade(color, 0.4), dark: shade(color, -0.5),
    cape: "#111827", lining: p.lining, accent: "#fde047", hair: c.hair || "#3b2416", custom: true, gender: c.gender,
  };
}
function registerCustomHeroes(list) {
  for (const id of Object.keys(HEROES)) if (HEROES[id].custom) delete HEROES[id];
  for (const c of list || []) HEROES[c.id] = makeHero(c);
}
