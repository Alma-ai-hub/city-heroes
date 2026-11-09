// The game's screens: choose a hero → city map → mission → reward → hero base.

const STORE_KEY = "city-heroes-v1";
const app = document.getElementById("app");

// ---------- saving progress (in this browser) ----------
function emptyPlayer() {
  return { stars: 0, done: 0, zones: { letters: 0, reading: 0, writing: 0, numbers: 0 }, parts: [], powers: [], medals: 0 };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.players) return s;
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
function clearScreen() { cleanups.forEach((f) => f()); cleanups = []; Voice.stop(); }
function on(sel, ev, fn) { const el = app.querySelector(sel); if (el) el.addEventListener(ev, fn); }

function confetti() {
  const box = document.createElement("div");
  box.className = "confetti";
  const colors = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#facc15"];
  for (let i = 0; i < 70; i++) {
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

// ---------- Screen 1: choose a hero ----------
function showHome() {
  clearScreen();
  hero = null;
  app.innerHTML = `
    <section class="home">
      <h1 class="title">גיבורי העיר</h1>
      <p class="subtitle">מי יוצא היום להציל את העיר?</p>
      <div class="hero-pick">
        ${Object.keys(HEROES).map((id) => `
          <button class="hero-card" data-hero="${id}" style="--c:${HEROES[id].cape}">
            ${heroSVG(id, 170, state.players[id].powers)}
            <span class="hero-name">${HEROES[id].name}</span>
            <span class="hero-stars">⭐ ${state.players[id].stars}</span>
          </button>`).join("")}
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
    <header class="topbar" style="--c:${H().cape}">
      <button class="icon-btn" data-home title="החלפת גיבור">↩️</button>
      <div class="me">${heroSVG(hero, 46, me().powers)}<b>${H().name}</b></div>
      <div class="stars">⭐ ${me().stars}</div>
      <button class="base-btn" data-base>🏰 הבסיס שלי</button>
    </header>`;
}

function showMap(greet) {
  clearScreen();
  app.innerHTML = `
    ${topBar()}
    <section class="map">
      <h2 class="map-title">לאן יוצאים למשימה?</h2>
      <div class="zones">
        ${ZONES.map((z) => `
          <button class="zone" data-zone="${z.id}" style="--z:${z.color}">
            <span class="zone-icon">${z.icon}</span>
            <span class="zone-title">${z.title}</span>
            <span class="zone-skill">${z.skill}</span>
            <span class="zone-level">שלב ${levelOf(z.id)} · ${me().zones[z.id]} משימות</span>
          </button>`).join("")}
      </div>
      <div class="city-skyline" aria-hidden="true">🏢🏠🏬🌳🏫🏠🏥🌳🏢</div>
    </section>`;
  bindTop();
  app.querySelectorAll("[data-zone]").forEach((b) => b.addEventListener("click", () => { Sfx.click(); startMission(b.dataset.zone); }));
  if (greet) Voice.say(`שָׁלוֹם ${H().name}! לְאָן יוֹצְאִים לַמְּשִׂימָה?`);
}

function bindTop() {
  on("[data-home]", "click", showHome);
  on("[data-base]", "click", showBase);
}

// ---------- Screen 3: a mission ----------
let mission = null;

function startMission(zoneId) {
  clearScreen();
  const zone = ZONES.find((z) => z.id === zoneId);
  mission = { zone, plan: planMission(zoneId), i: 0, mistakes: 0, hp: 5 };
  app.innerHTML = `
    ${topBar()}
    <section class="intro" style="--z:${zone.color}">
      <div class="intro-icon">${zone.icon}</div>
      <h2>${zone.title}</h2>
      <p class="story">${zone.storyText}</p>
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
  const isRobot = zone.id === "numbers";
  app.innerHTML = `
    <section class="mission" style="--z:${zone.color}">
      <div class="mission-top">
        <button class="icon-btn" data-quit title="יציאה מהמשימה">✖</button>
        <div class="progress">${mission.plan.map((_, i) => `<span class="${i < mission.i ? "done" : i === mission.i ? "now" : ""}"></span>`).join("")}</div>
        <div class="mini-hero">${heroSVG(hero, 52, me().powers)}</div>
      </div>
      <div class="mission-body">
        ${isRobot ? `<div class="robot-side" id="robot">${robotSVG(mission.hp, 5)}</div>` : ""}
        <div class="challenge" id="challenge"></div>
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
    heroColor: H().cape,
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
      Voice.say(Math.random() < 0.3 ? `${pick(PRAISE)} ${H().name}` : pick(PRAISE));
      flash("✔️");
      if (mission.zone.id === "numbers") hitRobot();
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

function flash(symbol) {
  const f = document.getElementById("feedback");
  if (!f) return;
  f.innerHTML = `<span>${symbol}</span>`;
  f.classList.remove("show"); void f.offsetWidth; f.classList.add("show");
}

function hitRobot() {
  mission.hp--;
  const r = document.getElementById("robot");
  if (!r) return;
  Sfx.zap();
  r.innerHTML = robotSVG(mission.hp, 5);
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
  const robotLine = mission.zone.id === "numbers" ? "הרובוט נרדם והגשר פתוח! " : "";
  app.innerHTML = `
    ${topBar()}
    <section class="reward">
      <h2>${robotLine}הצלת את העיר, ${H().name}!</h2>
      <div class="earned-stars">${"⭐".repeat(stars)}<span class="dim">${"⭐".repeat(3 - stars)}</span></div>
      <div class="gift">
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
  Voice.say(`${mission.zone.id === "numbers" ? "הָרוֹבּוֹט נִרְדַּם! " : ""}הִצַּלְתָּ אֶת הָעִיר, ${H().name}! הִנֵּה הַפְּרָס שֶׁלְּךָ`);
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
    <section class="base">
      <h2>הבסיס של ${H().name}</h2>
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
    <section class="parents">
      <h2>👨‍👩‍👦 פינת ההורים</h2>
      <div class="panel">
        <h3>מה מתרגלים בכל מקום בעיר</h3>
        <ul>
          <li>📚 <b>ספריית האותיות</b>: למצוא אות לפי שם, באיזו אות מתחילה מילה (לפי הצליל), איזו אות חסרה.</li>
          <li>🪧 <b>פארק השלטים</b>: לקרוא מילה (עם ניקוד) ולבחור תמונה, ולבחור מילה לתמונה.</li>
          <li>✏️ <b>סדנת הכתיבה</b>: להרכיב מילה מאותיות, להקליד מילה במקלדת, לעקוב בעכבר אחרי צורת אות.</li>
          <li>🤖 <b>גשר הרובוטים</b>: לספור, להשלים רצף מספרים, חיבור וחיסור עד 10.</li>
        </ul>
        <p>כל משימה היא 5 אתגרים קצרים. אחרי כל 3 משימות באותו מקום, השלב עולה (עד שלב 3). טעות לא מורידה כלום, רק משפיעה על מספר הכוכבים. אחרי 2 טעויות, התשובה הנכונה מהבהבת.</p>
      </div>
      <div class="panel">
        <h3>ההתקדמות</h3>
        <table>
          <tr><th></th>${ZONES.map((z) => `<th>${z.icon}</th>`).join("")}<th>⭐</th><th></th></tr>
          ${Object.keys(HEROES).map((id) => {
            const p = state.players[id];
            return `<tr><td><b>${HEROES[id].name}</b></td>${ZONES.map((z) => `<td>${p.zones[z.id]}</td>`).join("")}<td>${p.stars}</td>
              <td><button class="soft-btn small" data-reset="${id}">איפוס</button></td></tr>`;
          }).join("")}
        </table>
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
