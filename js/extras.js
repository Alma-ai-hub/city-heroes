// Richer game (2026-11-17): helper characters, pets that grow, a sticker album, a daily
// surprise chest, the opening comic story, Dr. Balagan's taunts, and themed challenge screens.

// ---------- a helper in each kingdom ----------
const HELPERS = {
  math: { name: "בובו הרובוט", spoken: "בּוּבּוֹ הָרוֹבּוֹט", e: "🤖", color: "#2563eb" },
  lang: { name: "חכמון הינשוף", spoken: "חַכְמוֹן הַיַּנְשׁוּף", e: "🦉", color: "#b45309" },
  en: { name: "פולי התוכי", spoken: "פּוֹלִי הַתֻּכִּי", e: "🦜", color: "#db2777" },
};
const helperFor = (zoneId) => HELPERS[(realmOfZone(zoneId) || { id: "lang" }).id] || HELPERS.lang;

// ---------- pets: an egg that hatches and grows with every mission ----------
const PETS = {
  fire: ["🐉", "דרקוני"], bolt: ["🦅", "נשרי"], smash: ["🦍", "גורי"], ice: ["🐧", "פינגי"],
  nature: ["🦋", "פרפרי"], water: ["🐬", "דולפי"], wind: ["🦉", "ינשופי"], magic: ["🦄", "קסמי"],
};
const PET_STAGES = [
  { from: 0, name: "ביצה", size: 0.6 }, { from: 2, name: "תינוק", size: 0.65 },
  { from: 6, name: "גדל", size: 0.85 }, { from: 15, name: "סופר", size: 1 },
];
const petStage = (done) => PET_STAGES.filter((s) => done >= s.from).length - 1;
function petInfo(heroId) {
  const h = HEROES[heroId], p = state.players[heroId] || { done: 0 };
  const [e, name] = PETS[h.power] || PETS.magic;
  const st = petStage(p.done || 0);
  const next = PET_STAGES[st + 1];
  return { e, name, stage: st, stageName: PET_STAGES[st].name, left: next ? next.from - (p.done || 0) : 0 };
}
function petHTML(heroId, size = 80) {
  const pet = petInfo(heroId);
  const s = Math.round(size * PET_STAGES[pet.stage].size);
  if (pet.stage === 0) return `<span class="pet egg" style="--s:${s}px;--c:${HEROES[heroId].suit}" title="${pet.name}"><i>🥚</i></span>`;
  return `<span class="pet stage${pet.stage}" style="--s:${s}px;--c:${HEROES[heroId].suit}" title="${pet.name}"><i>${pet.e}</i>${pet.stage === 3 ? "<b>👑</b>" : ""}</span>`;
}

// ---------- stickers ----------
const SPECIAL_STICKERS = ["🦄", "🌟", "🏆", "💎", "🚀", "🐲", "🌈", "👑", "🎸", "🦖", "🍀", "🧁", "🐙", "🛸", "🎯", "🪐", "🦜", "🍭", "⚡", "🎠"];
const stickerOf = (zoneId) => (PLACE_PICS[zoneId] || ["⭐"])[0];

function showAlbum(realmId) {
  clearScreen();
  const p = me();
  const realm = REALMS.find((r) => r.id === realmId) || REALMS[0];
  const zs = realmZones(realm.id);
  const total = REALMS.reduce((n, r) => n + realmZones(r.id).filter((z) => p.zones[z]).length, 0);
  const all = REALMS.reduce((n, r) => n + realmZones(r.id).length, 0);
  app.innerHTML = `
    ${topBar()}
    <section class="album comic-panel">
      <h2 class="comic-title">📒 אלבום המדבקות של ${H().name}</h2>
      <p class="album-count">${total} מתוך ${all} מדבקות · מדבקה מקבלים בכל עולם שמסיימים, ומדבקת זהב אחרי 3 משימות באותו עולם</p>
      <div class="album-tabs">${REALMS.map((r) => `<button class="base-tab ${r.id === realm.id ? "on" : ""}" data-realm-tab="${r.id}" style="--c:${r.color}">${r.icon} ${r.title}</button>`).join("")}
        <button class="base-tab ${realmId === "special" ? "on" : ""}" data-realm-tab="special" style="--c:#a855f7">🎁 מיוחדות</button></div>
      ${realmId === "special" ? `
        <div class="stickers">${SPECIAL_STICKERS.map((e) => { const has = (p.special || []).includes(e); return `<div class="sticker ${has ? "got gold" : ""}"><span>${has ? e : "❔"}</span><small>${has ? "מתיבת ההפתעה" : ""}</small></div>`; }).join("")}</div>
        <p class="album-count">מדבקות מיוחדות מקבלים מתיבת ההפתעה היומית 🎁</p>` : `
        <div class="stickers">${zs.map((zid) => { const z = ZONES.find((x) => x.id === zid); const n = p.zones[zid] || 0;
          return `<div class="sticker ${n ? "got" : ""} ${n >= 3 ? "gold" : ""}" style="--z:${z.color}"><span>${stickerOf(zid)}</span><small>${z.title}</small>${n >= 3 ? "<b>⭐</b>" : ""}</div>`; }).join("")}</div>`}
      <div class="row-btns"><button class="go-btn" data-map>🗺️ למפה</button></div>
    </section>`;
  bindTop();
  app.querySelectorAll("[data-realm-tab]").forEach((b) => b.addEventListener("click", () => { Sfx.click(); showAlbum(b.dataset.realmTab); }));
  on("[data-map]", "click", () => showMap(false));
  Voice.say(["זֶה אַלְבּוֹם הַמַּדְבֵּקוֹת שֶׁלְּךָ!", H().spokenName]);
}

// ---------- daily surprise chest ----------
const today = () => new Date().toLocaleDateString("en-CA");
function maybeDailyChest() {
  if (team || !hero) return;
  const p = me();
  if (p.chestDay === today()) return;
  const box = document.createElement("div");
  box.className = "overlay";
  box.innerHTML = `
    <div class="chest-pop comic-panel">
      <h2 class="comic-title">🎁 תיבת ההפתעה היומית!</h2>
      <button class="big-chest" data-open>🎁</button>
      <p class="chest-hint">לחץ על התיבה כדי לפתוח</p>
    </div>`;
  document.body.appendChild(box);
  Voice.say(["יֵשׁ לְךָ תֵּבַת הַפְתָּעָה! לְחַץ עָלֶיהָ כְּדֵי לִפְתֹּחַ"]);
  box.querySelector("[data-open]").addEventListener("click", () => {
    const missing = SPECIAL_STICKERS.filter((e) => !(p.special || []).includes(e));
    const sticker = missing.length ? pick(missing) : null;
    p.chestDay = today();
    p.stars += 3;
    if (sticker) p.special = [...(p.special || []), sticker];
    save();
    Sfx.win(); confetti();
    box.querySelector(".chest-pop").innerHTML = `
      <h2 class="comic-title">וואו!</h2>
      <div class="chest-prize">${sticker ? `<span class="prize-sticker">${sticker}</span>` : ""}<span class="prize-stars">⭐⭐⭐</span></div>
      <p class="chest-hint">${sticker ? "מדבקה מיוחדת לאלבום, ו־3 כוכבים!" : "3 כוכבים!"}</p>
      <button class="go-btn" data-close>יופי!</button>`;
    Voice.say([sticker ? "קִבַּלְתָּ מַדְבֵּקָה מְיֻחֶדֶת לָאַלְבּוֹם, וּשְׁלוֹשָׁה כּוֹכָבִים!" : "קִבַּלְתָּ שְׁלוֹשָׁה כּוֹכָבִים!"]);
    box.querySelector("[data-close]").addEventListener("click", () => { box.remove(); const s = app.querySelector(".topbar .stars"); if (s) s.textContent = `⭐ ${me().stars}`; });
  });
}

// ---------- the opening comic story ----------
const STORY_PANELS = [
  { art: () => `<div class="story-art city">${["🏙️", "🌳", "🏫", "🎡", "🏠"].map((e) => `<span>${e}</span>`).join("")}<div class="story-kids">😀😄😊</div></div>`,
    t: "פעם, העיר הייתה שמחה ומסודרת. כל האותיות, המספרים והמילים היו במקום.", n: "פַּעַם, הָעִיר הָיְתָה שְׂמֵחָה וּמְסֻדֶּרֶת. כׇּל הָאוֹתִיּוֹת, הַמִּסְפָּרִים וְהַמִּלִּים הָיוּ בַּמָּקוֹם." },
  { art: () => `<div class="story-art">${villainSVG(5, 0, 170)}${burstSVG("בלגן!")}</div>`,
    t: "עד שד״ר בלגן בנה את מכונת הבלגן!", n: "עַד שֶׁדּוֹקְטוֹר בַּלָּגָן בָּנָה אֶת מְכוֹנַת הַבַּלָּגָן!" },
  { art: () => `<div class="story-art rulers">${["robotking", "witch", "mrmix"].map((b) => BOSS_ART[b](5, 0)).join("")}</div>`,
    t: "המכונה ערבבה הכול, ושלושה שליטים שומרים על הבלגן: מגה־רובוט, המכשפה בלבולה ומיסטר מיקס.", n: "הַמְּכוֹנָה עִרְבְּבָה הַכֹּל, וּשְׁלוֹשָׁה שַׁלִּיטִים שׁוֹמְרִים עַל הַבַּלָּגָן: מֶגָה רוֹבּוֹט, הַמְּכַשֵּׁפָה בִּלְבּוּלָה, וּמִיסְטֶר מִיקְס." },
  { art: () => `<div class="story-art helpers">${Object.values(HELPERS).map((h) => `<div><span>${h.e}</span><small>${h.name}</small></div>`).join("")}</div>`,
    t: "אבל יש עזרה! בכל ממלכה מחכה חבר שעוזר: בובו הרובוט, חכמון הינשוף ופולי התוכי.", n: "אֲבָל יֵשׁ עֶזְרָה! בְּכׇל מַמְלָכָה מְחַכֶּה חָבֵר שֶׁעוֹזֵר: בּוּבּוֹ הָרוֹבּוֹט, חַכְמוֹן הַיַּנְשׁוּף, וּפּוֹלִי הַתֻּכִּי." },
  { art: () => `<div class="story-art heroes">${Object.keys(HEROES).slice(0, 4).map((id) => heroSVG(id, 130, [])).join("")}</div>`,
    t: "רק הגיבורים יכולים להציל את העיר! מוכנים?", n: "רַק הַגִּבּוֹרִים יְכוֹלִים לְהַצִּיל אֶת הָעִיר! מוּכָנִים?" },
];
function showStory(then) {
  clearScreen();
  let i = 0;
  const draw = () => {
    const s = STORY_PANELS[i];
    app.innerHTML = `
      <section class="story-screen comic-panel">
        <div class="story-dots">${STORY_PANELS.map((_, k) => `<span class="${k === i ? "on" : k < i ? "done" : ""}"></span>`).join("")}</div>
        <div class="story-panel">${s.art()}</div>
        <p class="caption-box story-caption">${s.t}</p>
        <div class="row-btns">
          <button class="go-btn" data-next>${i < STORY_PANELS.length - 1 ? "הלאה ⬅" : "🦸 יאללה, מצילים את העיר!"}</button>
          <button class="soft-btn" data-skip>דלג</button>
        </div>
      </section>`;
    Voice.say([s.n]);
    on("[data-next]", "click", () => { Sfx.click(); if (i < STORY_PANELS.length - 1) { i++; draw(); } else done(); });
    on("[data-skip]", "click", done);
  };
  const done = () => { state.settings.storySeen = true; save(); then(); };
  draw();
}

// ---------- Dr. Balagan's taunts (on the city map) ----------
const TAUNTS = [
  ["חה חה! לא תצליחו לנצח את השליטים שלי!", "חָה חָה! לֹא תַּצְלִיחוּ לְנַצֵּחַ אֶת הַשַּׁלִּיטִים שֶׁלִּי!"],
  ["אני אבלגן את כל האותיות!", "אֲנִי אֲבַלְגֵּן אֶת כׇּל הָאוֹתִיּוֹת!"],
  ["המכונה שלי הכי חזקה בעולם!", "הַמְּכוֹנָה שֶׁלִּי הֲכִי חֲזָקָה בָּעוֹלָם!"],
  ["אף אחד לא יכול לסדר את העיר!", "אַף אֶחָד לֹא יָכוֹל לְסַדֵּר אֶת הָעִיר!"],
  ["עוד מעט אערבב גם את המספרים!", "עוֹד מְעַט אֲעַרְבֵּב גַּם אֶת הַמִּסְפָּרִים!"],
];
function tauntHTML() {
  const [t] = pick(TAUNTS);
  return `<div class="taunt"><div class="taunt-face">${villainSVG(5, 0, 70)}</div><div class="taunt-bubble">${t}</div></div>`;
}

// ---------- the world behind a challenge ----------
function sceneThemeOf(zone) {
  if (zone.id === "fortress") return "edge";
  if (zone.ruler) return { math: "downtown", lang: "stories", en: "en" }[zone.realm] || "town";
  const h = hoodOfZone(zone.id);
  return h ? h.theme : "town";
}
function sceneHTML(zone) {
  const look = HOOD_LOOK[sceneThemeOf(zone)] || HOOD_LOOK.town;
  const pics = PLACE_PICS[zone.id] || [];
  const spots = [[4, 18], [92, 14], [8, 72], [90, 66], [50, 92], [24, 40], [76, 38], [16, 92], [84, 92], [60, 8]];
  const decos = [...pics, ...look.deco].slice(0, spots.length);
  return `<div class="mission-scene" style="--g1:${look.g[0]};--g2:${look.g[1]};--g3:${look.g[2]}">
    ${decos.map((e, i) => `<span style="left:${spots[i][0]}%;top:${spots[i][1]}%;--d:${(i % 5) * 0.6}s;font-size:${i < 3 ? 90 : 56}px">${e}</span>`).join("")}
  </div>`;
}
function heroReact(kind) {
  const el = document.getElementById("heroSide");
  if (!el) return;
  el.classList.remove("cheer", "think"); void el.offsetWidth; el.classList.add(kind);
}
