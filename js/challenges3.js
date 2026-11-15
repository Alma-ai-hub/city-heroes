// Even more challenges (2026-11-15): for the 10 newest worlds, plus a replacement for
// connect-the-dots. Same rules as challenges.js. What to say is returned as a list of
// parts (fixed sentence + word/number), so recorded voice clips can be joined.

const N = (n) => String(n); // numbers are spoken as their own part

// ---------- shared pieces ----------
// Sort items into bins: tap an item, then tap its bin.
function sortGame(el, api, { text, speech, bins, items, binClass = "" }) {
  el.innerHTML = `
    ${promptHTML(text)}
    <div class="sort-items">${items.map((it, i) => `<button class="sort-item" data-i="${i}">${it.html}</button>`).join("")}</div>
    <div class="sort-bins ${binClass}">${bins.map((b) => `<button class="sort-bin" data-b="${b.id}"><span class="bin-label">${b.label}</span><span class="bin-in"></span></button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let selected = null, left = items.length, wrong = 0;
  const itemBtns = [...el.querySelectorAll(".sort-item")];
  itemBtns.forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    Sfx.click();
    itemBtns.forEach((x) => x.classList.remove("selected"));
    b.classList.add("selected");
    selected = b;
    const it = items[+b.dataset.i];
    if (it.say) api.say(it.say);
  }));
  el.querySelectorAll(".sort-bin").forEach((bin) => bin.addEventListener("click", () => {
    if (!selected) { hintGlow(itemBtns.find((x) => !x.disabled)); return; }
    const it = items[+selected.dataset.i];
    if (it.bin === bin.dataset.b) {
      Sfx.pop();
      bin.querySelector(".bin-in").insertAdjacentHTML("beforeend", `<i>${it.html}</i>`);
      selected.disabled = true; selected.classList.add("gone"); selected.classList.remove("selected");
      selected = null; left--; wrong = 0;
      el.querySelectorAll(".sort-bin.hint").forEach((x) => x.classList.remove("hint"));
      if (left === 0) api.correct();
    } else {
      wrong++; shakeIt(bin); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.sort-bin[data-b="${it.bin}"]`));
    }
  }));
  return speech;
}

// Match pairs: tap something on the right, then its partner on the left.
function matchGame(el, api, { text, speech, pairs, leftClass = "", rightClass = "" }) {
  const colors = ["#fde047", "#86efac", "#93c5fd", "#f9a8d4", "#fdba74", "#c4b5fd"];
  const lefts = shuffle(pairs.map((p, i) => ({ ...p, i })));
  const rights = shuffle(pairs.map((p, i) => ({ ...p, i })));
  el.innerHTML = `
    ${promptHTML(text)}
    <div class="match-cols">
      <div class="match-col">${rights.map((p) => `<button class="match-item ${rightClass}" data-side="a" data-i="${p.i}">${p.a}</button>`).join("")}</div>
      <div class="match-col">${lefts.map((p) => `<button class="match-item ${leftClass}" data-side="b" data-i="${p.i}">${p.b}</button>`).join("")}</div>
    </div>`;
  wireSpeak(el, api, speech);
  let sel = null, done = 0, wrong = 0;
  el.querySelectorAll(".match-item").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    if (!sel || sel.dataset.side === b.dataset.side) {
      el.querySelectorAll(".match-item.selected").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected"); sel = b; Sfx.click();
      const p = pairs[+b.dataset.i];
      if (p.say) api.say(p.say);
      return;
    }
    if (sel.dataset.i === b.dataset.i) {
      const c = colors[done % colors.length];
      [sel, b].forEach((x) => { x.disabled = true; x.classList.remove("selected"); x.classList.add("matched"); x.style.background = c; });
      Sfx.good(); sel = null; done++; wrong = 0;
      el.querySelectorAll(".match-item.hint").forEach((x) => x.classList.remove("hint"));
      if (done === pairs.length) setTimeout(() => api.correct(), 400);
    } else {
      wrong++; shakeIt(b); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.match-item[data-side="${b.dataset.side}"][data-i="${sel.dataset.i}"]`));
    }
  }));
  return speech;
}

// Typing letters into slots with the Hebrew keyboard.
function typeIntoSlots(el, api, { text, speech, visual, letters, ghost, blankIndex = null }) {
  const shown = letters.map((l, i) => blankIndex === null || i === blankIndex ? `<span class="slot ${blankIndex !== null ? "q-slot" : ""}">${ghost ? `<i>${l}</i>` : ""}</span>` : `<span class="slot filled given">${l}</span>`);
  el.innerHTML = `
    ${promptHTML(text)}
    <div class="visual">${visual}</div>
    <div class="slots">${shown.join("")}</div>
    ${keyboardHTML()}`;
  wireSpeak(el, api, speech);
  const slots = [...el.querySelectorAll(".slot")];
  const todo = blankIndex === null ? letters.map((_, i) => i) : [blankIndex];
  let k = 0, wrong = 0, done = false;
  attachKeyboard(el, api, (l) => {
    if (done) return;
    const key = el.querySelector(`.key[data-l="${l}"]`);
    if (key) { key.classList.add("pressed"); setTimeout(() => key.classList.remove("pressed"), 150); }
    const pos = todo[k];
    if (normal(l) === normal(letters[pos])) {
      Sfx.click();
      slots[pos].textContent = letters[pos]; slots[pos].classList.add("filled");
      el.querySelectorAll(".key.hint").forEach((x) => x.classList.remove("hint"));
      k++; wrong = 0;
      if (k === todo.length) { done = true; api.correct(); }
    } else {
      wrong++; shakeIt(slots[pos]); api.mistake({ quiet: true });
      if (wrong === 1) api.say(["זֹאת הָאוֹת", letterName(l), "נַסֵּה שׁוּב"]);
      if (wrong >= 2) hintGlow(el.querySelector(`.key[data-l="${letters[pos]}"]`) || el.querySelector(`.key[data-l="${normal(letters[pos])}"]`));
    }
  });
  return speech;
}

// Two steps: first do something (pop / feed), then answer how many are left.
function thenAsk(el, api, { question, speech, answer, max }) {
  const box = el.querySelector(".then-ask");
  box.innerHTML = `<p class="then-q">${question}</p><div class="options numbers">${numberOptions(answer, 0, max).map((x) => `<button class="option" data-v="${x}"><span class="num">${x}</span></button>`).join("")}</div>`;
  api.say(speech);
  let wrong = 0, done = false;
  box.querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => {
    if (done || b.disabled) return;
    if (+b.dataset.v === answer) { done = true; b.classList.add("right"); api.correct(); }
    else {
      wrong++; b.classList.add("wrong"); b.disabled = true; api.mistake();
      if (wrong >= 2) hintGlow(box.querySelector(`.option[data-v="${answer}"]`));
    }
  }));
}

// ================= Replacement for connect-the-dots: type the missing letter =================
function missingLetterType(el, lvl, api) {
  const finals = Object.keys(FINAL_TO_NORMAL);
  const list = wordsUpTo(lvl).filter((w) => w.w.length <= (lvl <= 1 ? 3 : 5));
  const word = fresh(list, (w) => w.w);
  const letters = [...word.w];
  let idx = lvl <= 1 ? 0 : rand(0, letters.length - 1);
  if (finals.includes(letters[idx])) idx = 0;
  const speech = ["אֵיזוֹ אוֹת חֲסֵרָה בַּמִּלָּה", word.n, "הַקְלֵד אוֹתָהּ"];
  const s = typeIntoSlots(el, api, {
    text: "הקלד את האות החסרה במילה",
    speech,
    visual: `<button class="big-emoji tap" data-word>${word.e}</button>`,
    letters, ghost: false, blankIndex: idx,
  });
  el.querySelector("[data-word]").addEventListener("click", () => api.say(word.n));
  return s;
}

// ================= Monster cave =================
function monsterBigSVG(mouthOpen = true, chew = false) {
  return `<svg viewBox="0 0 220 200" class="monster-svg ${chew ? "chew" : ""}">
    <g stroke="#111" stroke-width="5" stroke-linejoin="round">
      <path d="M40 60 L30 14 L70 46Z M180 60 L190 14 L150 46Z" fill="#a3e635"/>
      <path d="M20 120 Q20 40 110 36 Q200 40 200 120 Q200 196 110 196 Q20 196 20 120Z" fill="#84cc16"/>
      <circle cx="80" cy="84" r="22" fill="#fff"/><circle cx="140" cy="84" r="22" fill="#fff"/>
    </g>
    <circle cx="84" cy="88" r="9" fill="#111"/><circle cx="136" cy="88" r="9" fill="#111"/>
    <circle cx="87" cy="84" r="3" fill="#fff"/><circle cx="139" cy="84" r="3" fill="#fff"/>
    ${mouthOpen
      ? `<path d="M56 130 Q110 196 164 130Z" fill="#7f1d1d" stroke="#111" stroke-width="5" stroke-linejoin="round"/>
         <path d="M70 132 l8 14 l8 -14 M136 132 l8 14 l8 -14" fill="#fff" stroke="#111" stroke-width="2.5"/>
         <ellipse cx="110" cy="166" rx="22" ry="10" fill="#f87171"/>`
      : `<path d="M60 140 Q110 170 160 140" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round"/>`}
  </svg>`;
}

function feedMonster(el, lvl, api) {
  const n = lvl <= 1 ? rand(1, 5) : lvl === 2 ? rand(3, 8) : rand(5, 10);
  const food = pick(["🍪", "🍌", "🍩", "🥕", "🍎"]);
  let fed = 0, done = false;
  const speech = ["הַמִּפְלֶצֶת רוֹצָה", N(n), "הַאֲכֵל אוֹתָהּ בְּדִיּוּק כַּמָּה שֶׁהִיא רוֹצָה, וְלַחַץ סִיַּמְתִּי"];
  el.innerHTML = `
    ${promptHTML(`המפלצת רוצה ${n}. האכל אותה בדיוק ${n}`)}
    <div class="monster-row">
      <div class="order-card"><small>אני רוצה</small><b>${n}</b>${lvl <= 1 ? `<span>${food.repeat(n)}</span>` : ""}</div>
      <div class="monster-box">${monsterBigSVG()}</div>
      <div class="belly"><small>אכלה</small><b class="eaten">${lvl <= 1 ? 0 : "?"}</b></div>
    </div>
    <div class="food-tray">${Array.from({ length: 12 }, () => `<button class="food">${food}</button>`).join("")}</div>
    <div class="row-btns"><button class="go-btn" data-done>✔️ סיימתי</button></div>`;
  wireSpeak(el, api, speech);
  const box = el.querySelector(".monster-box"), eaten = el.querySelector(".eaten");
  el.querySelectorAll(".food").forEach((f) => f.addEventListener("click", () => {
    if (done || f.disabled) return;
    f.disabled = true; f.classList.add("eat"); fed++;
    Sfx.pop();
    if (lvl <= 1) eaten.textContent = fed;
    box.innerHTML = monsterBigSVG(true, true);
  }));
  el.querySelector("[data-done]").addEventListener("click", () => {
    if (done || !fed) return;
    if (fed === n) { done = true; box.innerHTML = monsterBigSVG(false); api.correct(); return; }
    api.mistake({ quiet: true });
    api.say(fed < n ? ["הִיא אָכְלָה", N(fed), "הִיא עוֹד רְעֵבָה. נַסֵּה שׁוּב מֵהַהַתְחָלָה"] : ["הִיא אָכְלָה", N(fed), "זֶה יוֹתֵר מִדַּי! נַסֵּה שׁוּב מֵהַהַתְחָלָה"]);
    fed = 0;
    if (lvl <= 1) eaten.textContent = 0;
    el.querySelectorAll(".food").forEach((f) => { f.disabled = false; f.classList.remove("eat"); });
  });
  return speech;
}

function monsterSubtract(el, lvl, api) {
  const max = lvl <= 1 ? 5 : 10;
  const total = rand(3, max), eat = rand(1, total - 1);
  const food = pick(["🍪", "🧁", "🍓", "🍬"]);
  const speech = ["יֵשׁ", N(total), "הַמִּפְלֶצֶת רוֹצָה לֶאֱכֹל", N(eat), "תֵּן לָהּ"];
  el.innerHTML = `
    ${promptHTML(`יש ${total}. המפלצת רוצה לאכול ${eat}. תן לה ${eat}`)}
    <div class="monster-row"><div class="monster-box small">${monsterBigSVG()}</div></div>
    <div class="food-tray">${Array.from({ length: total }, () => `<button class="food">${food}</button>`).join("")}</div>
    <div class="then-ask"></div>`;
  wireSpeak(el, api, speech);
  let fed = 0;
  el.querySelectorAll(".food").forEach((f) => f.addEventListener("click", () => {
    if (f.disabled || fed >= eat) return;
    f.disabled = true; f.classList.add("eat"); fed++; Sfx.pop();
    if (fed === eat) setTimeout(() => thenAsk(el, api, { question: "כמה נשארו?", speech: ["כַּמָּה נִשְׁאֲרוּ?"], answer: total - eat, max: 10 }), 500);
  }));
  return speech;
}

// ================= Maze =================
function makePath(size) {
  // From bottom-right to top-left, one step up or left at a time.
  let r = size - 1, c = size - 1;
  const path = [[r, c]];
  while (r > 0 || c > 0) {
    if (r > 0 && (c === 0 || Math.random() < 0.5)) r--; else c--;
    path.push([r, c]);
  }
  return path;
}

function mazeGame(el, api, { text, speech, size, pathLabel, decoyLabel, cellClass = "" }) {
  const path = makePath(size);
  const onPath = new Map(path.map(([r, c], i) => [`${r},${c}`, i]));
  const cells = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const i = onPath.get(`${r},${c}`);
    cells.push({ r, c, label: i !== undefined ? pathLabel(i) : decoyLabel(), path: i });
  }
  el.innerHTML = `
    ${promptHTML(text)}
    <div class="maze ${cellClass}" dir="ltr" style="--n:${size}">
      ${cells.map((x) => `<button class="maze-cell" data-r="${x.r}" data-c="${x.c}">${x.label}</button>`).join("")}
    </div>`;
  wireSpeak(el, api, speech);
  const cellAt = (r, c) => el.querySelector(`.maze-cell[data-r="${r}"][data-c="${c}"]`);
  let step = 0, wrong = 0;
  const [sr, sc] = path[0];
  cellAt(sr, sc).classList.add("walked", "here");
  cellAt(path[path.length - 1][0], path[path.length - 1][1]).classList.add("goal");
  el.querySelectorAll(".maze-cell").forEach((b) => b.addEventListener("click", () => {
    if (step >= path.length - 1) return;
    const r = +b.dataset.r, c = +b.dataset.c;
    const [nr, nc] = path[step + 1];
    if (r === nr && c === nc) {
      Sfx.step();
      el.querySelector(".maze-cell.here")?.classList.remove("here");
      b.classList.add("walked", "here");
      el.querySelectorAll(".maze-cell.hint").forEach((x) => x.classList.remove("hint"));
      step++; wrong = 0;
      if (step === path.length - 1) api.correct();
    } else if (b.classList.contains("walked")) {
      // stepping back on the trail is fine, nothing happens
    } else {
      wrong++; shakeIt(b); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(cellAt(nr, nc));
    }
  }));
  return speech;
}

function letterMaze(el, lvl, api) {
  const pool = lvl <= 1 ? EASY_LETTERS : LETTERS.map((x) => x.l);
  const target = fresh(pool);
  const others = otherLetters(target, 5, lvl);
  const speech = ["לֵךְ בַּמָּבוֹךְ רַק עַל הָאוֹת", letterName(target), "עַד הַדֶּגֶל"];
  return mazeGame(el, api, {
    text: `לך במבוך רק על האות ${lvl <= 1 ? target : "ששמעת"}, עד הדגל 🏁`,
    speech, size: lvl <= 1 ? 4 : 5,
    pathLabel: () => target, decoyLabel: () => pick(others),
  });
}

function numberPath(el, lvl, api) {
  const size = lvl <= 1 ? 4 : 5;
  const start = lvl <= 2 ? 1 : rand(2, 10);
  const len = size * 2 - 1;
  const speech = ["לֵךְ לְפִי הַמִּסְפָּרִים, עַד הַדֶּגֶל. מַתְחִילִים בַּמִּסְפָּר", N(start)];
  return mazeGame(el, api, {
    text: `לך לפי המספרים מ־${start} ומעלה, עד הדגל 🏁`,
    speech, size,
    pathLabel: (i) => start + i,
    decoyLabel: () => { let d; do { d = rand(1, start + len + 2); } while (d >= start && d < start + len); return d; },
    cellClass: "numbers-maze",
  });
}

// ================= Farm: sorting =================
function soundSort(el, lvl, api) {
  const nBins = lvl >= 3 ? 3 : 2;
  const per = lvl <= 1 ? 2 : lvl === 2 ? 3 : 2;
  const pool = WORDS.filter((w) => w.lvl <= 2);
  const binLetters = [];
  for (const l of shuffle([...new Set(pool.map((w) => w.w[0]))])) {
    if (binLetters.length >= nBins) break;
    if (binLetters.some((b) => groupOf(SOUND_ALIKE, b).includes(l))) continue;
    if (pool.filter((w) => w.w[0] === l).length >= per) binLetters.push(l);
  }
  const items = [];
  binLetters.forEach((l) => shuffle(pool.filter((w) => w.w[0] === l)).slice(0, per).forEach((w) => items.push({ html: `<span class="emoji-opt">${w.e}</span>`, bin: l, say: w.n })));
  return sortGame(el, api, {
    text: "שים כל תמונה בסל של האות שהיא מתחילה בה",
    speech: ["שִׂים כׇּל תְּמוּנָה בַּסַּל שֶׁל הָאוֹת שֶׁהִיא מַתְחִילָה בָּהּ. לְחַץ עַל תְּמוּנָה, וְאַחַר כָּךְ עַל סַל"],
    bins: binLetters.map((l) => ({ id: l, label: `<span class="letter">${l}</span>` })),
    items: shuffle(items),
    binClass: "baskets",
  });
}

const SORT_GROUPS = [
  { id: "animals", label: "🐾 חיות", say: "חַיּוֹת", items: ["🐶", "🐱", "🐰", "🐻", "🦁", "🐸", "🐢", "🐘", "🦒", "🐵"] },
  { id: "fruit", label: "🧺 פירות", say: "פֵּרוֹת", items: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍐", "🍒"] },
  { id: "vehicles", label: "🛣️ כלי רכב", say: "כְּלֵי רֶכֶב", items: ["🚗", "🚌", "🚂", "✈️", "🚁", "🚲", "🚀", "🚜"] },
  { id: "clothes", label: "👕 בגדים", say: "בְּגָדִים", items: ["👕", "👖", "🧢", "👟", "🧦", "🧤", "👗"] },
];
function categorySort(el, lvl, api) {
  const groups = shuffle(SORT_GROUPS).slice(0, lvl >= 3 ? 3 : 2);
  const per = lvl <= 1 ? 2 : 3;
  const items = [];
  groups.forEach((g) => shuffle(g.items).slice(0, per).forEach((e) => items.push({ html: `<span class="emoji-opt">${e}</span>`, bin: g.id })));
  return sortGame(el, api, {
    text: "מיין: כל דבר לסל שלו",
    speech: ["מַיֵּן: כׇּל דָּבָר לַסַּל שֶׁלּוֹ. לְחַץ עַל תְּמוּנָה, וְאַחַר כָּךְ עַל הַסַּל"],
    bins: groups.map((g) => ({ id: g.id, label: `<span class="bin-word">${g.label}</span>` })),
    items: shuffle(items),
    binClass: "baskets",
  });
}

// ================= Post office =================
function writeMyName(el, lvl, api) {
  const h = HEROES[hero];
  const letters = [...h.name];
  const speech = ["כְּתֹב אֶת הַשֵּׁם שֶׁלְּךָ בַּמִּקְלֶדֶת", h.name === "בר" ? "בַּר" : "יַרְדֵּן"];
  return typeIntoSlots(el, api, {
    text: `כתוב את השם שלך: ${h.name}`,
    speech,
    visual: `<div class="envelope">✉️<span>אל: ${lvl <= 2 ? h.name : "?"}</span></div>`,
    letters, ghost: lvl <= 2,
  });
}

function letterMail(el, lvl, api) {
  const n = lvl <= 1 ? 2 : 3;
  const pool = lvl <= 1 ? EASY_LETTERS : LETTERS.map((x) => x.l);
  const boxes = [];
  for (const l of shuffle(pool)) {
    if (boxes.length >= n) break;
    if (boxes.some((b) => groupOf(LOOK_ALIKE, b).includes(l) || groupOf(SOUND_ALIKE, b).includes(l))) continue;
    boxes.push(l);
  }
  const items = [];
  boxes.forEach((l) => {
    for (let k = 0; k < (lvl <= 1 ? 2 : 2); k++) {
      if (lvl >= 3 && k === 1) {
        const w = pick(WORDS.filter((x) => x.w[0] === l));
        if (w) { items.push({ html: `<span class="mail">✉️<b>${w.e}</b></span>`, bin: l, say: w.n }); continue; }
      }
      items.push({ html: `<span class="mail">✉️<b>${l}</b></span>`, bin: l, say: letterName(l) });
    }
  });
  return sortGame(el, api, {
    text: "שים כל מכתב בתיבת הדואר של האות שלו",
    speech: ["שִׂים כׇּל מִכְתָּב בְּתֵבַת הַדֹּאַר שֶׁל הָאוֹת שֶׁלּוֹ"],
    bins: boxes.map((l) => ({ id: l, label: `<span class="mailbox">📮<b>${l}</b></span>` })),
    items: shuffle(items),
    binClass: "mailboxes",
  });
}

// ================= Luna park =================
const POSITIONS = [
  { id: "on", n: "עַל", t: "על" }, { id: "under", n: "מִתַּחַת לַ", t: "מתחת ל" },
  { id: "in", n: "בְּתוֹךְ הַ", t: "בתוך ה" }, { id: "next", n: "לְיַד הַ", t: "ליד ה" },
];
function sceneHTML(pos, thing) {
  return `<span class="scene scene-${pos}"><span class="box-thing">📦</span><span class="thing">${thing}</span></span>`;
}
function positionWords(el, lvl, api) {
  const thing = pick([{ e: "⚽", n: "הַכַּדּוּר" }, { e: "🐱", n: "הֶחָתוּל" }, { e: "🧸", n: "הַדֻּבִּי" }, { e: "🐶", n: "הַכֶּלֶב" }]);
  const pool = lvl <= 1 ? POSITIONS.slice(0, 3) : POSITIONS;
  const target = pick(pool);
  const opts = shuffle([target, ...shuffle(POSITIONS.filter((p) => p.id !== target.id)).slice(0, lvl <= 1 ? 1 : 2)]);
  const phrase = { on: "עַל הַקֻּפְסָה", under: "מִתַּחַת לַקֻּפְסָה", in: "בְּתוֹךְ הַקֻּפְסָה", next: "לְיַד הַקֻּפְסָה" }[target.id];
  const text = { on: "על הקופסה", under: "מתחת לקופסה", in: "בתוך הקופסה", next: "ליד הקופסה" }[target.id];
  const speech = ["לְחַץ עַל הַתְּמוּנָה שֶׁבָּהּ", thing.n, phrase];
  choiceQuestion(el, api, {
    text: `באיזו תמונה ${thing.n.replace(/[֑-ׇ]/g, "")} ${text}?`,
    speech,
    visual: `<div class="big-emoji small">🎡</div>`,
    options: opts.map((p) => ({ value: p.id, html: sceneHTML(p.id, thing.e) })),
    answer: target.id,
    optionClass: "scenes",
  });
  return speech;
}

function popSubtract(el, lvl, api) {
  const max = lvl <= 1 ? 5 : 10;
  const total = rand(3, max), pop = rand(1, total - 1);
  const speech = ["יֵשׁ", N(total), "בָּלוֹנִים. פּוֹצֵץ", N(pop)];
  el.innerHTML = `
    ${promptHTML(`יש ${total} בלונים. פוצץ ${pop}`)}
    <div class="balloon-field small-field">${Array.from({ length: total }, (_, i) => `<button class="balloon" style="--d:${(i % 5) * 0.37}s;--y:${(i * 37) % 24}px">${balloonSVG("", BALLOON_COLORS[i % BALLOON_COLORS.length])}</button>`).join("")}</div>
    <div class="then-ask"></div>`;
  wireSpeak(el, api, speech);
  let popped = 0;
  el.querySelectorAll(".balloon").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled || popped >= pop) return;
    b.disabled = true; b.classList.add("popped"); popped++; Sfx.pop();
    if (popped === pop) setTimeout(() => thenAsk(el, api, { question: "כמה בלונים נשארו?", speech: ["כַּמָּה בָּלוֹנִים נִשְׁאֲרוּ?"], answer: total - pop, max: 10 }), 500);
  }));
  return speech;
}

function dieSVG(n) {
  const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };
  return `<svg viewBox="-6 -6 112 112" class="die-svg"><rect width="100" height="100" rx="18" fill="#fff" stroke="#111" stroke-width="5"/>${P[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#111"/>`).join("")}</svg>`;
}
function diceSum(el, lvl, api) {
  const max = lvl <= 1 ? 3 : 6;
  const a = rand(1, max), b = rand(1, max);
  const speech = ["כַּמָּה נְקֻדּוֹת יֵשׁ בִּשְׁתֵּי הַקֻּבִּיּוֹת בְּיַחַד?"];
  choiceQuestion(el, api, {
    text: "כמה נקודות יש בשתי הקוביות ביחד?",
    speech,
    visual: `<div class="dice" dir="ltr"><span class="roll">${dieSVG(a)}</span><b class="op">+</b><span class="roll r2">${dieSVG(b)}</span></div>`,
    options: numberOptions(a + b, 2, 12).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: a + b,
    optionClass: "numbers",
  });
  return speech;
}

// ================= Shapes =================
const SHAPES = [
  { id: "circle", n: "עִגּוּל", theOne: "הָעִגּוּל", theMany: "הָעִגּוּלִים", many: "עִגּוּלִים", t: "עיגול", tm: "עיגולים", lvl: 1 },
  { id: "square", n: "רִבּוּעַ", theOne: "הָרִבּוּעַ", theMany: "הָרִבּוּעִים", many: "רִבּוּעִים", t: "ריבוע", tm: "ריבועים", lvl: 1 },
  { id: "triangle", n: "מְשֻׁלָּשׁ", theOne: "הַמְּשֻׁלָּשׁ", theMany: "הַמְּשֻׁלָּשִׁים", many: "מְשֻׁלָּשִׁים", t: "משולש", tm: "משולשים", lvl: 1 },
  { id: "star", n: "כּוֹכָב", theOne: "הַכּוֹכָב", theMany: "הַכּוֹכָבִים", many: "כּוֹכָבִים", t: "כוכב", tm: "כוכבים", lvl: 2 },
  { id: "heart", n: "לֵב", theOne: "הַלֵּב", theMany: "הַלְּבָבוֹת", many: "לְבָבוֹת", t: "לב", tm: "לבבות", lvl: 2 },
  { id: "rect", n: "מַלְבֵּן", theOne: "הַמַּלְבֵּן", theMany: "הַמַּלְבֵּנִים", many: "מַלְבֵּנִים", t: "מלבן", tm: "מלבנים", lvl: 3 },
];
const SHAPE_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6"];
function shapeSVG(id, color, rot = 0) {
  const d = {
    circle: `<circle cx="50" cy="50" r="40"/>`,
    square: `<rect x="12" y="12" width="76" height="76" rx="4"/>`,
    triangle: `<path d="M50 8 L92 88 L8 88Z"/>`,
    star: `<path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38Z"/>`,
    heart: `<path d="M50 88 C10 60 4 34 22 20 C36 10 48 18 50 30 C52 18 64 10 78 20 C96 34 90 60 50 88Z"/>`,
    rect: `<rect x="4" y="26" width="92" height="48" rx="4"/>`,
  }[id];
  return `<svg viewBox="0 0 100 100" class="shape-svg" style="transform:rotate(${rot}deg)"><g fill="${color}" stroke="#111" stroke-width="5" stroke-linejoin="round">${d}</g></svg>`;
}
const shapesUpTo = (lvl) => SHAPES.filter((s) => s.lvl <= lvl);

function shapeHunt(el, lvl, api) {
  const pool = shapesUpTo(lvl);
  const target = fresh(pool, (s) => s.id);
  const nT = rand(2, 4), total = lvl <= 1 ? 8 : 10;
  const others = pool.filter((s) => s.id !== target.id);
  const list = shuffle([...Array(nT).fill(target), ...Array.from({ length: total - nT }, () => pick(others))]);
  const speech = ["לְחַץ עַל כׇּל", target.theMany];
  el.innerHTML = `
    ${promptHTML(`לחץ על כל ה${target.tm}`)}
    <div class="visual">${lvl <= 1 ? `<span class="shape-sample">${shapeSVG(target.id, "#fde047")}</span>` : ""}</div>
    <div class="shape-field">${list.map((s, i) => `<button class="shape-btn" data-s="${s.id}" style="--r:${((i * 47) % 50) - 25}deg">${shapeSVG(s.id, SHAPE_COLORS[i % SHAPE_COLORS.length], s.id === "circle" ? 0 : ((i * 47) % 50) - 25)}</button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let left = nT, wrong = 0;
  el.querySelectorAll(".shape-btn").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled || left <= 0) return;
    if (b.dataset.s === target.id) {
      b.disabled = true; b.classList.add("found"); Sfx.pop(); left--; wrong = 0;
      el.querySelectorAll(".shape-btn.hint").forEach((x) => x.classList.remove("hint"));
      if (!left) api.correct();
    } else {
      wrong++; shakeIt(b); api.mistake({ quiet: true });
      api.say(["זֶה", SHAPES.find((s) => s.id === b.dataset.s).n]);
      if (wrong >= 2) hintGlow(el.querySelector(`.shape-btn[data-s="${target.id}"]:not(:disabled)`));
    }
  }));
  return speech;
}

function shapeName(el, lvl, api) {
  const pool = shapesUpTo(Math.max(lvl, 2));
  const target = fresh(pool, (s) => s.id);
  const opts = shuffle([target, ...shuffle(pool.filter((s) => s.id !== target.id)).slice(0, lvl <= 1 ? 2 : 3)]);
  const speech = ["לְחַץ עַל", target.theOne];
  choiceQuestion(el, api, {
    text: "לחץ על הצורה ששמעת",
    speech,
    visual: `<button class="big-emoji tap small" data-again>👂</button>`,
    options: opts.map((s, i) => ({ value: s.id, html: shapeSVG(s.id, SHAPE_COLORS[i]) })),
    answer: target.id,
    optionClass: "shapes-opts",
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say(speech));
  return speech;
}

function shapeCount(el, lvl, api) {
  const pool = shapesUpTo(lvl);
  const target = pick(pool);
  const n = rand(1, lvl <= 1 ? 4 : 7);
  const total = n + rand(2, 5);
  const others = pool.filter((s) => s.id !== target.id);
  const list = shuffle([...Array(n).fill(target), ...Array.from({ length: total - n }, () => pick(others))]);
  const speech = ["כַּמָּה", target.many, "יֵשׁ בַּצִּיּוּר?"];
  choiceQuestion(el, api, {
    text: `כמה ${target.tm} יש?`,
    speech,
    visual: `<div class="shape-field static">${list.map((s, i) => `<span class="shape-btn">${shapeSVG(s.id, SHAPE_COLORS[i % SHAPE_COLORS.length], s.id === "circle" ? 0 : ((i * 37) % 40) - 20)}</span>`).join("")}</div>`,
    options: numberOptions(n, 0, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: n,
    optionClass: "numbers",
  });
  return speech;
}

// ================= Giants' workshop: size =================
function pencilSVG(len, color) {
  return `<svg viewBox="0 0 ${len + 40} 40" class="pencil-svg" style="width:${len + 40}px">
    <rect x="16" y="8" width="${len}" height="24" fill="${color}" stroke="#111" stroke-width="4"/>
    <rect x="4" y="8" width="16" height="24" rx="4" fill="#f9a8d4" stroke="#111" stroke-width="4"/>
    <path d="M${len + 16} 8 L${len + 36} 20 L${len + 16} 32Z" fill="#fde68a" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    <path d="M${len + 29} 16 L${len + 36} 20 L${len + 29} 24Z" fill="#111"/>
  </svg>`;
}
function measureLonger(el, lvl, api) {
  const n = lvl <= 1 ? 2 : 3;
  const lens = new Set();
  const gap = lvl <= 1 ? 90 : lvl === 2 ? 50 : 26;
  while (lens.size < n) lens.add(80 + rand(0, Math.floor(280 / gap)) * gap);
  const arr = shuffle([...lens]);
  const askShort = lvl >= 2 && Math.random() < 0.5;
  const answer = askShort ? Math.min(...arr) : Math.max(...arr);
  const speech = askShort ? ["אֵיזֶה עִפָּרוֹן קָצָר יוֹתֵר?"] : ["אֵיזֶה עִפָּרוֹן אָרֹךְ יוֹתֵר?"];
  choiceQuestion(el, api, {
    text: askShort ? "איזה עיפרון הכי קצר?" : "איזה עיפרון הכי ארוך?",
    speech,
    visual: "",
    options: arr.map((l, i) => ({ value: l, html: pencilSVG(l, SHAPE_COLORS[i]) })),
    answer,
    optionClass: "pencils",
  });
  return speech;
}

function sizeOrder(el, lvl, api) {
  const n = lvl <= 1 ? 3 : 4;
  const thing = pick(["🐻", "🍎", "🚗", "🏠", "🐟", "⭐", "🐘"]);
  const sizes = [40, 66, 94, 124].slice(0, n);
  const shown = shuffle(sizes.map((s, i) => ({ s, i })));
  const speech = ["לְחַץ מֵהַקָּטָן בְּיוֹתֵר, עַד הַגָּדוֹל בְּיוֹתֵר"];
  el.innerHTML = `
    ${promptHTML("לחץ מהקטן ביותר עד הגדול ביותר")}
    <div class="size-row">${shown.map((x) => `<button class="size-btn" data-i="${x.i}" style="font-size:${x.s}px">${thing}</button>`).join("")}</div>
    <div class="popped-row" dir="ltr">${sizes.map(() => `<span class="pop-slot size-slot"></span>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let step = 0, wrong = 0;
  const slots = el.querySelectorAll(".size-slot");
  el.querySelectorAll(".size-btn").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    if (+b.dataset.i === step) {
      Sfx.click(); b.disabled = true; b.classList.add("used");
      slots[step].innerHTML = `<span style="font-size:${14 + step * 8}px">${thing}</span>`;
      step++; wrong = 0;
      el.querySelectorAll(".size-btn.hint").forEach((x) => x.classList.remove("hint"));
      if (step === n) api.correct();
    } else {
      wrong++; shakeIt(b); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.size-btn[data-i="${step}"]`));
    }
  }));
  return speech;
}

const WEIGHTS = [["🐘", 9, "הַפִּיל"], ["🐭", 1, "הָעַכְבָּר"], ["🍉", 6, "הָאֲבַטִּיחַ"], ["🍓", 1, "הַתּוּת"], ["🚗", 8, "הַמְּכוֹנִית"], ["🪶", 0, "הַנּוֹצָה"], ["🐻", 7, "הַדֹּב"], ["🐦", 1, "הַצִּפּוֹר"], ["🎈", 0, "הַבָּלוֹן"], ["🏋️", 9, "הַמִּשְׁקוֹלֶת"]];
function balanceScale(el, lvl, api) {
  let a, b;
  if (lvl <= 1) { do { a = pick(WEIGHTS); b = pick(WEIGHTS); } while (Math.abs(a[1] - b[1]) < 5); }
  else { a = ["📦", 2, "הַקֻּפְסָה הָאֲדֻמָּה"]; b = ["📦", 1, "הַקֻּפְסָה הַכְּחֻלָּה"]; if (Math.random() < 0.5) [a[1], b[1]] = [b[1], a[1]]; }
  const askLight = lvl >= 3 && Math.random() < 0.5;
  const heavyLeft = a[1] > b[1];
  const tilt = heavyLeft ? -12 : 12;
  const answer = askLight ? (heavyLeft ? "b" : "a") : (heavyLeft ? "a" : "b");
  const label = (x, color) => lvl <= 1 ? `<span class="emoji-opt">${x[0]}</span>` : `<span class="emoji-opt box-${color}">${x[0]}</span>`;
  const speech = askLight ? ["מָה קַל יוֹתֵר? תִּסְתַּכֵּל עַל הַמֹּאזְנַיִם"] : ["מָה כָּבֵד יוֹתֵר? תִּסְתַּכֵּל עַל הַמֹּאזְנַיִם"];
  choiceQuestion(el, api, {
    text: askLight ? "מה קל יותר? הסתכל על המאזניים" : "מה כבד יותר? הסתכל על המאזניים",
    speech,
    visual: `<div class="scale" dir="ltr">
      <svg viewBox="0 0 400 200" class="scale-svg">
        <path d="M200 60 L180 190 H220Z" fill="#94a3b8" stroke="#111" stroke-width="5" stroke-linejoin="round"/>
        <g transform="rotate(${tilt} 200 60)">
          <rect x="40" y="54" width="320" height="12" rx="6" fill="#64748b" stroke="#111" stroke-width="4"/>
          <path d="M60 66 V96 M140 66 V96 M260 66 V96 M340 66 V96" stroke="#111" stroke-width="3"/>
          <path d="M40 96 H160 Q100 130 40 96Z M240 96 H360 Q300 130 240 96Z" fill="#fde68a" stroke="#111" stroke-width="4"/>
          <foreignObject x="60" y="30" width="80" height="70"><div class="pan-item">${lvl <= 1 ? a[0] : `<span class="box-red">📦</span>`}</div></foreignObject>
          <foreignObject x="260" y="30" width="80" height="70"><div class="pan-item">${lvl <= 1 ? b[0] : `<span class="box-blue">📦</span>`}</div></foreignObject>
        </g>
        <circle cx="200" cy="60" r="9" fill="#111"/>
      </svg></div>`,
    options: [{ value: "a", html: label(a, "red") }, { value: "b", html: label(b, "blue") }],
    answer,
    optionClass: "pictures",
  });
  return speech;
}

// ================= Magic school =================
function traceNumber(el, lvl, api) {
  const target = String(lvl <= 1 ? rand(1, 5) : lvl === 2 ? rand(0, 9) : rand(0, 9));
  return traceLetter(el, lvl, api, target);
}

function finalFormsMatch(el, lvl, api) {
  const pairs = shuffle(Object.entries(FINAL_TO_NORMAL)).slice(0, lvl <= 1 ? 3 : 5)
    .map(([fin, reg]) => ({ a: `<span class="letter">${reg}</span>`, b: `<span class="letter">${fin}</span>`, say: [letterName(reg)] }));
  return matchGame(el, api, {
    text: "התאם כל אות לאות הסופית שלה (כמו מ ו־ם)",
    speech: ["לְכׇל אוֹת יֵשׁ אוֹת סוֹפִית, שֶׁכּוֹתְבִים בְּסוֹף הַמִּלָּה. הַתְאֵם בֵּינֵיהֶן"],
    pairs,
  });
}

function matchNumberDots(el, lvl, api) {
  const nums = new Set();
  while (nums.size < (lvl <= 1 ? 3 : 4)) nums.add(rand(1, lvl <= 1 ? 5 : 10));
  const dots = (n) => `<span class="dot-card">${Array.from({ length: n }, () => "<i></i>").join("")}</span>`;
  return matchGame(el, api, {
    text: "התאם כל מספר לכרטיס עם אותו מספר נקודות",
    speech: ["הַתְאֵם כׇּל מִסְפָּר לַכַּרְטִיס עִם אוֹתוֹ מִסְפָּר נְקֻדּוֹת"],
    pairs: [...nums].map((n) => ({ a: `<span class="num">${n}</span>`, b: dots(n), say: [N(n)] })),
  });
}

// ================= Fishing lake =================
function fishPond(el, api, { text, speech, visual, labels, answerIdx, labelClass = "" }) {
  const colors = ["#f97316", "#3b82f6", "#ec4899", "#22c55e", "#a855f7"];
  el.innerHTML = `
    ${promptHTML(text)}
    <div class="visual">${visual}</div>
    <div class="pond">${labels.map((l, i) => `<button class="fish" data-i="${i}" style="--d:${i * 0.7}s;--t:${(i % 2) ? 5.5 : 7}s;top:${12 + i * (70 / labels.length)}%">
        <svg viewBox="0 0 160 80" class="fish-svg"><path d="M150 40 L126 18 L128 40 L126 62Z" fill="${colors[i % colors.length]}" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="72" cy="40" rx="60" ry="32" fill="${colors[i % colors.length]}" stroke="#111" stroke-width="4"/><circle cx="30" cy="34" r="6" fill="#fff" stroke="#111" stroke-width="2.5"/><circle cx="29" cy="34" r="2.5" fill="#111"/></svg>
        <b class="fish-label ${labelClass}">${l}</b></button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let wrong = 0, done = false;
  el.querySelectorAll(".fish").forEach((f) => f.addEventListener("click", () => {
    if (done || f.disabled) return;
    if (+f.dataset.i === answerIdx) { done = true; f.classList.add("caught"); Sfx.pop(); api.correct(); }
    else {
      wrong++; f.classList.add("away"); f.disabled = true; api.mistake();
      if (wrong >= 2) hintGlow(el.querySelector(`.fish[data-i="${answerIdx}"]`));
    }
  }));
  return speech;
}

function wordFish(el, lvl, api) {
  const word = fresh(wordsUpTo(lvl), (w) => w.w);
  const others = shuffle(WORDS.filter((w) => w.w !== word.w && w.lvl <= Math.max(2, lvl))).slice(0, lvl <= 1 ? 2 : 3);
  const all = shuffle([word, ...others]);
  return fishPond(el, api, {
    text: "דוג את הדג עם המילה שמתאימה לתמונה",
    speech: ["דּוּג אֶת הַדָּג עִם הַמִּלָּה שֶׁמַּתְאִימָה לַתְּמוּנָה"],
    visual: `<span class="big-emoji small">${word.e}</span>`,
    labels: all.map((w) => w.n), answerIdx: all.indexOf(word), labelClass: "word",
  });
}

function numberFish(el, lvl, api) {
  const n = rand(1, lvl <= 1 ? 5 : 10);
  const set = new Set([n]);
  while (set.size < (lvl <= 1 ? 3 : 4)) set.add(rand(1, lvl <= 1 ? 6 : 10));
  const labels = shuffle([...set]);
  return fishPond(el, api, {
    text: "דוג את הדג עם המספר של הנקודות",
    speech: ["סְפֹר אֶת הַנְּקֻדּוֹת, וְדוּג אֶת הַדָּג עִם הַמִּסְפָּר הַזֶּה"],
    visual: `<span class="dot-card big">${Array.from({ length: n }, () => "<i></i>").join("")}</span>`,
    labels, answerIdx: labels.indexOf(n),
  });
}

function listenPickWord(el, lvl, api) {
  const word = fresh(wordsUpTo(lvl), (w) => w.w);
  const same = WORDS.filter((w) => w.w !== word.w && w.w[0] === word.w[0]);
  const others = shuffle(lvl >= 2 && same.length >= 2 ? same : WORDS.filter((w) => w.w !== word.w)).slice(0, 2);
  const speech = ["אֵיזוֹ מִלָּה כְּתוּבָה כָּאן:", word.n];
  choiceQuestion(el, api, {
    text: "לחץ על המילה ששמעת",
    speech,
    visual: `<button class="big-emoji tap small" data-again>👂</button>`,
    options: shuffle([word, ...others]).map((w) => ({ value: w.w, html: `<span class="word-opt">${w.n}</span>` })),
    answer: word.w,
    optionClass: "words",
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say(word.n));
  return speech;
}

// ================= Meteor shower =================
function catchFalling(el, lvl, api, kind) {
  const isLetter = kind === "letter";
  const pool = isLetter ? (lvl <= 1 ? EASY_LETTERS : LETTERS.map((x) => x.l)) : Array.from({ length: lvl <= 1 ? 10 : 20 }, (_, i) => String(i + 1));
  const target = fresh(pool);
  const decoys = isLetter ? otherLetters(target, 5, lvl) : shuffle(pool.filter((x) => x !== target)).slice(0, 6);
  const need = 3;
  const speech = isLetter ? ["תְּפֹס", N(need), "מֶטֵאוֹרִים עִם הָאוֹת", letterName(target)] : ["תְּפֹס", N(need), "מֶטֵאוֹרִים עִם הַמִּסְפָּר", N(target)];
  el.innerHTML = `
    ${promptHTML(isLetter ? `תפוס 3 מטאורים עם האות${lvl <= 1 ? " " + target : " ששמעת"}` : `תפוס 3 מטאורים עם המספר${lvl <= 1 ? " " + target : " ששמעת"}`)}
    <div class="caught-row">${Array.from({ length: need }, () => `<span class="pop-slot"></span>`).join("")}</div>
    <div class="sky"></div>`;
  wireSpeak(el, api, speech);
  const sky = el.querySelector(".sky");
  const slots = el.querySelectorAll(".caught-row .pop-slot");
  const speed = lvl <= 1 ? 7000 : lvl === 2 ? 6000 : 5000; // ms to fall
  let caught = 0, alive = true, sinceTarget = 0, wrong = 0;
  function spawn() {
    if (!alive) return;
    const isTarget = sinceTarget >= 2 || Math.random() < 0.4;
    sinceTarget = isTarget ? 0 : sinceTarget + 1;
    const m = document.createElement("button");
    m.className = "meteor";
    m.innerHTML = `<span>${isTarget ? target : pick(decoys)}</span>`;
    m.style.left = rand(4, 82) + "%";
    m.style.animationDuration = speed + "ms";
    m.dataset.t = isTarget ? "1" : "";
    m.addEventListener("click", () => {
      if (!alive || m.classList.contains("boom")) return;
      if (m.dataset.t) {
        Sfx.pop(); m.classList.add("boom");
        slots[caught].textContent = target; caught++; wrong = 0;
        if (caught === need) { alive = false; api.correct(); }
      } else {
        wrong++; Sfx.oops(); shakeIt(m); api.mistake({ quiet: true });
        if (wrong === 2) api.say(speech);
      }
    });
    m.addEventListener("animationend", () => m.remove());
    sky.appendChild(m);
  }
  spawn();
  const timer = setInterval(spawn, lvl <= 1 ? 1500 : 1200);
  api.cleanup(() => { alive = false; clearInterval(timer); });
  return speech;
}
const catchLetters = (el, lvl, api) => catchFalling(el, lvl, api, "letter");
const catchNumbers = (el, lvl, api) => catchFalling(el, lvl, api, "number");

// ---------- which tasks each newest place uses ----------
Object.assign(ZONE_CHALLENGES, {
  monster: [feedMonster, monsterSubtract, matchNumberDots],
  maze: [letterMaze, numberPath, sortNumbers],
  farm: [soundSort, categorySort, oddOneOut],
  post: [writeMyName, letterMail, typeWord],
  lunapark: [positionWords, popSubtract, diceSum],
  shapes: [shapeHunt, shapeName, shapeCount],
  giants: [measureLonger, sizeOrder, balanceScale],
  magic: [traceNumber, finalFormsMatch, missingLetterType],
  fishing: [wordFish, listenPickWord, numberFish],
  meteors: [catchLetters, catchNumbers, countdown],
});
// The forest's connect-the-dots game is replaced (it didn't work well).
ZONE_CHALLENGES.forest = [missingLetterType, firstLetterType, traceLetter];
ZONE_CHALLENGES.fortress.push(shapeHunt, feedMonster, wordFish, soundSort, measureLonger, diceSum);
