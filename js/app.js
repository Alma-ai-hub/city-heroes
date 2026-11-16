// The game's screens: choose a hero → city map → mission → reward → hero base.

const STORE_KEY = "city-heroes-v1";
const app = document.getElementById("app");
const plain = (s) => s.replace(/[֑-ׇ]/g, ""); // remove vowel marks for display

// ---------- saving progress (in this browser) ----------
function emptyZones() { return Object.fromEntries(ZONES.map((z) => [z.id, 0])); }
function emptyPlayer() {
  return { stars: 0, done: 0, zones: emptyZones(), parts: [], powers: [], medals: 0, at: "letters" };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.players) {
      registerCustomHeroes(s.custom);
      // Older saves don't know the newer places yet.
      for (const id of Object.keys(HEROES)) if (!s.players[id]) s.players[id] = emptyPlayer();
      for (const p of Object.values(s.players)) { p.zones = { ...emptyZones(), ...p.zones }; p.at = p.at || "letters"; }
      return s;
    }
  } catch (e) { /* start fresh */ }
  return { players: Object.fromEntries(Object.keys(HEROES).map((id) => [id, emptyPlayer()])) };
}
let state = load();
state.settings = state.settings || {};
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

let hero = null; // "bar" | "yarden" | "guy" (in a game together: whose turn it is)
let team = false; // true = several heroes play together, taking turns
let TEAM = ["bar", "yarden"]; // who plays together (chosen on the "who's playing" screen)
// "בר וירדן" / "בר, ירדן וגיא", written and spoken.
const teamNames = () => TEAM.length < 2 ? HEROES[TEAM[0]].name : TEAM.slice(0, -1).map((id) => HEROES[id].name).join(", ") + " ו" + HEROES[TEAM[TEAM.length - 1]].name;
const teamSpoken = () => [...TEAM.slice(0, -1).map((id) => HEROES[id].spokenName), HEROES[TEAM[TEAM.length - 1]].spokenAnd];
const me = () => state.players[hero];
const H = () => HEROES[hero];
const levelOf = (zoneId) => Math.min(3, 1 + Math.floor(me().zones[zoneId] / 3));

// Reward number k (0, 1, 2...): two base parts, then a superpower, and again.
function rewardFor(k, heroId = hero) {
  const cycle = Math.floor(k / 3), pos = k % 3;
  if (pos < 2) { const p = BASE_PARTS[cycle * 2 + pos]; if (p) return { kind: "part", ...partFor(heroId, p.id) }; }
  else { const p = POWERS[cycle]; if (p) return { kind: "power", ...powerFor(heroId, p.id) }; }
  return { kind: "medal", id: "medal", name: "מדליית גיבור", icon: "🏅" };
}

// ---------- little screen helpers ----------
let cleanups = [];
function clearScreen() { cleanups.forEach((f) => f()); cleanups = []; Voice.stop(); window.scrollTo(0, 0); }
function on(sel, ev, fn) { const el = app.querySelector(sel); if (el) el.addEventListener(ev, fn); }

function confetti() {
  const box = document.createElement("div");
  box.className = "confetti";
  const colors = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#facc15"];
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.background = pick(colors);
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.animationDuration = 1.8 + Math.random() * 1.5 + "s";
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

const logoHTML = (small) => `
  <div class="logo ${small ? "small" : ""}">
    <span class="logo-top">גיבורי</span><span class="logo-main">העיר</span>
  </div>`;

// ---------- Screen 1: choose a hero ----------
function showHome() {
  clearScreen();
  hero = null;
  app.innerHTML = `
    <section class="home">
      ${logoHTML()}
      <p class="tagline">מי יוצא היום להציל את העיר?</p>
      <div class="hero-pick ${Object.keys(HEROES).length > 3 ? "many" : ""}">
        ${Object.keys(HEROES).map((id, i) => `
          <button class="hero-card card-${HEROES[id].power} ${i ? "tilt-l" : "tilt-r"}" data-hero="${id}" style="--c:${HEROES[id].suit};--d:${HEROES[id].dark};--l:${HEROES[id].light}">
            <span class="card-rays"></span>
            ${heroSVG(id, Object.keys(HEROES).length > 3 ? 140 : 190, state.players[id].powers)}
            <span class="hero-name">${HEROES[id].name}</span>
            <span class="hero-title">${HEROES[id].title}</span>
            <span class="hero-stars">⭐ ${state.players[id].stars}</span>
          </button>`).join(Object.keys(HEROES).length > 3 ? "" : `<div class="vs">${burstSVG("או")}</div>`)}
        ${Object.keys(HEROES).length < 8 ? `<button class="hero-card add-hero" data-add-hero><span class="plus">➕</span><span class="hero-title">גיבור חדש</span></button>` : ""}
      </div>
      <button class="team-btn" data-team>${Object.keys(HEROES).map((id) => heroFaceSVG(id, 52)).join("")}<span>משחקים ביחד!</span></button>
      <div class="villain-corner">
        <div class="villain-bubble">חה חה! אני אבלגן את כל העיר!</div>
        ${villainSVG(5, 0, 130)}
      </div>
      <div id="voice-warning"></div>
      <button class="parents-link" data-parents>👨‍👩‍👦 פינת ההורים</button>
    </section>`;
  app.querySelectorAll("[data-hero]").forEach((b) => b.addEventListener("click", () => {
    hero = b.dataset.hero;
    team = false;
    Sfx.click();
    showMap(true);
  }));
  on("[data-parents]", "click", showParents);
  on("[data-add-hero]", "click", () => { Sfx.click(); showHeroMaker(); });
  on("[data-team]", "click", () => { Sfx.click(); showTeamPick(); });
  setTimeout(() => {
    const w = document.getElementById("voice-warning");
    if (w && !Voice.hasHebrew()) w.innerHTML = `<p class="warn">🔇 לא נמצא קול בעברית בדפדפן הזה. כדי שהמשחק ידבר, פתחו אותו ב־<b>Microsoft Edge</b>.</p>`;
  }, 1500);
}

// ---------- Screen 1b: who plays together? ----------
function showTeamPick() {
  clearScreen();
  const ids = Object.keys(HEROES);
  const picked = new Set((state.settings.lastTeam || ids.slice(0, 2)).filter((id) => HEROES[id]));
  app.innerHTML = `
    <section class="home who-plays">
      ${logoHTML()}
      <p class="tagline">מי משחק ביחד? לחצו על 2 גיבורים או יותר</p>
      <div class="hero-pick">
        ${ids.map((id) => `
          <button class="hero-card pickable card-${HEROES[id].power}" data-pick="${id}" style="--c:${HEROES[id].suit};--d:${HEROES[id].dark};--l:${HEROES[id].light}">
            <span class="card-rays"></span>
            ${heroSVG(id, 150, state.players[id].powers)}
            <span class="hero-name">${HEROES[id].name}</span>
            <span class="pick-mark">✔</span>
          </button>`).join("")}
      </div>
      <div class="row-btns">
        <button class="go-btn" data-start>🦸 יאללה, משחקים ביחד!</button>
        <button class="soft-btn" data-back>חזרה</button>
      </div>
    </section>`;
  const draw = () => {
    app.querySelectorAll("[data-pick]").forEach((b) => b.classList.toggle("picked", picked.has(b.dataset.pick)));
    app.querySelector("[data-start]").disabled = picked.size < 2;
  };
  app.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.pick;
    if (picked.has(id)) picked.delete(id); else picked.add(id);
    Sfx.click();
    if (picked.has(id)) Voice.say(HEROES[id].spokenTitle);
    draw();
  }));
  on("[data-start]", "click", () => {
    if (picked.size < 2) return;
    TEAM = ids.filter((id) => picked.has(id));
    state.settings.lastTeam = TEAM;
    save();
    team = true;
    hero = TEAM[0];
    showMap(true);
  });
  on("[data-back]", "click", showHome);
  draw();
  Voice.say(["מִי מְשַׂחֵק בְּיַחַד? לַחֲצוּ עַל שְׁנֵי גִּבּוֹרִים אוֹ יוֹתֵר"]);
}

// ---------- Screen 2: the city map, and each neighborhood ----------
function topBar() {
  return `
    <header class="topbar" style="--c:${H().suit}">
      <button class="icon-btn" data-home title="החלפת גיבור">↩</button>
      ${team ? `<div class="me duo">${TEAM.map((id) => heroFaceSVG(id, 46)).join("")}<b>${teamNames()}</b></div>` : `<div class="me">${heroFaceSVG(hero, 52)}<b>${H().name}</b></div>`}
      ${logoHTML(true)}
      <div class="stars">${team ? TEAM.map((id) => `${HEROES[id].name} ⭐${state.players[id].stars}`).join(" · ") : `⭐ ${me().stars}`}</div>
      <button class="base-btn map-btn" data-map-top title="מפת העיר">🗺️</button>
      <button class="base-btn" data-base>🏰 ${team ? "הבסיסים" : "הבסיס שלי"}</button>
    </header>`;
}
const openAll = () => !!(state.settings && state.settings.openAll);
// The map's progress: one kid's, or both kids' together in a two-player game.
function mp() {
  if (!team) return me();
  const zones = {};
  for (const z of ZONES) zones[z.id] = TEAM.reduce((s, id) => s + (state.players[id].zones[z.id] || 0), 0);
  return { zones, at: state.settings.teamAt || "letters" };
}
function setAt(zoneId) { if (team) state.settings.teamAt = zoneId; else me().at = zoneId; save(); }
// Where the hero stands on the city map: the kingdom of the last place visited.
const worldSpotOf = (zoneId) => (zoneId === "fortress" ? "fortress" : (realmOfZone(zoneId) || REALMS[1]).id);

function mapScreen({ caption, head, svg }) {
  return `
    ${topBar()}
    <section class="map">
      ${head || ""}
      ${caption ? `<div class="map-caption">${burstSVG("!")}<span>${caption}</span></div>` : ""}
      <div class="rotate-hint">🔄 כדאי לסובב את הטאבלט לרוחב, כדי לראות את המפה בגדול</div>
      <div class="map-frame">${svg}</div>
    </section>`;
}

// Click handling shared by the maps: walk to the place, or say why it's locked.
function wireMap(svg, pts, here, selector, attr, onArrive, lockedSay) {
  let busy = false;
  svg.querySelectorAll(selector).forEach((r) => {
    const go = () => {
      if (busy) return;
      const id = r.dataset[attr];
      if (r.classList.contains("locked")) { Sfx.oops(); shakeIt(r); Voice.say(lockedSay(id)); return; }
      busy = true;
      Sfx.click();
      walkToken(svg, pts, here, id, () => onArrive(id));
    };
    r.addEventListener("click", go);
    r.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  });
}

// ---------- the city: three kingdoms and the fortress ----------
function showMap(greet) {
  clearScreen();
  app.innerHTML = mapScreen({
    caption: "בחר ממלכה: מספרים, אותיות או אנגלית. נצחו את שלושת השליטים, ואז אפשר להגיע לד״ר בלגן!",
    svg: citySVG(mp(), openAll()),
  });
  bindTop();
  const svg = app.querySelector(".map-svg");
  const pts = cityPoints();
  const here = worldSpotOf(mp().at);
  putToken(svg, roadLengths(svg, pts)[here]);
  wireMap(svg, pts, here, ".district[data-realm]", "realm", (id) => {
    if (id === "fortress") { setAt("fortress"); startMission("fortress"); }
    else showRealm(id, true);
  }, () => ["הַמִּבְצָר עוֹד נָעוּל. כְּדֵי לִפְתֹּחַ אוֹתוֹ, צָרִיךְ לְנַצֵּחַ אֶת שְׁלוֹשֶׁת הַשַּׁלִּיטִים"]);
  if (greet) Voice.say([...(team ? ["שָׁלוֹם", ...teamSpoken(), "הַיּוֹם אַתֶּם מְשַׂחֲקִים בְּיַחַד."] : ["שָׁלוֹם", H().spokenTitle]), "דּוֹקְטוֹר בַּלָּגָן מְבַלְגֵּן אֶת הָעִיר. לְאָן רָצִים?"]);
}

// ---------- a kingdom: its neighborhoods and its ruler ----------
function showRealm(realmId, greet) {
  clearScreen();
  const realm = REALMS.find((r) => r.id === realmId);
  app.innerHTML = mapScreen({
    head: `<div class="hood-head" style="--h:${realm.color}">
        <button class="soft-btn big" data-city>🗺️ למפת העיר</button>
        <h2 class="hood-title">${realm.icon} ${realm.title}</h2>
        <span class="hood-hint">בקרו בכל העולמות, ואז נלחמים בשליט 👑</span>
      </div>`,
    svg: realmSVG(realmId, mp(), openAll()),
  });
  bindTop();
  on("[data-city]", "click", () => showMap(false));
  const svg = app.querySelector(".map-svg");
  const pts = realmPoints(realmId);
  const at = mp().at;
  const h = hoodOfZone(at);
  const here = at === realm.ruler ? realm.ruler : h && realm.hoods.includes(h.id) ? h.id : "_start";
  putToken(svg, roadLengths(svg, pts)[here]);
  wireMap(svg, pts, here, ".district[data-hood]", "hood", (id) => showHood(id, true), (id) => {
    const i = realm.hoods.indexOf(id);
    return ["הַשְּׁכוּנָה הַזֹּאת עוֹד נְעוּלָה. כְּדֵי לִפְתֹּחַ אוֹתָהּ, בַּקֵּר בְּכׇל הָעוֹלָמוֹת בַּשְּׁכוּנָה", NEIGHBORHOODS.find((n) => n.id === realm.hoods[i - 1]).spoken];
  });
  wireMap(svg, pts, here, ".district[data-ruler]", "ruler", (id) => { setAt(id); startMission(id); },
    () => ["הַשַּׁלִּיט עוֹד נָעוּל. כְּדֵי לְהִלָּחֵם בּוֹ, בַּקֵּר בְּכׇל הָעוֹלָמוֹת שֶׁל הַמַּמְלָכָה"]);
  if (greet) Voice.say(["בָּרוּךְ הַבָּא!", realm.spoken]);
}

// ---------- one neighborhood ----------
function showHood(hoodId, greet) {
  clearScreen();
  const h = NEIGHBORHOODS.find((x) => x.id === hoodId);
  const realm = realmOfHood(hoodId);
  app.innerHTML = mapScreen({
    head: `<div class="hood-head" style="--h:${h.color}">
        <button class="soft-btn big" data-realm-back>🗺️ ל${realm.title}</button>
        <h2 class="hood-title">${h.icon} ${h.title}</h2>
        <span class="hood-hint">לחץ על עולם, והגיבור ירוץ לשם</span>
      </div>`,
    svg: hoodSVG(hoodId, mp()),
  });
  bindTop();
  on("[data-realm-back]", "click", () => showRealm(realm.id));
  const svg = app.querySelector(".map-svg");
  const pts = hoodPoints(hoodId);
  const here = h.zones.includes(mp().at) ? mp().at : "_start";
  putToken(svg, roadLengths(svg, pts)[here]);
  let busy = false;
  svg.querySelectorAll(".spot").forEach((s) => {
    const go = () => {
      if (busy) return;
      busy = true;
      Sfx.click();
      const to = s.dataset.zone;
      Voice.say(plain(ZONES.find((z) => z.id === to).title));
      walkToken(svg, pts, here, to, () => { setAt(to); startMission(to); });
    };
    s.addEventListener("click", go);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  });
  if (greet) Voice.say(["בָּרוּךְ הַבָּא!", h.spoken]);
}

// Back from a mission: to the place's neighborhood, the ruler's kingdom, or the city.
function backToMap() {
  if (team && mission) hero = TEAM[0];
  const id = mission && mission.zone.id;
  const z = ZONES.find((x) => x.id === id);
  if (z && z.ruler) return showRealm(realmOfZone(id).id);
  const h = id && hoodOfZone(id);
  if (h) showHood(h.id); else showMap(false);
}

function bindTop() {
  on("[data-home]", "click", showHome);
  on("[data-base]", "click", () => showBase());
  on("[data-map-top]", "click", () => showMap(false));
}

// ---------- Screen 3: a mission ----------
let mission = null;

function bossHTML(zone, hp) {
  return zone.boss && BOSS_ART[zone.boss] ? BOSS_ART[zone.boss](hp, 5) : "";
}
const BOSS_ASLEEP = {
  robot: ["הרובוט נרדם! ", "הָרוֹבּוֹט נִרְדַּם!"], villain: ["ד״ר בלגן נרדם! ", "דּוֹקְטוֹר בַּלָּגָן נִרְדַּם!"],
  dragon: ["הדרקון נרדם! ", "הַדְּרָקוֹן נִרְדַּם!"], monster: ["המפלצת נרדמה! ", "הַמִּפְלֶצֶת נִרְדְּמָה!"],
  robotking: ["ניצחתם את מגה־רובוט! ", "נִצַּחְתֶּם אֶת מֶגָה רוֹבּוֹט!"], witch: ["ניצחתם את בלבולה! ", "נִצַּחְתֶּם אֶת הַמְּכַשֵּׁפָה בִּלְבּוּלָה!"],
  mrmix: ["ניצחתם את מיסטר מיקס! ", "נִצַּחְתֶּם אֶת מִיסְטֶר מִיקְס!"],
};

// In a two-player game the kids take turns: one task each.
const turnHero = (i) => (team ? TEAM[(i + mission.first) % TEAM.length] : mission.solo);

function startMission(zoneId) {
  clearScreen();
  const zone = ZONES.find((z) => z.id === zoneId);
  const first = team ? (state.settings.nextFirst || 0) % TEAM.length : 0;
  if (team) { state.settings.nextFirst = (first + 1) % TEAM.length; save(); }
  const plan = zoneId === "fortress" ? planFortress() : planMission(zoneId, team || zone.ruler ? 6 : 5);
  mission = { zone, plan, i: 0, mistakes: {}, hp: 5, first, solo: hero };
  if (team) hero = turnHero(0);
  const foe = (BOSS_ART[zone.boss] || villainSVG)(5, 0);
  const heroesHTML = team
    ? `<div class="vs-side duo n${TEAM.length}">${TEAM.map((id) => heroSVG(id, TEAM.length > 2 ? 110 : 130, state.players[id].powers)).join("")}</div>`
    : `<div class="vs-side">${heroSVG(hero, 170, me().powers)}</div>`;
  app.innerHTML = `
    ${topBar()}
    <section class="intro comic-panel" style="--z:${zone.color}">
      <div class="intro-head"><span class="intro-icon">${zone.icon}</span><h2>${zone.title}</h2>${team ? `<span class="level-chip">👫 משחק זוגי</span>` : `<span class="level-chip">שלב ${levelOf(zone.id)}</span>`}</div>
      <div class="versus">
        ${heroesHTML}
        <div class="vs-mid">${burstSVG("נגד")}</div>
        <div class="vs-side foe">${foe}</div>
      </div>
      <p class="story caption-box">${zone.storyText}${team ? `<br><b>${6 % TEAM.length ? "כל אחד בתורו, לפי הסדר." : `כל אחד בתורו: ${6 / TEAM.length} אתגרים לכל גיבור.`}</b>` : ""}</p>
      <button class="go-btn" data-go>🦸 יאללה, למשימה!</button>
      <button class="soft-btn" data-back>חזרה למפה</button>
    </section>`;
  bindTop();
  Voice.say(team ? [zone.story, "כׇּל אֶחָד בְּתוֹרוֹ"] : zone.story);
  on("[data-go]", "click", () => { Sfx.click(); showChallenge(); });
  on("[data-back]", "click", backToMap);
}

function showChallenge() {
  clearScreen();
  const { zone } = mission;
  hero = turnHero(mission.i);
  app.innerHTML = `
    <section class="mission" style="--z:${zone.color}">
      <div class="mission-top">
        <button class="icon-btn" data-quit title="יציאה מהמשימה">✖</button>
        <div class="zone-tag">${zone.icon} ${zone.title}</div>
        ${team ? `<div class="turn-tag" style="--c:${H().suit}">${heroFaceSVG(hero, 46)}<b>התור של ${H().name}!</b></div>` : ""}
        <div class="progress">${mission.plan.map((_, i) => `<span class="${i < mission.i ? "done" : i === mission.i ? "now" : ""}" ${team ? `style="--p:${HEROES[turnHero(i)].suit}"` : ""}>${i < mission.i ? "★" : ""}</span>`).join("")}</div>
      </div>
      <div class="mission-body">
        ${zone.boss ? `<div class="boss-side" id="boss">${bossHTML(zone, mission.hp)}</div>` : ""}
        <div class="challenge comic-panel" id="challenge"></div>
      </div>
      <div class="feedback" id="feedback"></div>
    </section>`;
  on("[data-quit]", "click", () => { if (team) hero = mission.solo; backToMap(); });
  runChallenge();
}

function runChallenge() {
  cleanups.forEach((f) => f()); cleanups = [];
  const el = document.getElementById("challenge");
  const fn = mission.plan[mission.i];
  let finished = false;
  const api = {
    heroColor: H().suit,
    say: (t) => Voice.say(t),
    cleanup: (f) => cleanups.push(f),
    replace: () => runChallenge(),
    mistake: (opts = {}) => {
      mission.mistakes[hero] = (mission.mistakes[hero] || 0) + 1;
      Sfx.oops();
      if (!opts.quiet) Voice.say(pick(TRY_AGAIN));
    },
    correct: (teach) => {
      if (finished) return;
      finished = true;
      Sfx.good();
      const last = mission.i === mission.plan.length - 1;
      const word = pick(BURSTS);
      const praise = team || Math.random() < 0.3 ? [pick(PRAISE), H().spokenName] : [word];
      Voice.say(teach ? [...teach, ...praise] : praise);
      flash(plain(word));
      const len = mission.plan.length;
      if (mission.zone.boss && Math.floor(((mission.i + 1) * 5) / len) > Math.floor((mission.i * 5) / len)) hitBoss();
      setTimeout(() => {
        mission.i++;
        if (last) finishMission();
        else showChallenge();
      }, 1600);
    },
  };
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  const speech = fn(el, levelOf(mission.zone.id), api);
  const parts = Array.isArray(speech) ? speech : [speech];
  setTimeout(() => { if (!finished) Voice.say(team ? ["הַתּוֹר שֶׁל", H().spokenName, ...parts] : parts); }, 350);
}

function flash(word) {
  const f = document.getElementById("feedback");
  if (!f) return;
  f.innerHTML = `<div class="flash">${burstSVG(word)}</div>`;
  f.classList.remove("show"); void f.offsetWidth; f.classList.add("show");
}

function hitBoss() {
  mission.hp--;
  const r = document.getElementById("boss");
  if (!r) return;
  Sfx.zap();
  r.innerHTML = bossHTML(mission.zone, mission.hp);
  r.classList.remove("zap"); void r.offsetWidth; r.classList.add("zap");
}

// ---------- Screen 4: mission done, reward (for each kid who played) ----------
function giveReward(id) {
  const p = state.players[id];
  if (mission.zone.id === "fortress") p.saved = (p.saved || 0) + 1;
  const m = mission.mistakes[id] || 0;
  const stars = m <= 1 ? 3 : m <= 4 ? 2 : 1;
  const reward = rewardFor(p.done, id);
  p.done++;
  p.stars += stars;
  p.zones[mission.zone.id]++;
  if (reward.kind === "part") p.parts.push(reward.id);
  else if (reward.kind === "power") p.powers.push(reward.id);
  else p.medals++;
  return { id, stars, reward };
}

function finishMission() {
  clearScreen();
  const players = team ? TEAM : [mission.solo];
  const results = players.map(giveReward);
  if (!team) hero = mission.solo;
  setAt(mission.zone.id);
  save();

  const kind = (r) => (r.kind === "part" ? "חלק חדש לבסיס" : r.kind === "power" ? "כוח מיוחד חדש" : "מדליה");
  const [bossLine, bossSpoken] = BOSS_ASLEEP[mission.zone.boss] || ["", ""];
  app.innerHTML = `
    ${topBar()}
    <section class="reward comic-panel">
      <h2 class="comic-title">${bossLine}${team ? `הצלתם את העיר, ${teamNames()}!` : `הצלת את העיר, ${H().name}!`}</h2>
      <div class="gift-row">
        ${results.map((r) => `
          <div class="gift-card" style="--c:${HEROES[r.id].suit}">
            ${team ? `<div class="gift-who">${heroFaceSVG(r.id, 54)}<b>${HEROES[r.id].name}</b></div>` : ""}
            <div class="earned-stars">${"⭐".repeat(r.stars)}<span class="dim">${"⭐".repeat(3 - r.stars)}</span></div>
            <div class="gift">
              <div class="gift-rays"></div>
              <div class="gift-box">🎁</div>
              <div class="gift-open hidden">
                <div class="reward-icon">${r.reward.icon}</div>
                <p class="reward-kind">${kind(r.reward)}:</p>
                <p class="reward-name">${r.reward.name}</p>
              </div>
            </div>
          </div>`).join("")}
      </div>
      <div class="row-btns">
        <button class="go-btn" data-base2>🏰 לראות בבסיס</button>
        <button class="soft-btn" data-again>🔁 עוד משימה כאן</button>
        <button class="soft-btn" data-map>🗺️ למפה</button>
      </div>
    </section>`;
  bindTop();
  Sfx.win();
  confetti();
  Voice.say([...(bossSpoken ? [bossSpoken] : []), ...(team ? ["הִצַּלְתֶּם אֶת הָעִיר!", ...teamSpoken(), "הִנֵּה הַפְּרָסִים שֶׁלָּכֶם"] : ["הִצַּלְתָּ אֶת הָעִיר", H().spokenName, "הִנֵּה הַפְּרָס שֶׁלְּךָ"])]);
  setTimeout(() => {
    app.querySelectorAll(".gift-box").forEach((x) => x.classList.add("hidden"));
    app.querySelectorAll(".gift-open").forEach((x) => x.classList.remove("hidden"));
    Voice.say(team ? results.flatMap((r) => [HEROES[r.id].spokenName, "קִבֵּל", r.reward.name]) : ["קִבַּלְתָּ", results[0].reward.name]);
  }, 2600);
  const zoneId = mission.zone.id;
  if (zoneId === "fortress") setTimeout(() => { if (app.querySelector(".reward")) showVictory(results.map((r) => r.id)); }, 5600);
  on("[data-base2]", "click", () => showBase());
  on("[data-again]", "click", () => startMission(zoneId));
  on("[data-map]", "click", backToMap);
}

// ---------- Screen 5: the hero base ----------
function showBase(whose) {
  clearScreen();
  if (whose) hero = whose;
  const p = me();
  const next = rewardFor(p.done);
  app.innerHTML = `
    ${topBar()}
    <section class="base comic-panel">
      ${team ? `<div class="base-tabs">${TEAM.map((id) => `<button class="base-tab ${id === hero ? "on" : ""}" data-whose="${id}" style="--c:${HEROES[id].suit}">${heroFaceSVG(id, 40)} הבסיס של ${HEROES[id].name}</button>`).join("")}</div>` : ""}
      <h2 class="comic-title">הבסיס של ${H().name}</h2>
      <div class="base-pic big">${baseSVG(p.parts, hero, p.powers)}</div>
      <div class="collection">
        <h3>חלקי הבסיס (${p.parts.length}/${BASE_PARTS.length})</h3>
        <div class="items">${BASE_PARTS.map((x) => partFor(hero, x.id)).map((b) => `<span class="item ${p.parts.includes(b.id) ? "" : "locked"}" title="${b.name}">${p.parts.includes(b.id) ? b.icon : "❔"}<small>${p.parts.includes(b.id) ? b.name : ""}</small></span>`).join("")}</div>
        <h3>כוחות מיוחדים (${p.powers.length}/${POWERS.length})</h3>
        <div class="items">${POWERS.map((x) => powerFor(hero, x.id)).map((b) => `<span class="item ${p.powers.includes(b.id) ? "" : "locked"}" title="${b.name}">${p.powers.includes(b.id) ? b.icon : "❔"}<small>${p.powers.includes(b.id) ? b.name : ""}</small></span>`).join("")}</div>
        <h3>שליטים שנוצחו (${REALMS.filter((r) => p.zones[r.ruler]).length}/${REALMS.length})</h3>
        <div class="items">${REALMS.map((r) => { const z = ZONES.find((x) => x.id === r.ruler); const won = p.zones[r.ruler] > 0; return `<span class="item ${won ? "" : "locked"}" title="${z.title}">${won ? "👑" : "❔"}<small>${won ? z.title : r.title}</small></span>`; }).join("")}</div>
        ${p.saved ? `<p class="medals">🏅 מדליית מצילי העיר × ${p.saved}</p>` : ""}
        ${p.medals ? `<p class="medals">🎖️ × ${p.medals}</p>` : ""}
        <p class="next">הפרס הבא: ${next.icon} ${next.name}</p>
      </div>
      <button class="go-btn" data-map>🗺️ יוצאים למשימה</button>
    </section>`;
  bindTop();
  app.querySelectorAll("[data-whose]").forEach((b) => b.addEventListener("click", () => showBase(b.dataset.whose)));
  on("[data-map]", "click", () => showMap(false));
  Voice.say(p.done ? ["זֶה הַבָּסִיס שֶׁלְּךָ", H().spokenName, "הַפְּרָס הַבָּא:", next.name] : ["הַבָּסִיס עוֹד רֵיק. צֵא לִמְשִׂימָה כְּדֵי לִבְנוֹת אוֹתוֹ!"]);
}


// ---------- The big win: after beating Dr. Balagan ----------
function medalSVG() {
  return `<svg viewBox="0 0 200 260" class="medal-svg">
    <path d="M60 0 L100 110 L140 0Z" fill="#2563eb" stroke="#111" stroke-width="5"/><path d="M80 0 L100 70 L120 0Z" fill="#dc2626"/>
    <circle cx="100" cy="170" r="80" fill="#eab308" stroke="#111" stroke-width="6"/>
    <circle cx="100" cy="170" r="64" fill="#fde047" stroke="#a16207" stroke-width="4"/>
    <path d="M100 118 L114 156 L154 156 L122 180 L134 218 L100 196 L66 218 L78 180 L46 156 L86 156Z" fill="#facc15" stroke="#a16207" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 130 Q80 112 104 112" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>
  </svg>`;
}

function showVictory(ids) {
  clearScreen();
  const who = ids.length > 1 ? ids.slice(0, -1).map((id) => HEROES[id].name).join(", ") + " ו" + HEROES[ids[ids.length - 1]].name : HEROES[ids[0]].name;
  const many = ids.length > 1;
  const date = new Date().toLocaleDateString("he-IL");
  app.innerHTML = `
    <section class="victory comic-panel">
      <div class="fireworks">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 71) % 100}%;--y:${(i * 37) % 60}%;--d:${(i % 7) * 0.35}s;--c:${["#facc15", "#ef4444", "#22c55e", "#3b82f6", "#ec4899", "#f97316"][i % 6]}"></i>`).join("")}</div>
      <h2 class="comic-title victory-title">${many ? "ניצחתם! העיר ניצלה!" : "ניצחת! העיר ניצלה!"}</h2>
      <div class="victory-row">
        <div class="victory-heroes">${ids.map((id) => heroSVG(id, ids.length > 2 ? 120 : 150, state.players[id].powers)).join("")}</div>
        <div class="victory-medal">${medalSVG()}</div>
        <div class="victory-villain">${villainSVG(0, 0, 130)}<div class="villain-bubble">סליחה! מעכשיו אני אעזור לסדר את העיר 🙂</div></div>
      </div>
      <div class="certificate" id="certificate">
        <div class="cert-title">תעודת גיבור העיר</div>
        <p>מוענקת ל<b>${who}</b></p>
        <p>על הצלת העיר מד״ר בלגן, ועל ניצחון על שלושת השליטים:<br>👑 מגה־רובוט · 👑 המכשפה בלבולה · 👑 מיסטר מיקס</p>
        <div class="cert-faces">${ids.map((id) => heroFaceSVG(id, 70)).join("")}</div>
        <p class="cert-date">${date}</p>
      </div>
      <div class="row-btns">
        <button class="go-btn" data-print>🖨️ להדפיס תעודה</button>
        <button class="soft-btn" data-base3>🏰 לבסיס</button>
        <button class="soft-btn" data-city3>🗺️ למפת העיר</button>
      </div>
    </section>`;
  bindTop();
  Sfx.win(); confetti(); setTimeout(confetti, 1200); setTimeout(() => Sfx.win(), 1500);
  Voice.say([many ? "נִצַּחְתֶּם! הָעִיר נִצְּלָה!" : "נִצַּחְתָּ! הָעִיר נִצְּלָה!", "קִבַּלְתֶּם מֶדַלְיַת זָהָב שֶׁל מַצִּילֵי הָעִיר, וּתְעוּדַת גִּבּוֹר", "וְדוֹקְטוֹר בַּלָּגָן אוֹמֵר: סְלִיחָה! מֵעַכְשָׁו אֲנִי אֶעֱזֹר לְסַדֵּר אֶת הָעִיר"]);
  on("[data-print]", "click", () => window.print());
  on("[data-base3]", "click", () => showBase());
  on("[data-city3]", "click", () => showMap(false));
}

// ---------- Make a new hero ----------
const HERO_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#475569"];
const HAIR_COLORS = ["#3b2416", "#1c1917", "#a16207", "#f59e0b", "#7f1d1d"];
function showHeroMaker() {
  clearScreen();
  const draft = { name: "", gender: "boy", power: "ice", color: POWER_TYPES.ice.color, hair: HAIR_COLORS[0] };
  app.innerHTML = `
    <section class="maker comic-panel">
      <h2 class="comic-title">➕ גיבור חדש</h2>
      <div class="maker-row">
        <div class="maker-form">
          <label class="maker-label">השם של הגיבור:
            <input class="maker-name" data-name maxlength="10" placeholder="למשל: נועה" autocomplete="off"></label>
          <div class="maker-label">בן או בת?</div>
          <div class="maker-choices" data-group="gender">
            <button class="chip on" data-v="boy">👦 בן</button><button class="chip" data-v="girl">👧 בת</button>
          </div>
          <div class="maker-label">כוח העל:</div>
          <div class="maker-choices powers" data-group="power">
            ${Object.entries(POWER_TYPES).map(([id, p]) => `<button class="chip ${id === draft.power ? "on" : ""}" data-v="${id}">${p.icon} ${p.title}</button>`).join("")}
          </div>
          <div class="maker-label">הצבע של החליפה:</div>
          <div class="maker-choices" data-group="color">${HERO_COLORS.map((c) => `<button class="swatch-sm ${c === draft.color ? "on" : ""}" data-v="${c}" style="--s:${c}"></button>`).join("")}</div>
          <div class="maker-label">צבע השיער:</div>
          <div class="maker-choices" data-group="hair">${HAIR_COLORS.map((c) => `<button class="swatch-sm ${c === draft.hair ? "on" : ""}" data-v="${c}" style="--s:${c}"></button>`).join("")}</div>
        </div>
        <div class="maker-preview"><div data-preview></div><p class="maker-title" data-title></p></div>
      </div>
      <div class="row-btns">
        <button class="go-btn" data-save>✔️ לשמור את הגיבור</button>
        <button class="soft-btn" data-back>ביטול</button>
      </div>
      <p class="small-note">המשחק מדבר אל כל הגיבורים בלשון זכר (למשל "מצא", "בחר"). שם התואר של גיבורה יהיה בלשון נקבה.</p>
    </section>`;
  const draw = () => {
    const h = makeHero({ ...draft, name: draft.name || "?" });
    HEROES.__preview = h;
    app.querySelector("[data-preview]").innerHTML = heroSVG("__preview", 220, ["shield"]);
    app.querySelector("[data-title]").textContent = h.title;
    delete HEROES.__preview;
  };
  app.querySelector("[data-name]").addEventListener("input", (e) => { draft.name = e.target.value.trim(); draw(); });
  app.querySelectorAll("[data-group]").forEach((g) => g.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    g.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    draft[g.dataset.group] = b.dataset.v;
    if (g.dataset.group === "power") {
      draft.color = POWER_TYPES[b.dataset.v].color;
      app.querySelectorAll('[data-group="color"] button').forEach((x) => x.classList.toggle("on", x.dataset.v === draft.color));
    }
    Sfx.click(); draw();
  })));
  on("[data-save]", "click", () => {
    if (!draft.name) { app.querySelector("[data-name]").focus(); shakeIt(app.querySelector("[data-name]")); return; }
    const id = "c" + Date.now();
    state.custom = [...(state.custom || []), { id, ...draft }];
    registerCustomHeroes(state.custom);
    state.players[id] = emptyPlayer();
    save();
    Sfx.win(); confetti();
    showHome();
  });
  on("[data-back]", "click", showHome);
  draw();
}

// ---------- Parents corner ----------
function showParents() {
  clearScreen();
  app.innerHTML = `
    <section class="parents comic-panel">
      <h2 class="comic-title">👨‍👩‍👦 פינת ההורים</h2>
      <div class="panel">
        <h3>מה מתרגלים בכל מקום בעיר</h3>
        <ul>${ZONES.map((z) => `<li>${z.icon} <b>${z.title}</b>: ${z.teaches}</li>`).join("")}</ul>
        <p>כל משימה היא 5 אתגרים קצרים. אחרי כל 3 משימות באותו מקום, השלב עולה (עד שלב 3). טעות לא מורידה כלום, רק משפיעה על מספר הכוכבים. אחרי 2 טעויות, התשובה הנכונה מהבהבת.</p>
      </div>
      <div class="panel">
        <h3>ההתקדמות (מספר משימות בכל מקום)</h3>
        <div class="table-wrap"><table>
          <tr><th></th>${ZONES.map((z) => `<th title="${z.title}">${z.icon}</th>`).join("")}<th>⭐</th><th></th></tr>
          ${Object.keys(HEROES).map((id) => {
            const p = state.players[id];
            return `<tr><td><b>${HEROES[id].name}</b></td>${ZONES.map((z) => `<td>${p.zones[z.id] || 0}</td>`).join("")}<td>${p.stars}</td>
              <td><button class="soft-btn small" data-reset="${id}">איפוס</button></td></tr>`;
          }).join("")}
        </table></div>
      </div>
      <div class="panel">
        <h3>גיבורים שהוספתם</h3>
        ${(state.custom || []).length ? (state.custom || []).map((c) => `<div class="custom-row">${heroFaceSVG(c.id, 44)}<b>${HEROES[c.id].title}</b><button class="soft-btn small" data-del-hero="${c.id}">🗑️ למחוק</button></div>`).join("") : "<p>עוד לא הוספתם גיבורים. אפשר להוסיף במסך הפתיחה, בכרטיס ➕ גיבור חדש.</p>"}
        <button class="soft-btn" data-add-hero2>➕ גיבור חדש</button>
      </div>
      <div class="panel">
        <h3>שכונות</h3>
        <label class="toggle"><input type="checkbox" data-openall ${openAll() ? "checked" : ""}> לפתוח את כל השכונות ואת המבצר מיד (בלי לחכות שיסיימו את השכונה הקודמת)</label>
      </div>
      <div class="panel">
        <h3>הקול</h3>
        ${Voice.hasRecorded() ? "<p>קול: <b>קול מוקלט (טבעי)</b></p>" : `
        <p>בחרו את הקול בעברית שנשמע הכי טוב במכשיר הזה:</p>
        <select class="voice-select" data-voice>${Voice.voices.length ? Voice.voices.map((v) => `<option value="${v.name}" ${Voice.voice && v.name === Voice.voice.name ? "selected" : ""}>${v.name}</option>`).join("") : "<option>לא נמצא קול בעברית במכשיר הזה</option>"}</select>
        <label class="toggle">מהירות דיבור: <input type="range" min="0.6" max="1.2" step="0.05" value="${Voice.prefs.rate || 0.9}" data-rate></label>`}
        <button class="soft-btn" data-test>🔊 בדיקת קול</button>
        <details class="voice-help"><summary>איך מקבלים קול עברי טוב יותר בטאבלט?</summary>
          <p><b>אייפד / אייפון:</b> הגדרות ← נגישות ← תוכן מוקרא (Spoken Content) ← קולות ← עברית ← להוריד את <b>כרמית (משופר)</b>. אחר כך לבחור אותו כאן.</p>
          <p><b>טאבלט אנדרואיד:</b> הגדרות ← נגישות ← המרת טקסט לדיבור ← מנוע של Google ← להתקין נתוני קול בעברית (באיכות גבוהה). אחר כך לבחור אותו כאן.</p>
          <p><b>מחשב:</b> הקול הכי טוב בעברית נמצא בדפדפן Microsoft Edge.</p>
        </details>
      </div>
      <button class="go-btn" data-back>חזרה למשחק</button>
    </section>`;
  on("[data-back]", "click", showHome);
  on("[data-add-hero2]", "click", showHeroMaker);
  app.querySelectorAll("[data-del-hero]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.delHero;
    if (!confirm(`למחוק את ${HEROES[id].name} וכל ההתקדמות שלו?`)) return;
    state.custom = (state.custom || []).filter((c) => c.id !== id);
    delete state.players[id];
    registerCustomHeroes(state.custom);
    if (state.settings.lastTeam) state.settings.lastTeam = state.settings.lastTeam.filter((x) => x !== id);
    save();
    showParents();
  }));
  on("[data-openall]", "change", (e) => { state.settings = { ...(state.settings || {}), openAll: e.target.checked }; save(); });
  on("[data-voice]", "change", (e) => Voice.setPrefs({ voiceName: e.target.value }));
  on("[data-rate]", "change", (e) => Voice.setPrefs({ rate: +e.target.value }));
  on("[data-test]", "click", () => Voice.say(["שָׁלוֹם", ...Object.values(HEROES).slice(0, -1).map((h) => h.spokenName), Object.values(HEROES).slice(-1)[0].spokenAnd, "מוּכָנִים לְהַצִּיל אֶת הָעִיר?"]));
  app.querySelectorAll("[data-reset]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.reset;
    if (confirm(`למחוק את כל ההתקדמות של ${HEROES[id].name}?`)) {
      state.players[id] = emptyPlayer();
      save();
      showParents();
    }
  }));
}

Voice.init();
showHome();
