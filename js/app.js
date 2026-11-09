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
      // Older saves don't know the newer places yet.
      for (const p of Object.values(s.players)) { p.zones = { ...emptyZones(), ...p.zones }; p.at = p.at || "letters"; }
      return s;
    }
  } catch (e) { /* start fresh */ }
  return { players: { bar: emptyPlayer(), yarden: emptyPlayer() } };
}
let state = load();
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

let hero = null; // "bar" | "yarden"
const me = () => state.players[hero];
const H = () => HEROES[hero];
const levelOf = (zoneId) => Math.min(3, 1 + Math.floor(me().zones[zoneId] / 3));

// Reward number k (0, 1, 2...): two base parts, then a superpower, and again.
function rewardFor(k) {
  const cycle = Math.floor(k / 3), pos = k % 3;
  if (pos < 2) { const p = BASE_PARTS[cycle * 2 + pos]; if (p) return { kind: "part", ...p }; }
  else { const p = POWERS[cycle]; if (p) return { kind: "power", ...p }; }
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
      <div class="hero-pick">
        ${Object.keys(HEROES).map((id, i) => `
          <button class="hero-card card-${HEROES[id].power} ${i ? "tilt-l" : "tilt-r"}" data-hero="${id}" style="--c:${HEROES[id].suit};--d:${HEROES[id].dark};--l:${HEROES[id].light}">
            <span class="card-rays"></span>
            ${heroSVG(id, 190, state.players[id].powers)}
            <span class="hero-name">${HEROES[id].name}</span>
            <span class="hero-title">${HEROES[id].title}</span>
            <span class="hero-stars">⭐ ${state.players[id].stars}</span>
          </button>`).join(`<div class="vs">${burstSVG("או")}</div>`)}
      </div>
      <div class="villain-corner">
        <div class="villain-bubble">חה חה! אני אבלגן את כל העיר!</div>
        ${villainSVG(5, 0, 130)}
      </div>
      <div id="voice-warning"></div>
      <button class="parents-link" data-parents>👨‍👩‍👦 פינת ההורים</button>
    </section>`;
  app.querySelectorAll("[data-hero]").forEach((b) => b.addEventListener("click", () => {
    hero = b.dataset.hero;
    Sfx.click();
    showMap(true);
  }));
  on("[data-parents]", "click", showParents);
  setTimeout(() => {
    const w = document.getElementById("voice-warning");
    if (w && !Voice.hasHebrew()) w.innerHTML = `<p class="warn">🔇 לא נמצא קול בעברית בדפדפן הזה. כדי שהמשחק ידבר, פתחו אותו ב־<b>Microsoft Edge</b>.</p>`;
  }, 1500);
}

// ---------- Screen 2: the city map ----------
function topBar() {
  return `
    <header class="topbar" style="--c:${H().suit}">
      <button class="icon-btn" data-home title="החלפת גיבור">↩</button>
      <div class="me">${heroFaceSVG(hero, 52)}<b>${H().name}</b></div>
      ${logoHTML(true)}
      <div class="stars">⭐ ${me().stars}</div>
      <button class="base-btn" data-base>🏰 הבסיס שלי</button>
    </header>`;
}

function showMap(greet) {
  clearScreen();
  app.innerHTML = `
    ${topBar()}
    <section class="map">
      <div class="map-caption">${burstSVG("!")}<span>לחץ על מקום במפה, והגיבור ירוץ לשם. יש במפה ${ZONES.length} עולמות: גלול למעלה כדי לגלות את כולם!</span></div>
      <div class="map-frame">${mapSVG(me())}</div>
    </section>`;
  bindTop();
  const svg = app.querySelector(".map-svg");
  placeToken(svg, me().at);
  let busy = false;
  svg.querySelectorAll(".spot").forEach((s) => {
    const go = () => {
      if (busy) return;
      busy = true;
      Sfx.click();
      const to = s.dataset.zone;
      const zone = ZONES.find((z) => z.id === to);
      Voice.say(plain(zone.title));
      walkToken(svg, me().at, to, () => {
        me().at = to;
        save();
        startMission(to);
      });
    };
    s.addEventListener("click", go);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  });
  if (greet) Voice.say(`שָׁלוֹם ${H().spokenTitle}! דּוֹקְטוֹר בַּלָּגָן מְבַלְגֵּן אֶת הָעִיר. לְאָן רָצִים?`);
}

function bindTop() {
  on("[data-home]", "click", showHome);
  on("[data-base]", "click", showBase);
}

// ---------- Screen 3: a mission ----------
let mission = null;

function bossHTML(zone, hp) {
  if (zone.boss === "robot") return robotSVG(hp, 5);
  if (zone.boss === "villain") return villainSVG(hp, 5);
  if (zone.boss === "dragon") return dragonSVG(hp, 5);
  return "";
}

function startMission(zoneId) {
  clearScreen();
  const zone = ZONES.find((z) => z.id === zoneId);
  mission = { zone, plan: planMission(zoneId), i: 0, mistakes: 0, hp: 5 };
  const foe = zone.boss === "robot" ? robotSVG(5, 0) : zone.boss === "dragon" ? dragonSVG(5, 0) : villainSVG(5, 0);
  app.innerHTML = `
    ${topBar()}
    <section class="intro comic-panel" style="--z:${zone.color}">
      <div class="intro-head"><span class="intro-icon">${zone.icon}</span><h2>${zone.title}</h2><span class="level-chip">שלב ${levelOf(zone.id)}</span></div>
      <div class="versus">
        <div class="vs-side">${heroSVG(hero, 170, me().powers)}</div>
        <div class="vs-mid">${burstSVG("נגד")}</div>
        <div class="vs-side foe">${foe}</div>
      </div>
      <p class="story caption-box">${zone.storyText}</p>
      <button class="go-btn" data-go>🦸 יאללה, למשימה!</button>
      <button class="soft-btn" data-back>חזרה למפה</button>
    </section>`;
  bindTop();
  Voice.say(zone.story);
  on("[data-go]", "click", () => { Sfx.click(); showChallenge(); });
  on("[data-back]", "click", () => showMap(false));
}

function showChallenge() {
  clearScreen();
  const { zone } = mission;
  app.innerHTML = `
    <section class="mission" style="--z:${zone.color}">
      <div class="mission-top">
        <button class="icon-btn" data-quit title="יציאה מהמשימה">✖</button>
        <div class="zone-tag">${zone.icon} ${zone.title}</div>
        <div class="progress">${mission.plan.map((_, i) => `<span class="${i < mission.i ? "done" : i === mission.i ? "now" : ""}">${i < mission.i ? "★" : ""}</span>`).join("")}</div>
      </div>
      <div class="mission-body">
        ${zone.boss ? `<div class="boss-side" id="boss">${bossHTML(zone, mission.hp)}</div>` : ""}
        <div class="challenge comic-panel" id="challenge"></div>
      </div>
      <div class="feedback" id="feedback"></div>
    </section>`;
  on("[data-quit]", "click", () => showMap(false));
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
      mission.mistakes++;
      Sfx.oops();
      if (!opts.quiet) Voice.say(pick(TRY_AGAIN));
    },
    correct: () => {
      if (finished) return;
      finished = true;
      Sfx.good();
      const last = mission.i === mission.plan.length - 1;
      const word = pick(BURSTS);
      Voice.say(Math.random() < 0.3 ? `${pick(PRAISE)} ${H().name}` : word);
      flash(plain(word));
      if (mission.zone.boss) hitBoss();
      setTimeout(() => {
        mission.i++;
        if (last) finishMission();
        else showChallenge();
      }, 1600);
    },
  };
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  const speech = fn(el, levelOf(mission.zone.id), api);
  setTimeout(() => { if (!finished) Voice.say(speech); }, 350);
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

// ---------- Screen 4: mission done, reward ----------
function finishMission() {
  clearScreen();
  const p = me();
  const stars = mission.mistakes <= 1 ? 3 : mission.mistakes <= 4 ? 2 : 1;
  const reward = rewardFor(p.done);
  p.done++;
  p.stars += stars;
  p.zones[mission.zone.id]++;
  if (reward.kind === "part") p.parts.push(reward.id);
  else if (reward.kind === "power") p.powers.push(reward.id);
  else p.medals++;
  save();

  const what = reward.kind === "part" ? "חלק חדש לבסיס הגיבורים" : reward.kind === "power" ? "כוח מיוחד חדש" : "מדליה";
  const bossLine = { robot: "הרובוט נרדם! ", villain: "ד״ר בלגן נרדם! ", dragon: "הדרקון נרדם! " }[mission.zone.boss] || "";
  const bossSpoken = { robot: "הָרוֹבּוֹט נִרְדַּם! ", villain: "דּוֹקְטוֹר בַּלָּגָן נִרְדַּם! ", dragon: "הַדְּרָקוֹן נִרְדַּם! " }[mission.zone.boss] || "";
  app.innerHTML = `
    ${topBar()}
    <section class="reward comic-panel">
      <h2 class="comic-title">${bossLine}הצלת את העיר, ${H().name}!</h2>
      <div class="earned-stars">${"⭐".repeat(stars)}<span class="dim">${"⭐".repeat(3 - stars)}</span></div>
      <div class="gift">
        <div class="gift-rays"></div>
        <div class="gift-box">🎁</div>
        <div class="gift-open hidden">
          <div class="reward-icon">${reward.icon}</div>
          <p class="reward-kind">קיבלת ${what}:</p>
          <p class="reward-name">${reward.name}</p>
        </div>
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
  Voice.say(`${bossSpoken}הִצַּלְתָּ אֶת הָעִיר, ${H().name}! הִנֵּה הַפְּרָס שֶׁלְּךָ`);
  setTimeout(() => {
    app.querySelector(".gift-box")?.classList.add("hidden");
    app.querySelector(".gift-open")?.classList.remove("hidden");
    Voice.say(`קִבַּלְתָּ ${reward.name}`);
  }, 2600);
  const zoneId = mission.zone.id;
  on("[data-base2]", "click", showBase);
  on("[data-again]", "click", () => startMission(zoneId));
  on("[data-map]", "click", () => showMap(false));
}

// ---------- Screen 5: the hero base ----------
function showBase() {
  clearScreen();
  const p = me();
  const next = rewardFor(p.done);
  app.innerHTML = `
    ${topBar()}
    <section class="base comic-panel">
      <h2 class="comic-title">הבסיס של ${H().name}</h2>
      <div class="base-row">
        <div class="base-pic">${baseSVG(p.parts, hero)}</div>
        <div class="base-hero">${heroSVG(hero, 180, p.powers)}</div>
      </div>
      <div class="collection">
        <h3>חלקי הבסיס (${p.parts.length}/${BASE_PARTS.length})</h3>
        <div class="items">${BASE_PARTS.map((b) => `<span class="item ${p.parts.includes(b.id) ? "" : "locked"}" title="${b.name}">${p.parts.includes(b.id) ? b.icon : "❔"}<small>${p.parts.includes(b.id) ? b.name : ""}</small></span>`).join("")}</div>
        <h3>כוחות מיוחדים (${p.powers.length}/${POWERS.length})</h3>
        <div class="items">${POWERS.map((b) => `<span class="item ${p.powers.includes(b.id) ? "" : "locked"}" title="${b.name}">${p.powers.includes(b.id) ? b.icon : "❔"}<small>${p.powers.includes(b.id) ? b.name : ""}</small></span>`).join("")}</div>
        ${p.medals ? `<p class="medals">🏅 × ${p.medals}</p>` : ""}
        <p class="next">הפרס הבא: ${next.icon} ${next.name}</p>
      </div>
      <button class="go-btn" data-map>🗺️ יוצאים למשימה</button>
    </section>`;
  bindTop();
  on("[data-map]", "click", () => showMap(false));
  Voice.say(p.done ? `זֶה הַבָּסִיס שֶׁלְּךָ, ${H().name}! הַפְּרָס הַבָּא: ${next.name}` : `הַבָּסִיס עוֹד רֵיק. צֵא לִמְשִׂימָה כְּדֵי לִבְנוֹת אוֹתוֹ!`);
}

// ---------- Parents corner ----------
function showParents() {
  clearScreen();
  const voiceName = Voice.voice ? Voice.voice.name : "לא נמצא קול בעברית";
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
        <h3>הקול</h3>
        <p>קול: <b>${voiceName}</b></p>
        <button class="soft-btn" data-test>🔊 בדיקת קול</button>
        <p class="small-note">הקול הכי טוב בעברית נמצא בדפדפן Microsoft Edge.</p>
      </div>
      <button class="go-btn" data-back>חזרה למשחק</button>
    </section>`;
  on("[data-back]", "click", showHome);
  on("[data-test]", "click", () => Voice.say("שָׁלוֹם בַּר וְיַרְדֵּן! מוּכָנִים לְהַצִּיל אֶת הָעִיר?"));
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
